import React from 'react'
import PageHero from '../components/ui/PageHero'

const Privacy = () => (
  <div className="min-h-screen bg-background">
    <PageHero label="Legal" title="Privacy Policy" />
    <div className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 pb-24 space-y-6 text-muted-foreground leading-relaxed">
      <p><strong className="text-foreground">Last updated:</strong> June 2025</p>
      <p>DraftBit (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) respects your privacy. This policy explains how we collect, use, and protect your personal information when you visit our website or contact us.</p>
      <h2 className="text-xl font-display font-bold text-foreground pt-4">Information We Collect</h2>
      <p>When you fill out our contact form or subscribe to our newsletter, we may collect your name, email address, phone number, and any message content you provide voluntarily.</p>
      <h2 className="text-xl font-display font-bold text-foreground pt-4">How We Use Your Information</h2>
      <p>We use your information to respond to inquiries, provide services, send newsletters (if subscribed), and improve our website. We do not sell your personal data to third parties.</p>
      <h2 className="text-xl font-display font-bold text-foreground pt-4">Contact</h2>
      <p>Questions about this policy? Email us at hello@draftbit.com.</p>
    </div>
  </div>
)

export default Privacy
