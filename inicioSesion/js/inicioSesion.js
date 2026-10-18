import {
validarCorreo,
validarContrasena
} from "./validadores.js";

const correoInput = document.getElementById("inputCorreo");
const contrasenaInput = document.getElementById("inputContrasena");

const form = document.getElementById("formularioInicioSesion");

function mostrarError(nombreCampo, mensaje) {
    const parrafoError = document.querySelector( `[data-error-for="${nombreCampo}"]` ); 
    if (parrafoError) { 
     parrafoError.textContent = mensaje; } }

function limpiarError(nombreCampo) {
  const parrafoError = document.querySelector(`[data-error-for="${nombreCampo}"]`);
  if (parrafoError) {
    parrafoError.textContent = "";
  }
}

function limpiarTodosLosErrores() {
  const errores = document.querySelectorAll("[data-error-for]");
  errores.forEach((p) => {
    p.textContent = "";
  });
}

correoInput.addEventListener("change", () => limpiarError("correo"));
contrasenaInput.addEventListener("change", () => limpiarError("contrasena"));


form.addEventListener("submit", (event) => {
    event.preventDefault();

    limpiarTodosLosErrores();

    

    const errorCorreo = validarCorreo(correoInput.value);
    const errorContrasena = validarContrasena(contrasenaInput.value);

    if (errorCorreo) {
        mostrarError("correo", errorCorreo);
    }

    if (errorContrasena) {
        mostrarError("contrasena", errorContrasena);
    }

    if (!errorCorreo && !errorContrasena) {
        console.log("Formulario válido");
    }

    correoInput.value = "";
    contrasenaInput.value = "";

});