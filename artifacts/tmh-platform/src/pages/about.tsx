import { Link } from "wouter"
import { Layout } from "@/components/layout/Layout"

const BELIEFS = [
  {
    num: "01",
    title: "Every Vote Is a Statement",
    body: "We didn't build a survey tool. We built a declaration machine. When someone from Cairo and someone from Riyadh vote the same way on the same question, something real is happening. We exist to document it.",
  },
  {
    num: "02",
    title: "Results Are the Reward",
    body: "Sharing isn't a barrier. It's the mechanic. The moment you share a TMH debate, you're adding to the story. Every distribution is a data point. Every data point is a voice.",
  },
  {
    num: "03",
    title: "The Hustlers Are the Heart",
    body: "Profiles on this platform aren't résumés. They're records. Of people who built something real in conditions that would have broken most. We document them because the world should know who they are.",
  },
  {
    num: "04",
    title: "No Fluff. Just Truth.",
    body: "TMH doesn't do polished bios and safe opinions. We ask the questions that make people put their phone down and say 'wait — what?' If a question can't split a WhatsApp group, it doesn't go live.",
  },
  {
    num: "05",
    title: "400 Million, One Square",
    body: "This region has never had a digital town square. A place where opinion becomes data, data becomes narrative, and narrative becomes pressure. That's what we're building. One question at a time.",
  },
  {
    num: "06",
    title: "Community First. Always.",
    body: "Revenue enhances the experience — it never interrupts it. The share gate is a distribution mechanic, not a paywall. There is always a free path. That's a promise.",
  },
]

export default function About() {
  return (
    <Layout>
      {/* Hero */}
      <div className="bg-foreground text-background py-20 lg:py-32 border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary mb-8 font-serif">
            Est. 2026 · Dubai · Founded by Kareem Kaddoura
          </div>
          <h1 className="font-display font-black text-5xl md:text-7xl lg:text-8xl leading-none tracking-tight mb-8">
            This Isn't a Platform.<br />
            <span className="text-primary">It's a Purpose.</span>
          </h1>
          <p className="text-xl text-background/60 font-sans max-w-2xl leading-relaxed">
            400 million people. One region. And until now, almost nobody asking them what they actually think.
          </p>
        </div>
      </div>

      {/* The Real Story */}
      <div className="max-w-3xl mx-auto px-4 py-20 border-b border-border">
        <p className="text-xl font-sans leading-relaxed text-foreground mb-8">
          I started The Middle East Hustle because I was tired. Tired of the region being defined by its crises instead of its people. Tired of watching the world's conversation about us happen without us. Tired of founders, operators, and builders doing extraordinary things in complete silence while the noise came from everywhere else.
        </p>

        <p className="text-base text-muted-foreground font-sans leading-relaxed mb-8">
          This region has $3.6 trillion in economic potential. Half its population is under 30. It's producing unicorns, Oscar-shortlisted films, world-class scientists, and the kind of entrepreneurs who build companies in the middle of wars, economic collapses, and systems designed to stop them. And yet the dominant narrative is still conflict, oil, and monarchy.
        </p>

        <blockquote className="font-display text-2xl md:text-3xl border-l-4 border-primary pl-6 py-4 my-12 text-foreground leading-snug">
          "TMH is the digital town square the Middle East has never had — where 400 million people finally have one place to say what they actually think."
        </blockquote>

        <p className="text-base text-muted-foreground font-sans leading-relaxed mb-8">
          Every poll on this platform is a small act of documentation. What do founders in Cairo really think about brain drain? What does a 25-year-old in Riyadh actually believe about AI and her job? Where does the region's most influential talent want to be in 10 years — and why are so many of them hedging their answer?
        </p>

        <p className="text-base text-muted-foreground font-sans leading-relaxed">
          The TMH Directory is a record of the people actually building this place. Not the ones with the best PR. Not the ones with the most followers. The ones who stayed, who came back, who built something real in conditions that would have broken most people.
        </p>
      </div>

      {/* What We Stand For */}
      <div className="py-20 bg-secondary/20 border-t border-border border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif font-black uppercase text-3xl border-b-2 border-foreground pb-4 mb-12 text-foreground">
            What We Stand For
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {BELIEFS.map(b => (
              <div key={b.num} className="relative">
                <span className="text-6xl font-display font-black text-foreground/8 leading-none select-none block">{b.num}</span>
                <div className="-mt-3">
                  <h3 className="font-serif font-black uppercase text-lg border-b border-border pb-2 mb-3 text-foreground tracking-wide">
                    {b.title}
                  </h3>
                  <p className="text-sm text-muted-foreground font-sans leading-relaxed">{b.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Numbers */}
      <div className="bg-foreground text-background py-16 border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { num: "67", label: "Founding Hustlers" },
              { num: "135+", label: "Active Debates" },
              { num: "12", label: "Topic Categories" },
              { num: "400M", label: "Potential Voices" },
            ].map(stat => (
              <div key={stat.label}>
                <div className="font-display font-black text-4xl md:text-5xl text-primary leading-none mb-2">{stat.num}</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-background/50 font-serif">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Signed Close */}
      <div className="py-20 border-t border-border">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="font-display text-3xl text-foreground mb-2 leading-snug">
            "Real People. Real Hustle.<br />Real Change."
          </p>
          <p className="text-sm text-muted-foreground font-sans mb-12">
            — Kareem Kaddoura, Founder · The Middle East Hustle · Dubai, 2026
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/polls"
              className="bg-foreground text-background px-8 py-3 font-bold uppercase tracking-widest text-xs hover:bg-primary transition-colors font-serif"
            >
              Cast Your Vote
            </Link>
            <Link
              href="/profiles"
              className="border border-foreground text-foreground px-8 py-3 font-bold uppercase tracking-widest text-xs hover:bg-foreground hover:text-background transition-colors font-serif"
            >
              Meet the Hustlers
            </Link>
            <Link
              href="/apply"
              className="border border-primary text-primary px-8 py-3 font-bold uppercase tracking-widest text-xs hover:bg-primary hover:text-white transition-colors font-serif"
            >
              Become a Hustler
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}
