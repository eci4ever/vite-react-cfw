import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/invoices')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/invoices"!</div>
}
