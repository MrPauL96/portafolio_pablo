import { motion } from 'framer-motion'
import { FiMapPin, FiCalendar } from 'react-icons/fi'

const experiences = [
  {
    company: 'Perficient Latin America',
    role: 'Software Engineer',
    period: 'Jan 2021 – Present',
    location: 'Medellín, Colombia',
    description:
      'Full-stack engineer on two major programmatic advertising products. Leading Angular frontend development and building Java/Spring Boot backend services for enterprise ad-tech clients.',
    highlights: [
      'Kinesso Marketplace — Upgraded Angular from v6 to v18, applied design patterns with RxJS & NgRx',
      'Investment Planner — Built from scratch as Senior Angular Developer, emphasizing scalability & performance',
      'Real-time data grids with AG-Grid and Server Side Rendering (SSR) for large datasets',
      'Java 8–11 & Spring Boot backend APIs, AWS, Elasticsearch, SQL',
      'CI/CD pipelines in Jenkins, E2E (Cypress) and unit tests',
    ],
  },
  {
    company: 'PSL (now Perficient)',
    role: 'Frontend Engineer',
    period: 'Oct 2019 – Jan 2021',
    location: 'Medellín, Colombia',
    description:
      'Frontend development on a large-scale enterprise application for IPG Mediabrands programmatic advertising. Micro-frontend architecture serving real-time campaign data.',
    highlights: [
      'Built and maintained Angular modules for a programmatic advertising platform',
      'RxJS & NgRx for state management, performance optimization on high-traffic UI',
      'Created bulk edit feature, charts, and micro-frontend communication layer',
      'Google Analytics & Heap integration for client reporting',
      'Unit testing and code quality practices across the team',
    ],
  },
  {
    company: 'PSL',
    role: 'Internship',
    period: 'Apr 2019 – Oct 2019',
    location: 'Medellín, Colombia',
    description:
      'First professional experience: developed internal tools and built a solid foundation in Angular development.',
    highlights: [
      'Built an app to facilitate the company interview process',
      'Developed a course/student management application',
      'Learned Angular fundamentals and enterprise development practices',
    ],
  },
  {
    company: 'Universidad Nacional de Colombia',
    role: 'Software Engineering Degree + Kiwibot Research Project',
    period: 'Jan 2015 – Apr 2019',
    location: 'Medellín, Colombia',
    description:
      'Software Engineering degree with emphasis on AI/Deep Learning. Capstone project with Kiwibot: object detection for semi-autonomous delivery robots.',
    highlights: [
      'Object detection model that improved Kiwibot robot perception in urban environments',
      'Deep learning, algorithms analysis, and data structures',
      'Robotics projects with Arduino, mobile app integration',
      'Web security and database systems',
    ],
  },
]

function ExperienceCard({ exp, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.12 }}
    >
      <motion.div
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.995 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="group p-6 rounded-xl bg-surface/50 border border-white/[0.04] hover:border-accent/15 transition-all duration-500"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white group-hover:text-accent transition-colors duration-300">
              {exp.company}
            </h3>
            <p className="text-neutral-400 text-sm mt-0.5">{exp.role}</p>
          </div>
          <div className="text-right shrink-0 ml-4">
            <p className="text-neutral-600 text-xs font-mono flex items-center gap-1.5 justify-end">
              <FiCalendar size={12} />
              {exp.period}
            </p>
            <p className="text-neutral-700 text-xs font-mono flex items-center gap-1.5 justify-end mt-1">
              <FiMapPin size={12} />
              {exp.location}
            </p>
          </div>
        </div>

        <p className="text-neutral-500 text-sm leading-relaxed mb-4">{exp.description}</p>

        <ul className="space-y-1.5">
          {exp.highlights.map((h) => (
            <li key={h} className="flex items-start gap-2 text-xs text-neutral-500">
              <span className="w-1 h-1 rounded-full bg-accent/40 mt-1.5 shrink-0" />
              {h}
            </li>
          ))}
        </ul>
      </motion.div>
    </motion.div>
  )
}

export default function Experience() {
  return (
    <section id="experience" className="relative py-32 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p className="text-accent font-mono text-xs tracking-widest uppercase mb-3">
            experience
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
            Where I&apos;ve built
          </h2>
        </motion.div>

        <div className="space-y-3">
          {experiences.map((exp, i) => (
            <ExperienceCard key={exp.company} exp={exp} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
