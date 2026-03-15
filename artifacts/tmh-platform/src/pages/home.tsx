import { useGetFeaturedPoll, useListPolls, useListProfiles, useListCategories } from "@workspace/api-client-react"
import { Layout } from "@/components/layout/Layout"
import { PollCard } from "@/components/poll/PollCard"
import { ProfileCard } from "@/components/profile/ProfileCard"
import { ArrowRight, Flame, Mic2, Grid2X2 } from "lucide-react"
import { Link } from "wouter"

export default function Home() {
  const { data: featuredPoll, isLoading: featuredLoading } = useGetFeaturedPoll()
  const { data: trendingPolls, isLoading: trendingLoading } = useListPolls({ filter: 'trending', limit: 3 })
  const { data: featuredProfiles, isLoading: profilesLoading } = useListProfiles({ filter: 'featured', limit: 4 })
  const { data: categories, isLoading: categoriesLoading } = useListCategories()

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 py-12 lg:py-20 max-w-7xl mx-auto border-b border-border">
        <div className="absolute inset-0 -z-10 bg-[url('/images/hero-bg.png')] bg-cover bg-center opacity-10 dark:opacity-20 rounded-3xl mix-blend-overlay"></div>
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-foreground tracking-tight leading-tight mb-6">
            The pulse of the <span className="text-primary italic pr-2">Middle East.</span>
          </h1>
          <p className="text-lg text-muted-foreground font-medium">
            High-signal opinions from the region's leading voices. Join the daily debate on startups, culture, and the future.
          </p>
        </div>

        {featuredLoading ? (
          <div className="h-96 rounded-2xl bg-secondary animate-pulse" />
        ) : featuredPoll ? (
          <PollCard poll={featuredPoll} featured />
        ) : null}
      </section>

      {/* Trending Polls */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-serif text-3xl font-bold text-foreground flex items-center gap-2">
              <Flame className="w-8 h-8 text-destructive" /> Trending Debates
            </h2>
            <p className="text-muted-foreground mt-2">What the region is voting on today</p>
          </div>
          <Link href="/polls" className="hidden sm:flex items-center gap-2 text-primary font-semibold hover:underline">
            View all polls <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {trendingLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="h-72 rounded-2xl bg-secondary animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {trendingPolls?.polls.map(poll => (
              <PollCard key={poll.id} poll={poll} />
            ))}
          </div>
        )}
        <div className="mt-8 text-center sm:hidden">
          <Link href="/polls" className="inline-flex items-center gap-2 text-primary font-semibold bg-primary/10 px-6 py-3 rounded-full">
            View all polls <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Featured Voices */}
      <section className="bg-card border-y border-border py-16">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-serif text-3xl font-bold text-foreground flex items-center gap-2">
                <Mic2 className="w-8 h-8 text-primary" /> Defining Voices
              </h2>
              <p className="text-muted-foreground mt-2">Leaders shaping the Middle East narrative</p>
            </div>
            <Link href="/profiles" className="hidden sm:flex items-center gap-2 text-primary font-semibold hover:underline">
              Directory <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {profilesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1,2,3,4].map(i => <div key={i} className="h-48 rounded-2xl bg-secondary animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProfiles?.profiles.map(profile => (
                <ProfileCard key={profile.id} profile={profile} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Explore Categories */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="font-serif text-3xl font-bold text-foreground flex items-center justify-center gap-2">
            <Grid2X2 className="w-8 h-8 text-accent" /> Explore Topics
          </h2>
        </div>

        {categoriesLoading ? (
          <div className="flex flex-wrap justify-center gap-3">
            {[1,2,3,4,5,6].map(i => <div key={i} className="h-12 w-32 rounded-full bg-secondary animate-pulse" />)}
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-4">
            {categories?.categories.map(cat => (
              <Link 
                key={cat.slug} 
                href={`/polls?category=${cat.slug}`}
                className="bg-card border border-border hover:border-primary hover:shadow-md px-6 py-3 rounded-full flex items-center gap-3 transition-all group"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">{cat.icon}</span>
                <span className="font-semibold text-foreground">{cat.name}</span>
                <span className="bg-secondary text-muted-foreground text-xs px-2 py-0.5 rounded-md">
                  {cat.pollCount}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </Layout>
  )
}
