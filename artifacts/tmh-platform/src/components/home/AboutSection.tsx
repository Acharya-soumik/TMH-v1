import { useI18n } from "@/lib/i18n"

const PRINCIPLES = [
  { title: "A Social Experiment", body: "Every question is a controlled provocation. The point is honesty." },
  { title: "No Editorial Agenda", body: "We write the questions. We never write the answers." },
  { title: "Private Opinions, Public Data", body: "Your vote is anonymous. The aggregate is not. That gap is the truth." },
  { title: "The Questions No One Asks", body: "Not because they're dangerous. Because nobody built the room yet." },
  { title: "Youngest Region on Earth", body: "60% of MENA is under 30. That's 541 million opinions waiting to be heard." },
  { title: "Real People Only", body: "No bots. No sponsored opinions. Just the region, speaking for itself." },
]

export default function AboutSection() {
  const { t } = useI18n()

  return (
    <section style={{ background: "#0A0A0A", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
      <div style={{ maxWidth: "80rem", margin: "0 auto", padding: "1.5rem 1.5rem" }}>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem 3rem", alignItems: "start" }}>

          {/* Left: founder note */}
          <div>
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.28em", color: "#DC143C", marginBottom: "0.6rem" }}>
              {t("Founder's Note")}
            </p>
            <blockquote style={{ borderLeft: "3px solid #DC143C", paddingLeft: "1rem", fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "0.95rem", lineHeight: 1.45, color: "#F5F0EB", marginBottom: "0.5rem" }}>
              {t("\"Bringing the voices of the Middle East into one room. Finally.\"")}
            </blockquote>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.7rem", color: "rgba(245,240,235,0.45)", letterSpacing: "0.05em", marginLeft: "1.15rem" }}>
              {t("— Kareem Kaddoura, Founder")}
            </p>
          </div>

          {/* Right: 6 principles in 3+3 columns */}
          <div>
            <p style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.28em", color: "#DC143C", marginBottom: "0.5rem" }}>
              {t("What We Stand For")}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", columnGap: "2rem" }}>
              {[PRINCIPLES.slice(0, 3), PRINCIPLES.slice(3, 6)].map((group, gIdx) => (
                <div key={gIdx}>
                  {group.map((item, i) => {
                    const idx = gIdx * 3 + i;
                    return (
                      <div key={idx} style={{ borderTop: "1px solid rgba(245,240,235,0.08)", padding: "0.5rem 0", display: "flex", gap: "0.7rem", alignItems: "flex-start" }}>
                        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: "0.62rem", color: "#DC143C", letterSpacing: "0.1em", flexShrink: 0, paddingTop: "0.1rem" }}>
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: "0.74rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#F5F0EB", display: "block", marginBottom: "0.1rem" }}>
                            {t(item.title)}<span style={{ color: "#DC143C" }}>.</span>
                          </span>
                          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.72rem", color: "rgba(245,240,235,0.5)", lineHeight: 1.4 }}>
                            {t(item.body)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
