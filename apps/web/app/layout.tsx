import type { Metadata } from 'next'
import './globals.css'

import localFont from 'next/font/local'

const sfProRoundedBold = localFont({
  src: './fonts/SFProRounded-Bold.otf',
  variable: '--font-sfpr-bold',
  display: 'swap',
})

const sfProRoundedSemiBold = localFont({
  src: './fonts/SFProRounded-Semibold.otf',
  variable: '--font-sfpr-semi-bold',
  display: 'swap',
})

const sfProRoundedMedium = localFont({
  src: './fonts/SFProRounded-Medium.otf',
  variable: '--font-sfpr-medium',
  display: 'swap',
})

export const metadata: Metadata = {
  title: '[Job Application] JurneeGo',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${sfProRoundedBold.variable} ${sfProRoundedSemiBold.variable} ${sfProRoundedMedium.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
