import { ReactNode } from "react"
import { Navbar } from "./Navbar"
import { Footer } from "./Footer"
import { CookieConsent } from "@/components/ui/CookieConsent"

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-20">
        {children}
      </main>
      <Footer />
      <CookieConsent />
    </div>
  )
}
