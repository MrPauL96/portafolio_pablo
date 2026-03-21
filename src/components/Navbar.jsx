import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiCpu, FiBriefcase, FiFolder, FiBox, FiMail } from 'react-icons/fi'

const sections = [
  { id: 'about', label: 'Services', icon: FiCpu },
  { id: 'experience', label: 'Experience', icon: FiBriefcase },
  { id: 'projects', label: 'Projects', icon: FiFolder },
  { id: 'skills', label: 'Stack', icon: FiBox },
  { id: 'contact', label: 'Contact', icon: FiMail },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('')

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50)
      const scrollY = window.scrollY + window.innerHeight * 0.35
      let current = ''
      for (const s of sections) {
        const el = document.getElementById(s.id)
        if (el && el.offsetTop <= scrollY) current = s.id
      }
      setActive(current)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'glass' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <a href="#" className="font-display text-2xl font-bold text-white tracking-tight shrink-0">
          JP<span className="text-accent">.</span>
        </a>

        <div className="hidden md:flex items-center gap-1.5">
          {sections.map((s, i) => {
            const isActive = active === s.id
            return (
              <motion.a
                key={s.id}
                href={`#${s.id}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.4 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono whitespace-nowrap transition-all duration-300 ${
                  isActive
                    ? 'bg-accent/10 text-accent border border-accent/20'
                    : 'text-neutral-500 border border-transparent hover:text-neutral-300 hover:bg-white/[0.03] hover:border-white/[0.06]'
                }`}
              >
                <s.icon size={12} />
                {s.label}
              </motion.a>
            )
          })}
        </div>

        <motion.a
          href="#contact"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="px-4 py-1.5 rounded-lg text-sm font-medium bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 transition-colors shrink-0"
        >
          Let&apos;s talk
        </motion.a>
      </div>
    </motion.nav>
  )
}
