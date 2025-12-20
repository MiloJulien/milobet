import './globals.css'
import { Providers } from './providers'
import { TabProvider } from './TabContext'

export const metadata = {
  title: 'MILOBET - 2026',
  description: 'Site de pronostics pour la Coupe du Monde 2026',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className="">
        <Providers>
          <TabProvider>
              <main className="bg-gray-950">
                  {children}
              </main>
          </TabProvider>
        </Providers>
      </body>
    </html>
  )
}
