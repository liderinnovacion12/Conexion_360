import { useLocalStorage } from './useLocalStorage.js'
import { TRACKS } from '../data/mockCandidates.js'

// Vías de vinculación (Funcionarios, Contratistas...) — libres de crear,
// igual que los grupos. No se limita a un par fijo de opciones: puede haber
// tantas vías como cargos/categorías necesite el reclutador.
export function useTracks() {
  const [tracks, setTracks] = useLocalStorage('cx360.tracks', TRACKS)

  const addTrack = (label) => {
    const id = label.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
    if (!id || tracks.some((t) => t.id === id)) return tracks.find((t) => t.id === id)
    const item = { id, label: label.trim() }
    setTracks((list) => [...list, item])
    return item
  }

  const removeTrack = (id) => {
    setTracks((list) => list.filter((t) => t.id !== id))
  }

  const trackLabel = (id) => tracks.find((t) => t.id === id)?.label || id

  return { tracks, addTrack, removeTrack, trackLabel }
}
