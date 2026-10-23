import './CampoFormulario.css'

// Envuelve un input/select/textarea con su label y su mensaje de error.
export default function CampoFormulario({ id, etiqueta, error, children }) {
  return (
    <div className="form-group">
      <label htmlFor={id}>{etiqueta}</label>
      {children}
      <p className="error-message" aria-live="polite">{error}</p>
    </div>
  )
}
