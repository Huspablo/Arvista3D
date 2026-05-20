import { Nav }              from '@/components/layout/nav'
import { Footer }           from '@/components/layout/footer'
import { ScrollReveal }     from '@/components/ui/scroll-reveal'
import { HeroSection }      from '@/components/landing/hero-section'
import { TickerSection }    from '@/components/landing/ticker-section'
import { ManifestoSection } from '@/components/landing/manifesto-section'
import { ShowcaseSection }  from '@/components/landing/showcase-section'
import { FeaturesSection }  from '@/components/landing/features-section'
import { ArtistsSection }   from '@/components/landing/artists-section'
import { CtaSection }       from '@/components/landing/cta-section'

export default function LandingPage() {
  return (
    <>
      <Nav transparent />
      <main>
        <HeroSection />
        <TickerSection />
        <ManifestoSection />
        <ShowcaseSection />
        <FeaturesSection />
        <ArtistsSection />
        <CtaSection />
      </main>
      <Footer />
      <ScrollReveal />
    </>
  )
}
