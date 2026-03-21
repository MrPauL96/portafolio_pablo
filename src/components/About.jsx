import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { FiCpu, FiCode, FiServer, FiZap } from 'react-icons/fi'

const services = [
  {
    icon: FiCode,
    title: 'Angular Engineering',
    sub: '7 years · Perficient / PSL',
    tags: ['Angular 6→18', 'RxJS', 'NgRx', 'TypeScript'],
    color: '#DD0031',
    emoji: '🅰️',
  },
  {
    icon: FiServer,
    title: 'Java & Spring Boot',
    sub: 'Backend APIs · Perficient',
    tags: ['Java 8–11', 'Spring Boot', 'REST', 'SQL'],
    color: '#14B8A6',
    emoji: '☕',
  },
  {
    icon: FiCpu,
    title: 'Deep Learning',
    sub: 'Kiwibot · Universidad Nacional',
    tags: ['TensorFlow', 'OpenCV', 'YOLO', 'CV'],
    color: '#a78bfa',
    emoji: '🤖',
  },
  {
    icon: FiZap,
    title: 'Ad-Tech & Analytics',
    sub: 'Programmatic Advertising',
    tags: ['DSP/SSP', 'Google Analytics', 'Heap', 'Charts'],
    color: '#fbbf24',
    emoji: '📊',
  },
]

function TiltCard({ children, className }) {
  const ref = useRef(null)
  const x = useMotionValue(0.5)
  const y = useMotionValue(0.5)
  const rotateX = useSpring(useTransform(y, [0, 1], [6, -6]), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(x, [0, 1], [-6, 6]), { stiffness: 300, damping: 30 })

  return (
    <motion.div
      ref={ref}
      onMouseMove={(e) => {
        const rect = ref.current?.getBoundingClientRect()
        if (!rect) return
        x.set((e.clientX - rect.left) / rect.width)
        y.set((e.clientY - rect.top) / rect.height)
      }}
      onMouseLeave={() => { x.set(0.5); y.set(0.5) }}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      whileTap={{ scale: 0.97 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default function About() {
  const scrollRef = useRef(null)

  return (
    <section id="about" className="relative py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <p className="text-accent font-mono text-xs tracking-widest uppercase mb-2">
            services
          </p>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-white">
            What I do
          </h2>
        </motion.div>

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="snap-start shrink-0 w-[220px] md:w-[240px]"
            >
              <TiltCard className="h-full">
                <div className="group h-full p-5 rounded-xl bg-surface/50 border border-white/[0.04] hover:border-white/[0.08] transition-all duration-300 cursor-default">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl">{s.emoji}</span>
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${s.color}10` }}
                    >
                      <s.icon size={15} style={{ color: s.color }} />
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-white mb-0.5 leading-tight">
                    {s.title}
                  </h3>
                  <p className="text-[11px] font-mono mb-4" style={{ color: `${s.color}90` }}>
                    {s.sub}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {s.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-white/[0.03] text-neutral-500 border border-white/[0.04]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
