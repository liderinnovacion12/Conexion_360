import { useState } from 'react'
import PageHeader from '../../components/common/PageHeader.jsx'
import { Card } from '../../components/ui/Card.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { Tabs } from '../../components/ui/Feedback.jsx'
import KanbanBoard from '../../components/feature/KanbanBoard.jsx'
import FunnelChart from '../../components/charts/FunnelChart.jsx'
import { STATUS_VARIANT } from '../../data/mockCandidates.js'
import { PIPELINE_STAGES } from '../../data/pipeline.js'
import { RECRUITMENT_FUNNEL } from '../../data/mockAnalytics.js'
import { useCandidates } from '../../hooks/useCandidates.js'

export default function Pipeline() {
  const { candidates: items, moveStage } = useCandidates()
  const [view, setView] = useState('kanban')

  const move = (id, stage) => {
    moveStage(id, stage)
  }

  return (
    <div className="page">
      <PageHeader
        title="Pipeline de reclutamiento"
        subtitle="Arrastra los aspirantes entre etapas. Vista Kanban o embudo."
        actions={
          <Tabs
            active={view}
            onChange={setView}
            tabs={[{ value: 'kanban', label: 'Kanban' }, { value: 'funnel', label: 'Embudo' }]}
          />
        }
      />

      {view === 'kanban' ? (
        <div className="anim-up">
          <KanbanBoard
            columns={PIPELINE_STAGES}
            items={items}
            onMove={move}
            renderCard={(c) => (
              <div className="col gap-2">
                <b>{c.name}</b>
                <small>{c.position}</small>
                <div className="row between">
                  <Badge variant={STATUS_VARIANT[c.status]} dot>{c.status}</Badge>
                  <small>{c.progress}%</small>
                </div>
              </div>
            )}
          />
        </div>
      ) : (
        <Card title="Embudo de conversión" subtitle="Aspirantes por etapa" className="anim-up">
          <FunnelChart data={RECRUITMENT_FUNNEL} />
        </Card>
      )}
    </div>
  )
}
