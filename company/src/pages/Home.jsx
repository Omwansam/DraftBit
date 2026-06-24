import React from 'react'
import Seo from '../components/ui/Seo'
import Hero from '../components/sections/Hero'
import WhoWeAre from '../components/sections/WhoWeAre'
import PassionateAbout from '../components/sections/PassionateAbout'
import ProcessSection from '../components/sections/Process'
import ProjectsSection from '../components/sections/Projects'
import TechMarquee from '../components/sections/TechMarquee'
import TestimonialsSection from '../components/sections/Testimonials'
import TeamSection from '../components/sections/Team'
import EngagementSection from '../components/sections/Engagement'
import ClientsSection from '../components/sections/Clients'
import InsightsSection from '../components/sections/Insights'
import FaqSection from '../components/sections/Faq'
import Newsletter from '../components/sections/Newsletter'
import ContactSection from '../components/sections/Contact Us'

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <Seo />
      <Hero />
      <WhoWeAre />
      <PassionateAbout />
      <ProcessSection />
      <ProjectsSection />
      <TechMarquee />
      <TestimonialsSection />
      <TeamSection />
      <EngagementSection />
      <ClientsSection />
      <InsightsSection />
      <FaqSection />
      <Newsletter />
      <ContactSection />
    </div>
  )
}

export default Home
