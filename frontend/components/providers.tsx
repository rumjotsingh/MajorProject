'use client'

import { Provider } from 'react-redux'
import { store } from '@/lib/store'
import { ThemeProvider } from '@/components/theme-provider'
import { SocketProvider } from '@/contexts/socket-context'
import { ToastProvider } from '@/components/toast-provider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem={true}
        storageKey="credmatrix-theme"
      >
        <SocketProvider>
          {children}
          <ToastProvider />
        </SocketProvider>
      </ThemeProvider>
    </Provider>
  )
}
