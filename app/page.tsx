'use client'

import { useState, useRef, useCallback, useMemo } from 'react'
import GradientSwoop from './components/GradientSwoop'
import type { Direction } from './components/GradientSwoop'

const DIRECTIONS: Direction[] = [
  'bottom-left', 'bottom-right', 'top-left', 'top-right', 'left', 'right', 'left-s', 'right-s',
]

const COLOR_PRESETS = [
  { label: 'Aurora',  colors: ['#22d3ee', '#a78bfa', '#c026d3', '#ec4899', '#22d3ee'] },
  { label: 'Cool',    colors: ['#06b6d4', '#3b82f6', '#8b5cf6'] },
  { label: 'Fire',    colors: ['#f97316', '#ec4899'] },
  { label: 'Earth',   colors: ['#f59e0b', '#b45309', '#78350f'] },
  { label: 'Mono',    colors: ['#f8fafc'] },
]

function ColorSwatches({ colors }: { colors: string[] }) {
  const uniq = [...new Set(colors)]
  return (
    <div className="flex gap-0.5">
      {uniq.map((c, i) => (
        <span key={i} className="w-3 h-3 rounded-full shrink-0" style={{ background: c }} />
      ))}
    </div>
  )
}

function Dropdown<T extends string | number>({ value, options, renderOption, renderSelected, onChange, className }: {
  value: T
  options: T[]
  renderOption: (o: T) => React.ReactNode
  renderSelected?: (o: T) => React.ReactNode
  onChange: (o: T) => void
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const handleBlur = useCallback((e: React.FocusEvent) => {
    if (!ref.current?.contains(e.relatedTarget as Node)) setOpen(false)
  }, [])

  return (
    <div ref={ref} className={`relative ${className ?? ''}`} onBlur={handleBlur}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-white hover:border-zinc-500 transition-colors focus:outline-none"
      >
        <div className="flex-1 flex items-center gap-2 min-w-0">{(renderSelected ?? renderOption)(value)}</div>
        <svg viewBox="0 0 12 12" fill="none" className="w-3 h-3 text-zinc-500 shrink-0">
          <path d="M2 4.5L6 8.5L10 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-zinc-900 border border-zinc-700 rounded-lg overflow-hidden z-50">
          {options.map((o, i) => (
            <button
              key={i}
              onClick={() => { onChange(o); setOpen(false) }}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors hover:bg-zinc-800 ${o === value ? 'text-white' : 'text-zinc-400'}`}
            >
              <div className="flex items-center gap-2">{renderOption(o)}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const DEFAULTS = { direction: 'bottom-right', curve: 0.35, size: 0.12, taper: 0.05, glow: true, blur: 20, animationSpeed: 1, animationIntensity: 1, bottomFade: 1, background: '#03020a' }
const DEFAULT_COLORS = ['#22d3ee', '#a78bfa', '#c026d3', '#ec4899', '#22d3ee']

function CodeSnippet({ direction, colors, background, curve, size, taper, glow, blur, animationSpeed, animationIntensity, bottomFade }: {
  direction: string; colors: string[]; background: string; curve: number; size: number
  taper: number; glow: boolean; blur: number; animationSpeed: number; animationIntensity: number; bottomFade: number
}) {
  const [copied, setCopied] = useState(false)

  const snippet = useMemo(() => {
    const colorsChanged = JSON.stringify(colors) !== JSON.stringify(DEFAULT_COLORS)
    const lines = ['<GradientSwoop']
    if (direction !== DEFAULTS.direction) lines.push(`  direction="${direction}"`)
    if (colorsChanged) lines.push(`  colors={${JSON.stringify(colors)}}`)
    if (background !== DEFAULTS.background) lines.push(`  background="${background}"`)
    if (curve !== DEFAULTS.curve) lines.push(`  curve={${curve}}`)
    if (size !== DEFAULTS.size) lines.push(`  size={${size}}`)
    if (taper !== DEFAULTS.taper) lines.push(`  taper={${taper}}`)
    if (glow !== DEFAULTS.glow) lines.push(`  glow={${glow}}`)
    if (blur !== DEFAULTS.blur) lines.push(`  blur={${blur}}`)
    if (animationSpeed !== DEFAULTS.animationSpeed) lines.push(`  animationSpeed={${animationSpeed}}`)
    if (animationIntensity !== DEFAULTS.animationIntensity) lines.push(`  animationIntensity={${animationIntensity}}`)
    if (bottomFade !== DEFAULTS.bottomFade) lines.push(`  bottomFade={${bottomFade}}`)
    return lines.length === 1 ? '<GradientSwoop />' : lines.join('\n') + '\n/>'
  }, [direction, colors, background, curve, size, taper, glow, blur, animationSpeed, animationIntensity, bottomFade])

  const copy = () => {
    navigator.clipboard.writeText(snippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-1.5 pt-2 border-t border-white/10">
      <div className="flex items-center justify-between">
        <span className="text-zinc-500 text-xs">Snippet</span>
        <button onClick={copy} className="text-zinc-500 text-xs hover:text-white transition-colors">
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre className="text-zinc-400 text-xs leading-relaxed bg-white/5 rounded-lg p-3 overflow-x-auto whitespace-pre">{snippet}</pre>
    </div>
  )
}

function Slider({ label, value, min = 0, max = 1, step = 0.01, onChange }: {
  label: string
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (v: number) => void
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-zinc-400 text-xs capitalize">{label}</span>
        <span
          contentEditable
          suppressContentEditableWarning
          className="text-zinc-500 text-xs tabular-nums outline-none cursor-text hover:text-zinc-300 transition-colors"
          onBlur={e => {
            const v = parseFloat(e.currentTarget.textContent || '')
            if (!isNaN(v)) onChange(Math.min(max, Math.max(min, v)))
            else e.currentTarget.textContent = value.toFixed(2)
          }}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur() } }}
        >
          {value.toFixed(2)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full accent-white cursor-pointer"
      />
    </div>
  )
}

export default function Home() {
  const [direction, setDirection] = useState<Direction>('bottom-right')
  const [curve, setCurve] = useState(0.35)
  const [size, setSize] = useState(0.12)
  const [taper, setTaper] = useState(0.05)
  const [glow, setGlow] = useState(true)
  const [blur, setBlur] = useState(20)
  const [animationSpeed, setAnimationSpeed] = useState(1)
  const [animationIntensity, setAnimationIntensity] = useState(1)
  const [bottomFade, setBottomFade] = useState(1)
  const [preset, setPreset] = useState(0)
  const [presetLabels, setPresetLabels] = useState(COLOR_PRESETS.map(p => p.label))
  const [background, setBackground] = useState('#03020a')
  const [open, setOpen] = useState(true)
  const [panelWidth, setPanelWidth] = useState(260)
  const [resizing, setResizing] = useState(false)

  const onDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setResizing(true)
    const onMove = (e: MouseEvent) => {
      setPanelWidth(w => Math.min(480, Math.max(180, w + e.movementX)))
    }
    const onUp = () => {
      setResizing(false)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [])

  const colors = COLOR_PRESETS[preset].colors

  return (
    <div className="fixed inset-0 flex">

      {/* Side panel */}
      <div
        className={`relative z-50 h-full shrink-0 bg-black/60 backdrop-blur-xl border-r border-white/10 overflow-hidden ${!resizing ? 'transition-[width] duration-200 ease-out' : ''}`}
        style={{ width: open ? panelWidth : 0 }}
      >
        <div className="p-4 space-y-5 h-full overflow-y-auto" style={{ width: panelWidth }}>

        {/* Resize handle */}
        <div
          onMouseDown={onDragStart}
          className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-violet-500/40 transition-colors"
        />

          <div className="pt-1 space-y-1">
            <p className="text-white text-xs font-medium">gradient-swoop</p>
            <a
              href="https://www.npmjs.com/package/gradient-swoop"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 text-xs hover:text-zinc-300 transition-colors"
            >
              Install the npm package →
            </a>
          </div>

          {/* Direction */}
          <div className="space-y-1.5">
            <span className="text-zinc-500 text-xs mb-1 block">Direction</span>
            <Dropdown
              value={direction}
              options={DIRECTIONS}
              renderOption={d => <span>{d}</span>}
              onChange={d => setDirection(d as Direction)}
              className="w-full"
            />
          </div>

          {/* Colors */}
          <div className="space-y-1.5">
            <span className="text-zinc-500 text-xs mb-1 block">Colors</span>
            <div className="flex gap-2">
              <Dropdown
                value={preset}
                options={COLOR_PRESETS.map((_, i) => i)}
                renderOption={i => <>
                  <ColorSwatches colors={COLOR_PRESETS[i].colors} />
                  <span>{presetLabels[i]}</span>
                </>}
                renderSelected={i => <><ColorSwatches colors={COLOR_PRESETS[i].colors} /><span>{presetLabels[i]}</span></>}
                onChange={setPreset}
                className="flex-1"
              />
              <label className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-lg text-xs cursor-pointer text-white hover:border-zinc-500 transition-colors">
                <span className="w-3 h-3 rounded-full shrink-0 ring-1 ring-white/10" style={{ background }} />
                bg
                <input type="color" value={background} onChange={e => setBackground(e.target.value)} className="sr-only" />
              </label>
            </div>
          </div>

          {/* Sliders */}
          <div className="space-y-3">
            <Slider label="curve" value={curve} onChange={setCurve} />
            <Slider label="size" value={size} onChange={setSize} />
            <Slider label="taper" value={taper} onChange={setTaper} />
            <Slider label="blur" value={blur} min={15} max={60} step={1} onChange={setBlur} />
            <Slider label="speed" value={animationSpeed} min={0} max={3} onChange={setAnimationSpeed} />
            <Slider label="intensity" value={animationIntensity} min={0} max={3} onChange={setAnimationIntensity} />
            <Slider label="bottom fade" value={bottomFade} onChange={setBottomFade} />
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-zinc-400 text-xs">Glow</span>
              <button
                onClick={() => setGlow(g => !g)}
                className={`w-3.5 h-3.5 rounded-sm border transition-colors flex items-center justify-center ${glow ? 'bg-white border-white' : 'bg-transparent border-white/60'}`}
              >
                {glow && (
                  <svg viewBox="0 0 10 10" fill="none" className="w-2.5 h-2.5">
                    <path d="M2 5l2.5 2.5L8 3" stroke="#09090b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </label>
          </div>

          {/* Code snippet */}
          <CodeSnippet
            direction={direction}
            colors={colors}
            background={background}
            curve={curve}
            size={size}
            taper={taper}
            glow={glow}
            blur={blur}
            animationSpeed={animationSpeed}
            animationIntensity={animationIntensity}
            bottomFade={bottomFade}
          />

        </div>
      </div>

      {/* Toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed top-4 left-4 z-50 w-7 h-7 flex items-center justify-center rounded-lg bg-black/60 backdrop-blur-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
        style={{ left: open ? panelWidth + 8 : 16 }}
      >
        <svg viewBox="0 0 12 12" fill="none" className={`w-3 h-3 transition-transform duration-200 ${open ? '' : 'rotate-180'}`}>
          <path d="M7.5 2L3.5 6L7.5 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Canvas */}
      <div className="flex-1 relative">
        <GradientSwoop
          className="w-full h-full"
          direction={direction}
          curve={curve}
          size={size}
          taper={taper}
          glow={glow}
          blur={blur}
          animationSpeed={animationSpeed}
          animationIntensity={animationIntensity}
          bottomFade={bottomFade}
          colors={colors}
          background={background}
        />
      </div>

    </div>
  )
}
