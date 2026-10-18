import { useState } from "react";
import { Link } from "react-router-dom";
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
      console.log("Registro válido:", datos.nombre, datos.correo, datos.telefono);
      // Aquí irá el registro real (llamada al backend)
      setDatos(VACIO);
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
      <button type="submit">Crear cuenta</button>

      <h5 className="texto-gris-oscuro">¿Ya tienes una cuenta?</h5>

      <Link className="enlace-oscuro" to="/iniciar-sesion">
        Inicia sesión aquí
      </Link>
    </TarjetaSesion>
  );
}
