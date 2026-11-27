import { useState } from 'react'
import Modal from './Modal.jsx'

// Confirmación para acciones que no se pueden deshacer (eliminar, cancelar...).
export default function ModalConfirmar({
  titulo,
  mensaje,
  textoConfirmar = 'Eliminar',
  peligro = true,
  onConfirmar,
  onCerrar,
}) {
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  const confirmar = async () => {
    setEnviando(true)
    setError('')
    try {
      await onConfirmar()
      onCerrar()
    } catch (e) {
      setError(e.message)
      setEnviando(false)
    }
  }

  return (
    <Modal
      titulo={titulo}
      onCerrar={onCerrar}
      pie={
        <>
          <button type="button" className="btn btn-outline-secondary" onClick={onCerrar}>
            Volver
          </button>
          <button
            type="button"
            className={`btn ${peligro ? 'btn-danger' : 'btn-primary'}`}
            onClick={confirmar}
            disabled={enviando}
          >
            {enviando ? 'Procesando...' : textoConfirmar}
          </button>
        </>
      }
    >
      <p className="mb-0">{mensaje}</p>
      {error && <div className="alert alert-danger mt-3 mb-0" role="alert">{error}</div>}
    </Modal>
  )
}
