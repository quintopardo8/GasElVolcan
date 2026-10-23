import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { iniciarSesion, primerNombre } from "../../utils/sesion.js";
import {
  validarNombre,
  validarCorreo,
  validarTelefono,
  validarContrasena,
  validarConfirmacion,
} from "./validadores";
import TarjetaSesion from "./components/TarjetaSesion.jsx";
import CampoSesion from "./components/CampoSesion.jsx";
import SelectorSesion from "./components/SelectorSesion.jsx";
import "./IniciarSesion.css";

const VACIO = {
  nombre: "",
  correo: "",
  telefono: "",
  contrasena: "",
  confirmacion: "",
};

export default function Registrarse() {
  const navigate = useNavigate();
  const [datos, setDatos] = useState(VACIO);
  const [errores, setErrores] = useState(VACIO);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setDatos((prev) => ({ ...prev, [name]: value }));
    setErrores((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const nuevosErrores = {
      nombre: validarNombre(datos.nombre) || "",
      correo: validarCorreo(datos.correo) || "",
      telefono: validarTelefono(datos.telefono) || "",
      contrasena: validarContrasena(datos.contrasena) || "",
      confirmacion: validarConfirmacion(datos.contrasena, datos.confirmacion) || "",
    };

    setErrores(nuevosErrores);

    const hayErrores = Object.values(nuevosErrores).some(Boolean);
    if (!hayErrores) {
      // Aquí irá el registro real (llamada al backend). Mientras tanto se guarda
      // una sesión simulada y se entra al inicio.
      iniciarSesion(primerNombre(datos.nombre));
      setDatos(VACIO);
      navigate("/", { replace: true });
    }
  };

  return (
    <TarjetaSesion onSubmit={handleSubmit}>
      <SelectorSesion />

      <h3 className="texto-gris">Completa tus datos para registrarte</h3>

      <CampoSesion
        id="inputNombre"
        etiqueta="Nombre*"
        name="nombre"
        value={datos.nombre}
        onChange={handleChange}
        error={errores.nombre}
      />

      <CampoSesion
        id="inputCorreo"
        etiqueta="Correo*"
        type="email"
        name="correo"
        value={datos.correo}
        onChange={handleChange}
        error={errores.correo}
      />

      <CampoSesion
        id="inputTelefono"
        etiqueta="Teléfono*"
        type="tel"
        name="telefono"
        value={datos.telefono}
        onChange={handleChange}
        error={errores.telefono}
      />

      <CampoSesion
        id="inputContrasena"
        etiqueta="Contraseña*"
        type="password"
        name="contrasena"
        value={datos.contrasena}
        onChange={handleChange}
        error={errores.contrasena}
      />

      <CampoSesion
        id="inputConfirmacion"
        etiqueta="Confirmar contraseña*"
        type="password"
        name="confirmacion"
        value={datos.confirmacion}
        onChange={handleChange}
        error={errores.confirmacion}
      />

      <br />
      <button type="submit" >Crear cuenta</button>
        <br /><br />
    </TarjetaSesion>
  );
}
