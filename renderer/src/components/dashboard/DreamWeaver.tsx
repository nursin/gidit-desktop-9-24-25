import { useRef, useState, useTransition } from 'react'
import { Wand2, Loader2, Code } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/useToast'

const makeSrcDoc = (userCode: string) => {
  const safe = (userCode || '').replaceAll('</script>', '<\\/script>')
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      html,body{height:100%;margin:0;font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Inter,sans-serif;background:transparent;color:inherit}
      .cell{height:100%;overflow:auto;padding:16px;box-sizing:border-box}
      pre.err{color:#ffb4b4;padding:12px;margin:0;white-space:pre-wrap}
    </style>
    <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  </head>
  <body>
    <div id="anchor-center" class="cell"></div>
    <script>
      (function(){
        function showError(msg){
          try{
            var node=document.getElementById('anchor-center');
            if(!node) return;
            node.innerHTML='';
            var pre=document.createElement('pre');
            pre.className='err';
            pre.textContent='Canvas error: '+msg;
            node.appendChild(pre);
          }catch(_){}
        }
        window.addEventListener('error',function(e){showError(e.error?.message||e.message||String(e));});
        window.addEventListener('unhandledrejection',function(e){showError(e.reason?.message||String(e.reason));});
        window.FrameAPI={
          render:function(registry){
            try{
              var node=document.getElementById('anchor-center');
              if(!node) return;
              var el=registry && registry.center;
              if(el==null) return;
              var root=node.__root||(node.__root=ReactDOM.createRoot(node));
              root.render(el);
            }catch(err){showError(err && err.message ? err.message : String(err));}
          }
        };
      })();
    </script>
    <script>
${safe}
    </script>
  </body>
</html>`
}

const mockGenerateReactComponent = async (description: string) => {
  const sample = `const Center = () => {
  const [count, setCount] = React.useState(0)
  return React.createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'center' } },
    React.createElement('h2', { style: { margin: 0 } }, 'Prototype for: ${description.replace(/`/g, '\\`')}'),
    React.createElement('div', { style: { fontSize: '48px', fontWeight: 'bold' } }, count),
    React.createElement('div', { style: { display: 'flex', gap: '8px' } },
      React.createElement('button', { onClick: () => setCount((n) => n + 1) }, 'Increment'),
      React.createElement('button', { onClick: () => setCount((n) => n - 1) }, 'Decrement'),
      React.createElement('button', { onClick: () => setCount(0) }, 'Reset')
    )
  )
}

FrameAPI.render({ center: React.createElement(Center) })`

  await new Promise((resolve) => setTimeout(resolve, 600))
  return { componentCode: sample }
}

export default function DreamWeaver({ name = 'Dream Weaver' }: { name?: string }) {
  const [prompt, setPrompt] = useState('a simple counter with start/stop/reset buttons and a big number.')
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [code, setCode] = useState('')
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const applyToIframe = (js: string) => {
    const iframe = iframeRef.current
    if (!iframe) return
    iframe.srcdoc = makeSrcDoc(js)
  }

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({
        title: 'Prompt is empty',
        description: 'Please describe the component you want to create.',
        variant: 'destructive',
      })
      return
    }

    startTransition(async () => {
      setStatus('Generating component...')
      setError('')
      setCode('')
      try {
        const result = await mockGenerateReactComponent(prompt)
        const cleaned = result.componentCode
          .replace(/^```[a-zA-Z]*\n/, '')
          .replace(/```\s*$/, '')
          .trim()
        setCode(cleaned)
        applyToIframe(cleaned)
        setStatus('Component generated successfully!')
      } catch (err) {
        console.error(err)
        const message = err instanceof Error ? err.message : 'Could not process the component.'
        setError('Failed to generate component. Check the console for details.')
        setStatus('')
        toast({ title: 'An error occurred', description: message, variant: 'destructive' })
      }
    })
  }

  return (
    <Card className="flex h-full flex-col border-0 bg-transparent shadow-none rounded-none">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>{name}</CardTitle>
            <CardDescription>Describe a UI component and preview a prototype.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="min-h-0 flex-1 space-y-2">
        <div className="flex gap-2">
          <Textarea
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="e.g., a classic snake game"
            className="h-16 resize-none text-xs"
            disabled={isPending}
          />
          <Button onClick={handleGenerate} disabled={isPending} className="h-16">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
          </Button>
        </div>
        <div className="min-h-[1.25rem] text-xs">
          {isPending && <span className="text-muted-foreground">{status}</span>}
          {error && <span className="text-destructive">{error}</span>}
          {!isPending && !error && status && <span className="text-muted-foreground">{status}</span>}
        </div>
        <div className="relative flex-1 overflow-hidden rounded-none border border-border bg-background/50">
          <iframe
            ref={iframeRef}
            title="dreamweaver-preview"
            className="h-full w-full"
            style={{ border: 0 }}
            sandbox="allow-scripts"
          />
          {code && (
            <details className="absolute bottom-2 right-2 max-h-48 max-w-sm overflow-auto rounded border border-border bg-background/80 p-2 text-xs backdrop-blur">
              <summary className="flex cursor-pointer items-center gap-1 opacity-80">
                <Code className="h-3 w-3" /> View code
              </summary>
              <pre className="mt-2 whitespace-pre-wrap text-xs">{code}</pre>
            </details>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
