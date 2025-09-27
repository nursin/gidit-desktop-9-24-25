import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

const KEYS = [
  ['7','8','9','/'],
  ['4','5','6','*'],
  ['1','2','3','-'],
  ['0','.','=','+'],
]

const SCI_KEYS = [
  ['sin','cos','tan','^'],
  ['ln','log','x²','√'],
  ['π','e','1/x','2nd'],
]

function toRadians(x: number, deg: boolean): number {
  return deg ? (x * Math.PI) / 180 : x
}

function factorial(n: number): number { return n <= 1 ? 1 : n * factorial(n - 1) }
function nPr(n: number, r: number): number { if (r>n) return NaN; return factorial(n)/factorial(n-r) }
function nCr(n: number, r: number): number { if (r>n) return NaN; return factorial(n)/(factorial(r)*factorial(n-r)) }

function safeEval(expr: string, mode: { deg: boolean }, ans: number, xVal?: number): number | string {
  try {
    // Allow only whitelisted tokens
    const cleaned = expr
      .replace(/Ans/g, String(ans))
      .replace(/π/g, String(Math.PI))
      .replace(/\be\b/g, String(Math.E))
      .replace(/\bx\b/g, xVal !== undefined ? String(xVal) : 'x')
    if (!/^[-+*/().,\d\s%^eAnsπlngocstax→]+$/i.test(expr)) return 'ERR'
    // Token transforms for functions and exponent
    const jsExpr = cleaned
      .replace(/\^/g, '**')
      .replace(/\bln\s*\(/g, 'Math.log(')
      .replace(/\blog\s*\(/g, 'Math.log10(')
      .replace(/\bsin\s*\(/g, '__SIN__(')
      .replace(/\bcos\s*\(/g, '__COS__(')
      .replace(/\btan\s*\(/g, '__TAN__(')
      .replace(/\bsin-1\s*\(/g, '__ASIN__(')
      .replace(/\bcos-1\s*\(/g, '__ACOS__(')
      .replace(/\btan-1\s*\(/g, '__ATAN__(')
      .replace(/\b10\^\s*\(/g, 'Math.pow(10,')
      .replace(/\be\^\s*\(/g, 'Math.exp(')
      .replace(/\bx²/g, '(x**2)')
      .replace(/√\s*\(/g, 'Math.sqrt(')
      .replace(/\b1\/x\b/g, '(1/x)')
      .replace(/nPr\s*\(/g, '__NPR__(')
      .replace(/nCr\s*\(/g, '__NCR__(')
    // eslint-disable-next-line no-new-func
    const result = Function(
      'Math','__SIN__','__COS__','__TAN__','__ASIN__','__ACOS__','__ATAN__','__NPR__','__NCR__',
      `"use strict"; return (${jsExpr})`
    )(
      Math,
      (x: number) => Math.sin(toRadians(x, mode.deg)),
      (x: number) => Math.cos(toRadians(x, mode.deg)),
      (x: number) => Math.tan(toRadians(x, mode.deg)),
      (x: number) => (mode.deg ? (Math.asin(x) * 180) / Math.PI : Math.asin(x)),
      (x: number) => (mode.deg ? (Math.acos(x) * 180) / Math.PI : Math.acos(x)),
      (x: number) => (mode.deg ? (Math.atan(x) * 180) / Math.PI : Math.atan(x)),
      nPr,
      nCr,
    )
    if (typeof result === 'number' && Number.isFinite(result)) return result
    return 'ERR'
  } catch {
    return 'ERR'
  }
}

export default function Calculator() {
  const [display, setDisplay] = useState('0')
  const [memory, setMemory] = useState(0)
  const [ans, setAns] = useState(0)
  const [degMode, setDegMode] = useState(true)
  const [history, setHistory] = useState<{ expr: string; result: string }[]>([])
  const [mode, setMode] = useState<'calc' | 'graph'>('calc')
  const viewRef = useRef<HTMLDivElement | null>(null)
  const [second, setSecond] = useState(false)
  const [clearCount, setClearCount] = useState(0)
  const [freshEntry, setFreshEntry] = useState(false)

  // Graph state
  const [f1, setF1] = useState('sin(x)')
  const [f2, setF2] = useState('')
  const [f3, setF3] = useState('')
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [view, setView] = useState({ xMin: -10, xMax: 10, yMin: -6, yMax: 6 })
  const [grid, setGrid] = useState(true);
  const [axes, setAxes] = useState(true);

  const input = (val: string) => {
    setDisplay((d) => {
      if (freshEntry && /[0-9.]/.test(val)) {
        setFreshEntry(false)
        return val
      }
      setFreshEntry(false)
      return d === '0' && /[0-9.]/.test(val) ? val : d + val
    })
  }

  const clearAll = () => {
    setDisplay('0')
    setClearCount((c) => {
      const next = c + 1
      if (next >= 2) {
        setHistory([])
        setAns(0)
        setMemory(0)
        return 0
      }
      setTimeout(() => setClearCount(0), 1200)
      return next
    })
  }
  const backspace = () => setDisplay((d) => (d.length > 1 ? d.slice(0, -1) : '0'))
  const evaluate = () => setDisplay((d) => {
    const res = safeEval(d, { deg: degMode }, ans)
    const out = String(res)
    if (typeof res === 'number') setAns(res)

    setHistory((h) => {
      // Don’t push duplicates (same expr/result as last entry)
      if (h.length && h[h.length - 1].expr === d && h[h.length - 1].result === out) {
        return h
      }
      return [...h, { expr: d, result: out }]
    })

    queueMicrotask(() => viewRef.current?.scrollTo({ top: viewRef.current.scrollHeight }))
    setFreshEntry(true)
    return out
  })


  const memAdd = () => setMemory((m) => {
    const val = safeEval(display, { deg: degMode }, ans)
    return m + (typeof val === 'number' ? val : 0)
  })
  const memClear = () => setMemory(0)
  const memRecall = () => setDisplay(String(memory))

  const sciHandler = (k: string) => {
    if (k === '2nd') return setSecond((s) => !s)
    if (k === 'x²') return setDisplay((d) => (d === '0' ? '(x^2)' : d + 'x^2'))
    if (k === '√') return setDisplay((d) => (d === '0' ? '√(' : d + '√('))
    if (k === '1/x') return setDisplay((d) => (d === '0' ? '(1/x)' : d + '1/x'))
    if (k === 'Ans') return setDisplay((d) => (d === '0' ? 'Ans' : d + 'Ans'))
    if (k === 'STO→') return setMemory((m) => {
      const val = safeEval(display, { deg: degMode }, ans)
      const num = typeof val === 'number' ? val : 0
      setDisplay('0')
      return num
    })
    if (k === 'π' || k === 'e') return setDisplay((d) => (d === '0' ? k : d + k))
    // functions insert with opening parenthesis; handle 2nd layer
    const map = second
      ? { sin: 'sin-1', cos: 'cos-1', tan: 'tan-1', ln: 'e^(', log: '10^(' }
      : { sin: 'sin(', cos: 'cos(', tan: 'tan(', ln: 'ln(', log: 'log(' }
    if (k in map) return setDisplay((d) => (d === '0' ? (map as any)[k] : d + (map as any)[k]))
    if (k === '^') return input('^')
    if (k === '(' || k === ')') return input(k)
  }

  // Graph rendering
  useEffect(() => {
    if (mode !== 'graph') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio || 1
    const width = canvas.clientWidth * dpr
    const height = canvas.clientHeight * dpr
    canvas.width = width
    canvas.height = height
    ctx.scale(dpr, dpr)

    const { xMin, xMax, yMin, yMax } = view
    const xToPx = (x: number) => ((x - xMin) / (xMax - xMin)) * canvas.clientWidth
    const yToPx = (y: number) => (1 - (y - yMin) / (yMax - yMin)) * canvas.clientHeight

    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight)
    
    // Draw grid
    if (grid) {
      ctx.strokeStyle = 'rgba(200, 200, 200, 0.2)';
      ctx.lineWidth = 1;
      
      // Vertical grid lines
      const xStep = (xMax - xMin) / 20;
      for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax; x += xStep) {
        const px = xToPx(x);
        ctx.beginPath();
        ctx.moveTo(px, 0);
        ctx.lineTo(px, canvas.clientHeight);
        ctx.stroke();
      }
      
      // Horizontal grid lines
      const yStep = (yMax - yMin) / 12;
      for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax; y += yStep) {
        const py = yToPx(y);
        ctx.beginPath();
        ctx.moveTo(0, py);
        ctx.lineTo(canvas.clientWidth, py);
        ctx.stroke();
      }
    }
    
    // Draw axes
    if (axes) {
      ctx.strokeStyle = 'rgba(100,100,120,0.6)';
      ctx.lineWidth = 1;
      // y-axis
      const yAxisX = xToPx(0);
      if (yAxisX >= 0 && yAxisX <= canvas.clientWidth) {
        ctx.beginPath();
        ctx.moveTo(yAxisX, 0);
        ctx.lineTo(yAxisX, canvas.clientHeight);
        ctx.stroke();
      }
      // x-axis
      const xAxisY = yToPx(0);
      if (xAxisY >= 0 && xAxisY <= canvas.clientHeight) {
        ctx.beginPath();
        ctx.moveTo(0, xAxisY);
        ctx.lineTo(canvas.clientWidth, xAxisY);
        ctx.stroke();
      }
      
      // Draw axis labels
      ctx.fillStyle = 'rgba(100,100,120,0.8)';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      
      // X-axis labels
      for (let x = Math.ceil(xMin); x <= xMax; x++) {
        if (x === 0) continue; // Skip origin
        const px = xToPx(x);
        if (px >= 10 && px <= canvas.clientWidth - 10) {
          ctx.fillText(x.toString(), px, yToPx(0) + 15);
        }
      }
      
      // Y-axis labels
      for (let y = Math.ceil(yMin); y <= yMax; y++) {
        if (y === 0) continue; // Skip origin
        const py = yToPx(y);
        if (py >= 15 && py <= canvas.clientHeight - 10) {
          ctx.textAlign = 'right';
          ctx.fillText(y.toString(), xToPx(0) - 5, py + 4);
        }
      }
    }

    const plot = (expr: string, color: string) => {
      if (!expr.trim()) return
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.beginPath()
      const steps = canvas.clientWidth
      let firstPoint = true;
      for (let i = 0; i <= steps; i++) {
        const x = xMin + (i / steps) * (xMax - xMin)
        const yVal = safeEval(expr, { deg: degMode }, ans, x)
        const y = typeof yVal === 'number' ? yVal : NaN
        const px = i
        const py = yToPx(y)
        if (Number.isFinite(py) && py >= 0 && py <= canvas.clientHeight) {
          if (firstPoint) {
            ctx.moveTo(px, py)
            firstPoint = false;
          } else {
            ctx.lineTo(px, py)
          }
        } else {
          firstPoint = true;
        }
      }
      ctx.stroke()
    }
    plot(f1, '#3391F3')
    plot(f2, '#33F3CD')
    plot(f3, '#F333CD')
  }, [mode, view, f1, f2, f3, degMode, ans, grid, axes])

  return (
    <div className="w-full h-full p-3">
      <div className="rounded-xl border bg-background p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="text-xs text-muted-foreground">TI‑83 {degMode ? 'DEG' : 'RAD'}</div>
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" className="h-7 px-2" onClick={memClear}>MC</Button>
            <Button size="sm" variant="ghost" className="h-7 px-2" onClick={memRecall}>MR</Button>
            <Button size="sm" variant="ghost" className="h-7 px-2" onClick={memAdd}>M+</Button>
            <Button size="sm" variant={mode === 'calc' ? 'default' : 'ghost'} className="h-7 px-2" onClick={() => setMode('calc')}>CALC</Button>
            <Button size="sm" variant={mode === 'graph' ? 'default' : 'ghost'} className="h-7 px-2" onClick={() => setMode('graph')}>GRAPH</Button>
          </div>
        </div>
        {/* Enlarged view window with history (CALC) and canvas (GRAPH) */}
        <div className="mb-3 h-56 rounded-lg border bg-muted p-2">
          {mode === 'calc' ? (
            <div ref={viewRef} className="h-full w-full overflow-y-auto">
              <div className="space-y-1 font-mono text-sm">
                {history.map((line, idx) => (
                  <div key={idx} className="flex flex-col">
                    <div className="text-muted-foreground">{line.expr}</div>
                    <div className="text-right text-xl">{line.result}</div>
                  </div>
                ))}

                {/* Show live display only if it's not just a repeat of the last history result */}
                {(!history.length || display !== history[history.length - 1].result) && (
                  <div className="text-right text-xl">{display}</div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-full w-full flex-col gap-2">
              <div className="flex items-center gap-2">
                <input value={f1} onChange={(e) => setF1(e.target.value)} placeholder="f1(x) =" className="h-8 flex-1 rounded-md border bg-background px-2 text-sm" />
                <input value={f2} onChange={(e) => setF2(e.target.value)} placeholder="f2(x) =" className="h-8 flex-1 rounded-md border bg-background px-2 text-sm" />
                <input value={f3} onChange={(e) => setF3(e.target.value)} placeholder="f3(x) =" className="h-8 flex-1 rounded-md border bg-background px-2 text-sm" />
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="secondary" onClick={() => setView((v) => ({...v, xMin: v.xMin/1.2, xMax: v.xMax/1.2, yMin: v.yMin/1.2, yMax: v.yMax/1.2}))}>Zoom In</Button>
                  <Button size="sm" variant="secondary" onClick={() => setView((v) => ({...v, xMin: v.xMin*1.2, xMax: v.xMax*1.2, yMin: v.yMin*1.2, yMax: v.yMax*1.2}))}>Zoom Out</Button>
                  <Button size="sm" variant={grid ? 'default' : 'outline'} onClick={() => setGrid(!grid)}>Grid</Button>
                  <Button size="sm" variant={axes ? 'default' : 'outline'} onClick={() => setAxes(!axes)}>Axes</Button>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" onClick={() => setView((v)=>({...v, xMin: v.xMin-1, xMax: v.xMax-1}))}>←</Button>
                  <Button size="sm" variant="ghost" onClick={() => setView((v)=>({...v, xMin: v.xMin+1, xMax: v.xMax+1}))}>→</Button>
                  <Button size="sm" variant="ghost" onClick={() => setView((v)=>({...v, yMin: v.yMin-1, yMax: v.yMax-1}))}>↑</Button>
                  <Button size="sm" variant="ghost" onClick={() => setView((v)=>({...v, yMin: v.yMin+1, yMax: v.yMax+1}))}>↓</Button>
                </div>
              </div>
              <div className="relative h-full w-full overflow-hidden rounded-md border bg-background">
                <canvas ref={canvasRef} className="h-full w-full" />
              </div>
            </div>
          )}
        </div>
        <div className="mb-2 grid grid-cols-4 gap-2">
          {SCI_KEYS.flat().map((k) => (
            <Button key={k} variant={k==='2nd' && second ? 'default' : 'secondary'} onClick={() => sciHandler(k)}>{k}</Button>
          ))}
        </div>
        <div className="mb-2 grid grid-cols-4 gap-2">
          <Button variant="secondary" className="col-span-2" onClick={clearAll}>CLEAR</Button>
          <Button variant="secondary" onClick={backspace}>DEL</Button>
          <Button variant="secondary" onClick={() => input('(')}>(</Button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {KEYS.flat().map((k, idx) => (
            <Button
              key={`${k}-${idx}`}
              onClick={() => (k === '=' ? evaluate() : input(k))}
              variant={/^[0-9.]$/.test(k) ? 'default' : 'secondary'}
            >
              {k}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}