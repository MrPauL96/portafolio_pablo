import { useRef, useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const RED_BODY = '#dc2626'
const RED_WICK = '#b91c1c'
const GREEN_BODY = '#16a34a'
const GREEN_WICK = '#15803d'
const RED_TEXT = '#ef4444'
const GREEN_TEXT = '#22c55e'
const BG = '#0a0a0a'
const GRID = 'rgba(255,255,255,0.025)'
const AXIS_TEXT = 'rgba(255,255,255,0.2)'
const PRICE_LINE = 'rgba(255,255,255,0.06)'
const INITIAL_PRICE = 2348.50
const TICK_MS = 100
const TICKS_PER_CANDLE = 25
const MAX_CANDLES = 40

function generateTick(prev) {
  const vol = 0.6 + Math.random() * 0.5
  const drift = (Math.random() - 0.501) * vol
  const momentum = (Math.random() < 0.5 ? 1 : -1) * Math.random() * 0.15
  const spike = Math.random() < 0.02 ? (Math.random() - 0.5) * 5 : 0
  return +(prev + drift + momentum + spike).toFixed(2)
}

function createCandle(openPrice) {
  return { open: openPrice, high: openPrice, low: openPrice, close: openPrice, volume: 0, ticks: 0 }
}

function drawChart(ctx, w, h, candles, currentCandle, position, mouse) {
  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = BG
  ctx.fillRect(0, 0, w, h)

  const rightMargin = 58
  const bottomMargin = 28
  const topPad = 16
  const chartW = w - rightMargin
  const chartH = h - bottomMargin - topPad
  const volH = chartH * 0.12

  const allCandles = [...candles, currentCandle].filter(Boolean)
  if (allCandles.length < 1) return

  let min = Infinity, max = -Infinity, maxVol = 0
  for (const c of allCandles) {
    if (c.low < min) min = c.low
    if (c.high > max) max = c.high
    if (c.volume > maxVol) maxVol = c.volume
  }

  const priceRange = max - min || 1
  min -= priceRange * 0.08
  max += priceRange * 0.08
  const range = max - min

  const toY = (v) => topPad + (1 - (v - min) / range) * chartH
  const candleCount = allCandles.length
  const candleW = Math.max(3, Math.min(14, (chartW - 20) / candleCount * 0.75))
  const gap = candleW * 0.35
  const totalW = candleCount * (candleW + gap)
  const startX = chartW - totalW - 4

  // Grid lines
  ctx.strokeStyle = GRID
  ctx.lineWidth = 1
  const priceStep = calcStep(range)
  let priceLine = Math.ceil(min / priceStep) * priceStep
  ctx.font = '9px monospace'
  while (priceLine < max) {
    const y = toY(priceLine)
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(chartW, y); ctx.stroke()
    ctx.fillStyle = AXIS_TEXT
    ctx.textAlign = 'left'
    ctx.fillText(priceLine.toFixed(2), chartW + 6, y + 3)
    priceLine += priceStep
  }

  // Vertical time lines
  for (let i = 0; i < candleCount; i += 5) {
    const x = startX + i * (candleW + gap) + candleW / 2
    ctx.strokeStyle = GRID
    ctx.beginPath(); ctx.moveTo(x, topPad); ctx.lineTo(x, topPad + chartH); ctx.stroke()
    ctx.fillStyle = 'rgba(255,255,255,0.1)'
    ctx.textAlign = 'center'
    ctx.fillText(`${i * 5}m`, x, h - 8)
  }

  // Entry line
  if (position) {
    const ey = toY(position.entry)
    ctx.setLineDash([4, 4])
    ctx.strokeStyle = position.type === 'long' ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(0, ey); ctx.lineTo(chartW, ey); ctx.stroke()
    ctx.setLineDash([])

    ctx.fillStyle = position.type === 'long' ? 'rgba(34,197,94,0.7)' : 'rgba(239,68,68,0.7)'
    const label = `${position.type.toUpperCase()} @ ${position.entry.toFixed(2)}`
    const tw = ctx.measureText(label).width + 10
    ctx.fillRect(chartW - tw - 2, ey - 8, tw, 16)
    ctx.fillStyle = '#fff'
    ctx.textAlign = 'right'
    ctx.fillText(label, chartW - 7, ey + 3)
  }

  // Candles + volume
  for (let i = 0; i < candleCount; i++) {
    const c = allCandles[i]
    const x = startX + i * (candleW + gap)
    const cx = x + candleW / 2
    const isUp = c.close >= c.open
    const bodyTop = toY(Math.max(c.open, c.close))
    const bodyBot = toY(Math.min(c.open, c.close))
    const bodyH = Math.max(1, bodyBot - bodyTop)

    // Wick
    ctx.strokeStyle = isUp ? GREEN_WICK : RED_WICK
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(cx, toY(c.high))
    ctx.lineTo(cx, toY(c.low))
    ctx.stroke()

    // Body
    ctx.fillStyle = isUp ? GREEN_BODY : RED_BODY
    ctx.fillRect(x, bodyTop, candleW, bodyH)

    // Volume bar
    if (maxVol > 0) {
      const vBarH = (c.volume / maxVol) * volH
      const vBarY = topPad + chartH - vBarH
      ctx.fillStyle = isUp ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)'
      ctx.fillRect(x, vBarY, candleW, vBarH)
    }
  }

  // Current price line + label
  const lastClose = allCandles[allCandles.length - 1]?.close
  if (lastClose != null) {
    const py = toY(lastClose)
    const prevClose = allCandles.length > 1 ? allCandles[allCandles.length - 2].close : lastClose
    const isUp = lastClose >= prevClose
    const color = isUp ? GREEN_TEXT : RED_TEXT

    ctx.setLineDash([2, 3])
    ctx.strokeStyle = isUp ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(chartW, py); ctx.stroke()
    ctx.setLineDash([])

    // Price label on right axis
    const labelW = 56
    ctx.fillStyle = isUp ? GREEN_BODY : RED_BODY
    roundRect(ctx, chartW + 1, py - 9, labelW, 18, 3)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 10px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(lastClose.toFixed(2), chartW + 1 + labelW / 2, py + 4)
    ctx.font = '9px monospace'
  }

  // Crosshair
  if (mouse && mouse.x > 0 && mouse.x < chartW && mouse.y > topPad && mouse.y < topPad + chartH) {
    ctx.strokeStyle = 'rgba(255,255,255,0.07)'
    ctx.setLineDash([2, 3])
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(mouse.x, topPad); ctx.lineTo(mouse.x, topPad + chartH); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, mouse.y); ctx.lineTo(chartW, mouse.y); ctx.stroke()
    ctx.setLineDash([])

    const hoverPrice = min + (1 - (mouse.y - topPad) / chartH) * range
    ctx.fillStyle = 'rgba(255,255,255,0.08)'
    roundRect(ctx, chartW + 1, mouse.y - 8, 56, 16, 3)
    ctx.fill()
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.textAlign = 'center'
    ctx.fillText(hoverPrice.toFixed(2), chartW + 29, mouse.y + 3)
  }

  // Right axis border
  ctx.strokeStyle = 'rgba(255,255,255,0.04)'
  ctx.lineWidth = 1
  ctx.beginPath(); ctx.moveTo(chartW, 0); ctx.lineTo(chartW, h - bottomMargin); ctx.stroke()

  // Bottom axis border
  ctx.beginPath(); ctx.moveTo(0, h - bottomMargin); ctx.lineTo(chartW, h - bottomMargin); ctx.stroke()
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

