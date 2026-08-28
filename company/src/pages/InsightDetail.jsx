import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Share2, Twitter, Linkedin, Link2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useSiteData } from '../context/SiteDataContext'
import Seo from '../components/ui/Seo'
import { useToast } from '../components/ui/Toast'
import NotFound from './NotFound'

const articleBodies = {
  'building-for-africa-global-tech': [
    'The narrative around African tech has shifted dramatically. What was once dismissed as "emerging" is now producing companies that compete on global stages—from fintech unicorns to enterprise SaaS platforms shipping to Fortune 500 clients.',
    'At DraftBit, we\'ve seen this firsthand. Our clients in Nairobi, Lagos, and Johannesburg are building products that serve users across continents. The key isn\'t copying Silicon Valley playbooks—it\'s understanding local constraints (connectivity, payments, languages) while engineering for global scale.',
    'Three principles guide our approach: mobile-first architecture (because that\'s how Africa accesses the internet), payment localization (M-Pesa, Flutterwave, and beyond), and cloud-native infrastructure that can burst to any region when growth demands it.',
    'The teams winning today aren\'t asking permission to compete globally. They\'re building world-class products from day one—and we\'re proud to be their engineering partner.',
  ],
  'why-clean-architecture-matters': [
    'Startups move fast. That\'s non-negotiable. But speed without structure creates debt that compounds silently until your best engineers spend 80% of their time fighting the codebase instead of shipping features.',
    'Clean architecture isn\'t about over-engineering—it\'s about making the right abstractions at the right time. Separate your business logic from your framework. Keep your API contracts stable. Write tests for the parts that matter.',
    'We\'ve inherited codebases where a simple feature took three weeks because nobody understood the data flow. We\'ve also seen well-structured MVPs scale to millions of users with minimal rewrites. The difference is almost always architectural decisions made in the first 90 days.',
    'Our recommendation: invest in structure early, ship iteratively, and refactor continuously. Your future self—and your investors—will thank you.',
  ],
  'ai-automation-smb': [
    'Enterprise AI gets the headlines, but the biggest opportunity for growing businesses is practical automation: the repetitive tasks that drain your team\'s time and introduce human error.',
    'Start with workflow automation—connecting your CRM to your billing system, auto-generating reports, routing support tickets intelligently. Tools like custom API integrations and no-code triggers can eliminate hours of manual work weekly.',
    'For customer-facing AI, chatbots trained on your documentation can handle 60-70% of common support queries. Document processing AI can extract data from invoices and contracts. Predictive analytics can flag churn risk before it happens.',
    'The key is starting small, measuring impact, and scaling what works. You don\'t need a data science team—you need a partner who understands both the technology and your business processes.',
  ],
}

const InsightDetail = () => {
  const { getBlogPostBySlug, blogPosts } = useSiteData()

  const { slug } = useParams()
  const post = getBlogPostBySlug(slug)
  const paragraphs = articleBodies[slug]
  const { addToast } = useToast()
  const url = typeof window !== 'undefined' ? window.location.href : ''

  if (!post || !paragraphs) return <NotFound />

  const related = blogPosts.filter((p) => p.slug !== slug).slice(0, 2)

  const copyLink = () => {
    navigator.clipboard.writeText(url)
    addToast('Link copied to clipboard!')
  }

  return (
    <div className="min-h-screen bg-background">
      <Seo title={`${post.title} | DraftBit Insights`} description={post.excerpt} />

      <div className="relative h-[40vh] overflow-hidden">
        <img src={post.image} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>

      <article className="max-w-3xl mx-auto px-6 sm:px-8 -mt-32 relative pb-16">
        <Link to="/insights" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          All Insights
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-6">
            <span className="text-primary font-semibold uppercase tracking-wider">{post.category}</span>
            <span>·</span>
            <time dateTime={post.date}>{new Date(post.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</time>
            <span>·</span>
            <span>{post.readTime}</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground leading-tight mb-8">{post.title}</h1>

          <div className="flex items-center gap-3 mb-10 pb-8 border-b border-white/8">
            <Share2 className="w-4 h-4 text-muted-foreground" />
            <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors" aria-label="Share on Twitter">
              <Twitter className="w-4 h-4" />
            </a>
            <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors" aria-label="Share on LinkedIn">
              <Linkedin className="w-4 h-4" />
            </a>
            <button type="button" onClick={copyLink} className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors" aria-label="Copy link">
              <Link2 className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-6">
            {paragraphs.map((p, i) => (
              <p key={i} className="text-lg text-muted-foreground leading-relaxed">{p}</p>
            ))}
          </div>
        </motion.div>

        <div className="mt-16 pt-8 border-t border-white/8">
          <Link to="/contact" className="inline-flex px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
            Let&apos;s build something together
          </Link>
        </div>
      </article>

      {related.length > 0 && (
        <section className="py-16 border-t border-white/5">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="section-label mb-8">Continue Reading</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {related.map((p) => (
                <Link key={p.slug} to={`/insights/${p.slug}`} className="group p-5 rounded-2xl border border-white/8 hover:border-primary/30 transition-colors">
                  <span className="text-xs text-primary uppercase tracking-wider">{p.category}</span>
                  <h3 className="font-display font-bold text-foreground mt-2 group-hover:text-primary transition-colors">{p.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{p.excerpt}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

export default InsightDetail
