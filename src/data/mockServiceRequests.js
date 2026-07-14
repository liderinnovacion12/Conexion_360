// Solicitudes de servicio enviadas por clientes desde la vitrina (rol
// Cliente). El Admin las revisa y actualiza su estado desde
// Admin → Solicitudes de clientes.
export const SERVICE_REQUEST_STATES = ['pendiente', 'en gestión', 'atendida', 'cerrada']

export const SERVICE_REQUESTS = []

/*
Forma de cada solicitud:
{
  id, serviceId, serviceName,
  requestedById, requestedBy, company,
  message, createdAt,
  status: 'pendiente' | 'en gestión' | 'atendida' | 'cerrada',
}
*/
