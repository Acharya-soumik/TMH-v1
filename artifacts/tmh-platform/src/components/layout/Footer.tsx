import { Link } from "wouter"

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-8 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center group">
            <span className="font-serif font-black text-3xl uppercase tracking-widest leading-none">
              TMH
            </span>
          </Link>
          
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href="/polls" className="text-xs uppercase tracking-[0.2em] font-medium text-background/70 hover:text-background transition-colors">Polls</Link>
            <Link href="/profiles" className="text-xs uppercase tracking-[0.2em] font-medium text-background/70 hover:text-background transition-colors">Profiles</Link>
            <Link href="/rankings" className="text-xs uppercase tracking-[0.2em] font-medium text-background/70 hover:text-background transition-colors">Rankings</Link>
            <Link href="/about" className="text-xs uppercase tracking-[0.2em] font-medium text-background/70 hover:text-background transition-colors">About</Link>
          </div>
          
          <div className="text-[10px] uppercase tracking-widest text-background/50">
            © {new Date().getFullYear()} The Middle East Hustle.
          </div>
        </div>
      </div>
    </footer>
  )
}
