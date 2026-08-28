import React from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { SiteDataProvider } from './context/SiteDataContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/sections/Footer'
import SkipLink from './components/ui/SkipLink'
import ScrollProgress from './components/ui/ScrollProgress'
import ScrollToTop from './components/ui/ScrollToTop'
import ScrollToHash from './components/ui/ScrollToHash'
import PageLoader from './components/ui/PageLoader'
import PageTransition from './components/ui/PageTransition'
import CookieConsent from './components/ui/CookieConsent'
import PageViewTracker from './components/ui/PageViewTracker'
import WhatsAppButton from './components/ui/WhatsAppButton'
import { ToastProvider } from './components/ui/Toast'
import Home from './pages/Home'
import Project from './pages/Project'
import CaseStudy from './pages/CaseStudy'
import About from './pages/About'
import Services from './pages/Services'
import Contact from './pages/Contact'
import Careers from './pages/Careers'
import Insights from './pages/Insights'
import InsightDetail from './pages/InsightDetail'
import Privacy from './pages/Privacy'
import Terms from './pages/Terms'
import NotFound from './pages/NotFound'

const AnimatedRoutes = () => {
  const location = useLocation()

  return (
    <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Home /></PageTransition>} />
        <Route path="/projects" element={<PageTransition><Project /></PageTransition>} />
        <Route path="/projects/:slug" element={<PageTransition><CaseStudy /></PageTransition>} />
        <Route path="/about" element={<PageTransition><About /></PageTransition>} />
        <Route path="/services" element={<PageTransition><Services /></PageTransition>} />
        <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
        <Route path="/careers" element={<PageTransition><Careers /></PageTransition>} />
        <Route path="/insights" element={<PageTransition><Insights /></PageTransition>} />
        <Route path="/insights/:slug" element={<PageTransition><InsightDetail /></PageTransition>} />
        <Route path="/privacy" element={<PageTransition><Privacy /></PageTransition>} />
        <Route path="/terms" element={<PageTransition><Terms /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
  )
}

const App = () => {
  return (
    <ThemeProvider>
      <SiteDataProvider>
      <ToastProvider>
        <Router>
          <PageViewTracker />
          <SkipLink />
          <ScrollProgress />
          <ScrollToHash />
          <PageLoader />
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main id="main-content" className="flex-1">
              <AnimatedRoutes />
            </main>
            <Footer />
            <ScrollToTop />
            <WhatsAppButton />
            <CookieConsent />
          </div>
        </Router>
      </ToastProvider>
      </SiteDataProvider>
    </ThemeProvider>
  )
}

export default App
