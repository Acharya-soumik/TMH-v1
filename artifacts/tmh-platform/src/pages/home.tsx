import { useGetFeaturedPoll, useListPolls, useListProfiles, useListCategories } from "@workspace/api-client-react"
import { Layout } from "@/components/layout/Layout"
import { PollCard } from "@/components/poll/PollCard"
import { ProfileCard } from "@/components/profile/ProfileCard"
import { Link } from "wouter"

export default function Home() {
  const { data: featuredPoll, isLoading: featuredLoading } = useGetFeaturedPoll()
  const { data: trendingPolls, isLoading: trendingLoading } = useListPolls({ filter: 'trending', limit: 3 })
  const { data: featuredProfiles, isLoading: profilesLoading } = useListProfiles({ filter: 'featured', limit: 4 })
  const { data: categories, isLoading: categoriesLoading } = useListCategories()

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-background py-20 lg:py-32 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <div className="h-1 w-16 bg-primary mb-6"></div>
            <h1 className="font-serif font-black uppercase text-6xl md:text-8xl lg:text-9xl leading-none tracking-tight text-foreground mb-8">
              The Region's<br />Opinion Engine.
            </h1>
            <div className="text-xl md:text-2xl text-muted-foreground font-serif font-bold uppercase tracking-widest leading-relaxed">
              <p>THE PULSE OF THE REGION.</p>
              <p>VOTE DAILY.</p>
            </div>
          </div>

          {featuredLoading ? (
            <div className="h-96 bg-secondary animate-pulse border border-border" />
          ) : featuredPoll ? (
            <div className="w-full">
              <PollCard poll={featuredPoll} featured />
            </div>
          ) : null}
        </div>
      </section>

      {/* Trending Polls */}
      <section className="py-20 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12 border-l-4 border-primary pl-4">
            <h2 className="font-serif font-black uppercase text-2xl text-foreground">
              Trending Debates
            </h2>
            <Link href="/polls" className="hidden sm:inline-block text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground">
              View All
            </Link>
          </div>

          {trendingLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1,2,3].map(i => <div key={i} className="h-72 bg-secondary animate-pulse border border-border" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {trendingPolls?.polls.map(poll => (
                <PollCard key={poll.id} poll={poll} />
              ))}
            </div>
          )}
          
          <div className="mt-8 sm:hidden">
            <Link href="/polls" className="block text-center text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground border border-border py-4">
              View All Debates
            </Link>
          </div>
        </div>
      </section>

      {/* Defining Voices */}
      <section className="bg-foreground text-background py-20 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="font-serif font-black uppercase text-2xl text-background border-b-4 border-primary inline-block pb-2">
                Defining Voices
              </h2>
            </div>
            <Link href="/profiles" className="hidden sm:inline-block text-xs font-bold uppercase tracking-widest text-background/50 hover:text-background">
              Directory
            </Link>
          </div>

          {profilesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1,2,3,4].map(i => <div key={i} className="h-48 bg-background/10 animate-pulse border border-background/20" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProfiles?.profiles.map(profile => (
                <div key={profile.id} className="dark">
                  {/* Wrap in a dark class or adjust ProfileCard to naturally invert - we use a wrapper for minimal impact to component */}
                  <ProfileCard profile={profile} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Explore Topics */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 border-l-4 border-primary pl-4">
            <h2 className="font-serif font-black uppercase text-2xl text-foreground">
              Explore Topics
            </h2>
          </div>

          {categoriesLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-20 bg-secondary animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories?.categories.map(cat => (
                <Link 
                  key={cat.slug} 
                  href={`/polls?category=${cat.slug}`}
                  className="bg-secondary p-6 flex flex-col justify-between transition-colors hover:bg-foreground hover:text-background group border border-border"
                >
                  <span className="font-serif font-bold uppercase tracking-wider text-lg mb-4">{cat.name}</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-background/50">
                    {cat.pollCount} Debates
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  )
}
