import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import React from 'react'

import { siteConfig } from '@/site.config'
import Footer from '@/components/Footer'
import Header from '@/components/Header'
import './styles.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body id="top">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
