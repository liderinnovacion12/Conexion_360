import { forwardRef } from 'react'
import { formatConsecutive, peekConsecutive } from '../../utils/documents.js'
import { formatDateTime } from '../../utils/format.js'

// Sello de firma reutilizable: la firma queda SIEMPRE contenida en el
// mismo recuadro fijo, junto al consecutivo, la fecha-hora y el código de
// verificación. Se usa tanto en la vista previa como para estampar PDFs.
const SignatureSeal = forwardRef(function SignatureSeal(
  { signature, signerName, signerRole, signed },
  ref
) {
  return (
    <div className="doc-seal" ref={ref}>
      <div className="doc-seal-head">FIRMA ELECTRÓNICA VERIFICADA · CONEXIÓN 360</div>
      <div className="doc-seal-body">
        <div className="doc-seal-wm">CONEXIÓN 360</div>
        <div className="doc-seal-sig">
          {!signature && <span className="empty">Firma pendiente</span>}
          {signature?.type === 'typed' && <span className="cursive">{signature.data}</span>}
          {(signature?.type === 'draw' || signature?.type === 'upload') && (
            <img src={signature.data} alt="Firma" />
          )}
        </div>
        <div className="doc-seal-name">{signerName || '—'}</div>
        <div className="doc-seal-role">{signerRole}</div>
        <div className="doc-seal-meta">
          {signed ? (
            <>
              <div><span className="lbl">Consecutivo:</span> <b>{formatConsecutive(signed.consecutive)}</b></div>
              <div><span className="lbl">Fecha y hora de firma:</span> {formatDateTime(signed.date)}</div>
              <div><span className="lbl">Código de verificación:</span> <b>{signed.code}</b></div>
            </>
          ) : (
            <div className="unsigned">
              DOCUMENTO SIN FIRMAR · próximo consecutivo {formatConsecutive(peekConsecutive() + 1)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

export default SignatureSeal
