import { useState } from "react"
import { useLocation } from "wouter"
import { useListPolls, useListCategories } from "@workspace/api-client-react"
import { Layout } from "@/components/layout/Layout"
import { PollCard } from "@/components/poll/PollCard"
import { Filter, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

export default function Polls() {
  const [location] = useLocation()
  const searchParams = new URLSearchParams(window.location.search)
  const initialCategory = searchParams.get('category') || undefined
  
  const [filter, setFilter] = useState<'latest' | 'trending' | 'most_voted'>('latest')
  const [category, setCategory] = useState<string | undefined>(initialCategory)

  const { data: pollsData, isLoading } = useListPolls({ filter, category, limit: 20 })
  const { data: categoriesData } = useListCategories()

  const tabs = [
    { id: 'latest', label: 'Latest' },
    { id: 'trending', label: 'Trending' },
    { id: 'most_voted', label: 'Most Voted' }
  ] as const

  return (
    <Layout>
      <div className="bg-card border-b border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            The Polls
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Vote, debate, and see where the region stands on the issues that matter most.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col lg:flex-row gap-10">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0 space-y-8">
          <div>
            <h3 className="font-serif font-bold text-lg mb-4 flex items-center gap-2">
              <Filter className="w-4 h-4" /> Sort By
            </h3>
            <div className="flex flex-col gap-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={cn(
                    "text-left px-4 py-2.5 rounded-lg font-medium transition-colors",
                    filter === tab.id 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-serif font-bold text-lg mb-4 flex items-center gap-2">
              <Search className="w-4 h-4" /> Categories
            </h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setCategory(undefined)}
                className={cn(
                  "text-left px-4 py-2.5 rounded-lg font-medium transition-colors flex justify-between",
                  !category 
                    ? "bg-secondary text-foreground font-bold" 
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}
              >
                All Topics
              </button>
              {categoriesData?.categories.map(cat => (
                <button
                  key={cat.slug}
                  onClick={() => setCategory(cat.slug)}
                  className={cn(
                    "text-left px-4 py-2.5 rounded-lg font-medium transition-colors flex justify-between items-center",
                    category === cat.slug 
                      ? "bg-secondary text-foreground font-bold" 
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span>{cat.icon}</span> {cat.name}
                  </span>
                  {category === cat.slug && <X className="w-3 h-3 opacity-50" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1,2,3,4].map(i => <div key={i} className="h-80 rounded-2xl bg-secondary animate-pulse" />)}
            </div>
          ) : pollsData?.polls.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-2xl border border-border border-dashed">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-bold text-foreground mb-2">No polls found</h3>
              <p className="text-muted-foreground">Try adjusting your filters to find more discussions.</p>
              <button 
                onClick={() => { setFilter('latest'); setCategory(undefined); }}
                className="mt-6 text-primary font-semibold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {pollsData?.polls.map(poll => (
                <PollCard key={poll.id} poll={poll} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
