import { correoValido, validarDireccion, validarMensaje, validarMotivo, validarNombre, validarTelefono } from "./validadores.js";

const form = document.getElementById("formularioContacto");
const exito = document.getElementById("mensajeExito");
const campos = {
  nombre: document.getElementById("nombre"), telefono: document.getElementById("telefono"),
  telefonoAlternativo: document.getElementById("telefono_alternativo"), email: document.getElementById("email"),
  motivo: document.getElementById("motivo"), direccion: document.getElementById("direccion"), mensaje: document.getElementById("mensaje"),
};

function mostrarError(campo, mensaje = "") {
  document.querySelector(`[data-error-for="${campo}"]`).textContent = mensaje;
  campos[campo].setAttribute("aria-invalid", String(Boolean(mensaje)));
}

Object.entries(campos).forEach(([nombre, input]) => {
  input.addEventListener(input.tagName === "SELECT" ? "change" : "input", () => {
    mostrarError(nombre);
    exito.textContent = "";
  });
});

form.addEventListener("submit", (evento) => {
  evento.preventDefault();
  exito.textContent = "";
  const errores = {
    nombre: validarNombre(campos.nombre.value), telefono: validarTelefono(campos.telefono.value),
    telefonoAlternativo: validarTelefono(campos.telefonoAlternativo.value, false), email: correoValido(campos.email.value),
    motivo: validarMotivo(campos.motivo.value), direccion: validarDireccion(campos.direccion.value), mensaje: validarMensaje(campos.mensaje.value),
  };
  let primero;
  Object.entries(errores).forEach(([campo, error]) => {
    mostrarError(campo, error);
    if (error && !primero) primero = campos[campo];
  });
  if (primero) return primero.focus();
  exito.textContent = "Tu mensaje fue validado y enviado correctamente. Te contactaremos pronto.";
  form.reset();
});
