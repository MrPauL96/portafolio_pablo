import { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const ACCENT = '#14B8A6'
const BG = '#0e0e0e'
const HS_KEY = 'collision_highscore'

class Vec2 {
  constructor(x = 0, y = 0) { this.x = x; this.y = y }
  add(v) { return new Vec2(this.x + v.x, this.y + v.y) }
  sub(v) { return new Vec2(this.x - v.x, this.y - v.y) }
  scale(s) { return new Vec2(this.x * s, this.y * s) }
  mag() { return Math.sqrt(this.x * this.x + this.y * this.y) }
  normalize() { const m = this.mag(); return m > 0 ? this.scale(1 / m) : new Vec2() }
}

class TargetBall {
  constructor(x, y, r, vx, vy, hue, type = 'normal') {
    this.pos = new Vec2(x, y)
    this.vel = new Vec2(vx, vy)
    this.radius = r
    this.alive = true
    this.deathAnim = 0
    this.deathParticles = []
    this.hue = hue
    this.pulsePhase = Math.random() * Math.PI * 2
    this.type = type
    this.hp = type === 'armored' ? 2 : 1
    this.hitFlash = 0
    this.points = type === 'speed' ? 30 : type === 'armored' ? 25 : type === 'splitter' ? 20 : 10
  }

  update(dt, bounds) {
    if (!this.alive) {
      this.deathAnim += dt * 3
      this.deathParticles.forEach(p => {
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.life -= dt * 2.5
        p.vy += 80 * dt
      })
      this.deathParticles = this.deathParticles.filter(p => p.life > 0)
      return
    }

    if (this.hitFlash > 0) this.hitFlash -= dt * 5

    this.pos = this.pos.add(this.vel.scale(dt))

    if (this.pos.x - this.radius < 0) { this.pos.x = this.radius; this.vel.x *= -1 }
    if (this.pos.x + this.radius > bounds.w) { this.pos.x = bounds.w - this.radius; this.vel.x *= -1 }
    if (this.pos.y - this.radius < 0) { this.pos.y = this.radius; this.vel.y *= -1 }
    if (this.pos.y + this.radius > bounds.h) { this.pos.y = bounds.h - this.radius; this.vel.y *= -1 }
  }

  hit() {
    this.hp--
    if (this.hp <= 0) {
      this.die()
      return true
    }
    this.hitFlash = 1
    return false
  }

  die() {
    this.alive = false
    const count = this.type === 'splitter' ? 16 : 12
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3
      const speed = 60 + Math.random() * 120
      this.deathParticles.push({
        x: this.pos.x, y: this.pos.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1, size: 2 + Math.random() * 4,
      })
    }
  }

  draw(ctx, time) {
    if (!this.alive) {
      for (const p of this.deathParticles) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2)
        ctx.fillStyle = `hsla(${this.hue},70%,60%,${p.life * 0.7})`
        ctx.fill()
      }
      return
    }

    const pulse = 1 + Math.sin(time * 3 + this.pulsePhase) * 0.08
    const r = this.radius * pulse
    const flashMix = Math.max(0, this.hitFlash)

    ctx.beginPath()
    ctx.arc(this.pos.x, this.pos.y, r + 12, 0, Math.PI * 2)
    ctx.fillStyle = `hsla(${this.hue},70%,50%,${0.06 + flashMix * 0.15})`
    ctx.fill()

    ctx.beginPath()
    ctx.arc(this.pos.x, this.pos.y, r, 0, Math.PI * 2)
    const lightness = 55 + flashMix * 30
    ctx.fillStyle = `hsla(${this.hue},70%,${lightness}%,0.9)`
    ctx.fill()

    if (this.type === 'armored' && this.hp > 1) {
      ctx.beginPath()
      ctx.arc(this.pos.x, this.pos.y, r + 3, 0, Math.PI * 2)
      ctx.strokeStyle = `hsla(${this.hue},50%,70%,0.5)`
      ctx.lineWidth = 2
      ctx.setLineDash([3, 3])
      ctx.stroke()
      ctx.setLineDash([])
    }

    if (this.type === 'splitter') {
      ctx.beginPath()
      ctx.arc(this.pos.x, this.pos.y, r * 0.35, 0, Math.PI * 2)
      ctx.fillStyle = `hsla(${this.hue},80%,80%,0.6)`
      ctx.fill()
      ctx.beginPath()
      ctx.arc(this.pos.x + r * 0.3, this.pos.y - r * 0.1, r * 0.2, 0, Math.PI * 2)
      ctx.fill()
    } else {
      ctx.beginPath()
      ctx.arc(this.pos.x, this.pos.y, r * 0.55, 0, Math.PI * 2)
      ctx.fillStyle = `hsla(${this.hue},70%,70%,0.4)`
      ctx.fill()
    }

    if (this.type === 'speed') {
      ctx.save()
      ctx.translate(this.pos.x, this.pos.y)
      const angle = Math.atan2(this.vel.y, this.vel.x)
      ctx.rotate(angle)
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath()
        ctx.moveTo(-r - i * 5, -3)
        ctx.lineTo(-r - i * 5 - 4, 0)
        ctx.lineTo(-r - i * 5, 3)
        ctx.strokeStyle = `hsla(${this.hue},70%,60%,${0.4 - i * 0.1})`
        ctx.lineWidth = 1
        ctx.stroke()
      }
      ctx.restore()
    }

    ctx.beginPath()
    ctx.arc(this.pos.x - r * 0.25, this.pos.y - r * 0.25, r * 0.15, 0, Math.PI * 2)
    ctx.fillStyle = `hsla(${this.hue},60%,85%,0.5)`
    ctx.fill()
  }
}

