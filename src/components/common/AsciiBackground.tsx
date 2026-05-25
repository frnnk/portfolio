import { useCallback, useEffect, useRef } from 'react'

// ---------------------------------------------------------------------------
// Animated ASCII flow-field background.
//
// Ported from a minified reference (a Perlin/fractal-noise field rendered into
// a <pre>): drifting diagonal bands, "static" in the negative space, moving
// streaks that blank the field, gap clouds, and an interactive mouse-erase
// trail. Everything tunable lives in CONFIG below.
// ---------------------------------------------------------------------------

// The word woven into the bands. Change this to weave in any text.
const WORD = 'frank'

const CONFIG = {
  angleDeg: 0,
  frequency: 11,
  contrast: 0.35,
  edgeWidth: 0.04,
  gapLevel: 0.3,
  driftX: 0,
  driftY: -0.018,
  warpAmp: 0.42,
  warpScale: 1.4,
  warpSpeed: 0.001,
  bandJitter: { amp: 0.2, scale: 0.85, speed: 0.05 },
  randomSet: Array.from('        .,:;*+-~'),
  lineSet: Array.from(`    ${WORD} @@@    `),
  gapSet: Array.from('@'),
  randomChangeHz: 1.5,
  lineThreshold: 0,
  gapThreshold: 1,
  gapFan: { strength: 0.5 },
  streaks: {
    count: 3,
    char: ' ',
    angleJitterDeg: 75,
    widthMin: 0.008,
    widthMax: 0.028,
    lengthMin: 0.22,
    lengthMax: 0.7,
    speedMin: 0.12,
    speedMax: 0.3,
    startMargin: 0.18,
  },
  gapClouds: { density: 0.18, scale: 1.6, speed: 0.03, octaves: 3, hardness: 0.85 },
  erase: { radiusCells: 12, durationSec: 0.9, jitter: 0.35, hardness: 0.6 },
  fpsCap: 30,
}

// --- noise / hash helpers ---------------------------------------------------

const gradients: { x: number; y: number }[] = []
for (let i = 0; i < 256; i++) {
  const a = (i / 256) * Math.PI * 2
  gradients[i] = { x: Math.cos(a), y: Math.sin(a) }
}

const perm = new Uint8Array(512)
;(() => {
  const p = new Uint8Array(256)
  for (let i = 0; i < 256; i++) p[i] = i
  let seed = 1234567
  const rng = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967295
  for (let i = 255; i > 0; i--) {
    const j = (rng() * (i + 1)) | 0
    const tmp = p[i]
    p[i] = p[j]
    p[j] = tmp
  }
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255]
})()

const clamp = (n: number, lo: number, hi: number) => (n < lo ? lo : n > hi ? hi : n)
const smoother = (n: number) => n * n * n * (n * (n * 6 - 15) + 10)

function gradDot(ix: number, iy: number, x: number, y: number): number {
  const g = gradients[perm[(ix & 255) + perm[iy & 255]]]
  return g.x * (x - ix) + g.y * (y - iy)
}

function perlin2d(x: number, y: number): number {
  const x0 = Math.floor(x)
  const y0 = Math.floor(y)
  const x1 = x0 + 1
  const y1 = y0 + 1
  const sx = smoother(x - x0)
  const sy = smoother(y - y0)
  const n00 = gradDot(x0, y0, x, y)
  const n10 = gradDot(x1, y0, x, y)
  const n01 = gradDot(x0, y1, x, y)
  const n11 = gradDot(x1, y1, x, y)
  const ix0 = n00 + sx * (n10 - n00)
  const ix1 = n01 + sx * (n11 - n01)
  return ix0 + sy * (ix1 - ix0)
}

function fbm(x: number, y: number, octaves = 3, gain = 0.5, lacunarity = 2): number {
  let sum = 0
  let amp = 1
  let freq = 1
  let norm = 0
  for (let i = 0; i < octaves; i++) {
    sum += amp * perlin2d(x * freq, y * freq)
    norm += amp
    amp *= gain
    freq *= lacunarity
  }
  return sum / (norm || 1)
}

function hash1(n: number): number {
  n = (n >>> 0) + 2654435769
  n ^= n >>> 16
  n = Math.imul(n, 2246822507)
  n ^= n >>> 13
  n = Math.imul(n, 3266489909)
  n ^= n >>> 16
  return n >>> 0
}

function hash3(a: number, b: number, c: number): number {
  let h = 2166136261
  h ^= a | 0
  h = Math.imul(h, 16777619)
  h ^= b | 0
  h = Math.imul(h, 16777619)
  h ^= c | 0
  h = Math.imul(h, 16777619)
  return h >>> 0
}

