import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useLogin } from '@/api/hooks'
import { setAuth } from '@/lib/auth'
import { problemDetail } from '@/api/mutator'
import { Button, Card, Field, Input } from '@/components/ui'

export function LoginPage() {
  const navigate = useNavigate()
  const login = useLogin()
  const [emailOrUserName, setEmail] = useState('admin@gearflow.local')
  const [password, setPassword] = useState('Admin@123')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      const res = await login.mutateAsync({ data: { emailOrUserName, password } })
      setAuth(res.accessToken, res.refreshToken)
      toast.success('Bem-vindo!')
      navigate('/', { replace: true })
    } catch (err) {
      toast.error(problemDetail(err))
    }
  }

  return (
    <div className="grid min-h-screen place-items-center p-4">
      <Card className="w-full max-w-sm p-6">
        <div className="mb-6 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-brand-600 font-bold text-white">G</span>
          <div>
            <h1 className="font-semibold text-slate-800">GearFlow</h1>
            <p className="text-xs text-slate-400">Gestão de oficina</p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <Field label="E-mail ou usuário">
            <Input value={emailOrUserName} onChange={(e) => setEmail(e.target.value)} autoFocus />
          </Field>
          <Field label="Senha">
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Field>
          <Button type="submit" className="w-full" disabled={login.isPending}>
            {login.isPending ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>
        <p className="mt-4 text-center text-xs text-slate-400">Seed dev: admin@gearflow.local / Admin@123</p>
      </Card>
    </div>
  )
}
