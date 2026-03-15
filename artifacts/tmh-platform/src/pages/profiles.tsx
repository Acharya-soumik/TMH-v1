import { useState } from "react"
import { useListProfiles } from "@workspace/api-client-react"
import { Layout } from "@/components/layout/Layout"
import { ProfileCard } from "@/components/profile/ProfileCard"
import { Search, Filter, Mic2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function Profiles() {
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<'featured' | 'newest' | 'most_viewed'>('featured')

  // Debounce search in a real app, simplified here
  const { data, isLoading } = useListProfiles({ search, filter, limit: 24 })

  const filters = [
    { id: 'featured', label: 'Featured Voices' },
    { id: 'most_viewed', label: 'Most Viewed' },
    { id: 'newest', label: 'Newly Added' },
  ] as const

  return (
    <Layout>
      <div className="bg-card border-b border-border py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-6 text-primary">
            <Mic2 className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            The TMH Directory
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Discover and connect with the founders, leaders, and creators shaping the Middle East's future.
          </p>

          <div className="max-w-2xl mx-auto relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name, company, or sector..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-background border-2 border-border focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 text-foreground transition-all text-lg font-medium shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            {filters.map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap",
                  filter === f.id
                    ? "bg-foreground text-background"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/70"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="text-sm font-medium text-muted-foreground whitespace-nowrap pl-4">
            {data?.total || 0} profiles
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-64 rounded-2xl bg-secondary animate-pulse" />)}
          </div>
        ) : data?.profiles.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-xl font-medium text-muted-foreground">No profiles found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data?.profiles.map(profile => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
