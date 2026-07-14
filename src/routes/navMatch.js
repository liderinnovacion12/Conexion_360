// Encuentra el ítem de NAV_CONFIG que corresponde a una ruta actual, para un rol dado.
// Reutilizado por DashboardLayout (título de página) y PermissionsContext (chequeo de acceso).
export function matchNavItem(navConfig, role, pathname) {
  const items = (navConfig[role] || []).flatMap((s) => s.items)
  return items
    .filter((i) => pathname === i.to || pathname.startsWith(i.to + '/'))
    .sort((a, b) => b.to.length - a.to.length)[0]
}
