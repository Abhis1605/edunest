import { Inter } from 'next/font/google'
import './globals.css'
import SessionWrapper from '@/components/shared/SessionWrapper'
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: "EduNest",
  description: "School Management Portal"
}

export default function RootLayout({ children }){
  return (
    <html lang='en' className='dark' suppressHydrationWarning>
      <body className={inter.className}>
        <SessionWrapper>
          {children}
          <Toaster richColors position="top-right" />
        </SessionWrapper>
      </body>
    </html>
  )
}