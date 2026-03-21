import { motion } from 'framer-motion'
import { FiLayout, FiDatabase, FiRefreshCw, FiGitBranch } from 'react-icons/fi'

const skillCategories = [
  {
    title: 'Frontend',
    icon: FiLayout,
    skills: ['Angular', 'TypeScript', 'JavaScript', 'RxJS', 'NgRx', 'AG-Grid (SSR)', 'HTML/CSS', 'SASS'],
  },
  {
    title: 'Backend',
    icon: FiDatabase,
    skills: ['Java', 'Spring Boot', 'REST APIs', 'SQL', 'Python'],
  },
  {
    title: 'CI/CD & DevOps',
    icon: FiRefreshCw,
    skills: ['Jenkins', 'Spinnaker', 'Docker', 'Git'],
  },
  {
    title: 'Testing & Analytics',
    icon: FiGitBranch,
    skills: ['Cypress', 'Karma/Jasmine', 'Unit Testing', 'Google Analytics', 'Heap'],
  },
]

export default function Skills() {
  return (
    <section id="skills" className="relative py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p className="text-accent font-mono text-xs tracking-widest uppercase mb-3">
            stack
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
            Tools of the trade
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {skillCategories.map((cat, i) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
            >
              <motion.div
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="group p-5 rounded-xl bg-surface/50 border border-white/[0.04] hover:border-accent/15 transition-all duration-500"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-accent/5 flex items-center justify-center">
                    <cat.icon size={16} className="text-accent" />
                  </div>
                  <h3 className="font-medium text-neutral-300 text-sm">{cat.title}</h3>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {cat.skills.map((skill, j) => (
                    <motion.span
                      key={skill}
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: j * 0.04 }}
                      whileHover={{ scale: 1.05, borderColor: 'rgba(20,184,166,0.2)' }}
                      whileTap={{ scale: 0.95 }}
                      className="px-2.5 py-1 rounded-md text-xs font-mono bg-white/[0.02] text-neutral-500 border border-white/[0.04] cursor-default transition-colors hover:text-neutral-300"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
