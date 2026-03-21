import { useRef, useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { FiX, FiZoomIn, FiChevronLeft, FiChevronRight } from 'react-icons/fi'

function TiltCard({ children, className, onClick }) {
  const ref = useRef(null)
  const x = useMotionValue(0.5)
  const y = useMotionValue(0.5)

  const rotateX = useSpring(useTransform(y, [0, 1], [8, -8]), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(x, [0, 1], [-8, 8]), { stiffness: 300, damping: 30 })

  const handleMouse = (e) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    x.set((e.clientX - rect.left) / rect.width)
    y.set((e.clientY - rect.top) / rect.height)
  }

  const handleLeave = () => {
    x.set(0.5)
    y.set(0.5)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      onClick={onClick}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 800,
      }}
      whileTap={{ scale: 0.97 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

function ZoomModal({ image, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 cursor-pointer"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="absolute top-6 right-6 z-10 w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        onClick={onClose}
      >
        <FiX size={20} />
      </motion.button>

      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        className="relative max-w-5xl w-full max-h-[85vh] z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative rounded-xl overflow-hidden bg-surface border border-white/5">
          <div className="aspect-video flex items-center justify-center" style={{ background: image.bg }}>
            <div className="text-center p-8">
              <span className="text-6xl block mb-4">{image.emoji}</span>
              <p className="text-white/80 text-lg font-medium">{image.title}</p>
              <p className="text-white/40 text-sm mt-2">{image.description}</p>
              <p className="text-accent/40 text-xs font-mono mt-4">[ replace with your image ]</p>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-neutral-400 text-sm">{image.caption}</p>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function ImageCarousel({ images }) {
  const [zoomedIndex, setZoomedIndex] = useState(null)
  const containerRef = useRef(null)
  const dragX = useMotionValue(0)

  const scroll = (direction) => {
    if (!containerRef.current) return
    const scrollAmount = 340
    containerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  if (!images || images.length === 0) return null

  return (
    <>
      <div className="relative group/carousel">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 z-10 w-8 h-8 rounded-lg bg-surface/90 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white opacity-0 group-hover/carousel:opacity-100 transition-all hover:scale-110"
        >
          <FiChevronLeft size={16} />
        </button>

        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-10 w-8 h-8 rounded-lg bg-surface/90 border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white opacity-0 group-hover/carousel:opacity-100 transition-all hover:scale-110"
        >
          <FiChevronRight size={16} />
        </button>

        <div
          ref={containerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {images.map((image, i) => (
            <TiltCard
              key={i}
              onClick={() => setZoomedIndex(i)}
              className="flex-shrink-0 w-72 md:w-80 snap-start cursor-pointer group/card"
            >
              <div className="rounded-xl overflow-hidden bg-surface border border-white/5 hover:border-accent/20 transition-all duration-300">
                <div
                  className="aspect-[16/10] flex items-center justify-center relative overflow-hidden"
                  style={{ background: image.bg }}
                >
                  <div className="text-center p-6 relative z-10">
                    <span className="text-4xl block mb-2">{image.emoji}</span>
                    <p className="text-white/60 text-sm font-medium">{image.title}</p>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                    <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
                      <FiZoomIn size={18} className="text-white" />
                    </div>
                  </div>
                </div>

                <div className="p-3">
                  <p className="text-neutral-500 text-xs truncate">{image.caption}</p>
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {zoomedIndex !== null && (
          <ZoomModal
            image={images[zoomedIndex]}
            onClose={() => setZoomedIndex(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
