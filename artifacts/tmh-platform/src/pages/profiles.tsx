import { useState } from "react"
import { useListProfiles } from "@workspace/api-client-react"
import { Layout } from "@/components/layout/Layout"
import { ProfileCard } from "@/components/profile/ProfileCard"
import { Search, Filter } from "lucide-react"
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
      <div className="bg-background border-b border-border py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-1 w-12 bg-primary mb-6"></div>
          <h1 className="font-serif font-black uppercase text-5xl md:text-7xl text-foreground mb-6 leading-none tracking-tight">
            The TMH Directory
          </h1>
          <p className="text-lg text-muted-foreground font-sans max-w-2xl mb-10">
            Discover and connect with the founders, leaders, and creators shaping the Middle East's future.
          </p>

          <div className="max-w-2xl relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-foreground transition-colors" />
            <input 
              type="text" 
              placeholder="Search by name, company, or sector..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-background border border-border focus:outline-none focus:border-foreground text-foreground transition-all text-base font-medium font-sans"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8 overflow-x-auto pb-4 border-b border-border">
          <div className="flex items-center gap-4">
            <Filter className="w-4 h-4 text-muted-foreground hidden sm:block" />
            {filters.map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "pb-1 text-xs uppercase tracking-widest font-bold transition-colors whitespace-nowrap",
                  filter === f.id
                    ? "border-b-2 border-primary text-primary"
                    : "border-b-2 border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground whitespace-nowrap pl-4">
            {data?.total || 0} profiles
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-64 bg-secondary animate-pulse border border-border" />)}
          </div>
        ) : data?.profiles.length === 0 ? (
          <div className="text-center py-24 border border-border border-dashed bg-secondary/30">
            <p className="font-serif font-bold text-2xl uppercase text-foreground tracking-wider mb-2">No profiles found</p>
            <p className="text-sm text-muted-foreground font-sans">Try adjusting your search criteria.</p>
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
