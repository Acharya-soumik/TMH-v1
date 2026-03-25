import { ReactNode, useEffect } from "react"
import { useLocation } from "wouter"
import { Navbar } from "./Navbar"
import { Footer } from "./Footer"
import { CookieConsent } from "@/components/ui/CookieConsent"

export function Layout({ children }: { children: ReactNode }) {
  const [location] = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [location])

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
