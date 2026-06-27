import { useRef, useState } from 'react'
import { Camera, RefreshCw, Video, VideoOff } from 'lucide-react'
import Button from '../ui/Button.jsx'

// Captura de evidencia por webcam. Las capturas se etiquetan con timestamp + metadata.
export default function WebcamCapture({ userId, courseId, onCapture }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [active, setActive] = useState(false)
  const [shot, setShot] = useState(null)
  const [error, setError] = useState('')

  const startCam = async () => {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setActive(true)
    } catch {
      setError('No se pudo acceder a la cámara. Verifica los permisos del navegador.')
    }
  }

  const stopCam = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    setActive(false)
  }

  const capture = () => {
    const v = videoRef.current
    if (!v) return
    const canvas = document.createElement('canvas')
    canvas.width = v.videoWidth || 640
    canvas.height = v.videoHeight || 480
    canvas.getContext('2d').drawImage(v, 0, 0)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
    const meta = {
      data: dataUrl,
      timestamp: new Date().toISOString(),
      userId: userId || 'desconocido',
      courseId: courseId || null,
    }
    setShot(meta)
    onCapture?.(meta)
    stopCam()
  }

  return (
    <div className="col gap-3">
      <div className="webcam-frame">
        {shot ? (
          <img src={shot.data} alt="Captura" />
        ) : active ? (
          <video ref={videoRef} muted playsInline />
        ) : (
          <div className="webcam-placeholder">
            <Camera size={30} style={{ marginBottom: 8, opacity: 0.6 }} />
            <div>Cámara desactivada</div>
            <div className="card-sub">Se solicitará permiso al activarla</div>
          </div>
        )}
      </div>

      {error && <div className="field-error">{error}</div>}

      <div className="row gap-2 wrap">
        {!active && !shot && (
          <Button variant="primary" icon={Video} onClick={startCam}>
            Activar cámara
          </Button>
        )}
        {active && (
          <>
            <Button variant="primary" icon={Camera} onClick={capture}>
              Capturar evidencia
            </Button>
            <Button variant="ghost" icon={VideoOff} onClick={stopCam}>
              Detener
            </Button>
          </>
        )}
        {shot && (
          <>
            <Button variant="ghost" icon={RefreshCw} onClick={() => { setShot(null); startCam() }}>
              Repetir
            </Button>
            <span className="card-sub">Capturado · {new Date(shot.timestamp).toLocaleTimeString('es-CO')}</span>
          </>
        )}
      </div>
    </div>
  )
}
