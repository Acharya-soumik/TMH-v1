import { Link, useLocation } from "wouter"
import { Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import { useTheme } from "@/hooks/use-theme"
import { cn } from "@/lib/utils"

export function Navbar() {
  const [location] = useLocation()
  const { isDark, toggleTheme } = useTheme()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { label: "Polls", href: "/polls" },
    { label: "Profiles", href: "/profiles" },
    { label: "Rankings", href: "/rankings" },
    { label: "Weekly Pulse", href: "/weekly-pulse" },
    { label: "About", href: "/about" },
  ]

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
        "bg-background border-border py-4"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-12">
            <Link href="/" className="flex flex-col group">
              <span className="font-serif font-black text-4xl uppercase tracking-widest text-foreground leading-none">
                TMH
              </span>
              <span className="text-[10px] font-sans tracking-[0.3em] uppercase text-foreground leading-none mt-1">
                The Middle East Hustle
              </span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={cn(
                    "text-xs uppercase tracking-[0.2em] font-medium transition-all",
                    location === link.href 
                      ? "text-primary border-b-2 border-primary pb-1" 
                      : "text-foreground hover:border-b-2 hover:border-foreground pb-1"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={toggleTheme}
              className="text-xs uppercase tracking-widest font-bold text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? 'Light' : 'Dark'}
            </button>
            
            <button 
              className="md:hidden p-2 text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-background border-b border-border shadow-lg py-4 px-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={cn(
                "text-lg font-serif font-bold uppercase tracking-wider p-2 transition-colors",
                location === link.href ? "text-primary" : "text-foreground"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
