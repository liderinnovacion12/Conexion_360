import { PERSONNEL } from '../../data/mockPersonnel.js'

export const totalPayroll = (rows = PERSONNEL) =>
  rows.filter((p) => p.state === 'Activo').reduce((s, p) => s + p.salary, 0)

export const groupSum = (rows, key) => {
  const map = {}
  rows.forEach((p) => {
    map[p[key]] = (map[p[key]] || 0) + p.salary
  })
  return Object.entries(map).map(([name, value]) => ({ name, value: Math.round(value / 1e6 * 10) / 10 }))
}

export const countBy = (rows, key) => {
  const map = {}
  rows.forEach((p) => {
    map[p[key]] = (map[p[key]] || 0) + 1
  })
  return Object.entries(map).map(([name, value]) => ({ name, value }))
}
