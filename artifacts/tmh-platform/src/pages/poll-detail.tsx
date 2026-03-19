import { useRoute, Link } from "wouter"
import { useGetPoll, useListPolls } from "@workspace/api-client-react"
import { Layout } from "@/components/layout/Layout"
import { PollCard } from "@/components/poll/PollCard"
import { TrendChart } from "@/components/poll/TrendChart"
import { ArrowLeft, AlertCircle } from "lucide-react"

export default function PollDetail() {
  const [, params] = useRoute("/polls/:id")
  const id = params?.id ? parseInt(params.id) : 0

  const { data: poll, isLoading, error } = useGetPoll(id)
  
  // Fetch related automatically using the category of current poll
  const { data: relatedData } = useListPolls(
    { category: poll?.categorySlug, limit: 2 },
    { query: { enabled: !!poll?.categorySlug } }
  )

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="h-8 w-24 bg-secondary animate-pulse mb-8 border border-border" />
          <div className="h-[500px] bg-secondary animate-pulse border border-border" />
        </div>
      </Layout>
    )
  }

  if (error || !poll) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-24 text-center">
          <AlertCircle className="w-16 h-16 text-primary mx-auto mb-6" />
          <h1 className="text-4xl font-serif font-black uppercase tracking-tight mb-4">Poll not found</h1>
          <p className="text-muted-foreground mb-8 font-sans">This poll might have been removed or the link is invalid.</p>
          <Link href="/polls" className="bg-foreground text-background px-6 py-3 font-bold text-xs uppercase tracking-widest hover:bg-primary transition-colors">
            Back to Polls
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 lg:py-16">
        <Link href="/polls" className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground font-bold mb-8 transition-colors">
          <ArrowLeft className="w-3 h-3" /> Back to all polls
        </Link>

        {/* The featured poll card handles voting and result display perfectly */}
        <div className="mb-16">
          <PollCard poll={poll} featured />
        </div>

        {/* Bloomberg-style opinion trend chart */}
        <div className="bg-card border border-border p-6 md:p-10 mb-16">
          <div className="h-px w-8 bg-primary mb-6" />
          <h3 className="font-serif font-black uppercase text-xl tracking-wider mb-6">
            How Opinion Has Shifted
          </h3>
          <TrendChart pollId={poll.id} />
        </div>

        {poll.context && (
          <div className="bg-background border border-border p-8 md:p-12 mb-16">
            <h3 className="font-serif font-black uppercase text-2xl tracking-wider flex items-center gap-3 mb-6">
              The Context
            </h3>
            <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground font-sans">
              <p>{poll.context}</p>
            </div>
            
            {poll.tags && poll.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-border">
                {poll.tags.map(tag => (
                  <span key={tag} className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-secondary text-foreground border border-border">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Related Polls */}
        {relatedData?.polls && relatedData.polls.length > 0 && (
          <div>
            <div className="border-l-4 border-primary pl-4 mb-8">
              <h3 className="font-serif font-black uppercase text-3xl tracking-tight">Related Debates</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {relatedData.polls.filter(p => p.id !== poll.id).map(p => (
                <PollCard key={p.id} poll={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
