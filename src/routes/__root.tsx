import { useState } from 'react'
import type { ReactNode, PropsWithChildren } from 'react'
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import '@/styles/main.css'

interface MyRouterContext {
  queryClient: typeof QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: async () => {
    return await root_metadatas()
  },
  shellComponent: RootDocument,
})

let client

function RootDocument({ children }: PropsWithChildren): ReactNode {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            refetchOnWindowFocus: false,
          },
        },
      }),
  )
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-emerald-500 selection:text-white">
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  )
}

async function root_metadatas(key = 'all') {
  const title = 'Poultnova | Precision Poultry Management ERP & Health Guide'

  const description =
    'Poultnova (poultnova.com) is a commercial poultry management ERP for broilers, noilers, and layers featuring flock monitoring, feed calculators, vaccination schedules, IoT telemetry, and farm accounting.'

  const metadata = {
    meta: [
      { title },
      { charSet: 'utf-8' },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      { name: 'description', content: description },
      {
        name: 'keywords',
        content:
          'Poultnova, poultnova.com, Poultry ERP, Broiler Management, Noiler Farming, Layer Egg Production, Poultry Health Guide, Vaccination Schedule, Poultry Farm Management',
      },
      { name: 'theme-color', content: '#10b981' },
      { name: 'author', content: 'Iroka Ntomchukwu Chisom' },
      { name: 'author:url', content: 'https://iroka09.github.io' },

      // Open Graph
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: 'https://poultnova.com' },
      { property: 'og:site_name', content: 'Poultnova' },
      { property: 'og:image', content: '/poultnova-logo-light.png' },
      {
        property: 'og:image:alt',
        content: 'Poultnova Poultry Management ERP logo',
      },

      // Twitter / X Card
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: '/poultnova-logo-light.png' },
    ],
    links: [
      { rel: 'icon', type: 'image/png', href: '/poultnova-logo-mark.png' },
      { rel: 'apple-touch-icon', href: '/poultnova-logo-mark.png' },
      { rel: 'canonical', href: 'https://poultnova.com' },
    ],
    scripts: [],
  }

  if (key === 'all') return metadata
  return metadata[key]
}
