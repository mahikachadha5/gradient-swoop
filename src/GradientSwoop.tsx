'use client'

import { useEffect, useId, useRef } from 'react'
import type { ReactNode } from 'react'

// ============================================================
// TYPES
// ============================================================

type Point = { x: number; y: number }

export type Direction =
  | 'bottom-left'   // fat end bottom-left, tapers to top-right (default)
  | 'bottom-right'  // fat end bottom-right, tapers to top-left
  | 'top-left'      // fat end top-left, tapers to bottom-right
  | 'top-right'     // fat end top-right, tapers to bottom-left
  | 'left'          // fat end left-center, tapers to right-center
  | 'right'         // fat end right-center, tapers to left-center
  | 'left-s'
  | 'right-s'

export type PathPreset =
  | 's-turn'
  | 'reverse-s-turn'
  | 'slash'
  | 'reverse-slash'
  | 'arch'
  | 'u-turn'

export type GradientSwoopProps = {

  // ── COLOR ────────────────────────────────────────────────
  // Colors mapped evenly along the swoop, start to end.
  // 2 colors = minimal. 4-5 = aurora effect.
  colors?: string[]

  // Base background color — visible where swoop doesn't reach.
  background?: string

  // ── PATH (HIGH-LEVEL) ────────────────────────────────────
  // Path preset — higher-level than direction. If provided,
  // it selects a bundled set of bezier control points.
  // `direction` remains as a lower-level fallback.
  path?: PathPreset

  // ── DIRECTION ────────────────────────────────────────────
  // Which corner/edge the swoop originates from.
  // The swoop always travels to the opposite corner.
  direction?: Direction

  // ── CURVE ────────────────────────────────────────────────
  // How much the swoop bends.
  // 0 = straight diagonal line. 1 = dramatic arc. Default: 0.7
  curve?: number

  // ── SIZE ─────────────────────────────────────────────────
  // Overall thickness of the swoop band.
  // 0 = invisible. 1 = fills most of the container. Default: 0.5
  size?: number

  // ── TAPER ────────────────────────────────────────────────
  // How much the swoop narrows from start to end.
  // 0 = uniform thickness throughout.
  // 1 = tapers to a very thin point at the end. Default: 0.7
  taper?: number

  // ── ANIMATION ────────────────────────────────────────────
  // How much the swoop breathes and shifts over time.
  // 0 = completely static. 1 = full movement. Default: 1
  animationIntensity?: number

  // Oscillation speed multiplier. Default: 1
  animationSpeed?: number

  // ── FINISH ───────────────────────────────────────────────
  // CSS blur on the canvas layer. Higher = dreamier. Default: 10
  blur?: number

  // Film grain opacity. Range 0-1. Default: 0.06
  grainOpacity?: number

  // Fades bottom of component into background color.
  // 0 = full fade. 1 = no fade. Default: 0.34
  bottomFade?: number

  // Enables multi-pass bloom rendering — draws the ribbon 3 times
  // at increasing widths with decreasing opacity, creating a
  // luminous tube-of-light effect. Works best with left-s / right-s
  // directions and a dark background. Default: false
  glow?: boolean

  // ── STYLE PASSTHROUGH ────────────────────────────────────
  className?: string
  style?: React.CSSProperties

  // ── CHILDREN ─────────────────────────────────────────────
  // Optional content rendered above the swoop.
  children?: ReactNode
}

// ============================================================
// DEFAULTS
// ============================================================

const DEFAULTS = {
  colors: ['#22d3ee', '#a78bfa', '#c026d3', '#ec4899', '#22d3ee'],
  background: '#03020a',
  direction: 'bottom-right' as Direction,
  curve: 0.35,
  size: 0.12,
  taper: 0.05,
  animationIntensity: 1,
  animationSpeed: 1,
  blur: 20,
  grainOpacity: 0.06,
  bottomFade: 1,
  glow: true,
}

// ============================================================
// DIRECTION → BEZIER CONTROL POINTS
//
// Each direction has:
//   - p0: start point (where the fat end is)
//   - p3: end point (where the thin end tapers to)
//   - straightP1/P2: handles for curve=0 (straight diagonal)
//   - swoopP1/P2: handles for curve=1 (maximum arc)
//
// The actual p1/p2 used is lerped between straight and swoop
// based on the curve prop.
// ============================================================

