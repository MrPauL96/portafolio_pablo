import { useState, useEffect, useCallback, useRef } from 'react'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/~`'

export function useTextScramble(targetText, { speed = 30, scrambleDuration = 600, enabled = true } = {}) {
  const [displayText, setDisplayText] = useState('')
  const frameRef = useRef(null)
  const startTimeRef = useRef(null)

  const scramble = useCallback(() => {
    if (!enabled) {
      setDisplayText(targetText)
      return
    }

    startTimeRef.current = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current
      const progress = Math.min(elapsed / scrambleDuration, 1)
      const revealedCount = Math.floor(progress * targetText.length)

      let result = ''
      for (let i = 0; i < targetText.length; i++) {
        if (targetText[i] === ' ') {
          result += ' '
        } else if (i < revealedCount) {
          result += targetText[i]
        } else {
          result += CHARS[Math.floor(Math.random() * CHARS.length)]
        }
      }

      setDisplayText(result)

      if (progress < 1) {
        frameRef.current = setTimeout(animate, speed)
      }
    }

    animate()

    return () => {
      if (frameRef.current) clearTimeout(frameRef.current)
    }
  }, [targetText, speed, scrambleDuration, enabled])

  useEffect(() => {
    return () => {
      if (frameRef.current) clearTimeout(frameRef.current)
    }
  }, [])

  return { displayText, triggerScramble: scramble }
}

export function ScrambleText({ text, className, as: Tag = 'span', speed = 25, duration = 800 }) {
  const [revealed, setRevealed] = useState(false)
  const [displayText, setDisplayText] = useState('')
  const ref = useRef(null)
  const frameRef = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !revealed) {
          setRevealed(true)
          const start = Date.now()

          const animate = () => {
            const elapsed = Date.now() - start
            const progress = Math.min(elapsed / duration, 1)
            const count = Math.floor(progress * text.length)

            let result = ''
            for (let i = 0; i < text.length; i++) {
              if (text[i] === ' ') {
                result += ' '
              } else if (i < count) {
                result += text[i]
              } else if (progress > 0) {
                result += CHARS[Math.floor(Math.random() * CHARS.length)]
              }
            }

            setDisplayText(result)
            if (progress < 1) {
              frameRef.current = requestAnimationFrame(animate)
            }
          }

          frameRef.current = requestAnimationFrame(animate)
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(el)
    return () => {
      observer.disconnect()
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [text, duration, revealed])

  return (
    <Tag ref={ref} className={className}>
      {displayText || '\u00A0'}
    </Tag>
  )
}
