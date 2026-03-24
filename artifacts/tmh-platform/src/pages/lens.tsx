import { useState } from "react"
import { Layout } from "@/components/layout/Layout"
import { cn } from "@/lib/utils"

export interface LensPhoto {
  id: string
  src: string
  title: string
  location: string
  country: string
  credit: string
  creditUrl: string
  category: string
  description: string
  aspect: "landscape" | "portrait" | "square"
}

export const LENS_PHOTOS: LensPhoto[] = [
  {
    id: "1",
    src: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=85",
    title: "Dawn Over Downtown",
    location: "Dubai, UAE",
    country: "UAE",
    credit: "Unsplash",
    creditUrl: "https://unsplash.com",
    category: "Architecture",
    description: "The Dubai skyline at golden hour — a city that rebuilt itself from sand into the world's most ambitious canvas.",
    aspect: "landscape",
  },
  {
    id: "2",
    src: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1200&q=85",
    title: "Inside the Medina",
    location: "Marrakech, Morocco",
    country: "Morocco",
    credit: "Unsplash",
    creditUrl: "https://unsplash.com",
    category: "Culture",
    description: "The narrow alleys of the medina still breathe centuries of trade, craft, and community — untouched by the algorithm.",
    aspect: "portrait",
  },
  {
    id: "3",
    src: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?w=1200&q=85",
    title: "The Pyramids at Dusk",
    location: "Giza, Egypt",
    country: "Egypt",
    credit: "Unsplash",
    creditUrl: "https://unsplash.com",
    category: "Heritage",
    description: "4,500 years of silence. The only structure from the ancient world still standing — and still humbling everyone who sees it.",
    aspect: "landscape",
  },
  {
    id: "4",
    src: "https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?w=1200&q=85",
    title: "The Old City",
    location: "Amman, Jordan",
    country: "Jordan",
    credit: "Unsplash",
    creditUrl: "https://unsplash.com",
    category: "Urban",
    description: "A city stacked on seven hills — ancient Roman theaters sharing the skyline with modern ambitions.",
    aspect: "landscape",
  },
  {
    id: "5",
    src: "https://images.unsplash.com/photo-1578895101408-1a36b834405b?w=1200&q=85",
    title: "Desert Silence",
    location: "Wadi Rum, Jordan",
    country: "Jordan",
    credit: "Unsplash",
    creditUrl: "https://unsplash.com",
    category: "Landscape",
    description: "The Valley of the Moon. No signal, no WiFi, no noise — just the oldest silence on Earth.",
    aspect: "landscape",
  },
  {
    id: "6",
    src: "https://images.unsplash.com/photo-1548013146-72479768bada?w=1200&q=85",
    title: "Blue Pearl",
    location: "Chefchaouen, Morocco",
    country: "Morocco",
    credit: "Unsplash",
    creditUrl: "https://unsplash.com",
    category: "Culture",
    description: "A town painted entirely in blue — originally a Jewish tradition, now the most photographed town in North Africa.",
    aspect: "portrait",
  },
  {
    id: "7",
    src: "https://images.unsplash.com/photo-1531973819741-e27a5ae2cc7b?w=1200&q=85",
    title: "Kingdom Tower Rising",
    location: "Riyadh, Saudi Arabia",
    country: "Saudi Arabia",
    credit: "Unsplash",
    creditUrl: "https://unsplash.com",
    category: "Architecture",
    description: "Riyadh's skyline — the capital of the region's boldest transformation. Vision 2030 isn't a slogan here, it's a construction site.",
    aspect: "landscape",
  },
  {
    id: "8",
    src: "https://images.unsplash.com/photo-1549893072-4bc678117f45?w=1200&q=85",
    title: "Petra by Candlelight",
    location: "Petra, Jordan",
    country: "Jordan",
    credit: "Unsplash",
    creditUrl: "https://unsplash.com",
    category: "Heritage",
    description: "The Treasury at night — carved from rock 2,000 years ago, still making people forget to breathe.",
    aspect: "portrait",
  },
  {
    id: "9",
    src: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=85&fit=crop&crop=bottom",
    title: "Marina Glow",
    location: "Dubai, UAE",
    country: "UAE",
    credit: "Unsplash",
    creditUrl: "https://unsplash.com",
    category: "Urban",
    description: "Dubai Marina at night — a floating city of glass, ambition, and 200 nationalities living in 1.5 square kilometers.",
    aspect: "landscape",
  },
  {
    id: "10",
    src: "https://images.unsplash.com/photo-1539768942893-daf53e448371?w=1200&q=85",
    title: "The Souk",
    location: "Fez, Morocco",
    country: "Morocco",
    credit: "Unsplash",
    creditUrl: "https://unsplash.com",
    category: "Culture",
    description: "Fez el Bali — the world's largest car-free urban area. 9,000 alleyways. A sensory overload in the best possible way.",
    aspect: "square",
  },
  {
    id: "11",
    src: "https://images.unsplash.com/photo-1547483238-f400e65ccd56?w=1200&q=85",
    title: "Nile at Sunset",
    location: "Cairo, Egypt",
    country: "Egypt",
    credit: "Unsplash",
    creditUrl: "https://unsplash.com",
    category: "Landscape",
    description: "The Nile — still the lifeblood of 100 million people. Cairo doesn't sleep, and neither does this river.",
    aspect: "landscape",
  },
  {
    id: "12",
    src: "https://images.unsplash.com/photo-1466442929976-97f336a657be?w=1200&q=85",
    title: "Mosque at Dawn",
    location: "Abu Dhabi, UAE",
    country: "UAE",
    credit: "Unsplash",
    creditUrl: "https://unsplash.com",
    category: "Architecture",
    description: "Sheikh Zayed Grand Mosque — 82 domes, 1,000 columns, and the world's largest hand-knotted carpet. Built to unite, not divide.",
    aspect: "landscape",
  },
  {
    id: "13",
    src: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=1200&q=85",
    title: "Baalbek Columns",
    location: "Baalbek, Lebanon",
    country: "Lebanon",
    credit: "Unsplash",
    creditUrl: "https://unsplash.com",
    category: "Heritage",
    description: "The Temple of Bacchus — better preserved than most things in the region. A reminder that civilizations rise, fall, and leave stones.",
    aspect: "portrait",
  },
  {
    id: "14",
    src: "https://images.unsplash.com/photo-1559386484-97dfc0e15539?w=1200&q=85",
    title: "Bahrain Skyline",
    location: "Manama, Bahrain",
    country: "Bahrain",
    credit: "Unsplash",
    creditUrl: "https://unsplash.com",
    category: "Urban",
    description: "The smallest Gulf state with the biggest story. Where ancient pearl-diving meets fintech and Formula One.",
    aspect: "landscape",
  },
  {
    id: "15",
    src: "https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=1200&q=85",
    title: "Sahara Dunes",
    location: "Merzouga, Morocco",
    country: "Morocco",
    credit: "Unsplash",
    creditUrl: "https://unsplash.com",
    category: "Landscape",
    description: "Erg Chebbi at sunrise — the Sahara's most cinematic dunes. The desert doesn't care about your deadlines.",
    aspect: "landscape",
  },
  {
    id: "16",
    src: "https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?w=1200&q=85",
    title: "Souq Waqif",
    location: "Doha, Qatar",
    country: "Qatar",
    credit: "Unsplash",
    creditUrl: "https://unsplash.com",
    category: "Culture",
    description: "Doha's restored trading market — where falcon sellers sit next to art galleries and the scent of oud fills every aisle.",
    aspect: "square",
  },
]

