import { useState, useEffect } from 'react'
import { useLocalStorage } from './useLocalStorage.js'
import { GROUPS, CANDIDATE_GROUP_MAP } from '../data/mockCandidateGroups.js'
import { USE_SUPABASE, listGroups, createGroup as apiCreateGroup, removeGroup as apiRemoveGroup, listGroupMembership, toggleGroupMembership as apiToggleMembership } from '../services/api.js'

// Grupos libres de aspirantes + asignación muchos-a-muchos.
// Modo Supabase: lee/escribe en candidate_groups / candidate_group_members.
// Modo mock: mismo comportamiento original, persistido en localStorage.
export function useCandidateGroups() {
  const [mockGroups, setMockGroups] = useLocalStorage('cx360.candidateGroups', GROUPS)
  const [mockMembership, setMockMembership] = useLocalStorage('cx360.candidateGroupMap', CANDIDATE_GROUP_MAP)
  const [remoteGroups, setRemoteGroups] = useState([])
  const [remoteMembership, setRemoteMembership] = useState([])

  const reload = () => {
    if (!USE_SUPABASE) return
    listGroups().then(setRemoteGroups).catch(() => {})
    listGroupMembership().then(setRemoteMembership).catch(() => {})
  }

  useEffect(() => {
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const groups = USE_SUPABASE ? remoteGroups : mockGroups
  const membership = USE_SUPABASE ? remoteMembership : mockMembership

  const addGroup = async (name, color = '#19E3D9') => {
    if (USE_SUPABASE) {
      const item = await apiCreateGroup(name, color)
      setRemoteGroups((list) => [...list, item])
      return item
    }
    const item = { id: `grp-${Date.now()}`, name, color, createdAt: new Date().toISOString().slice(0, 10) }
    setMockGroups((list) => [...list, item])
    return item
  }

  const removeGroup = async (groupId) => {
    if (USE_SUPABASE) {
      await apiRemoveGroup(groupId)
      setRemoteGroups((list) => list.filter((g) => g.id !== groupId))
      setRemoteMembership((list) => list.filter((m) => m.groupId !== groupId))
      return
    }
    setMockGroups((list) => list.filter((g) => g.id !== groupId))
    setMockMembership((list) => list.filter((m) => m.groupId !== groupId))
  }

  const groupsForCandidate = (candidateId) =>
    membership.filter((m) => m.candidateId === candidateId).map((m) => groups.find((g) => g.id === m.groupId)).filter(Boolean)

  const candidatesInGroup = (groupId) => membership.filter((m) => m.groupId === groupId).map((m) => m.candidateId)

  const isMember = (candidateId, groupId) => membership.some((m) => m.candidateId === candidateId && m.groupId === groupId)

  const toggleMembership = async (candidateId, groupId) => {
    const already = isMember(candidateId, groupId)
    if (USE_SUPABASE) {
      await apiToggleMembership(candidateId, groupId, already)
      setRemoteMembership((list) =>
        already ? list.filter((m) => !(m.candidateId === candidateId && m.groupId === groupId)) : [...list, { candidateId, groupId }]
      )
      return
    }
    setMockMembership((list) =>
      already ? list.filter((m) => !(m.candidateId === candidateId && m.groupId === groupId)) : [...list, { candidateId, groupId }]
    )
  }

  return { groups, membership, addGroup, removeGroup, groupsForCandidate, candidatesInGroup, isMember, toggleMembership }
}
