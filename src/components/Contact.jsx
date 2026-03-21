import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiSend, FiMail, FiLinkedin, FiGithub, FiArrowUpRight } from 'react-icons/fi'

const EMAIL = 'jupvillegasgo@gmail.com'

const contactLinks = [
  {
    icon: FiMail,
    label: 'Email',
    value: 'jupvillegasgo@gmail.com',
    href: `mailto:${EMAIL}`,
  },
  {
    icon: FiLinkedin,
    label: 'LinkedIn',
    value: '/in/jpvillegasg',
    href: 'https://linkedin.com/in/jpvillegasg',
  },
  {
    icon: FiGithub,
    label: 'GitHub',
    value: '@jpvillegasg',
    href: 'https://github.com/jpvillegasg',
  },
]

function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    const subject = encodeURIComponent(`Portfolio Contact from ${name}`)
    const body = encodeURIComponent(`Hi Juan Pablo,\n\n${message}\n\nFrom: ${name}\nEmail: ${email}`)
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`
    setSent(true)
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-neutral-500 text-xs font-mono block mb-2">name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full px-4 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-white text-sm placeholder:text-neutral-700 focus:outline-none focus:border-accent/30 transition-colors"
          />
        </div>
        <div>
          <label className="text-neutral-500 text-xs font-mono block mb-2">email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="w-full px-4 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-white text-sm placeholder:text-neutral-700 focus:outline-none focus:border-accent/30 transition-colors"
          />
        </div>
      </div>
      <div>
        <label className="text-neutral-500 text-xs font-mono block mb-2">message</label>
        <textarea
          rows={4}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell me about your project..."
          className="w-full px-4 py-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] text-white text-sm placeholder:text-neutral-700 focus:outline-none focus:border-accent/30 transition-colors resize-none"
        />
      </div>
      <motion.button
        type="submit"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.97 }}
        className={`px-6 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
          sent
            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
            : 'bg-accent text-white hover:bg-accent/90'
        }`}
      >
        <FiSend size={14} />
        {sent ? 'Opening mail client...' : 'Send message'}
      </motion.button>
    </form>
  )
}

export default function Contact() {
  return (
    <section id="contact" className="relative py-32 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <p className="text-accent font-mono text-xs tracking-widest uppercase mb-3">
            contact
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Let&apos;s build something together
          </h2>
          <p className="text-neutral-500 text-base max-w-xl leading-relaxed">
            Open to new roles, collaborations, or a solid conversation about engineering. Feel free to reach out.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-10"
        >
          {contactLinks.map((link) => (
            <motion.a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="group p-5 rounded-xl bg-surface/50 border border-white/[0.04] hover:border-accent/15 transition-all duration-300"
            >
              <div className="w-9 h-9 rounded-lg bg-accent/5 flex items-center justify-center mb-3">
                <link.icon size={18} className="text-accent" />
              </div>
              <p className="text-white text-sm font-medium mb-0.5">{link.label}</p>
              <p className="text-neutral-600 text-xs font-mono flex items-center gap-1">
                {link.value}
                <FiArrowUpRight
                  size={12}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-accent"
                />
              </p>
            </motion.a>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="rounded-xl bg-surface/50 border border-white/[0.04] p-6 md:p-8"
        >
          <ContactForm />
        </motion.div>
      </div>

      <footer className="mt-32 text-center">
        <div className="divider w-full max-w-xs mx-auto mb-6" />
        <p className="text-neutral-700 text-xs font-mono">
          Juan Pablo Villegas Gomez · 2026
        </p>
      </footer>
    </section>
  )
}
