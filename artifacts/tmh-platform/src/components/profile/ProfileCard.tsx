import { Link } from "wouter"
import { MapPin, TrendingUp } from "lucide-react"
import type { Profile } from "@workspace/api-client-react/src/generated/api.schemas"
import { cn } from "@/lib/utils"

export function ProfileCard({ profile }: { profile: Profile }) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
  }

  return (
    <Link href={`/profiles/${profile.id}`}>
      <div className="group bg-card hover:bg-secondary/20 border border-border hover:border-primary/40 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl cursor-pointer h-full flex flex-col">
        <div className="flex items-start gap-4 mb-5">
          <div className="relative">
            {profile.imageUrl ? (
              <img 
                src={profile.imageUrl} 
                alt={profile.name} 
                className="w-16 h-16 rounded-full object-cover border-2 border-background shadow-md group-hover:border-primary transition-colors"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-serif font-bold text-xl border-2 border-background shadow-md group-hover:border-primary transition-colors">
                {getInitials(profile.name)}
              </div>
            )}
            {profile.isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-primary text-primary-foreground p-0.5 rounded-full border-2 border-background" title="Verified Voice">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="font-serif font-bold text-lg text-foreground group-hover:text-primary transition-colors">
              {profile.name}
            </h3>
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5 mt-1">
              <MapPin className="w-3.5 h-3.5" /> {profile.city}, {profile.country}
            </p>
          </div>
        </div>

        <p className="text-sm text-foreground/80 line-clamp-3 mb-5 flex-1">
          {profile.headline}
        </p>

        <div className="pt-4 border-t border-border flex items-center justify-between text-xs mt-auto">
          <span className="bg-secondary text-secondary-foreground px-2.5 py-1 rounded-md font-medium">
            {profile.sector}
          </span>
          {profile.associatedPollCount > 0 && (
            <span className="flex items-center gap-1 text-muted-foreground font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              {profile.associatedPollCount} Polls
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
