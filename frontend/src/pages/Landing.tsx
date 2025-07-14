import { Navigation } from '../components/sections/Navigation'
import { HeroSection } from '../components/sections/HeroSection'
import { FeaturesSection } from '../components/sections/FeaturesSection'
import { AISection } from '../components/sections/AISection'
import { SuperformSection } from '../components/sections/SuperformSection'
import { TeamCommunicationSection } from '../components/sections/TeamCommunicationSection'
import { LayoutBuilderSection } from '../components/sections/LayoutBuilderSection'
import { CustomizationSection } from '../components/sections/CustomizationSection'
import { ProductivitySection } from '../components/sections/ProductivitySection'
import { IntegrateSection } from '../components/sections/IntegrateSection'
import { TestimonialsSection } from '../components/sections/TestimonialsSection'
import { PricingSection } from '../components/sections/PricingSection'
import { Footer } from '../components/sections/Footer'

export default function Landing() {
  return (
    <>
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <AISection />
      <SuperformSection />
      <TeamCommunicationSection />
      <LayoutBuilderSection />
      <CustomizationSection />
      <ProductivitySection />
      <IntegrateSection />
      <TestimonialsSection />
      <PricingSection />
      <Footer />
    </>
  )
}