class Projectile {
  constructor(x, y, vx, vy) {
    this.pos = new Vec2(x, y)
    this.vel = new Vec2(vx, vy)
    this.radius = 6
    this.alive = true
    this.trail = []
    this.bounces = 0
  }

  update(dt, bounds) {
    if (!this.alive) return

    this.pos = this.pos.add(this.vel.scale(dt))

    this.trail.push({ x: this.pos.x, y: this.pos.y, life: 1 })
    if (this.trail.length > 18) this.trail.shift()
    this.trail.forEach(p => { p.life -= dt * 3 })
    this.trail = this.trail.filter(p => p.life > 0)

    if (this.pos.x - this.radius < 0 || this.pos.x + this.radius > bounds.w) {
      this.vel.x *= -1
      this.pos.x = Math.max(this.radius, Math.min(bounds.w - this.radius, this.pos.x))
      this.bounces++
    }
    if (this.pos.y - this.radius < 0 || this.pos.y + this.radius > bounds.h) {
      this.vel.y *= -1
      this.pos.y = Math.max(this.radius, Math.min(bounds.h - this.radius, this.pos.y))
      this.bounces++
    }

    if (this.bounces > 6) this.alive = false
  }

  draw(ctx) {
    if (!this.alive) return

    for (const p of this.trail) {
      ctx.beginPath()
      ctx.arc(p.x, p.y, this.radius * p.life * 0.6, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(20,184,166,${p.life * 0.25})`
      ctx.fill()
    }

    ctx.beginPath()
    ctx.arc(this.pos.x, this.pos.y, this.radius + 5, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(20,184,166,0.08)'
    ctx.fill()

    ctx.beginPath()
    ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2)
    ctx.fillStyle = ACCENT
    ctx.fill()

    ctx.beginPath()
    ctx.arc(this.pos.x, this.pos.y, this.radius * 0.45, 0, Math.PI * 2)
    ctx.fillStyle = '#5eead4'
    ctx.fill()
  }
}

const HUES = [170, 200, 260, 320, 40, 120, 280, 60]

function createWaveTargets(w, h, wave) {
  const targets = []
  const margin = 35
  const zone = { x: margin, y: margin, w: w - margin * 2, h: h * 0.6 }

  const baseCount = 3 + wave
  const count = Math.min(baseCount, 12)
  const baseSpeed = 20 + wave * 8
  const baseRadius = Math.max(7, 13 - wave * 0.4)

  for (let i = 0; i < count; i++) {
    const x = zone.x + Math.random() * zone.w
    const y = zone.y + Math.random() * zone.h
    const speed = baseSpeed + Math.random() * (20 + wave * 5)
    const angle = Math.random() * Math.PI * 2
    const hue = HUES[i % HUES.length]

    let type = 'normal'
    if (wave >= 2 && i === count - 1) type = 'splitter'
    if (wave >= 3 && i === count - 2) type = 'armored'
    if (wave >= 4 && i === 0) type = 'speed'

    const speedMult = type === 'speed' ? 1.8 : 1
    targets.push(new TargetBall(
      x, y,
      baseRadius + Math.random() * 4,
      Math.cos(angle) * speed * speedMult,
      Math.sin(angle) * speed * speedMult,
      hue, type
    ))
  }
  return targets
}

function getAmmo(wave, targetCount) {
  return targetCount + 2 + Math.floor(wave * 0.5)
}

export default function CollisionGame() {
  const canvasRef = useRef(null)
  const stateRef = useRef(null)
  const [gameState, setGameState] = useState('playing')
  const [wave, setWave] = useState(1)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [ammo, setAmmo] = useState(0)
  const [hits, setHits] = useState(0)
  const [totalTargets, setTotalTargets] = useState(0)
  const [highScore, setHighScore] = useState(() => {
    try { return parseInt(localStorage.getItem(HS_KEY)) || 0 } catch { return 0 }
  })
  const [floatingTexts, setFloatingTexts] = useState([])
  const hasInit = useRef(false)
  const comboTimerRef = useRef(null)
  const comboRef = useRef(0)
  const scoreRef = useRef(0)
  const shakeRef = useRef(0)

  const addFloatingText = useCallback((x, y, text, color) => {
    const id = Date.now() + Math.random()
    setFloatingTexts(prev => [...prev, { id, x, y, text, color, life: 1 }])
    setTimeout(() => setFloatingTexts(prev => prev.filter(t => t.id !== id)), 800)
  }, [])

  const startWave = useCallback((waveNum) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const w = canvas._cssW
    const h = canvas._cssH

    const targets = createWaveTargets(w, h, waveNum)
    const ammoCount = getAmmo(waveNum, targets.length)

    setWave(waveNum)
    setTotalTargets(targets.length)
    setHits(0)
    setAmmo(ammoCount)
    setCombo(0)
    comboRef.current = 0
    setGameState('playing')

    stateRef.current = {
      targets,
      projectiles: [],
      launcherPos: new Vec2(w / 2, h - 28),
      aimAngle: -Math.PI / 2,
    }
  }, [])

  const startGame = useCallback(() => {
    setScore(0)
    scoreRef.current = 0
    startWave(1)
  }, [startWave])

  const endGame = useCallback((finalScore) => {
    const s = finalScore ?? scoreRef.current
    if (s > highScore) {
      setHighScore(s)
      try { localStorage.setItem(HS_KEY, String(s)) } catch {}
    }
    setGameState('gameover')
  }, [highScore])

  useEffect(() => {
    if (!hasInit.current) {
      hasInit.current = true
      setTimeout(() => startGame(), 150)
    }
  }, [startGame])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let animId
    let lastTime = performance.now()

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio, 2)
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      canvas._cssW = rect.width
      canvas._cssH = rect.height
    }

    resize()
    window.addEventListener('resize', resize)

    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      const s = stateRef.current
      if (!s) return
      s.aimAngle = Math.atan2(my - s.launcherPos.y, mx - s.launcherPos.x)
    }

    const onClick = (e) => {
      const s = stateRef.current
      if (!s || gameState !== 'playing') return

      setAmmo(prev => {
        if (prev <= 0) return 0
        const rect = canvas.getBoundingClientRect()
        const mx = e.clientX - rect.left
        const my = e.clientY - rect.top
        const dir = new Vec2(mx - s.launcherPos.x, my - s.launcherPos.y).normalize()
        const speed = 420
        s.projectiles.push(new Projectile(s.launcherPos.x, s.launcherPos.y, dir.x * speed, dir.y * speed))
        return prev - 1
      })
    }

    canvas.addEventListener('mousemove', onMouseMove)
    canvas.addEventListener('click', onClick)

    const loop = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05)
      lastTime = now

      const w = canvas._cssW
      const h = canvas._cssH
      const bounds = { w, h }

      if (shakeRef.current > 0) shakeRef.current -= dt * 8

      const shakeX = shakeRef.current > 0 ? (Math.random() - 0.5) * shakeRef.current * 4 : 0
      const shakeY = shakeRef.current > 0 ? (Math.random() - 0.5) * shakeRef.current * 4 : 0

      ctx.save()
      ctx.translate(shakeX, shakeY)

      ctx.clearRect(-5, -5, w + 10, h + 10)
      ctx.fillStyle = BG
      ctx.fillRect(-5, -5, w + 10, h + 10)

      ctx.strokeStyle = 'rgba(255,255,255,0.02)'
      ctx.lineWidth = 1
      const gridSize = 30
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
      }

      const s = stateRef.current
      if (s && gameState === 'playing') {
        const time = now / 1000

        s.targets.forEach(t => t.update(dt, bounds))
        s.projectiles.forEach(p => p.update(dt, bounds))
        s.projectiles = s.projectiles.filter(p => p.alive || p.trail.length > 0)

        let waveHits = 0
        const newSplits = []

        for (const proj of s.projectiles) {
          if (!proj.alive) continue
          for (const target of s.targets) {
            if (!target.alive) continue
            const dist = proj.pos.sub(target.pos).mag()
            if (dist < proj.radius + target.radius) {
              const killed = target.hit()
              proj.alive = false
              shakeRef.current = 1

              if (killed) {
                waveHits++

                comboRef.current++
                setCombo(comboRef.current)

                clearTimeout(comboTimerRef.current)
                comboTimerRef.current = setTimeout(() => {
                  comboRef.current = 0
                  setCombo(0)
                }, 1500)

                const multiplier = Math.min(comboRef.current, 5)
                const points = target.points * multiplier
                scoreRef.current += points
                setScore(scoreRef.current)

                const label = multiplier > 1 ? `+${points} x${multiplier}` : `+${points}`
                const color = multiplier >= 4 ? '#fbbf24' : multiplier >= 2 ? '#5eead4' : '#14B8A6'
                addFloatingText(target.pos.x, target.pos.y, label, color)

                if (target.type === 'splitter') {
                  for (let k = 0; k < 2; k++) {
                    const angle = Math.random() * Math.PI * 2
                    const spd = 40 + Math.random() * 30
                    newSplits.push(new TargetBall(
                      target.pos.x + (k === 0 ? -10 : 10),
                      target.pos.y,
                      6, Math.cos(angle) * spd, Math.sin(angle) * spd,
                      target.hue + 30, 'normal'
                    ))
                    newSplits[newSplits.length - 1].points = 15
                  }
                }
              }
              break
            }
          }
        }

        if (newSplits.length > 0) {
          s.targets.push(...newSplits)
          setTotalTargets(prev => prev + newSplits.length)
        }

        if (waveHits > 0) {
          setHits(prev => {
            const newHits = prev + waveHits
            const aliveCount = s.targets.filter(t => t.alive).length
            if (aliveCount === 0) {
              setTimeout(() => {
                setWave(w => {
                  const next = w + 1
                  startWave(next)
                  return next
                })
              }, 600)
            }
            return newHits
          })
        }

        setAmmo(prev => {
          const aliveTargets = s.targets.filter(t => t.alive).length
          const aliveProjectiles = s.projectiles.filter(p => p.alive).length
          if (prev <= 0 && aliveProjectiles === 0 && aliveTargets > 0) {
            setTimeout(() => endGame(), 500)
          }
          return prev
        })

        s.targets.forEach(t => t.draw(ctx, time))
        s.projectiles.forEach(p => p.draw(ctx))

        const lx = s.launcherPos.x
        const ly = s.launcherPos.y

        ctx.beginPath()
        ctx.arc(lx, ly, 14, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(20,184,166,0.08)'
        ctx.fill()
        ctx.strokeStyle = 'rgba(20,184,166,0.25)'
        ctx.lineWidth = 1.5
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(lx, ly, 5, 0, Math.PI * 2)
        ctx.fillStyle = ACCENT
        ctx.fill()

        const aimLen = 55
        const ax = lx + Math.cos(s.aimAngle) * aimLen
        const ay = ly + Math.sin(s.aimAngle) * aimLen

        ctx.setLineDash([4, 6])
        ctx.beginPath()
        ctx.moveTo(lx, ly)
        ctx.lineTo(ax, ay)
        ctx.strokeStyle = 'rgba(20,184,166,0.2)'
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.setLineDash([])

        ctx.beginPath()
        ctx.arc(ax, ay, 3, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(20,184,166,0.4)'
        ctx.fill()
      }

      ctx.restore()

      animId = requestAnimationFrame(loop)
    }

    animId = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('mousemove', onMouseMove)
      canvas.removeEventListener('click', onClick)
    }
  }, [gameState, startWave, endGame, addFloatingText])

  const comboColor = combo >= 4 ? 'text-yellow-400' : combo >= 2 ? 'text-teal-300' : 'text-accent/60'

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-white/[0.06] bg-[#0e0e0e]" style={{ aspectRatio: '4/3' }}>
      {/* HUD */}
      {gameState === 'playing' && (
        <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-3 py-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-neutral-600">W{wave}</span>
            <span className="text-[10px] font-mono text-accent/60">{score}</span>
            {combo >= 2 && (
              <span className={`text-[10px] font-mono font-bold ${comboColor} animate-pulse`}>
                x{combo}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-neutral-600">
              {ammo} shots
            </span>
            <span className="text-[10px] font-mono text-accent/50">
              {hits}/{totalTargets}
            </span>
          </div>
        </div>
      )}

      {/* Floating score texts */}
      {floatingTexts.map(t => (
        <motion.div
          key={t.id}
          initial={{ opacity: 1, y: 0, scale: 1 }}
          animate={{ opacity: 0, y: -30, scale: 1.3 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="absolute z-30 pointer-events-none text-xs font-mono font-bold"
          style={{ left: t.x, top: t.y, color: t.color }}
        >
          {t.text}
        </motion.div>
      ))}

      {/* Canvas */}
      <div className="absolute inset-0">
        <canvas
          ref={canvasRef}
          className="w-full h-full"
          style={{ touchAction: 'none', cursor: gameState === 'playing' ? 'crosshair' : 'default' }}
        />
      </div>

      {/* Game Over overlay */}
      <AnimatePresence>
        {gameState === 'gameover' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#0e0e0e]/85 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="text-center"
            >
              <p className="text-red-400 text-sm font-bold mb-1 font-mono">OUT OF AMMO</p>
              <p className="text-white text-2xl font-bold mb-0.5">{score}</p>
              <p className="text-neutral-600 text-[10px] font-mono mb-1">Wave {wave} · Best: {highScore}</p>
              {score >= highScore && score > 0 && (
                <p className="text-yellow-400 text-[10px] font-mono font-bold mb-2 animate-pulse">NEW HIGH SCORE!</p>
              )}
              <p className="text-neutral-700 text-[9px] font-mono mb-4">
                click to play again
              </p>
              <motion.button
                onClick={startGame}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2 rounded-lg bg-accent text-white text-xs font-medium hover:bg-accent/90 transition-colors"
              >
                Retry
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* High score badge */}
      {gameState === 'playing' && highScore > 0 && (
        <div className="absolute bottom-2 left-3 z-20 text-[9px] font-mono text-neutral-700">
          best: {highScore}
        </div>
      )}
    </div>
  )
}
