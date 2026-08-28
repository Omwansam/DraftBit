import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useSiteData } from '../../context/SiteDataContext'

/* '/' is filled in from the live site settings inside the component, so a
   name or description edited in the admin console reaches the tab title and
   the share cards without a rebuild. */
const routeMeta = {
  '/about': { title: 'About | DraftBit', description: 'Meet the team behind DraftBit. Our mission, values, and journey.' },
  '/services': { title: 'Services | DraftBit', description: 'Custom software, websites, ERP, CRM, POS, and automation.' },
  '/projects': { title: 'Projects | DraftBit', description: 'Selected work delivered for clients worldwide.' },
  '/contact': { title: 'Contact | DraftBit', description: 'Have a project in mind? Talk to us.' },
  '/careers': { title: 'Careers | DraftBit', description: 'Join our team building the future from Nairobi.' },
  '/insights': { title: 'Insights | DraftBit', description: 'Thoughts from the studio on tech and product.' },
  '/privacy': { title: 'Privacy Policy | DraftBit', description: 'How DraftBit handles your data.' },
  '/terms': { title: 'Terms of Service | DraftBit', description: 'Terms for using the DraftBit website.' },
}

const PageMeta = () => {
  const { pathname } = useLocation()
  const { siteConfig } = useSiteData()

  useEffect(() => {
    const defaultMeta = {
      title: `${siteConfig.name} | Africa's Bold Tech Studio`,
      description: siteConfig.description,
    }

    const base = pathname.split('/').slice(0, 2).join('/') || '/'
    const meta = routeMeta[base] || routeMeta[pathname] || defaultMeta

    document.title = meta.title

    const desc = document.querySelector('meta[name="description"]')
    if (desc) desc.setAttribute('content', meta.description)

    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) ogTitle.setAttribute('content', meta.title)

    const ogDesc = document.querySelector('meta[property="og:description"]')
    if (ogDesc) ogDesc.setAttribute('content', meta.description)
  }, [pathname, siteConfig])

  return null
}

export default PageMeta
