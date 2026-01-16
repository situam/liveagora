export function DashboardBox({children}: {children: React.ReactNode}) {
  return (
    <div style={{marginBottom: '1rem', border: '1px solid var(--ux-color-secondary)', padding: '1rem', overflow: 'auto'}}>
      {children}
    </div>
  )
}