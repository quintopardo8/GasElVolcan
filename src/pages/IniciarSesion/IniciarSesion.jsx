import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { validarCorreo, validarContrasena } from "./validadores";
import { esPersonal, guardarSesionDesdeApi } from "../../utils/sesion.js";
import { auth } from "../../utils/api.js";
import TarjetaSesion from "./components/TarjetaSesion.jsx";
import CampoSesion from "./components/CampoSesion.jsx";
import SelectorSesion from "./components/SelectorSesion.jsx";
import "./IniciarSesion.css";

export default function IniciarSesion() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [errores, setErrores] = useState({ correo: "", contrasena: "" });
  const [errorServidor, setErrorServidor] = useState("");
  const [enviando, setEnviando] = useState(false);

  const handleCorreo = (e) => {
    setCorreo(e.target.value);
    setErrores((prev) => ({ ...prev, correo: "" }));
    setErrorServidor("");
  };

  const handleContrasena = (e) => {
    setContrasena(e.target.value);
    setErrores((prev) => ({ ...prev, contrasena: "" }));
    setErrorServidor("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errorCorreo = validarCorreo(correo);
    const errorContrasena = validarContrasena(contrasena);

    setErrores({
      correo: errorCorreo || "",
      contrasena: errorContrasena || "",
    });

    if (errorCorreo || errorContrasena || enviando) return;

    // Login real contra usuarios-service: devuelve el token JWT y el rol.
    setEnviando(true);
    try {
      const respuesta = await auth.login(correo.trim(), contrasena);
      guardarSesionDesdeApi(respuesta);
      // Administradora y operadora entran directo al panel de administración.
      navigate(esPersonal(respuesta.usuario.rol) ? "/admin" : "/", { replace: true });
    } catch (error) {
      setErrorServidor(error.message);
      setEnviando(false);
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
      {errorServidor && (
        <p className="error" role="alert">{errorServidor}</p>
      )}
      <button type="submit" disabled={enviando}>
        {enviando ? "Ingresando..." : "Iniciar sesion"}
      </button>
        <br /><br />
    </TarjetaSesion>
  );
}