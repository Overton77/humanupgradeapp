import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { ApolloWrapper } from '@/lib/apollo/browser-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
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
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ClerkProvider afterSignOutUrl="/">
          <ApolloWrapper>
            <TooltipProvider delayDuration={150}>{children}</TooltipProvider>
          </ApolloWrapper>
        </ClerkProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
