// Piezas pequeñas que se repiten en todas las pantallas del panel.

export function Encabezado({ titulo, descripcion, acciones }) {
  return (
    <div className="admin-encabezado">
      <div>
        <h1>{titulo}</h1>
        {descripcion && <p className="admin-descripcion">{descripcion}</p>}
      </div>
      {acciones && <div className="admin-encabezado-acciones">{acciones}</div>}
    </div>
  )
}

export function Campo({ id, etiqueta, error, ayuda, className = '', children }) {
  return (
    <div className={`mb-3 ${className}`}>
      <label htmlFor={id} className="form-label">{etiqueta}</label>
      {children}
      {ayuda && !error && <div className="form-text">{ayuda}</div>}
      {error && <div className="invalid-feedback d-block">{error}</div>}
    </div>
  )
}

export function Aviso({ tipo = 'success', children, onCerrar }) {
  if (!children) return null
  return (
    <div className={`alert alert-${tipo} d-flex align-items-start justify-content-between gap-3`} role={tipo === 'danger' ? 'alert' : 'status'}>
      <span>{children}</span>
      {onCerrar && <button type="button" className="btn-close" aria-label="Cerrar aviso" onClick={onCerrar} />}
    </div>
  )
}

export function Cargando({ texto = 'Cargando...' }) {
  return (
    <div className="admin-cargando" role="status">
      <span className="spinner-border spinner-border-sm" aria-hidden="true" />
      <span>{texto}</span>
    </div>
  )
}

export function SinResultados({ children }) {
  return <p className="admin-vacio">{children}</p>
}
