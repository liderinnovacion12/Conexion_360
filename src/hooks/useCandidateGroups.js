import { useLocalStorage } from './useLocalStorage.js'
import { GROUPS, CANDIDATE_GROUP_MAP } from '../data/mockCandidateGroups.js'

// Grupos libres de aspirantes + asignación muchos-a-muchos, persistidos.
export function useCandidateGroups() {
  const [groups, setGroups] = useLocalStorage('cx360.candidateGroups', GROUPS)
  const [membership, setMembership] = useLocalStorage('cx360.candidateGroupMap', CANDIDATE_GROUP_MAP)

  const addGroup = (name, color = '#19E3D9') => {
    const item = { id: `grp-${Date.now()}`, name, color, createdAt: new Date().toISOString().slice(0, 10) }
    setGroups((list) => [...list, item])
    return item
  }

  const removeGroup = (groupId) => {
    setGroups((list) => list.filter((g) => g.id !== groupId))
    setMembership((list) => list.filter((m) => m.groupId !== groupId))
  }

  const groupsForCandidate = (candidateId) =>
    membership.filter((m) => m.candidateId === candidateId).map((m) => groups.find((g) => g.id === m.groupId)).filter(Boolean)

  const candidatesInGroup = (groupId) => membership.filter((m) => m.groupId === groupId).map((m) => m.candidateId)

  const isMember = (candidateId, groupId) => membership.some((m) => m.candidateId === candidateId && m.groupId === groupId)

  const toggleMembership = (candidateId, groupId) => {
    setMembership((list) =>
      list.some((m) => m.candidateId === candidateId && m.groupId === groupId)
        ? list.filter((m) => !(m.candidateId === candidateId && m.groupId === groupId))
        : [...list, { candidateId, groupId }]
    )
  }

  return { groups, membership, addGroup, removeGroup, groupsForCandidate, candidatesInGroup, isMember, toggleMembership }
}