const pick = <T,>(arr: T[], i: number): T => arr[i % arr.length]
const randRange = (lo: number, hi: number) => lo + Math.random() * (hi - lo)

// --- types ------------------------------------------------------------------

interface Sample {
  u: number
  v: number
  bandIndex: number
  tLine: number
  tGap: number
}

interface Streak {
  dirx: number
  diry: number
  nrmx: number
  nrmy: number
  p0: number
  width: number
  length: number
  speed: number
  headStart: number
  bornAt: number
}

interface FieldState {
  cols: number
  rows: number
  sShort: number
  t0: number
  lastFrame: number
  lastT: number
  cellW: number
  cellH: number
  eraseBuf: Float32Array
  eraseActive: boolean
  streaks: Streak[]
}

// --- component --------------------------------------------------------------

export function AsciiBackground() {
  const preRef = useRef<HTMLPreElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef(0)
  const stateRef = useRef<FieldState>({
    cols: 0,
    rows: 0,
    sShort: 1,
    t0: 0,
    lastFrame: 0,
    lastT: 0,
    cellW: 8,
    cellH: 14,
    eraseBuf: new Float32Array(1),
    eraseActive: false,
    streaks: [],
  })

  const measureCell = useCallback((): { cw: number; lh: number } => {
    const pre = preRef.current
    const container = containerRef.current
    if (!pre || !container) return { cw: 8, lh: 14 }
    const probe = document.createElement('span')
    probe.textContent = 'M'.repeat(200)
    probe.style.position = 'absolute'
    probe.style.left = '-9999px'
    probe.style.top = '-9999px'
    probe.style.whiteSpace = 'pre'
    probe.style.pointerEvents = 'none'
    probe.style.visibility = 'hidden'
    const cs = getComputedStyle(pre)
    probe.style.fontFamily = cs.fontFamily
    probe.style.fontSize = cs.fontSize
    probe.style.fontWeight = cs.fontWeight
    probe.style.fontStyle = cs.fontStyle
    probe.style.letterSpacing = cs.letterSpacing
    container.appendChild(probe)
    const width = probe.getBoundingClientRect().width
    container.removeChild(probe)
    const cw = width / 200 || 8
    const lh = parseFloat(cs.lineHeight) || 14
    return { cw, lh }
  }, [])

  const resize = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    const { cw, lh } = measureCell()
    const st = stateRef.current
    st.cellW = cw
    st.cellH = lh
    const rect = container.getBoundingClientRect()
    const cols = Math.max(1, Math.floor(rect.width / st.cellW - 0.15))
    const rows = Math.max(1, Math.floor(rect.height / st.cellH - 0.05))
    if (cols === st.cols && rows === st.rows) return
    st.cols = cols
    st.rows = rows
    st.sShort = Math.min(cols, rows)
    st.eraseBuf = new Float32Array(cols * rows)
  }, [measureCell])

  const streakDir = useCallback(() => {
    let dx = CONFIG.driftX
    let dy = CONFIG.driftY
    let ang = Math.atan2(dy, dx)
    ang += randRange(-1, 1) * CONFIG.streaks.angleJitterDeg * (Math.PI / 180)
    dx = Math.cos(ang)
    dy = Math.sin(ang)
    const len = Math.hypot(dx, dy) || 1
    dx /= len
    dy /= len
    return { dx, dy, nx: -dy, ny: dx }
  }, [])

  const makeStreak = useCallback(
    (bornAt: number): Streak => {
      const s = CONFIG.streaks
      const margin = s.startMargin
      const dir = streakDir()
      return {
        dirx: dir.dx,
        diry: dir.dy,
        nrmx: dir.nx,
        nrmy: dir.ny,
        p0: randRange(-margin, 1 + margin),
        width: randRange(s.widthMin, s.widthMax),
        length: randRange(s.lengthMin, s.lengthMax),
        speed: randRange(s.speedMin, s.speedMax),
        headStart: -(randRange(s.lengthMin, s.lengthMax) + margin),
        bornAt,
      }
    },
    [streakDir]
  )

  const spawnStreaks = useCallback(
    (now: number) => {
      const st = stateRef.current
      st.streaks = []
      for (let i = 0; i < CONFIG.streaks.count; i++) st.streaks.push(makeStreak(now))
    },
    [makeStreak]
  )

  const gapCloud = useCallback((u: number, v: number, t: number): boolean => {
    const g = CONFIG.gapClouds
    const n = fbm(u * g.scale + t * g.speed + 11.3, v * g.scale - t * g.speed - 7.9, g.octaves, 0.55, 2)
    const hardened = Math.pow(n, g.hardness)
    const threshold = 1 - g.density
    const jitter = ((hash3((u * 9999) | 0, (v * 9999) | 0, Math.floor(t)) % 997) / 997) * 0.02
    return hardened + jitter > threshold
  }, [])

  const streakHit = useCallback(
    (u: number, v: number, t: number): boolean => {
      const st = stateRef.current
      const margin = CONFIG.streaks.startMargin
      for (let i = 0; i < st.streaks.length; i++) {
        const s = st.streaks[i]
        const along = u * s.dirx + v * s.diry
        const across = u * s.nrmx + v * s.nrmy
        const head = s.headStart + s.speed * t
        const tail = head - s.length
        if (head > 1 + margin) {
          st.streaks[i] = makeStreak(t)
          continue
        }
        if (Math.abs(across - s.p0) <= s.width * 0.5 && along >= tail && along <= head) return true
      }
      return false
    },
    [makeStreak]
  )

  const computeCell = useCallback(
    (x: number, y: number, t: number, rowFrac: number, out: Sample) => {
      const short = stateRef.current.sShort || 1
      let u = x / short
      let v = y / short
      u -= CONFIG.driftX * t
      v -= CONFIG.driftY * t
      const wt = t * CONFIG.warpSpeed
      const warpU = CONFIG.warpAmp * fbm(u * CONFIG.warpScale + 10.1 + wt, v * CONFIG.warpScale - 9.3 - wt, 3, 0.55, 2)
      const warpV = CONFIG.warpAmp * fbm(u * CONFIG.warpScale - 30.9 - wt, v * CONFIG.warpScale + 19.7 + wt, 3, 0.8, 2)
      const ang = CONFIG.angleDeg * (Math.PI / 180)
      const h = (u + warpU) * Math.cos(ang) + (v + warpV) * Math.sin(ang)
      const wave = 0.5 + 0.5 * Math.sin(h * Math.PI * 2 * (CONFIG.frequency / 2))
      const intensity = 1 - Math.pow(wave, CONFIG.contrast)
      let level = CONFIG.gapLevel
      level += (1 - rowFrac) * CONFIG.gapFan.strength
      const jitter = fbm(u * CONFIG.bandJitter.scale + 77.1, v * CONFIG.bandJitter.scale - 99.8, 3, 0.55, 2)
      level += CONFIG.bandJitter.amp * (jitter - 0.5) * 2 + Math.sin(t * CONFIG.bandJitter.speed) * 0.02
      const lo = level - CONFIG.edgeWidth
      const hi = level + CONFIG.edgeWidth
      out.u = u + warpU
      out.v = v + warpV
      out.bandIndex = Math.floor(h * CONFIG.frequency)
      out.tLine = clamp(1 - (intensity - lo) / (hi - lo), 0, 1)
      out.tGap = clamp((intensity - lo) / (hi - lo), 0, 1)
    },
    []
  )

  const pickChar = useCallback(
    (x: number, y: number, t: number, s: Sample): string => {
      if (gapCloud(s.u, s.v, t)) return ' '
      if (streakHit(s.u, s.v, t - stateRef.current.t0 / 1e3)) return CONFIG.streaks.char
      if (s.tLine > CONFIG.lineThreshold) return pick(CONFIG.lineSet, hash1(s.bandIndex * 73856093))
      if (s.tGap > CONFIG.gapThreshold) return pick(CONFIG.gapSet, hash1(s.bandIndex * 19349663))
      const tick = Math.floor(t * CONFIG.randomChangeHz)
      const r = hash1(((x + 1) * 15485863) ^ ((y + 1) * 32452843) ^ (tick * 49979687))
      return CONFIG.randomSet[r % CONFIG.randomSet.length]
    },
    [gapCloud, streakHit]
  )

  const cellChar = useCallback(
    (x: number, y: number, t: number, s: Sample): string => {
      const st = stateRef.current
      return st.eraseBuf[y * st.cols + x] > 0 ? ' ' : pickChar(x, y, t, s)
    },
    [pickChar]
  )

  const draw = useCallback(
    (t: number) => {
      const pre = preRef.current
      const st = stateRef.current
      if (!pre) return
      let text = ''
      const sample: Sample = { u: 0, v: 0, bandIndex: 0, tLine: 0, tGap: 0 }
      for (let y = 0; y < st.rows; y++) {
        const rowFrac = st.rows <= 1 ? 0 : y / (st.rows - 1)
        for (let x = 0; x < st.cols; x++) {
          computeCell(x, y, t, rowFrac, sample)
          text += cellChar(x, y, t, sample)
        }
        if (y < st.rows - 1) text += '\n'
      }
      pre.textContent = text
    },
    [computeCell, cellChar]
  )

  const frame = useCallback(
    (now: number) => {
      const st = stateRef.current
      if (!preRef.current || now - st.lastFrame < 1e3 / CONFIG.fpsCap) {
        rafRef.current = requestAnimationFrame(frame)
        return
      }
      const t = (now - st.t0) / 1e3
      const dt = t - st.lastT
      st.lastT = t
      st.lastFrame = now
      if (st.eraseActive) {
        const step = dt > 0 ? dt : 0.016
        let active = false
        for (let i = 0; i < st.eraseBuf.length; i++) {
          const remaining = st.eraseBuf[i] - step
          if (remaining > 0) {
            st.eraseBuf[i] = remaining
            active = true
          } else {
            st.eraseBuf[i] = 0
          }
        }
        st.eraseActive = active
      }
      draw(t)
      rafRef.current = requestAnimationFrame(frame)
    },
    [draw]
  )

  const pointer = useCallback((event: MouseEvent | TouchEvent) => {
    const pre = preRef.current
    if (!pre) return
    const st = stateRef.current
    const rect = pre.getBoundingClientRect()
    const point = 'touches' in event ? event.touches[0] : event
    if (!point) return
    const px = point.clientX - rect.left
    const py = point.clientY - rect.top
    let cx = Math.floor(px / st.cellW)
    let cy = Math.floor(py / st.cellH)
    cx = Math.max(0, Math.min(st.cols - 1, cx))
    cy = Math.max(0, Math.min(st.rows - 1, cy))
    const radius = CONFIG.erase.radiusCells | 0
    const duration = CONFIG.erase.durationSec
    const hardness = clamp(CONFIG.erase.hardness, 0, 1)
    const jitter = clamp(CONFIG.erase.jitter, 0, 1)
    const r2 = radius * radius
    const x0 = Math.max(0, cx - radius)
    const x1 = Math.min(st.cols - 1, cx + radius)
    const y0 = Math.max(0, cy - radius)
    const y1 = Math.min(st.rows - 1, cy + radius)
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        const dx = x - cx
        const dy = y - cy
        const dist2 = dx * dx + dy * dy
        if (dist2 > r2) continue
        const falloff = Math.sqrt(dist2) / radius
        const strength = Math.pow(1 - falloff, hardness * 3 + 0.01)
        const roll = (hash3(x * 131 + y * 911, y * 521 + x * 173, cx * 7 + cy * 13) % 1e3) / 1e3
        if (roll < strength * (1 - jitter) + (strength > 0.5 ? jitter * 0.6 : jitter * 0.2)) {
          const idx = y * st.cols + x
          st.eraseBuf[idx] = Math.max(st.eraseBuf[idx], duration * strength)
          st.eraseActive = true
        }
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || typeof ResizeObserver === 'undefined') return

    const st = stateRef.current
    st.t0 = performance.now()
    resize()
    spawnStreaks(0)

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const observer = new ResizeObserver(() => {
      resize()
      if (reduceMotion) draw(0)
    })
    if (containerRef.current) observer.observe(containerRef.current)

    if (reduceMotion) {
      // Render a single static frame; no animation loop, no interaction.
      draw(0)
      return () => observer.disconnect()
    }

    rafRef.current = requestAnimationFrame(frame)

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(rafRef.current)
      } else {
        // Keep time continuity so the field doesn't jump on resume.
        st.t0 = performance.now() - st.lastT * 1e3
        st.lastFrame = 0
        rafRef.current = requestAnimationFrame(frame)
      }
    }

    window.addEventListener('mousemove', pointer as EventListener)
    window.addEventListener('touchstart', pointer as EventListener, { passive: true })
    window.addEventListener('touchmove', pointer as EventListener, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      cancelAnimationFrame(rafRef.current)
      observer.disconnect()
      window.removeEventListener('mousemove', pointer as EventListener)
      window.removeEventListener('touchstart', pointer as EventListener)
      window.removeEventListener('touchmove', pointer as EventListener)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [resize, spawnStreaks, frame, draw, pointer])

  return (
    <div ref={containerRef} className="ascii-bg" aria-hidden="true">
      <pre ref={preRef} className="ascii-pre" />
    </div>
  )
}
