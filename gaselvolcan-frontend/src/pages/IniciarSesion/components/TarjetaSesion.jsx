import logo from "../../../assets/LogoElVolcan.png";

// de iniciar sesion y recuperar contraseña

export default function TarjetaSesion({ onSubmit, children }) {
  return (
    <div className="pagina-sesion">
      <section className="cuadroBlanco">
        <form onSubmit={onSubmit} noValidate>
          <img className="logo" src={logo} alt="LogoElVolcan" />
          {children}
        </form>
      </section>
    </div>
  );
}
