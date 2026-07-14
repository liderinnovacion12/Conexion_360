import { useLocalStorage } from './useLocalStorage.js'
import { useAuth } from '../context/AuthContext.jsx'

// Biblioteca de firmas propia de cada usuario (antes era un único storage
// global compartido por cualquiera que abriera el editor).
export function useMySignatures() {
  const { user } = useAuth()
  const key = user ? `cx360.signatures.${user.id}` : 'cx360.signatures.anon'
  return useLocalStorage(key, [])
}
