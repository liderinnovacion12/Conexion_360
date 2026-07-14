import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react'
import {
  FileUp, FilePlus2, ArrowRight, ArrowLeft, ShieldCheck, Move, Maximize2, Check,
  ChevronsUp, ChevronsDown,
} from 'lucide-react'
import { Card } from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'
import Badge from '../ui/Badge.jsx'
import { Field, Input } from '../ui/Form.jsx'
import { AlertBanner } from '../ui/Feedback.jsx'
import FileDropzone from './FileDropzone.jsx'
import SignaturePicker from './SignaturePicker.jsx'
import SignatureSeal from './SignatureSeal.jsx'
import ReAuthModal from './ReAuthModal.jsx'
import { nextConsecutive, formatConsecutive, verificationCode } from '../../utils/documents.js'
import { stampSealOnPdfAt } from '../../utils/pdf.js'

const SEAL_W = 360 // ancho natural del sello (coincide con .doc-seal)

const STEPS = [
  { n: 1, label: 'Documento' },
  { n: 2, label: 'Ubicar firma' },
  { n: 3, label: 'Firmar y descargar' },
]

export default function PdfSignStudio({
  library, setLibrary, signerName, setSignerName, signerRole, setSignerRole, onGenerateDoc,
}) {
  const [step, setStep] = useState(1)
  const [file, setFile] = useState(null)
  const [signature, setSignature] = useState(null)
  const [signData, setSignData] = useState(null) // { consecutive, date, code }
  const [box, setBox] = useState({ left: 40, top: 40, width: 150 })
  const [placement, setPlacement] = useState(null)
  const [sealAspect, setSealAspect] = useState(0.55)
  const [generating, setGenerating] = useState(false)
  const [done, setDone] = useState(false)
  const [loadingPdf, setLoadingPdf] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [renderTick, setRenderTick] = useState(0)
  const [finishError, setFinishError] = useState('')
  const [confirmFinish, setConfirmFinish] = useState(false)

  const viewerRef = useRef(null)
  const stackRef = useRef(null)
  const pagesRef = useRef(null)
  const hiddenSealRef = useRef(null)
  const pagesGeom = useRef([])
  const drag = useRef(null)
  const lastPointer = useRef(null)
  const autoScrollDir = useRef(0)
  const autoScrollRAF = useRef(null)

  const boxH = box.width * sealAspect

  // Mide la relación de aspecto real del sello (según su contenido firmado).
  useLayoutEffect(() => {
    if (hiddenSealRef.current) {
      const el = hiddenSealRef.current
      if (el.offsetWidth) setSealAspect(el.offsetHeight / el.offsetWidth)
    }
  }, [signData, signature, signerName, signerRole])

  // ---------- Paso 1 -> 2: reservar consecutivo y renderizar el PDF ----------
  const goToPlace = () => {
    if (!file || !signature || !signerName.trim()) return
    const consecutive = nextConsecutive()
    const date = new Date().toISOString()
    const code = verificationCode({ file: file.name, signerName, signerRole, consecutive, date })
    setSignData({ consecutive, date, code })
    setStep(2)
  }

  // Tiempo máximo de espera por página antes de avisar al usuario (evita que
  // la UI se quede "colgada" en silencio, p. ej. si la pestaña pierde el foco).
  const PAGE_RENDER_TIMEOUT_MS = 15000

  const withTimeout = (promise, ms, label) =>
    Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error(`timeout:${label}`)), ms)),
    ])

  // Renderiza las páginas del PDF con pdf.js cuando entramos al paso 2.
  useEffect(() => {
    if (step !== 2 || !file) return
    let cancelled = false
    const container = pagesRef.current
    if (container) container.innerHTML = ''
    pagesGeom.current = []
    setLoadError('')
    setLoadingPdf(true)

    ;(async () => {
      try {
        const pdfjsLib = await import('pdfjs-dist')
        const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

        const data = await file.arrayBuffer()
        if (cancelled) return
        const pdf = await withTimeout(pdfjsLib.getDocument({ data }).promise, PAGE_RENDER_TIMEOUT_MS, 'documento')
        const dpr = window.devicePixelRatio || 1
        const viewerW = (viewerRef.current?.clientWidth || 700) - 40
        const displayW = Math.max(280, Math.min(viewerW, 720))

        for (let i = 1; i <= pdf.numPages; i++) {
          if (cancelled) return
          const page = await pdf.getPage(i)
          const base = page.getViewport({ scale: 1 })
          const cssScale = displayW / base.width
          const viewport = page.getViewport({ scale: cssScale * dpr })
          const wrap = document.createElement('div')
          wrap.className = 'pdf-page'
          wrap.style.width = `${displayW}px`
          wrap.style.height = `${viewport.height / dpr}px`
          const canvas = document.createElement('canvas')
          canvas.width = viewport.width
          canvas.height = viewport.height
          canvas.style.width = `${displayW}px`
          canvas.style.height = `${viewport.height / dpr}px`
          wrap.appendChild(canvas)
          container.appendChild(wrap)
          await withTimeout(
            page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise,
            PAGE_RENDER_TIMEOUT_MS,
            `pagina-${i}`
          )
        }
        if (cancelled) return

        // Geometría de cada página relativa al stack (posicionado).
        const nodes = [...container.querySelectorAll('.pdf-page')]
        pagesGeom.current = nodes.map((n, idx) => ({ index: idx, top: n.offsetTop, left: n.offsetLeft, width: n.offsetWidth, height: n.offsetHeight }))

        // Posición inicial del sello: última página, esquina inferior derecha.
        const last = pagesGeom.current[pagesGeom.current.length - 1]
        if (last) {
          const w = Math.min(180, last.width * 0.42)
          setBox({ width: w, left: last.left + last.width - w - 18, top: last.top + last.height - w * sealAspect - 18 })
        }
        setLoadingPdf(false)
      } catch (err) {
        if (cancelled) return
        const timedOut = String(err?.message || '').startsWith('timeout:')
        setLoadError(
          timedOut
            ? 'La vista previa está tardando más de lo esperado. Verifica que esta pestaña esté activa e inténtalo de nuevo.'
            : 'No se pudo previsualizar el PDF. Verifica que el archivo no esté dañado o protegido.'
        )
        setLoadingPdf(false)
      }
    })()

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, file, renderTick])

  const retryRender = () => setRenderTick((t) => t + 1)

  // ---------- Arrastrar / redimensionar el sello ----------
  // Se calcula SIEMPRE contra el rectángulo actual del "stack" (no contra un
  // delta acumulado), así el sello sigue el cursor con precisión incluso
  // cuando el visor hace auto-scroll durante el arrastre.
  const applyPointer = useCallback((clientX, clientY) => {
    const d = drag.current
    const stack = stackRef.current
    if (!d || !stack) return
    const rect = stack.getBoundingClientRect()
    const sw = stack.offsetWidth
    const sh = stack.offsetHeight
    setBox((b) => {
      if (d.mode === 'move') {
        let left = clientX - rect.left - d.grabX
        let top = clientY - rect.top - d.grabY
        left = Math.max(0, Math.min(left, sw - b.width))
        top = Math.max(0, Math.min(top, sh - b.width * sealAspect))
        return { ...b, left, top }
      }
      let width = clientX - rect.left - d.boxLeft
      width = Math.max(90, Math.min(width, sw - d.boxLeft))
      return { ...b, width }
    })
  }, [sealAspect])

  // Auto-scroll del visor cuando el cursor se acerca al borde superior/inferior,
  // para poder llevar la firma a cualquier parte de documentos largos.
  const autoScrollTick = useCallback(() => {
    const viewer = viewerRef.current
    if (!viewer || !autoScrollDir.current) { autoScrollRAF.current = null; return }
    viewer.scrollTop += autoScrollDir.current * 16
    if (lastPointer.current) applyPointer(lastPointer.current.x, lastPointer.current.y)
    autoScrollRAF.current = requestAnimationFrame(autoScrollTick)
  }, [applyPointer])

  const setAutoScroll = useCallback((dir) => {
    autoScrollDir.current = dir
    if (dir && autoScrollRAF.current == null) {
      autoScrollRAF.current = requestAnimationFrame(autoScrollTick)
    }
  }, [autoScrollTick])

  const onPointerMove = useCallback((e) => {
    if (!drag.current) return
    lastPointer.current = { x: e.clientX, y: e.clientY }
    applyPointer(e.clientX, e.clientY)

    const viewer = viewerRef.current
    if (!viewer) return
    const vRect = viewer.getBoundingClientRect()
    const EDGE = 56
    if (e.clientY < vRect.top + EDGE) setAutoScroll(-1)
    else if (e.clientY > vRect.bottom - EDGE) setAutoScroll(1)
    else setAutoScroll(0)
  }, [applyPointer, setAutoScroll])

  const endDrag = useCallback(() => {
    drag.current = null
    lastPointer.current = null
    setAutoScroll(0)
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', endDrag)
  }, [onPointerMove, setAutoScroll])

  const startDrag = (mode) => (e) => {
    e.preventDefault()
    e.stopPropagation()
    const rect = stackRef.current.getBoundingClientRect()
    drag.current =
      mode === 'move'
        ? { mode, grabX: e.clientX - rect.left - box.left, grabY: e.clientY - rect.top - box.top }
        : { mode, boxLeft: box.left }
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', endDrag)
  }

  // Detiene cualquier auto-scroll pendiente al desmontar.
  useEffect(() => () => { if (autoScrollRAF.current) cancelAnimationFrame(autoScrollRAF.current) }, [])

  // ---------- Botones de salto rápido: inicio / final del documento ----------
  const jumpTo = (which) => {
    const geom = pagesGeom.current
    if (!geom.length) return
    const target = which === 'end' ? geom[geom.length - 1] : geom[0]
    setBox((b) => {
      const h = b.width * sealAspect
      const top = which === 'end' ? target.top + target.height - h - 18 : target.top + 18
      const left = target.left + target.width - b.width - 18
      return { ...b, left, top: Math.max(0, top) }
    })
    requestAnimationFrame(() => {
      const viewer = viewerRef.current
      if (!viewer) return
      const desired = which === 'end' ? target.top + target.height - viewer.clientHeight : target.top
      viewer.scrollTop = Math.max(0, desired)
    })
  }

  // ---------- Paso 2 -> 3: calcular la posición sobre la página ----------
  const goToConfirm = () => {
    const geom = pagesGeom.current
    if (!geom.length) return setStep(3)
    const target = geom.find((p) => box.top >= p.top && box.top < p.top + p.height) || geom[geom.length - 1]
    setPlacement({
      page: target.index,
      xr: Math.max(0, Math.min(1, (box.left - target.left) / target.width)),
      yr: Math.max(0, Math.min(1, (box.top - target.top) / target.height)),
      wr: box.width / target.width,
    })
    setStep(3)
  }

  const finish = async () => {
    if (!placement || !hiddenSealRef.current) return
    setConfirmFinish(false)
    setGenerating(true)
    setFinishError('')
    try {
      const buf = await file.arrayBuffer()
      await stampSealOnPdfAt(buf, hiddenSealRef.current, placement, `${formatConsecutive(signData.consecutive)}_${file.name}`)
      setDone(true)
    } catch {
      setFinishError('No se pudo generar el documento firmado. Verifica que esta pestaña esté activa e inténtalo de nuevo.')
    } finally {
      setGenerating(false)
    }
  }

  const restart = () => {
    setStep(1); setFile(null); setSignature(null); setSignData(null); setPlacement(null); setDone(false)
    setLoadError(''); setLoadingPdf(false); setFinishError(''); setConfirmFinish(false)
  }

  return (
    <div>
      {/* Indicador de etapas */}
      <div className="stepper">
        {STEPS.map((s, i) => (
          <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 'none' }}>
            <div className={`step ${step === s.n ? 'active' : ''} ${step > s.n ? 'done' : ''}`} style={{ flex: 'none' }}>
              <span className="step-dot">{step > s.n ? <Check size={15} /> : s.n}</span>
              <span className="step-label">{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <span className="step-line" />}
          </div>
        ))}
      </div>

      {/* Sello oculto (tamaño natural) para medir y estampar */}
      <div style={{ position: 'absolute', left: -99999, top: 0 }} aria-hidden>
        <SignatureSeal ref={hiddenSealRef} signature={signature} signerName={signerName} signerRole={signerRole} signed={signData} />
      </div>

      {/* ---------------- PASO 1 ---------------- */}
      {step === 1 && (
        <div className="grid grid-2">
          <Card title={<span className="row gap-2"><FileUp size={16} /> Documento</span>} subtitle="Carga un PDF o genera uno nuevo">
            {file ? (
              <div className="file-pill">
                <div className="fic"><FileUp size={16} /></div>
                <div className="grow">
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{file.name}</div>
                  <div className="card-sub">{(file.size / 1024).toFixed(0)} KB</div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setFile(null)}>Cambiar</Button>
              </div>
            ) : (
              <>
                <FileDropzone accept="application/pdf" maxSizeMB={20} onFile={setFile} label="Arrastra el PDF a firmar o haz clic para seleccionar" />
                <div className="row center" style={{ margin: '12px 0' }}><span className="card-sub">o</span></div>
                <Button variant="ghost" icon={FilePlus2} className="full" onClick={onGenerateDoc}>Generar un documento nuevo</Button>
              </>
            )}
          </Card>

          <Card title="Firmante y firma" subtitle="Datos y firma a aplicar">
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <Field label="Nombre de quien firma" required><Input value={signerName} onChange={(e) => setSignerName(e.target.value)} /></Field>
              <Field label="Cargo"><Input value={signerRole} onChange={(e) => setSignerRole(e.target.value)} /></Field>
            </div>
            <SignaturePicker library={library} setLibrary={setLibrary} active={signature} onSelect={setSignature} />
            <div className="row" style={{ justifyContent: 'flex-end', marginTop: 16 }}>
              <Button variant="primary" icon={ArrowRight} disabled={!file || !signature || !signerName.trim()} onClick={goToPlace}>
                Continuar a revisión
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* ---------------- PASO 2 ---------------- */}
      {step === 2 && (
        <Card
          title="Revisa el documento y ubica la firma"
          subtitle="Arrastra el sello y ajústalo con el punto de la esquina"
          action={
            <div className="row gap-2">
              <Button size="sm" variant="ghost" icon={ArrowLeft} onClick={() => setStep(1)}>Atrás</Button>
              <Button size="sm" variant="primary" icon={ArrowRight} disabled={loadingPdf || !!loadError} onClick={goToConfirm}>
                Continuar
              </Button>
            </div>
          }
        >
          {loadError ? (
            <AlertBanner variant="danger" title="No se pudo cargar la vista previa">
              <div className="col gap-2">
                <span>{loadError}</span>
                <div>
                  <Button size="sm" variant="violet" onClick={retryRender}>Reintentar</Button>
                </div>
              </div>
            </AlertBanner>
          ) : (
            <AlertBanner variant="info">
              <span className="row gap-2 wrap">
                <Move size={14} /> Arrastra el sello a su posición · <Maximize2 size={14} /> usa el punto inferior derecho para cambiar el tamaño.
                Si el documento es largo, mantén el cursor cerca del borde superior o inferior mientras arrastras para desplazarte automáticamente.
              </span>
            </AlertBanner>
          )}

          {!loadError && (
            <div className="row gap-2" style={{ marginTop: 10 }}>
              <Button size="sm" variant="ghost" icon={ChevronsUp} disabled={loadingPdf} onClick={() => jumpTo('start')}>Ir al inicio del documento</Button>
              <Button size="sm" variant="ghost" icon={ChevronsDown} disabled={loadingPdf} onClick={() => jumpTo('end')}>Ir al final del documento</Button>
            </div>
          )}

          <div className="pdf-viewer" ref={viewerRef} style={{ marginTop: 14 }}>
            {loadingPdf && (
              <div className="col center gap-2" style={{ padding: 40, color: 'var(--text-dim)' }}>
                <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 12 }} />
                <span>Cargando documento…</span>
              </div>
            )}
            <div className="pdf-stack" ref={stackRef} style={{ display: loadingPdf || loadError ? 'none' : 'block' }}>
              {/* Las páginas del PDF se inyectan aquí (fuera del control de React). */}
              <div ref={pagesRef} />
              <div
                className="sig-overlay"
                style={{ left: box.left, top: box.top, width: box.width, height: boxH }}
                onPointerDown={startDrag('move')}
              >
                <span className="sig-hint">Firma</span>
                <div className="sig-scale" style={{ width: SEAL_W, transform: `scale(${box.width / SEAL_W})` }}>
                  <SignatureSeal signature={signature} signerName={signerName} signerRole={signerRole} signed={signData} />
                </div>
                <span className="sig-handle" onPointerDown={startDrag('resize')} />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ---------------- PASO 3 ---------------- */}
      {step === 3 && (
        <div className="grid grid-2">
          <Card title="Confirmar firma" subtitle="Revisa y descarga el documento firmado">
            {done ? (
              <AlertBanner variant="success" title="Documento firmado y descargado">
                Se estampó el sello <b>{formatConsecutive(signData.consecutive)}</b> en <b>{file?.name}</b>.
              </AlertBanner>
            ) : (
              <>
                <div className="glass-soft" style={{ padding: 14 }}>
                  <div className="stat-row"><span className="muted">Documento</span><b>{file?.name}</b></div>
                  <div className="stat-row"><span className="muted">Página</span><b>{(placement?.page ?? 0) + 1}</b></div>
                  <div className="stat-row"><span className="muted">Firmante</span><b>{signerName}</b></div>
                  <div className="stat-row"><span className="muted">Consecutivo</span><b>{formatConsecutive(signData.consecutive)}</b></div>
                  <div className="stat-row"><span className="muted">Código de verificación</span><b>{signData.code}</b></div>
                </div>
                {finishError ? (
                  <AlertBanner variant="danger" title="No se pudo firmar el documento">{finishError}</AlertBanner>
                ) : (
                  <AlertBanner variant="info">El sello se incrusta en la posición y tamaño que elegiste, sin alterar el contenido original.</AlertBanner>
                )}
              </>
            )}
            <div className="row gap-2" style={{ justifyContent: 'flex-end', marginTop: 16 }}>
              {done ? (
                <Button variant="ghost" icon={FilePlus2} onClick={restart}>Firmar otro documento</Button>
              ) : (
                <>
                  <Button variant="ghost" icon={ArrowLeft} onClick={() => setStep(2)}>Atrás</Button>
                  <Button variant="violet" icon={ShieldCheck} disabled={generating} onClick={() => setConfirmFinish(true)}>
                    {generating ? 'Firmando…' : 'Firmar y descargar PDF'}
                  </Button>
                </>
              )}
            </div>
          </Card>

          <Card title="Vista del sello" subtitle="Como quedará estampado" action={<Badge variant={done ? 'success' : 'warning'} dot>{done ? 'Aplicado' : 'Listo'}</Badge>}>
            <div className="col center" style={{ padding: '10px 0' }}>
              <SignatureSeal signature={signature} signerName={signerName} signerRole={signerRole} signed={signData} />
            </div>
          </Card>
        </div>
      )}

      <ReAuthModal
        open={confirmFinish}
        onClose={() => setConfirmFinish(false)}
        actionLabel="Confirmar y firmar"
        message={`¿Seguro que quieres firmar "${file?.name}"? Se estampará el sello en la página ${(placement?.page ?? 0) + 1} de forma permanente.`}
        onConfirm={finish}
        preview={
          <div className="col center" style={{ padding: '6px 0' }}>
            <SignatureSeal signature={signature} signerName={signerName} signerRole={signerRole} signed={signData} />
          </div>
        }
      />
    </div>
  )
}
