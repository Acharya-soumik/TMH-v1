import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Poll, PollListResponse } from "@workspace/api-client-react";
import { HorizontalScroller } from "./HorizontalScroller";
import { PollTeaserCard } from "./PollTeaserCard";
import { DebateCardSkeleton } from "@/components/skeletons/DebateCardSkeleton";
import { useVoter } from "@/hooks/use-voter";

const SECTION_FETCH_LIMIT = 60;

export interface DebateSectionConfig {
  id: string;
  enabled: boolean;
  order: number;
  title: string;
  subtitle?: string;
  mode: "manual" | "tag" | "category";
  manualPostIds?: number[];
  tag?: string;
  categorySlug?: string;
  cardLimit: number;
  showSeeAll: boolean;
}

interface Props {
  section: DebateSectionConfig;
}

async function fetchSectionPolls(section: DebateSectionConfig): Promise<Poll[]> {
  const params = new URLSearchParams();
  params.set("limit", String(Math.max(section.cardLimit, SECTION_FETCH_LIMIT)));
  if (section.mode === "manual") {
    const ids = (section.manualPostIds ?? []).filter((n) => Number.isFinite(n) && n > 0);
    if (ids.length === 0) return [];
    params.set("ids", ids.join(","));
  } else if (section.mode === "category") {
    const slug = (section.categorySlug ?? "").trim();
    if (!slug) return [];
    params.set("category", slug);
    params.set("filter", "latest");
  } else {
    const tag = (section.tag ?? "").trim();
    if (!tag) return [];
    params.set("tag", tag);
  }
  const res = await fetch(`/api/polls?${params.toString()}`);
  if (!res.ok) return [];
  const data: PollListResponse = await res.json();
  return data.polls ?? [];
}

export function DebateSection({ section }: Props) {
  const queryKey =
    section.mode === "manual"
      ? ["debates-section", section.id, "ids", section.manualPostIds]
      : section.mode === "category"
        ? ["debates-section", section.id, "category", section.categorySlug]
        : ["debates-section", section.id, "tag", section.tag];

  const enabled =
    section.mode === "manual"
      ? (section.manualPostIds ?? []).length > 0
      : section.mode === "category"
        ? !!section.categorySlug?.trim()
        : !!section.tag?.trim();

  const { data, isLoading } = useQuery<Poll[]>({
    queryKey,
    queryFn: () => fetchSectionPolls(section),
    staleTime: 60_000,
    enabled,
  });

  const { hasVoted } = useVoter();
  const visiblePolls = useMemo(
    () => (data ?? []).filter((p) => !hasVoted(p.id)),
    [data, hasVoted],
  );

  // Hide section entirely when no posts (Decision E2) or all are filtered out
  if (!isLoading && visiblePolls.length === 0) return null;

  return (
    <section className="py-12 sm:py-14 border-t border-foreground/15 first:border-t-0 first:pt-4">
      <div className="mb-6 px-1">
        <span className="block h-0.5 w-10 bg-primary mb-3" aria-hidden />
        <h2
          className="font-black uppercase text-foreground"
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "clamp(1.3rem, 2.5vw, 1.75rem)",
            letterSpacing: "-0.01em",
            lineHeight: 1.05,
          }}
        >
          {section.title}
        </h2>
        {section.subtitle && (
          <p className="text-sm text-muted-foreground mt-2 font-sans">{section.subtitle}</p>
        )}
      </div>

      {isLoading ? (
        <div className="flex gap-4 overflow-hidden px-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="shrink-0 w-[85%] sm:w-[55%] lg:w-[38%] xl:w-[32%] min-h-[340px] sm:min-h-[360px]">
              <DebateCardSkeleton />
            </div>
          ))}
        </div>
      ) : (
        <HorizontalScroller ariaLabel={section.title}>
          {visiblePolls.map((poll) => (
            <div
              key={poll.id}
              className="snap-start shrink-0 w-[85%] sm:w-[55%] lg:w-[38%] xl:w-[32%] min-h-[340px] sm:min-h-[360px]"
            >
              <PollTeaserCard poll={poll} />
            </div>
          ))}
        </HorizontalScroller>
      )}
    </section>
  );
}
