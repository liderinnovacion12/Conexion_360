import { useState, useMemo } from 'react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card, KpiCard } from '../../components/ui/Card.jsx'
import { Select } from '../../components/ui/Form.jsx'
import { BarChartCard, LineChartCard, DonutChart } from '../../components/charts/Charts.jsx'
import { Wallet, Users, Percent } from 'lucide-react'
import { PERSONNEL } from '../../data/mockPersonnel.js'
import { PAYROLL_TREND } from '../../data/mockAnalytics.js'
import { totalPayroll, groupSum, countBy } from './financeUtils.js'
import { formatCOP } from '../../utils/format.js'

export default function PayrollAnalytics() {
  const [area, setArea] = useState('')
  const areas = useMemo(() => [...new Set(PERSONNEL.map((p) => p.area))], [])
  const rows = area ? PERSONNEL.filter((p) => p.area === area) : PERSONNEL
  const activos = rows.filter((p) => p.state === 'Activo')

  const byArea = groupSum(PERSONNEL, 'area').sort((a, b) => b.value - a.value)
  const byContract = groupSum(rows, 'contract')
  const byState = countBy(rows, 'state').map((d, i) => ({ ...d, color: ['#2EE6A6', '#6b7793', '#FFC857'][i % 3] }))
  const avg = activos.length ? totalPayroll(rows) / activos.length : 0

  return (
    <div className="page">
      <PageHeader
        title="Analítica de nómina"
        subtitle="Costos por área, cargo, contrato y estado."
        actions={<Select placeholder="Todas las áreas" value={area} onChange={(e) => setArea(e.target.value)} options={areas} />}
      />

      <div className="grid grid-kpi stagger" style={{ marginBottom: 18 }}>
        <KpiCard label="Nómina (selección)" value={formatCOP(totalPayroll(rows))} icon={Wallet} accent="success" />
        <KpiCard label="Personas activas" value={activos.length} icon={Users} accent="teal" />
        <KpiCard label="Salario promedio" value={formatCOP(avg)} icon={Percent} accent="violet" />
      </div>

      <div className="grid grid-2" style={{ marginBottom: 18 }}>
        <Card title="Tendencia mensual de nómina" subtitle="Millones COP">
          <LineChartCard data={PAYROLL_TREND} xKey="month" area lines={[{ key: 'costo', name: 'Costo (M)' }]} />
        </Card>
        <Card title="Nómina por estado" subtitle="Cantidad de personas">
          <DonutChart data={byState} />
        </Card>
      </div>

      <div className="grid grid-2">
        <Card title="Nómina por área" subtitle="Millones COP">
          <BarChartCard data={byArea} xKey="name" bars={[{ key: 'value', name: 'Nómina (M)', color: '#19E3D9' }]} />
        </Card>
        <Card title="Nómina por tipo de contrato" subtitle="Millones COP">
          <BarChartCard data={byContract} xKey="name" bars={[{ key: 'value', name: 'Nómina (M)', color: '#9B5DE5' }]} />
        </Card>
      </div>
    </div>
  )
}
