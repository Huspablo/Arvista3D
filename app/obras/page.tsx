import { Nav }          from '@/components/layout/nav'
import { Footer }        from '@/components/layout/footer'
import { ObrasCatalog }  from '@/components/public/obras-catalog'
import { ScrollReveal }  from '@/components/ui/scroll-reveal'

export default function ObrasPage() {
  return (
    <>
      <Nav />
      <ObrasCatalog />
      <Footer />
      <ScrollReveal />
    </>
  )
}
