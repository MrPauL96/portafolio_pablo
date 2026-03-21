import { useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { FiExternalLink, FiGithub } from 'react-icons/fi'

const projects = [
  {
    title: 'Kinesso Marketplace',
    subtitle: 'Perficient · Programmatic Advertising',
    description:
      'Enterprise ad-tech platform for IPG Mediabrands. Upgraded Angular from v6 to v18, implemented RxJS/NgRx state management, and built Java/Spring Boot backend APIs with AWS & Elasticsearch.',
    tech: ['Angular', 'RxJS', 'NgRx', 'Java', 'Spring Boot', 'AWS'],
    icon: '📊',
  },
  {
    title: 'Investment Planner',
    subtitle: 'Perficient · Built from Scratch',
    description:
      'Created a full investment planning application from scratch as Senior Angular Developer. AG-Grid integration, Jenkins CI/CD pipelines, and Spring Boot API delivered under tight deadlines.',
    tech: ['Angular', 'AG-Grid', 'Java', 'Spring Boot', 'Jenkins', 'Cypress'],
    icon: '💰',
  },
  {
    title: 'Kiwibot Object Detection',
    subtitle: 'Universidad Nacional · Deep Learning',
    description:
      'University capstone project with Kiwibot: trained object detection models that improved robot perception for semi-autonomous delivery navigation in real urban environments.',
    tech: ['Python', 'TensorFlow', 'OpenCV', 'YOLO', 'Deep Learning'],
    icon: '🤖',
  },
  {
    title: 'Micro-Frontend Shared Library',
    subtitle: 'Cross-App Communication Layer',
    description:
      'Shared library connecting multiple Angular frontends: module-based architecture, distributed state, and a communication layer for enterprise micro-frontend ecosystems.',
    tech: ['Angular', 'TypeScript', 'RxJS', 'Module Design', 'npm'],
    icon: '🧩',
  },
  {
    title: 'AI Recommendation Engine',
    subtitle: 'Hackathon · Gemini API · Python',
    description:
      'Hackathon project: built a recommendation system powered by Google Gemini to surface relevant information based on user context and queries.',
    tech: ['Python', 'Gemini API', 'AI/LLM', 'REST API'],
    icon: '🧠',
  },
]

function TiltCard({ children, className }) {
  const ref = useRef(null)
  const x = useMotionValue(0.5)
  const y = useMotionValue(0.5)

  const rotateX = useSpring(useTransform(y, [0, 1], [4, -4]), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(x, [0, 1], [-4, 4]), { stiffness: 300, damping: 30 })
  const brightness = useTransform(y, [0, 0.5, 1], [1.02, 1, 0.98])

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
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      whileTap={{ scale: 0.98 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default function Projects() {
  return (
    <section id="projects" className="relative py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p className="text-accent font-mono text-xs tracking-widest uppercase mb-3">
            projects
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
            What I&apos;ve shipped
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project, i) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <TiltCard className="h-full">
                <div className="group h-full p-6 rounded-xl bg-surface/50 border border-white/[0.04] hover:border-accent/15 transition-all duration-500">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="text-2xl block mb-2">{project.icon}</span>
                      <h3 className="text-base font-semibold text-white group-hover:text-accent transition-colors duration-300">
                        {project.title}
                      </h3>
                      <p className="text-xs font-mono text-neutral-600 mt-0.5">
                        {project.subtitle}
                      </p>
                    </div>
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-center text-neutral-500 hover:text-white transition-colors">
                        <FiGithub size={14} />
                      </button>
                      <button className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-center text-neutral-500 hover:text-white transition-colors">
                        <FiExternalLink size={14} />
                      </button>
                    </div>
                  </div>

                  <p className="text-neutral-500 text-sm leading-relaxed mb-5">
                    {project.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {project.tech.map((t) => (
                      <span
                        key={t}
                        className="px-2.5 py-1 rounded-md text-xs font-mono bg-white/[0.02] text-neutral-600 border border-white/[0.04]"
                      >
                        {t}
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
