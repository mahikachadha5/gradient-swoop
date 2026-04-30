'use client'

import { useState } from 'react'
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
        <span className="text-zinc-400 text-xs">{label}</span>
        <span className="text-zinc-500 text-xs tabular-nums">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full accent-violet-500 cursor-pointer"
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
  const [background, setBackground] = useState('#03020a')

  const colors = COLOR_PRESETS[preset].colors

  return (
    <div className="fixed inset-0">
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

      {/* Controls panel */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 z-50">
        <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 space-y-5">

          {/* Direction */}
          <div className="space-y-2">
            <span className="text-zinc-400 text-xs">direction</span>
            <div className="flex flex-wrap gap-1.5">
              {DIRECTIONS.map(d => (
                <button
                  key={d}
                  onClick={() => setDirection(d)}
                  className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                    direction === d
                      ? 'bg-violet-600 text-white'
                      : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div className="space-y-2">
            <span className="text-zinc-400 text-xs">colors</span>
            <div className="flex gap-1.5">
              {COLOR_PRESETS.map((p, i) => (
                <button
                  key={p.label}
                  onClick={() => setPreset(i)}
                  className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                    preset === i
                      ? 'bg-violet-600 text-white'
                      : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                  }`}
                >
                  {p.label}
                </button>
              ))}
              <label className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs cursor-pointer transition-colors bg-white/5 text-zinc-400 hover:bg-white/10`}>
                bg
                <input type="color" value={background} onChange={e => setBackground(e.target.value)} className="w-4 h-4 rounded cursor-pointer bg-transparent border-0" />
              </label>
            </div>
          </div>

          {/* Sliders */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <Slider label="curve" value={curve} onChange={setCurve} />
            <Slider label="size" value={size} onChange={setSize} />
            <Slider label="taper" value={taper} onChange={setTaper} />
            <Slider label="blur" value={blur} min={15} max={60} step={1} onChange={setBlur} />
            <Slider label="speed" value={animationSpeed} min={0} max={3} onChange={setAnimationSpeed} />
            <Slider label="intensity" value={animationIntensity} min={0} max={3} onChange={setAnimationIntensity} />
            <Slider label="bottom fade" value={bottomFade} onChange={setBottomFade} />
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-xs">glow</span>
              <button
                onClick={() => setGlow(g => !g)}
                className={`w-9 h-5 rounded-full transition-colors relative ${glow ? 'bg-violet-600' : 'bg-white/10'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${glow ? 'left-4' : 'left-0.5'}`} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
