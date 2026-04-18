import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { ApolloWrapper } from '@/lib/apollo/browser-provider'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'HumanUpgrade — A precision biohacking workbench',
    template: '%s · HumanUpgrade',
  },
  description:
    'Explore a curated knowledge graph of podcasts, claims, compounds, products, lab tests, biomarkers and case studies — and turn it into a personal protocol you actually run.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ClerkProvider>
          <ApolloWrapper>{children}</ApolloWrapper>
        </ClerkProvider>
      </body>
    </html>
  )
}