const CATEGORIES = ["All", "Architecture", "Culture", "Heritage", "Landscape", "Urban"]

export default function Lens() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedPhoto, setSelectedPhoto] = useState<LensPhoto | null>(null)

  const filtered = selectedCategory === "All" ? LENS_PHOTOS : LENS_PHOTOS.filter(p => p.category === selectedCategory)

  return (
    <Layout>
      <div className="bg-foreground text-background py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.28em", color: "#DC143C", marginBottom: "0.5rem" }}>
            The Lens
          </p>
          <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "clamp(2rem, 5vw, 3.5rem)", textTransform: "uppercase", color: "var(--background)", letterSpacing: "-0.01em", lineHeight: 1.05, marginBottom: "0.5rem" }}>
            The Region<span style={{ color: "#DC143C" }}>.</span> Unfiltered<span style={{ color: "#DC143C" }}>.</span>
          </h1>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.18em", color: "rgba(250,250,250,0.45)" }}>
            Visual stories from across the Middle East and North Africa.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-wrap gap-2 mb-10">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-4 py-2 text-[10px] font-bold uppercase tracking-[0.2em] font-serif border transition-all duration-200",
                selectedCategory === cat
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 [column-fill:_balance]">
          {filtered.map(photo => (
            <div
              key={photo.id}
              className="break-inside-avoid mb-5 group cursor-pointer"
              onClick={() => setSelectedPhoto(photo)}
            >
              <div className="relative overflow-hidden bg-secondary border border-border">
                <img
                  src={photo.src}
                  alt={photo.title}
                  loading="lazy"
                  className="w-full h-auto grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <p className="text-white font-serif font-black uppercase text-sm tracking-wide leading-tight">
                    {photo.title}
                  </p>
                  <p className="text-white/70 text-[10px] uppercase tracking-[0.2em] font-serif mt-1">
                    {photo.location}
                  </p>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-serif">
                  {photo.category}
                </p>
                <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-serif">
                  {photo.country}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 sm:p-8"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="max-w-5xl w-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="relative overflow-hidden flex-1 min-h-0">
              <img
                src={selectedPhoto.src}
                alt={selectedPhoto.title}
                className="w-full h-auto max-h-[70vh] object-contain"
              />
            </div>
            <div className="bg-[#0A0A0A] border-t border-white/10 p-6 mt-2">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-[#DC143C] font-bold font-serif mb-1">
                    {selectedPhoto.category}
                  </p>
                  <h3 className="font-serif font-black uppercase text-xl text-white tracking-tight">
                    {selectedPhoto.title}
                  </h3>
                  <p className="text-white/50 text-[10px] uppercase tracking-[0.2em] font-serif mt-1">
                    {selectedPhoto.location}
                  </p>
                  <p className="text-white/70 font-sans text-sm mt-3 leading-relaxed max-w-xl">
                    {selectedPhoto.description}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="text-white/50 hover:text-white text-2xl leading-none p-2 transition-colors"
                >
                  ×
                </button>
              </div>
              <p className="text-white/30 text-[9px] uppercase tracking-[0.2em] font-serif mt-4">
                Photo: {selectedPhoto.credit}
              </p>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
