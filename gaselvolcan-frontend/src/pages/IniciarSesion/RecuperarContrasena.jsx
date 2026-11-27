import { useState } from "react";
import { Link } from "react-router-dom";
import { validarCorreo } from "./validadores";
import TarjetaSesion from "./components/TarjetaSesion.jsx";
import CampoSesion from "./components/CampoSesion.jsx";
import "./IniciarSesion.css";

export default function RecuperarContrasena() {
  const [correo, setCorreo] = useState("");
  const [error, setError] = useState("");

  const handleCorreo = (e) => {
    setCorreo(e.target.value);
    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const errorCorreo = validarCorreo(correo);
    setError(errorCorreo || "");

    if (!errorCorreo) {
      console.log("Solicitar código para:", correo);
      // Aquí irá el envío real del código (backend)
      setCorreo("");
    }
  };

  return (
    <TarjetaSesion onSubmit={handleSubmit}>
      <h2>Recuperar contraseña</h2>
      <h4 className="texto-gris">
        Ingresa tu correo y te llegará un codigo para reestablecer tu
        contraseña
      </h4>

      <CampoSesion
        id="inputCorreo"
        etiqueta="Correo"
        type="email"
        name="correoUsuario"
        value={correo}
        onChange={handleCorreo}
        error={error}
      />

      <br /><br />
      <button type="submit">Solicitar codigo</button>

      <br /><br />
      <Link className="enlace-azul" to="/iniciar-sesion">
        Volver
      </Link>
    </TarjetaSesion>
  );
}
