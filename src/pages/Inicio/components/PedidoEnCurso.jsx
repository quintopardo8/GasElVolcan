import { Link } from 'react-router-dom'
import { formatearDinero } from '../../../data/productos.js'
import { ESTADOS_PEDIDO } from '../../../utils/pedidoEnCurso.js'

export default function PedidoEnCurso({ pedido }) {
  const resumen = pedido.lineas.map((l) => `${l.cantidad} × ${l.corto}`).join(', ')
  const actual = Math.max(0, ESTADOS_PEDIDO.findIndex((e) => e.id === pedido.estado))
  const entregado = pedido.estado === 'entregado'

  return (
    <section className="inicio-pedido tarjeta" aria-label="Pedido en curso">
      <div className="inicio-pedido-cabecera">
        <div>
          <p className="eyebrow">Pedido en curso</p>
          <h2>N° {pedido.id}</h2>
          <p className="texto-suave">
            {resumen} · {formatearDinero(pedido.total)}
          </p>
        </div>
        <Link to="/rastreo" className="boton boton-secundario">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
          Rastrea tu pedido
        </Link>
      </div>

      <ol className="inicio-pedido-pasos" aria-label="Estado del pedido">
        {ESTADOS_PEDIDO.map((estado, i) => {
          const hecho = i < actual || entregado
          const enCurso = i === actual && !entregado
          const nota = i === 0 && pedido.hora ? `Hoy, ${pedido.hora}` : estado.nota
          return (
            <li
              key={estado.id}
              className={hecho ? 'hecho' : enCurso ? 'en-curso' : undefined}
              aria-current={enCurso ? 'step' : undefined}
            >
              <span className="paso-barra" aria-hidden="true" />
              <span className="paso-nombre">
                {hecho && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12.5l4.5 4.5L19 7.5" />
                  </svg>
                )}
                {estado.nombre}
              </span>
              <span className="paso-nota">{nota}</span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
