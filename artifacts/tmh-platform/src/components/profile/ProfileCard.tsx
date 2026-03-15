import { Link } from "wouter"
import { MapPin } from "lucide-react"
import type { Profile } from "@workspace/api-client-react/src/generated/api.schemas"

export function ProfileCard({ profile }: { profile: Profile }) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  return (
    <Link href={`/profiles/${profile.id}`}>
      <div className="group bg-card border border-border hover:border-primary p-6 transition-all duration-300 cursor-pointer h-full flex flex-col">
        <div className="flex items-start gap-4 mb-5">
          <div className="relative">
            {profile.imageUrl ? (
              <img 
                src={profile.imageUrl} 
                alt={profile.name} 
                className="w-16 h-16 rounded-sm object-cover grayscale group-hover:grayscale-0 transition-all border border-border"
              />
            ) : (
              <div className="w-16 h-16 rounded-sm bg-secondary text-foreground flex items-center justify-center font-serif font-bold text-xl border border-border">
                {getInitials(profile.name)}
              </div>
            )}
            {profile.isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-primary w-2 h-2 rounded-full border border-background" title="Verified Voice" />
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="font-serif font-bold text-base uppercase tracking-wider text-foreground group-hover:text-primary transition-colors leading-tight">
              {profile.name}
            </h3>
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" /> {profile.city}
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-5 flex-1 font-sans">
          {profile.headline}
        </p>

        <div className="pt-4 border-t border-border flex items-center justify-between text-xs mt-auto">
          <span className="bg-foreground text-background text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full font-bold">
            {profile.sector}
          </span>
          {profile.associatedPollCount > 0 && (
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
              {profile.associatedPollCount} Polls
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