type DirectionDef = {
  p0: Point
  p3: Point
  straightP1: Point
  straightP2: Point
  swoopP1: Point
  swoopP2: Point
}

const DIRECTIONS: Record<Direction, DirectionDef> = {
  'bottom-left': {
    p0: { x: 0.0, y: 0.97 },
    p3: { x: 0.92, y: 0.0 },
    straightP1: { x: 0.31, y: 0.65 },
    straightP2: { x: 0.62, y: 0.32 },
    swoopP1:    { x: 0.18, y: 0.02 },
    swoopP2:    { x: 0.94, y: 1.08 },
  },
  'bottom-right': {
    p0: { x: 1.0,  y: 0.97 },
    p3: { x: 0.08, y: 0.0 },
    straightP1: { x: 0.69, y: 0.65 },
    straightP2: { x: 0.38, y: 0.32 },
    swoopP1:    { x: 0.82, y: 0.02 },
    swoopP2:    { x: 0.06, y: 1.08 },
  },
  'top-left': {
    p0: { x: 0.0,  y: 0.03 },
    p3: { x: 0.92, y: 1.0 },
    straightP1: { x: 0.31, y: 0.35 },
    straightP2: { x: 0.62, y: 0.68 },
    swoopP1:    { x: 0.18, y: 0.98 },
    swoopP2:    { x: 0.94, y: -0.08 },
  },
  'top-right': {
    p0: { x: 1.0,  y: 0.03 },
    p3: { x: 0.08, y: 1.0 },
    straightP1: { x: 0.69, y: 0.35 },
    straightP2: { x: 0.38, y: 0.68 },
    swoopP1:    { x: 0.82, y: 0.98 },
    swoopP2:    { x: 0.06, y: -0.08 },
  },
  'left': {
    p0: { x: 0.0, y: 0.5 },
    p3: { x: 1.0, y: 0.5 },
    straightP1: { x: 0.33, y: 0.5 },
    straightP2: { x: 0.67, y: 0.5 },
    swoopP1:    { x: 0.18, y: -0.10 },
    swoopP2:    { x: 0.82, y: 1.10 },
  },
  'right': {
    p0: { x: 1.0, y: 0.5 },
    p3: { x: 0.0, y: 0.5 },
    straightP1: { x: 0.67, y: 0.5 },
    straightP2: { x: 0.33, y: 0.5 },
    swoopP1:    { x: 0.82, y: 1.10 },
    swoopP2:    { x: 0.18, y: -0.10 },
  },
  'left-s': {
    p0: { x: 0.0, y: 0.5 },
    p3: { x: 1.0, y: 0.5 },
    straightP1: { x: 0.33, y: 0.5 },
    straightP2: { x: 0.67, y: 0.5 },
    swoopP1: { x: 0.15, y: 0.02 },
    swoopP2: { x: 0.85, y: 0.98 },
  },
  'right-s': {
    p0: { x: 0.95, y: 0.15 },
    p3: { x: 0.05, y: 0.90 },
    straightP1: { x: 0.67, y: 0.5 },
    straightP2: { x: 0.33, y: 0.5 },
    swoopP1: { x: 0.90, y: 1.10 },
    swoopP2: { x: 0.10, y: -0.10 },
  },
}

// ============================================================
// PATH PRESETS (HIGH-LEVEL)
// ============================================================

const PATHS: Record<PathPreset, DirectionDef> = {
  // Uses the same control-point structure as `DIRECTIONS`,
  // but with names that describe the composition.
  's-turn': DIRECTIONS['left-s'],
  'reverse-s-turn': DIRECTIONS['right-s'],
  'slash': DIRECTIONS['bottom-left'],
  'reverse-slash': DIRECTIONS['bottom-right'],
  // A gentle top arc that “falls” into the bottom-right.
  'arch': {
    p0: { x: 0.12, y: 0.08 },
    p3: { x: 0.94, y: 0.92 },
    straightP1: { x: 0.34, y: 0.26 },
    straightP2: { x: 0.62, y: 0.74 },
    swoopP1: { x: 0.15, y: 1.05 },
    swoopP2: { x: 0.95, y: -0.10 },
  },
  // Enters from upper-left and exits back toward lower-left.
  'u-turn': {
    p0: { x: 0.08, y: 0.18 },
    p3: { x: 0.12, y: 0.92 },
    straightP1: { x: 0.08, y: 0.42 },
    straightP2: { x: 0.12, y: 0.68 },
    swoopP1: { x: 1.10, y: 0.05 },
    swoopP2: { x: 0.95, y: 1.10 },
  },
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function lerpPoint(a: Point, b: Point, t: number): Point {
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) }
}

