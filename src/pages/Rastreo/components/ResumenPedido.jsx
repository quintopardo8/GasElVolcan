export default function ResumenPedido() {
  return (
    <div className="order-summary">
      <div>
        <h2>¡Tu pedido está en camino!</h2>
        <p className="delivery-time">
          Llegará aproximadamente entre <strong>18:30 y 19:00 hrs.</strong>
        </p>
      </div>
      <span className="status-pill"><span></span> En reparto</span>
    </div>
  )
}
