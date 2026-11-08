import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clients · CYTRON Admin',
  description: 'Manage fictional CYTRON client records. These samples are not real customers.',
}

export default function ClientsLayout({ children }: { children: React.ReactNode }) {
  return children
}
