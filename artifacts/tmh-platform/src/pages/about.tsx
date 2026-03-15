import { Layout } from "@/components/layout/Layout"
import { BarChart2, Shield, Users, Zap } from "lucide-react"

export default function About() {
  return (
    <Layout>
      <div className="relative border-b border-border">
        <div className="absolute inset-0 -z-10 bg-[url('/images/about-texture.png')] bg-cover bg-center opacity-20 mix-blend-luminosity"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-background -z-10"></div>
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 lg:py-32 text-center">
          <div className="bg-primary text-primary-foreground p-3 rounded-xl inline-flex mb-8 shadow-xl">
            <BarChart2 className="w-10 h-10" />
          </div>
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-foreground mb-8 leading-tight tracking-tight">
            We are measuring the <br/>
            <span className="text-primary italic">Middle East's heartbeat.</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto font-medium">
            The Middle East Hustle (TMH) is the definitive polling and opinion network for the region's founders, leaders, and creators.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
        <div className="prose prose-xl dark:prose-invert max-w-none">
          <h2 className="font-serif font-bold text-3xl md:text-4xl text-foreground">The Problem</h2>
          <p className="text-muted-foreground leading-relaxed">
            The Middle East is transforming at a speed unseen anywhere else on earth. Yet, the data, narratives, and opinions that define this growth are fragmented, anecdotal, or hidden behind paywalls. We rely on gut feelings instead of collective intelligence.
          </p>

          <h2 className="font-serif font-bold text-3xl md:text-4xl text-foreground mt-16">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed text-2xl font-serif italic border-l-4 border-primary pl-6 py-2 bg-primary/5 rounded-r-lg">
            To build the most credible, high-signal opinion engine in the Middle East.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-6">
            We curate the most urgent questions—from venture capital trends to cultural shifts—and put them to the region's sharpest minds. Every vote is anonymous, every result is instantaneous, and every poll builds the definitive record of what the region actually believes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-card p-8 rounded-2xl border border-border">
            <Shield className="w-10 h-10 text-primary mb-6" />
            <h3 className="font-serif text-2xl font-bold mb-3">High Signal</h3>
            <p className="text-muted-foreground">We cut through the noise. Our polls are editorialized, highly relevant, and targeted at professionals who move markets.</p>
          </div>
          <div className="bg-card p-8 rounded-2xl border border-border">
            <Zap className="w-10 h-10 text-primary mb-6" />
            <h3 className="font-serif text-2xl font-bold mb-3">Real-time Pulse</h3>
            <p className="text-muted-foreground">No quarterly reports. Just live, instant sentiment analysis on the stories breaking today.</p>
          </div>
          <div className="bg-card p-8 rounded-2xl border border-border">
            <Users className="w-10 h-10 text-primary mb-6" />
            <h3 className="font-serif text-2xl font-bold mb-3">Verified Voices</h3>
            <p className="text-muted-foreground">The TMH Directory curates the true builders of the region, amplifying the voices that matter most.</p>
          </div>
        </div>
      </div>
    </Layout>
  )
}
