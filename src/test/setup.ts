import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Desmonta os componentes e zera o localStorage entre os testes.
// (Os testes de ambiente "node", como o de contraste, não têm navegador simulado.)
afterEach(() => {
  if (typeof document === 'undefined') return
  cleanup()
  localStorage.clear()
})
