import { useState, useEffect } from 'react'

// Estado persistente en localStorage (sincroniza en cada cambio).
export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* almacenamiento no disponible */
    }
  }, [key, value])

  return [value, setValue]
}