function calcStep(range) {
  const raw = range / 5
  const mag = Math.pow(10, Math.floor(Math.log10(raw)))
  const norm = raw / mag
  if (norm <= 1) return mag
  if (norm <= 2) return 2 * mag
  if (norm <= 5) return 5 * mag
  return 10 * mag
}

const LEVERAGES = [1, 5, 10]
const SPEEDS = [1, 2, 5]

export default function TradingGame() {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [gameState, setGameState] = useState('playing')
  const hasInit = useRef(false)
  const [price, setPrice] = useState(INITIAL_PRICE)
  const [position, setPosition] = useState(null)
  const [pnl, setPnl] = useState(0)
  const [balance, setBalance] = useState(10000)
  const [totalPnl, setTotalPnl] = useState(0)
  const [trades, setTrades] = useState(0)
  const [wins, setWins] = useState(0)
  const [leverage, setLeverage] = useState(1)
  const [speed, setSpeed] = useState(1)
  const [flash, setFlash] = useState(null)
  const candlesRef = useRef([])
  const currentCandleRef = useRef(null)
  const positionRef = useRef(null)
  const priceRef = useRef(INITIAL_PRICE)
  const mouseRef = useRef(null)
  const intervalRef = useRef(null)
  const leverageRef = useRef(1)
  const speedRef = useRef(1)

  leverageRef.current = leverage
  speedRef.current = speed

  const triggerFlash = useCallback((type) => {
    setFlash(type)
    setTimeout(() => setFlash(null), 300)
  }, [])

  const startGame = useCallback(() => {
    const initial = +(INITIAL_PRICE + (Math.random() - 0.5) * 10).toFixed(2)
    priceRef.current = initial

    const candles = []
    let p = initial - 8 + Math.random() * 4
    for (let i = 0; i < 20; i++) {
      const candle = createCandle(p)
      for (let t = 0; t < TICKS_PER_CANDLE; t++) {
        p = generateTick(p)
        candle.high = Math.max(candle.high, p)
        candle.low = Math.min(candle.low, p)
        candle.close = p
        candle.volume += Math.floor(Math.random() * 50 + 10)
        candle.ticks++
      }
      candles.push(candle)
    }

    priceRef.current = p
    candlesRef.current = candles
    currentCandleRef.current = createCandle(p)
    positionRef.current = null
    setPrice(p)
    setPosition(null)
    setPnl(0)
    setBalance(10000)
    setTotalPnl(0)
    setTrades(0)
    setWins(0)
    setGameState('playing')
  }, [])

  const openPosition = useCallback((type) => {
    if (positionRef.current) return
    const pos = { type, entry: priceRef.current, leverage: leverageRef.current }
    positionRef.current = pos
    setPosition({ ...pos })
    triggerFlash(type === 'long' ? 'buy' : 'sell')
  }, [triggerFlash])

  const closePosition = useCallback(() => {
    const pos = positionRef.current
    if (!pos) return
    const diff = pos.type === 'long'
      ? priceRef.current - pos.entry
      : pos.entry - priceRef.current
    const realized = +(diff * 100 * pos.leverage).toFixed(2)
    if (realized > 0) setWins(prev => prev + 1)
    setBalance(prev => +(prev + realized).toFixed(2))
    setTotalPnl(prev => +(prev + realized).toFixed(2))
    setTrades(prev => prev + 1)
    triggerFlash(realized >= 0 ? 'win' : 'loss')
    positionRef.current = null
    setPosition(null)
    setPnl(0)
  }, [triggerFlash])

  useEffect(() => {
    const onKey = (e) => {
      const key = e.key.toLowerCase()
      if (key === 'b') openPosition('long')
      else if (key === 's') openPosition('short')
      else if (key === 'c') closePosition()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openPosition, closePosition])

  useEffect(() => {
    if (!hasInit.current) {
      hasInit.current = true
      setTimeout(() => startGame(), 100)
    }
  }, [startGame])

  useEffect(() => {
    if (gameState !== 'playing') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

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
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }

    const onMouseLeave = () => { mouseRef.current = null }

    canvas.addEventListener('mousemove', onMouseMove)
    canvas.addEventListener('mouseleave', onMouseLeave)

    const tick = () => {
      const newPrice = generateTick(priceRef.current)
      priceRef.current = newPrice

      const candle = currentCandleRef.current
      candle.high = Math.max(candle.high, newPrice)
      candle.low = Math.min(candle.low, newPrice)
      candle.close = newPrice
      candle.volume += Math.floor(Math.random() * 30 + 5)
      candle.ticks++

      if (candle.ticks >= TICKS_PER_CANDLE) {
        candlesRef.current.push({ ...candle })
        if (candlesRef.current.length > MAX_CANDLES) candlesRef.current.shift()
        currentCandleRef.current = createCandle(newPrice)
      }

      setPrice(newPrice)

      const pos = positionRef.current
      if (pos) {
        const diff = pos.type === 'long' ? newPrice - pos.entry : pos.entry - newPrice
        setPnl(+(diff * 100 * pos.leverage).toFixed(2))
      }

      const w = canvas._cssW
      const h = canvas._cssH
      if (w && h) {
        drawChart(ctx, w, h, candlesRef.current, currentCandleRef.current, positionRef.current, mouseRef.current)
      }
    }

    intervalRef.current = setInterval(tick, TICK_MS / speedRef.current)

    return () => {
      clearInterval(intervalRef.current)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('mousemove', onMouseMove)
      canvas.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [gameState, speed])

  const prevPrice = candlesRef.current.length > 0 ? candlesRef.current[candlesRef.current.length - 1].close : INITIAL_PRICE
  const priceUp = price >= prevPrice
  const change = price - INITIAL_PRICE
  const changePct = ((change / INITIAL_PRICE) * 100).toFixed(2)
  const winRate = trades > 0 ? Math.round((wins / trades) * 100) : 0

  const flashBorder = flash === 'buy' ? 'border-green-500/40' : flash === 'sell' ? 'border-red-500/40' : flash === 'win' ? 'border-green-400/50' : flash === 'loss' ? 'border-red-400/50' : 'border-white/[0.06]'

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-xl overflow-hidden bg-[#0a0a0a] flex flex-col border transition-colors duration-300 ${flashBorder}`}
      style={{ aspectRatio: '4/3' }}
      tabIndex={0}
    >
      {/* Price ticker + controls */}
      {gameState === 'playing' && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#0a0a0a] border-b border-white/[0.04] shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-neutral-500 font-bold">XAUUSD</span>
            <span className="text-[9px] font-mono text-neutral-600">M5</span>
            {/* Speed selector */}
            <div className="flex items-center gap-0.5 ml-1">
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold transition-all ${
                    speed === s
                      ? 'bg-accent/15 text-accent border border-accent/25'
                      : 'text-neutral-700 hover:text-neutral-500'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold" style={{ color: priceUp ? GREEN_TEXT : RED_TEXT }}>
              {price.toFixed(2)}
            </span>
            <span className="text-[9px] font-mono" style={{ color: change >= 0 ? GREEN_TEXT : RED_TEXT }}>
              {change >= 0 ? '+' : ''}{changePct}%
            </span>
          </div>
        </div>
      )}

      {/* Chart area */}
      <div className="flex-1 relative min-h-0">
        {gameState === 'playing' && (
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ cursor: 'crosshair' }} />
        )}
      </div>

      {/* Trading controls */}
      {gameState === 'playing' && (
        <div className="px-3 py-2 bg-[#0a0a0a] border-t border-white/[0.04] shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div className="text-[9px] font-mono text-neutral-600 leading-tight">
                <span className="block">BAL <span className="text-neutral-400">${balance.toFixed(0)}</span></span>
                <span className="block">
                  P&L{' '}
                  <span style={{ color: totalPnl >= 0 ? GREEN_TEXT : RED_TEXT }}>
                    {totalPnl >= 0 ? '+' : ''}{totalPnl.toFixed(0)}
                  </span>
                  <span className="text-neutral-700"> · {trades}t · {winRate}%</span>
                </span>
              </div>
              {/* Leverage selector */}
              <div className="flex items-center gap-0.5">
                {LEVERAGES.map((lev) => (
                  <button
                    key={lev}
                    onClick={() => setLeverage(lev)}
                    disabled={!!position}
                    className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold transition-all ${
                      leverage === lev
                        ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/25'
                        : 'text-neutral-700 hover:text-neutral-500 disabled:opacity-30'
                    }`}
                  >
                    {lev}x
                  </button>
                ))}
              </div>
            </div>

            {!position ? (
              <div className="flex gap-1.5">
                <button
                  onClick={() => openPosition('long')}
                  className="px-3.5 py-1.5 rounded-md text-[10px] font-mono font-bold bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20 active:scale-95 transition-all"
                  title="Press B"
                >
                  BUY <span className="text-[7px] text-green-600">B</span>
                </button>
                <button
                  onClick={() => openPosition('short')}
                  className="px-3.5 py-1.5 rounded-md text-[10px] font-mono font-bold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 active:scale-95 transition-all"
                  title="Press S"
                >
                  SELL <span className="text-[7px] text-red-600">S</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="text-[9px] font-mono text-right leading-tight">
                  <span className="text-neutral-600 block">
                    {position.type.toUpperCase()} {position.leverage}x @ {position.entry.toFixed(2)}
                  </span>
                  <span className="font-bold block" style={{ color: pnl >= 0 ? GREEN_TEXT : RED_TEXT }}>
                    {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)} USD
                  </span>
                </div>
                <button
                  onClick={closePosition}
                  className="px-3 py-1.5 rounded-md text-[10px] font-mono font-bold bg-white/5 text-neutral-300 border border-white/10 hover:bg-white/10 active:scale-95 transition-all"
                  title="Press C"
                >
                  CLOSE <span className="text-[7px] text-neutral-600">C</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
