# gradient-swoop

Animated bezier gradient ribbon for React. Drop it in as a wrapper, children render above it.

## Install

```bash
npm install gradient-swoop
```

## Usage

```tsx
import GradientSwoop from 'gradient-swoop'

// Zero config — defaults give you the aurora S-curve look
<GradientSwoop className="w-full rounded-2xl" style={{ height: 360 }} />

// With content
<GradientSwoop className="w-full rounded-2xl" style={{ height: 360 }}>
  <div className="flex items-center justify-center h-full">
    <h1 className="text-white text-4xl font-bold">Hello</h1>
  </div>
</GradientSwoop>

// Custom shape and colors
<GradientSwoop
  direction="top-right"
  colors={['#06b6d4', '#8b5cf6', '#ec4899']}
  curve={0.7}
  size={0.3}
  taper={0.4}
  bottomFade={0.5}
/>
```

## Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `direction` | `Direction` | `'bottom-right'` | Which corner/edge the swoop originates from |
| `colors` | `string[]` | aurora palette | 2–5 colors mapped along the ribbon |
| `background` | `string` | `'#03020a'` | Base background color |
| `curve` | `number` | `0.35` | How much the path bends. `0` = straight, `1` = dramatic arc |
| `size` | `number` | `0.12` | Overall band thickness relative to container |
| `taper` | `number` | `0.05` | How much the band narrows end-to-end. `0` = uniform, `1` = max taper |
| `glow` | `boolean` | `true` | Multi-pass bloom rendering for a luminous tube-of-light effect |
| `blur` | `number` | `20` | CSS blur on the canvas layer (px). Higher = dreamier |
| `animationSpeed` | `number` | `1` | Animation speed multiplier |
| `animationIntensity` | `number` | `1` | How much the handles drift over time |
| `grainOpacity` | `number` | `0.06` | Film grain strength. `0` = off |
| `bottomFade` | `number` | `1` | Fades the bottom into the background. `1` = no fade, `0` = full fade |
| `className` | `string` | — | Classes on the outer container |
| `style` | `CSSProperties` | — | Inline styles — use for fixed height |
| `children` | `ReactNode` | — | Content rendered above the gradient via `z-10` |

## Direction values

```
'bottom-left' | 'bottom-right' | 'top-left' | 'top-right'
'left' | 'right' | 'left-s' | 'right-s'
```

## Examples

### Hero banner

```tsx
<GradientSwoop className="w-full rounded-2xl" style={{ height: 400 }}>
  <div className="p-12 flex flex-col justify-end h-full">
    <h1 className="text-white text-5xl font-bold">Your headline</h1>
  </div>
</GradientSwoop>
```

### Two-color with dramatic arc

```tsx
<GradientSwoop
  colors={['#f97316', '#7c3aed']}
  curve={0.8}
  size={0.2}
  taper={0.6}
/>
```

### Light mode

```tsx
<GradientSwoop
  colors={['#f8fafc']}
  background="#f8f6f0"
  grainOpacity={0.04}
  bottomFade={0.5}
/>
```

### Fullscreen background

```tsx
<div className="fixed inset-0">
  <GradientSwoop className="w-full h-full" direction="top-right" curve={0.5} />
</div>
```
