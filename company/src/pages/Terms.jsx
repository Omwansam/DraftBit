import React from 'react'
import PageHero from '../components/ui/PageHero'

const Terms = () => (
  <div className="min-h-screen bg-background">
    <PageHero label="Legal" title="Terms of Service" />
    <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 pb-24 space-y-6 text-muted-foreground leading-relaxed">
      <p><strong className="text-foreground">Last updated:</strong> June 2025</p>
      <p>By accessing and using the DraftBit website, you agree to these terms. If you do not agree, please do not use our site.</p>
      <h2 className="text-xl font-display font-bold text-foreground pt-4">Use of Website</h2>
      <p>This website is provided for informational purposes. Content may be updated without notice. We make no warranties about the completeness or accuracy of information on this site.</p>
      <h2 className="text-xl font-display font-bold text-foreground pt-4">Intellectual Property</h2>
      <p>All content, branding, and materials on this website are owned by DraftBit unless otherwise stated. You may not reproduce or distribute our content without written permission.</p>
      <h2 className="text-xl font-display font-bold text-foreground pt-4">Contact</h2>
      <p>For questions about these terms, contact hello@draftbit.com.</p>
    </div>
  </div>
)

export default Terms
