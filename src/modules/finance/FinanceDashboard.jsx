import { Wallet, Users, Briefcase, Building2 } from 'lucide-react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card, KpiCard } from '../../components/ui/Card.jsx'
import { BarChartCard, LineChartCard, DonutChart } from '../../components/charts/Charts.jsx'
import { PERSONNEL } from '../../data/mockPersonnel.js'
import { PAYROLL_TREND } from '../../data/mockAnalytics.js'
import { totalPayroll, groupSum, countBy } from './financeUtils.js'
import { formatCOP } from '../../utils/format.js'

export default function FinanceDashboard() {
  const activos = PERSONNEL.filter((p) => p.state === 'Activo')
  const contratistas = PERSONNEL.filter((p) => p.contract === 'Prestación de servicios')
  const byPosition = groupSum(activos, 'position').sort((a, b) => b.value - a.value).slice(0, 6)
  const byContract = countBy(PERSONNEL, 'contract').map((d, i) => ({
    ...d,
    color: ['#19E3D9', '#9B5DE5', '#00BCD4', '#FFC857'][i % 4],
  }))

  return (
    <div className="page">
      <PageHeader title="Tablero financiero" subtitle="Control de nómina y costos de personal." />

      <div className="grid grid-kpi stagger" style={{ marginBottom: 18 }}>
        <KpiCard label="Valor total de nómina" value={formatCOP(totalPayroll())} icon={Wallet} accent="success" trend={{ dir: 'up', text: '+3.0% mensual' }} />
        <KpiCard label="Personal activo" value={activos.length} icon={Users} accent="teal" trend={{ dir: 'up', text: `${PERSONNEL.length} registros` }} />
        <KpiCard label="Contratistas" value={contratistas.length} icon={Briefcase} accent="violet" trend={{ dir: 'flat', text: 'Prestación de servicios' }} />
        <KpiCard label="Áreas operativas" value={new Set(PERSONNEL.map((p) => p.area)).size} icon={Building2} accent="cyan" trend={{ dir: 'up', text: 'Distribución por área' }} />
      </div>

      <div className="grid grid-2" style={{ marginBottom: 18 }}>
        <Card title="Tendencia mensual de costos" subtitle="Millones COP">
          <LineChartCard data={PAYROLL_TREND} xKey="month" area lines={[{ key: 'costo', name: 'Costo (M)', color: '#2EE6A6' }]} />
        </Card>
        <Card title="Nómina por tipo de contrato" subtitle="Distribución de personal">
          <DonutChart data={byContract} />
        </Card>
      </div>

      <Card title="Nómina por cargo (Top 6)" subtitle="Millones COP · personal activo">
        <BarChartCard data={byPosition} xKey="name" bars={[{ key: 'value', name: 'Nómina (M)', color: '#19E3D9' }]} height={300} />
      </Card>
    </div>
  )
}
