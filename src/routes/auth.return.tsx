import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/auth/return')({
  beforeLoad: () => {
    const url = sessionStorage.getItem('form_client_url')
    throw redirect({ to: url || '/' })
  },
})
