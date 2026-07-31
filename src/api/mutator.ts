import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import { getToken, clearAuth } from '@/lib/auth'

// baseURL vazio → chamadas /api/** relativas passam pelo proxy do Vite até a API (:8080).
export const api = axios.create({ baseURL: '' })

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearAuth()
      if (window.location.pathname !== '/login') window.location.assign('/login')
    }
    return Promise.reject(error)
  },
)

/** Mutator usado pelos hooks gerados pelo Orval. */
export const customInstance = <T>(config: AxiosRequestConfig, options?: AxiosRequestConfig): Promise<T> => {
  const source = axios.CancelToken.source()
  const promise = api({ ...config, ...options, cancelToken: source.token }).then(({ data }) => data as T)

  // @ts-expect-error orval usa .cancel para abortar a query
  promise.cancel = () => source.cancel('Query cancelada')

  return promise
}

/** Extrai a mensagem do ProblemDetails (RFC 9457) de um erro de request. */
export function problemDetail(error: unknown): string {
  const err = error as AxiosError<{ detail?: string; title?: string; errors?: Record<string, string[]> }>
  const data = err.response?.data
  if (data?.errors) {
    const first = Object.values(data.errors)[0]
    if (first?.length) return first[0]
  }
  return data?.detail || data?.title || err.message || 'Erro inesperado.'
}
