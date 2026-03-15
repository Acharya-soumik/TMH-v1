import { useRoute, Link } from "wouter"
import { useGetPoll, useListPolls } from "@workspace/api-client-react"
import { Layout } from "@/components/layout/Layout"
import { PollCard } from "@/components/poll/PollCard"
import { ArrowLeft, MessageSquare, AlertCircle } from "lucide-react"

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
          <div className="h-8 w-24 bg-secondary animate-pulse mb-8 rounded" />
          <div className="h-[500px] bg-secondary animate-pulse rounded-2xl" />
        </div>
      </Layout>
    )
  }

  if (error || !poll) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 py-24 text-center">
          <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-6" />
          <h1 className="text-3xl font-serif font-bold mb-4">Poll not found</h1>
          <p className="text-muted-foreground mb-8">This poll might have been removed or the link is invalid.</p>
          <Link href="/polls" className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold">
            Back to Polls
          </Link>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 lg:py-16">
        <Link href="/polls" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to all polls
        </Link>

        {/* The featured poll card handles voting and result display perfectly */}
        <div className="mb-16">
          <PollCard poll={poll} featured />
        </div>

        {poll.context && (
          <div className="bg-card border border-border p-8 rounded-2xl mb-16">
            <h3 className="font-serif font-bold text-2xl flex items-center gap-3 mb-4">
              <MessageSquare className="w-6 h-6 text-primary" /> The Context
            </h3>
            <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground">
              <p>{poll.context}</p>
            </div>
            
            {poll.tags && poll.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-border">
                {poll.tags.map(tag => (
                  <span key={tag} className="text-xs font-medium px-3 py-1 bg-secondary text-secondary-foreground rounded-md">
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
            <h3 className="font-serif font-bold text-2xl mb-6">Related Debates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
