import { useEffect, useId, useRef } from 'react'

// Modal de Bootstrap controlado por React (sin el JavaScript de Bootstrap).
// Se cierra con la X o con Escape. El padre decide si se muestra.
export default function Modal({ titulo, onCerrar, children, pie, tamano = '' }) {
  const idTitulo = useId()
  const alCerrar = useRef(onCerrar)
  const caja = useRef(null)

  useEffect(() => {
    alCerrar.current = onCerrar
  }, [onCerrar])

  useEffect(() => {
    const alTeclear = (e) => {
      if (e.key === 'Escape') alCerrar.current()
    }
    document.addEventListener('keydown', alTeclear)
    document.body.classList.add('modal-open')
    // Lleva el foco al primer campo del modal.
    caja.current?.querySelector('input, select, textarea, button:not(.btn-close)')?.focus()
    return () => {
      document.removeEventListener('keydown', alTeclear)
      document.body.classList.remove('modal-open')
    }
  }, [])

  return (
    <>
      <div className="modal fade show d-block" role="dialog" aria-modal="true" aria-labelledby={idTitulo} tabIndex={-1}>
        <div className={`modal-dialog modal-dialog-scrollable modal-dialog-centered ${tamano}`}>
          <div className="modal-content" ref={caja}>
            <div className="modal-header">
              <h2 className="modal-title fs-5" id={idTitulo}>{titulo}</h2>
              <button type="button" className="btn-close" aria-label="Cerrar" onClick={onCerrar} />
            </div>
            <div className="modal-body">{children}</div>
            {pie && <div className="modal-footer">{pie}</div>}
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" />
    </>
  )
}
