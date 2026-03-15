import { useRoute, Link } from "wouter"
import { useGetProfile } from "@workspace/api-client-react"
import { Layout } from "@/components/layout/Layout"
import { PollCard } from "@/components/poll/PollCard"
import { ProfileCard } from "@/components/profile/ProfileCard"
import { ArrowLeft, MapPin, Building, Briefcase, Eye, Quote } from "lucide-react"

export default function ProfileDetail() {
  const [, params] = useRoute("/profiles/:id")
  const id = params?.id ? parseInt(params.id) : 0

  const { data: profile, isLoading, error } = useGetProfile(id)

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="h-8 w-24 bg-secondary animate-pulse mb-8 rounded" />
          <div className="h-[300px] bg-secondary animate-pulse rounded-2xl mb-8" />
          <div className="h-64 bg-secondary animate-pulse rounded-2xl" />
        </div>
      </Layout>
    )
  }

  if (error || !profile) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-24 text-center">
          <h1 className="text-3xl font-serif font-bold mb-4">Profile not found</h1>
          <Link href="/profiles" className="text-primary hover:underline font-bold">
            Back to Directory
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* Header Banner */}
      <div className="bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
          <Link href="/profiles" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium mb-10 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Directory
          </Link>

          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start">
            {profile.imageUrl ? (
              <img 
                src={profile.imageUrl} 
                alt={profile.name} 
                className="w-32 h-32 md:w-48 md:h-48 rounded-2xl object-cover border-4 border-background shadow-xl flex-shrink-0"
              />
            ) : (
              <div className="w-32 h-32 md:w-48 md:h-48 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-serif font-bold text-5xl border-4 border-background shadow-xl flex-shrink-0">
                {profile.name.substring(0,2).toUpperCase()}
              </div>
            )}
            
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full uppercase tracking-wider">
                  {profile.sector}
                </span>
                {profile.isVerified && (
                  <span className="px-3 py-1 bg-accent text-accent-foreground text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    Verified
                  </span>
                )}
                <span className="text-muted-foreground text-sm font-medium flex items-center gap-1 ml-auto">
                  <Eye className="w-4 h-4" /> {profile.viewCount.toLocaleString()}
                </span>
              </div>
              
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
                {profile.name}
              </h1>
              <p className="text-xl text-muted-foreground mb-6 font-medium">
                {profile.headline}
              </p>
              
              <div className="flex flex-wrap items-center gap-6 text-sm font-semibold text-foreground/80">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary" /> {profile.role}
                </div>
                {profile.company && (
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-primary" /> {profile.company}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" /> {profile.city}, {profile.country}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          {profile.quote && (
            <div className="relative p-8 bg-secondary/30 rounded-2xl border border-border">
              <Quote className="absolute top-6 left-6 w-10 h-10 text-primary/20 rotate-180" />
              <p className="relative z-10 font-serif text-xl md:text-2xl font-medium italic text-foreground leading-relaxed pt-4">
                "{profile.quote}"
              </p>
            </div>
          )}

          <section>
            <h2 className="font-serif text-2xl font-bold mb-4">The Story</h2>
            <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground">
              {profile.story.split('\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </section>

          {profile.lessonsLearned && profile.lessonsLearned.length > 0 && (
            <section className="bg-card border border-border p-8 rounded-2xl shadow-sm">
              <h2 className="font-serif text-2xl font-bold mb-6 text-primary">Lessons Learned</h2>
              <ul className="space-y-4">
                {profile.lessonsLearned.map((lesson, i) => (
                  <li key={i} className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                      {i + 1}
                    </span>
                    <span className="text-lg font-medium text-foreground pt-1">{lesson}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {profile.relatedPolls && profile.relatedPolls.length > 0 && (
            <section>
              <h2 className="font-serif text-2xl font-bold mb-6">Associated Polls</h2>
              <div className="grid gap-6">
                {profile.relatedPolls.map(poll => (
                  <PollCard key={poll.id} poll={poll} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
          {profile.similarProfiles && profile.similarProfiles.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-6">
              <h3 className="font-serif font-bold text-xl mb-6">Similar Voices</h3>
              <div className="space-y-4">
                {profile.similarProfiles.map(similar => (
                  <ProfileCard key={similar.id} profile={similar} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
