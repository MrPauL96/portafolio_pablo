import { useRef, useCallback } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { FiGithub, FiLinkedin, FiMail } from 'react-icons/fi'
import CollisionGame from './CollisionGame'
import TradingGame from './TradingGame'

const socialLinks = [
  { icon: FiGithub, href: 'https://github.com/jpvillegasg', label: 'GitHub' },
  { icon: FiLinkedin, href: 'https://linkedin.com/in/jpvillegasg', label: 'LinkedIn' },
  { icon: FiMail, href: 'mailto:jupvillegasgo@gmail.com', label: 'Email' },
]

const roles = ['Software Engineer', 'Angular · Java/Spring Boot', 'Universidad Nacional']

function MagneticButton({ children, className, href, ...props }) {
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 200, damping: 15 })
  const springY = useSpring(y, { stiffness: 200, damping: 15 })

  const handleMouse = useCallback((e) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    x.set((e.clientX - rect.left - rect.width / 2) * 0.35)
    y.set((e.clientY - rect.top - rect.height / 2) * 0.35)
  }, [x, y])

  const handleLeave = useCallback(() => { x.set(0); y.set(0) }, [x, y])

  return (
    <motion.a
      ref={ref}
      href={href}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      whileTap={{ scale: 0.92 }}
      className={className}
      {...props}
    >
      {children}
    </motion.a>
  )
}

export default function Hero() {
  const containerRef = useRef(null)
  const mouseX = useMotionValue(0)
  const smoothX = useSpring(mouseX, { stiffness: 40, damping: 25 })
  const parallaxX = useTransform(smoothX, [-500, 500], [6, -6])

  const handleMouseMove = useCallback((e) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    mouseX.set(e.clientX - rect.left - rect.width / 2)
  }, [mouseX])

  return (
    <section
      ref={containerRef}
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center px-6 py-24"
      onMouseMove={handleMouseMove}
    >
      <div className="max-w-5xl mx-auto w-full relative z-10">
        {/* Top: centered text */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
              className="inline-flex items-center gap-2 mb-5"
            >
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-neutral-500 font-mono text-xs tracking-wider">
                Available for new projects
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.7 }}
              className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[0.95] mb-5 tracking-tight"
            >
              <motion.span className="text-white block" style={{ x: parallaxX }}>
                Juan Pablo
              </motion.span>
              <span className="text-neutral-600">Villegas Gomez</span>
            </motion.h1>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="flex flex-wrap items-center justify-center gap-2 mb-4"
            >
              {roles.map((role, i) => (
                <span key={role} className="flex items-center gap-2">
                  <motion.span
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                    className="px-3 py-1 rounded-md text-xs font-medium bg-surface border border-white/5 text-neutral-400 cursor-default transition-colors hover:text-white hover:border-white/10"
                  >
                    {role}
                  </motion.span>
                  {i < roles.length - 1 && (
                    <span className="w-1 h-1 rounded-full bg-neutral-700 hidden sm:block" />
                  )}
                </span>
              ))}
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65, duration: 0.8 }}
              className="text-neutral-500 text-sm md:text-base max-w-lg mx-auto mb-5 leading-relaxed"
            >
              Software engineer from
              <span className="text-neutral-300"> Universidad Nacional de Colombia</span> with 7 years building
              <span className="text-accent"> Angular</span>,
              <span className="text-white"> Java/Spring Boot</span> & apps across multiple industries.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.7 }}
              className="flex items-center justify-center gap-3"
            >
              {socialLinks.map((link) => (
                <MagneticButton
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="w-10 h-10 rounded-lg bg-surface border border-white/5 flex items-center justify-center text-neutral-500 hover:text-accent hover:border-accent/20 transition-all duration-300"
                >
                  <link.icon size={16} />
                </MagneticButton>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Game panels side by side */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.9, ease: 'easeOut' }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto"
        >
          <CollisionGame />
          <TradingGame />
        </motion.div>
      </div>

      {/* Scroll indicator — circuit trace with traveling pulse */}
      <motion.a
        href="#about"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center cursor-pointer z-10 group"
      >
        <svg width="20" height="64" viewBox="0 0 20 64" fill="none" className="overflow-visible">
          {/* Main vertical trace */}
          <line x1="10" y1="0" x2="10" y2="52" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          {/* End node */}
          <circle cx="10" cy="56" r="3" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <circle cx="10" cy="56" r="1" fill="rgba(255,255,255,0.1)" className="group-hover:fill-[#14B8A6] transition-all duration-300" />
          {/* Traveling pulse — glowing dot that moves down the trace */}
          <circle r="2" fill="#14B8A6" opacity="0.9">
            <animate attributeName="cy" values="0;52" dur="2.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0.9;0.9;0" dur="2.2s" repeatCount="indefinite" />
          </circle>
          <circle r="5" fill="#14B8A6" opacity="0">
            <animate attributeName="cy" values="0;52" dur="2.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0;0.15;0.15;0" dur="2.2s" repeatCount="indefinite" />
          </circle>
          {/* Top node */}
          <circle cx="10" cy="0" r="1.5" fill="rgba(255,255,255,0.08)" className="group-hover:fill-[#14B8A6] transition-all duration-300" />
          {/* Side branches for circuit feel */}
          <line x1="10" y1="16" x2="16" y2="16" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          <circle cx="17" cy="16" r="1" fill="rgba(255,255,255,0.06)" />
          <line x1="10" y1="36" x2="4" y2="36" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          <circle cx="3" cy="36" r="1" fill="rgba(255,255,255,0.06)" />
        </svg>
      </motion.a>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-dark to-transparent pointer-events-none z-20" />
    </section>
  )
}
