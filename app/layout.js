import { AuthProvider } from '@/src/context/AuthContext'
import { DataProvider } from '@/src/context/DataContext'
import { Toast } from '@/src/components/Toast'
import '@/src/styles/globals.css'

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a1628',
}

export const metadata = {
  title: 'חוג שייט | מרכז דניאל',
  description: 'מערכת ניהול קבוצות שייט',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl" className="dark">
      <body>
        <div id="__next">
          <AuthProvider>
            <DataProvider>
              {children}
              <Toast />
            </DataProvider>
          </AuthProvider>
        </div>
      </body>
    </html>
  )
}
