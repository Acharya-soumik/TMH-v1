import { Link } from "wouter"
import { BarChart2, Twitter, Linkedin, Instagram } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-card border-t border-border py-12 lg:py-16 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
                <BarChart2 className="w-5 h-5" />
              </div>
              <span className="font-serif font-bold text-xl tracking-tight text-foreground">
                THE MIDDLE EAST HUSTLE
              </span>
            </Link>
            <p className="text-muted-foreground max-w-sm text-sm leading-relaxed mb-6">
              The pulse of the Middle East. High-signal polls, defining voices, and data-driven insights shaping the region's future.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-serif font-semibold text-foreground mb-4">Explore</h4>
            <ul className="space-y-3">
              <li><Link href="/polls" className="text-sm text-muted-foreground hover:text-primary transition-colors">Latest Polls</Link></li>
              <li><Link href="/profiles" className="text-sm text-muted-foreground hover:text-primary transition-colors">Voices & Profiles</Link></li>
              <li><Link href="/rankings" className="text-sm text-muted-foreground hover:text-primary transition-colors">Rankings</Link></li>
              <li><Link href="/weekly-pulse" className="text-sm text-muted-foreground hover:text-primary transition-colors">Weekly Pulse</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-serif font-semibold text-foreground mb-4">Platform</h4>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About TMH</Link></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Submit a Poll</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} The Middle East Hustle. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