// ============================================================
// BEZIER MATH
// ============================================================

function cubicBezier(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
  const u = 1 - t, uu = u * u, tt = t * t
  return {
    x: uu * u * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + tt * t * p3.x,
    y: uu * u * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + tt * t * p3.y,
  }
}

function cubicTangent(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
  const u = 1 - t, uu = u * u, tt = t * t
  return {
    x: 3 * uu * (p1.x - p0.x) + 6 * u * t * (p2.x - p1.x) + 3 * tt * (p3.x - p2.x),
    y: 3 * uu * (p1.y - p0.y) + 6 * u * t * (p2.y - p1.y) + 3 * tt * (p3.y - p2.y),
  }
}

function normalize(v: Point): Point {
  const L = Math.hypot(v.x, v.y)
  return L < 1e-9 ? { x: 0, y: 1 } : { x: v.x / L, y: v.y / L }
}

// ============================================================
// COMPONENT
// ============================================================

const STEPS = 135

export default function GradientSwoop(props: GradientSwoopProps) {
  const {
    colors = DEFAULTS.colors,
    background = DEFAULTS.background,
    path,
    direction = DEFAULTS.direction,
    curve = DEFAULTS.curve,
    size = DEFAULTS.size,
    taper = DEFAULTS.taper,
    animationIntensity = DEFAULTS.animationIntensity,
    animationSpeed = DEFAULTS.animationSpeed,
    blur = DEFAULTS.blur,
    grainOpacity = DEFAULTS.grainOpacity,
    bottomFade = DEFAULTS.bottomFade,
    glow = DEFAULTS.glow,
    className = '',
    style,
  } = props

  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rawId = useId()
  const noiseId = `grain-${rawId.replace(/:/g, '')}`

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const draw = (elapsed: number) => {
      const w = container.clientWidth
      const h = container.clientHeight
      if (w < 1 || h < 1) return

      const dpr = Math.min(window.devicePixelRatio ?? 1, 2)
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`

      const ctx = canvas.getContext('2d', { alpha: true })
      if (!ctx) return
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
      ctx.clearRect(0, 0, w, h)

      // ── RESOLVE CONTROL POINTS FROM DIRECTION + CURVE ───
      const def = path ? PATHS[path] : DIRECTIONS[direction]
      const p1base = lerpPoint(def.straightP1, def.swoopP1, curve)
      const p2base = lerpPoint(def.straightP2, def.swoopP2, curve)

      // ── ANIMATION — gently shift the bezier handles ─────
      // Circular animation — angle advances steadily over time
      const angle = elapsed * 0.0005 * animationSpeed * animationIntensity
      const s1 = Math.sin(angle)
      const s2 = Math.cos(angle)

      const cp0 = { x: def.p0.x * w, y: def.p0.y * h }
      const cp1 = { x: (p1base.x + s1 * 0.08 * curve) * w, y: (p1base.y + s2 * 0.06 * curve) * h }
      const cp2 = { x: (p2base.x - s2 * 0.06 * curve) * w, y: (p2base.y - s1 * 0.08 * curve) * h }
      const cp3 = { x: def.p3.x * w, y: def.p3.y * h }

      // ── THICKNESS FROM size + taper ──────────────────────
      // size scales the overall band thickness
      // taper controls how much it narrows end-to-end
      const m = Math.min(w, h)
      const maxThick = m * size * 0.55                // size=1 fills ~55% of container
      const minThick = maxThick * (1 - taper * 0.85)  // taper=1 → end is 15% of start
      const halfAt = (t: number) =>
        Math.max(3, maxThick * (1 - t) + minThick * t)

      // ── COLOR STOPS ─────────────────────────────────────
      const buildStops = (arr: string[]) => {
        const stops: Array<[number, string]> = []
        stops.push([0, 'rgba(0,0,0,0)'])
        stops.push([0.04, arr[0]])
        arr.forEach((c, i) => {
          if (i === 0) return
          stops.push([0.04 + (0.92 * i) / (arr.length - 1), c])
        })
        stops.push([0.96, arr[arr.length - 1]])
        stops.push([1, 'rgba(0,0,0,0)'])
        return stops
      }
      const colorStops = buildStops(colors)

      // ── RENDER STRIPS ───────────────────────────────────
      const passes = glow
        ? [
            { widthMult: 8.0, alpha: 0.03 },
            { widthMult: 4.0, alpha: 0.08 },
            { widthMult: 2.0, alpha: 0.20 },
            { widthMult: 1.0, alpha: 0.90 },
            { widthMult: 0.4, alpha: 0.60 },
          ]
        : [{ widthMult: 1.0, alpha: 1.0 }]

      for (const pass of passes) {
        ctx.globalAlpha = pass.alpha
        for (let i = 0; i < STEPS; i++) {
          const t0 = i / STEPS
          const t1 = (i + 1) / STEPS
          const w0 = halfAt(t0) * pass.widthMult
          const w1 = halfAt(t1) * pass.widthMult
          const wMid = (w0 + w1) / 2

          const pa = cubicBezier(cp0, cp1, cp2, cp3, t0)
          const pb = cubicBezier(cp0, cp1, cp2, cp3, t1)
          const na = normalize({ x: -(cubicTangent(cp0, cp1, cp2, cp3, t0).y), y: cubicTangent(cp0, cp1, cp2, cp3, t0).x })
          const nb = normalize({ x: -(cubicTangent(cp0, cp1, cp2, cp3, t1).y), y: cubicTangent(cp0, cp1, cp2, cp3, t1).x })

          const mid = { x: (pa.x + pb.x) / 2, y: (pa.y + pb.y) / 2 }
          const navg = normalize({ x: na.x + nb.x, y: na.y + nb.y })

          const g = ctx.createLinearGradient(
            mid.x - wMid * navg.x, mid.y - wMid * navg.y,
            mid.x + wMid * navg.x, mid.y + wMid * navg.y
          )
          colorStops.forEach(([pos, color]) => g.addColorStop(pos, color))

          ctx.beginPath()
          ctx.moveTo(pa.x - w0 * na.x, pa.y - w0 * na.y)
          ctx.lineTo(pa.x + w0 * na.x, pa.y + w0 * na.y)
          ctx.lineTo(pb.x + w1 * nb.x, pb.y + w1 * nb.y)
          ctx.lineTo(pb.x - w1 * nb.x, pb.y - w1 * nb.y)
          ctx.closePath()
          ctx.fillStyle = g
          ctx.fill()
        }
      }
      ctx.globalAlpha = 1
    }

    let rafId: number
    const start = performance.now()
    const loop = () => { rafId = requestAnimationFrame(loop); draw(performance.now() - start) }
    rafId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafId)
  }, [colors, path, direction, curve, size, taper, animationIntensity, animationSpeed, glow])

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`} style={style}>
      {/* Base */}
      <div className="absolute inset-0" style={{ background }} />

      {/* Canvas — scaled up to hide blur edges */}
      <div className="absolute inset-0" style={{ transform: 'scale(1.2)', transformOrigin: 'center' }}>
        <canvas
          ref={canvasRef}
          style={{ display: 'block', width: '100%', height: '100%', filter: blur > 0 ? `blur(${blur}px)` : undefined }}
        />
      </div>

      {/* Grain */}
      {grainOpacity > 0 && (
        <svg aria-hidden className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: grainOpacity }}>
          <defs>
            <filter colorInterpolationFilters="sRGB" id={noiseId}>
              <feTurbulence baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" type="fractalNoise" />
            </filter>
          </defs>
          <rect filter={`url(#${noiseId})`} height="100%" width="100%" />
        </svg>
      )}

      {/* Bottom fade */}
      {bottomFade < 1 && (
        <div className="absolute inset-0 pointer-events-none" style={{
          background: `linear-gradient(to bottom, transparent 0%, transparent ${bottomFade * 100}%, ${background} 100%)`,
        }} />
      )}

      {/* Children */}
      <div className="relative z-10 w-full h-full">
        {props.children as ReactNode}
      </div>
    </div>
  )
}

