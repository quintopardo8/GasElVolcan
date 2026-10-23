import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { validarCorreo, validarContrasena } from "./validadores";
import { iniciarSesion, nombreDesdeCorreo } from "../../utils/sesion.js";
import TarjetaSesion from "./components/TarjetaSesion.jsx";
import CampoSesion from "./components/CampoSesion.jsx";
import SelectorSesion from "./components/SelectorSesion.jsx";
import "./IniciarSesion.css";

export default function IniciarSesion() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [errores, setErrores] = useState({ correo: "", contrasena: "" });

  const handleCorreo = (e) => {
    setCorreo(e.target.value);
    setErrores((prev) => ({ ...prev, correo: "" }));
  };

  const handleContrasena = (e) => {
    setContrasena(e.target.value);
    setErrores((prev) => ({ ...prev, contrasena: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const errorCorreo = validarCorreo(correo);
    const errorContrasena = validarContrasena(contrasena);

    setErrores({
      correo: errorCorreo || "",
      contrasena: errorContrasena || "",
    });

    if (!errorCorreo && !errorContrasena) {
      // Aquí irá el login real (llamada al backend). Mientras tanto se guarda
      // una sesión simulada y se entra al inicio.
      iniciarSesion(nombreDesdeCorreo(correo));
      setCorreo("");
      setContrasena("");
      navigate("/", { replace: true });
    }
  };

  return (
    <TarjetaSesion onSubmit={handleSubmit}>
      <SelectorSesion />

        <br />
      <h3 className="texto-gris">Ingresa con tu correo y contraseña</h3>
      <br />

      <CampoSesion id="inputCorreo" etiqueta="Correo*" type="email"
        name="correoUsuario" value={correo} onChange={handleCorreo} error={errores.correo} placeholder="ejemplo@gmail.com"
      />

      <CampoSesion
        id="inputContrasena" etiqueta="Contraseña*" type="password"
        name="contrasenaUsuario" value={contrasena} onChange={handleContrasena} error={errores.contrasena} placeholder="Ingresa tu contraseña"
      />
      <br /><br />

      <Link className="enlace-azul" to="/recuperar-contrasena">
        ¿Olvidaste tu contraseña?, Recuperemosla aquí
      </Link>

      <br /><br />
      <button type="submit">Iniciar sesion</button>
        <br /><br />
    </TarjetaSesion>
  );
}