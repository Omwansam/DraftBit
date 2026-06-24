import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

const routeMeta = {
  '/': {
    title: 'DraftBit | Africa\'s Bold Tech Studio',
    description: 'Sharp code. A builder\'s mind. Custom software, web apps, and digital transformation from Nairobi to the world.',
  },
  '/projects': {
    title: 'Projects | DraftBit',
    description: 'Selected projects we\'ve delivered — web apps, mobile products, and design systems.',
  },
  '/about': {
    title: 'About | DraftBit',
    description: 'Meet the team building world-class technology from Nairobi with a global outlook.',
  },
  '/contact': {
    title: 'Contact | DraftBit',
    description: 'Have an epic project in mind? Talk to us. Free consultation, no commitment.',
  },
  '/careers': {
    title: 'Careers | DraftBit',
    description: 'Join our team. Open roles for engineers, designers, and DevOps in Nairobi and remote.',
  },
  '/insights': {
    title: 'Insights | DraftBit',
    description: 'Engineering, product, and industry perspectives from the DraftBit studio.',
  },
  '/services': {
    title: 'Services | DraftBit',
    description: 'Custom software, web development, mobile apps, ERP, CRM, and automation.',
  },
  '/privacy': { title: 'Privacy Policy | DraftBit', description: 'How DraftBit handles your data.' },
  '/terms': { title: 'Terms of Service | DraftBit', description: 'Terms for using the DraftBit website.' },
}

export const usePageSeo = (custom = {}) => {
  const { pathname } = useLocation()

  useEffect(() => {
    const base = routeMeta[pathname] || {
      title: 'DraftBit | Africa\'s Bold Tech Studio',
      description: 'Building scalable digital solutions for modern businesses.',
    }
    const title = custom.title || base.title
    const description = custom.description || base.description

    document.title = title

    let meta = document.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = 'description'
      document.head.appendChild(meta)
    }
    meta.content = description

    let ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) ogTitle.content = title

    let ogDesc = document.querySelector('meta[property="og:description"]')
    if (ogDesc) ogDesc.content = description
  }, [pathname, custom.title, custom.description])
}

const Seo = ({ title, description }) => {
  usePageSeo({ title, description })
  return null
}

export default Seo
