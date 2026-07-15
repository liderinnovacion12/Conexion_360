-- Permite que quien tiene el turno de aprobar un contrato o documento
-- generado pueda VER su contenido (previsualización en la bandeja de
-- aprobación), sin importar su rol. Antes solo admin/legal/reclutamiento
-- (y finanzas, en contratos) podían leer estas tablas, así que un
-- aprobador de otra área quedaba "aprobando a ciegas". Mismo patrón que
-- ya existía en approvals/approval_chain_steps (assignee_select).

create policy contracts_assignee_select on contracts
for select
using (
  exists (
    select 1 from approval_chain_steps s
    where s.approval_id = contracts.approval_request_id
    and s.assigned_to = auth.uid()
  )
);

create policy generated_documents_assignee_select on generated_documents
for select
using (
  exists (
    select 1 from approval_chain_steps s
    where s.approval_id = generated_documents.approval_request_id
    and s.assigned_to = auth.uid()
  )
);
