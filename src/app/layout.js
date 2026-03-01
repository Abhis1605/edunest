import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: "EduNest",
  description: "School Management Portal"
}

export default function RootLayout({ children }){
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}