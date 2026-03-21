import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { FiCpu, FiBriefcase, FiFolder, FiBox, FiMail } from 'react-icons/fi'

const sections = [
  { id: 'about', label: 'Services', icon: FiCpu },
  { id: 'experience', label: 'Experience', icon: FiBriefcase },
  { id: 'projects', label: 'Projects', icon: FiFolder },
  { id: 'skills', label: 'Stack', icon: FiBox },
  { id: 'contact', label: 'Contact', icon: FiMail },
]

export default function SectionNav() {
  const [active, setActive] = useState('')
  const scrollRef = useRef(null)

  useEffect(() => {
    const onScroll = () => {
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
    <div className="sticky top-[60px] z-40 py-3 pointer-events-none">
      <div className="max-w-5xl mx-auto px-6">
        <div
          ref={scrollRef}
          className="flex gap-1.5 overflow-x-auto scrollbar-hide pointer-events-auto w-fit mx-auto"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {sections.map((s) => {
            const isActive = active === s.id
            return (
              <motion.a
                key={s.id}
                href={`#${s.id}`}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-mono whitespace-nowrap transition-all duration-300 shrink-0 ${
                  isActive
                    ? 'bg-accent/10 text-accent border border-accent/20'
                    : 'bg-surface/80 backdrop-blur-sm text-neutral-500 border border-white/[0.04] hover:text-neutral-300 hover:border-white/[0.08]'
                }`}
              >
                <s.icon size={12} />
                {s.label}
              </motion.a>
            )
          })}
        </div>
      </div>
    </div>
  )
}
