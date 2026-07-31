/** Backend usa inteiro de centavos. Helpers para exibir/editar em R$. */
export const toBRL = (cents?: number | null): string =>
  ((cents ?? 0) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

/** Converte "12,50" ou "12.50" (reais) em centavos inteiros. */
export const centsFromInput = (value: string): number =>
  Math.round(parseFloat((value || '0').replace(',', '.')) * 100)

/** Centavos → string em reais para input (ex.: 1250 → "12.50"). */
export const reaisFromCents = (cents?: number | null): string => ((cents ?? 0) / 100).toFixed(2)
