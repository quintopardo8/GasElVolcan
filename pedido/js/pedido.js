import {
  validarCilindro,
  validarCantidad,
  validarNombre,
  validarTelefono,
  validarZonaComuna,
  validarDireccion,
  validarMetodoPago,
} from "./validadores.js";

const form = document.getElementById("formularioPedido");
const panelExito = document.getElementById("panelExitoPedido");

const cilindroInput = document.getElementById("cilindro");
const cantidadInput = document.getElementById("cantidad");
const nombreInput = document.getElementById("nombreCliente");
const telefonoInput = document.getElementById("telefonoCliente");
const zonaComunaInput = document.getElementById("zonaComuna");
const direccionInput = document.getElementById("direccionEntrega");
const metodoPagoInput = document.getElementById("metodoPago");

function mostrarError(nombreCampo, mensaje) {
  const parrafoError = document.querySelector(`[data-error-for="${nombreCampo}"]`);
  if (parrafoError) {
    parrafoError.textContent = mensaje;
  }
}

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

cilindroInput.addEventListener("change", () => limpiarError("cilindro"));
cantidadInput.addEventListener("change", () => limpiarError("cantidad"));
nombreInput.addEventListener("input", () => limpiarError("nombre"));
telefonoInput.addEventListener("input", () => limpiarError("telefono"));
zonaComunaInput.addEventListener("change", () => limpiarError("zonaComuna"));
direccionInput.addEventListener("input", () => limpiarError("direccion"));
metodoPagoInput.addEventListener("change", () => limpiarError("metodoPago"));

form.addEventListener("submit", (e) => {
  e.preventDefault();

  limpiarTodosLosErrores();

  let hayErrores = false;

  const errorCilindro = validarCilindro(cilindroInput.value);
  if (errorCilindro) {
    mostrarError("cilindro", errorCilindro);
    hayErrores = true;
  }

  const errorCantidad = validarCantidad(cantidadInput.value);
  if (errorCantidad) {
    mostrarError("cantidad", errorCantidad);
    hayErrores = true;
  }

  const errorNombre = validarNombre(nombreInput.value);
  if (errorNombre) {
    mostrarError("nombre", errorNombre);
    hayErrores = true;
  }

  const errorTelefono = validarTelefono(telefonoInput.value);
  if (errorTelefono) {
    mostrarError("telefono", errorTelefono);
    hayErrores = true;
  }

  const errorZona = validarZonaComuna(zonaComunaInput.value);
  if (errorZona) {
    mostrarError("zonaComuna", errorZona);
    hayErrores = true;
  }

  const errorDireccion = validarDireccion(direccionInput.value);
  if (errorDireccion) {
    mostrarError("direccion", errorDireccion);
    hayErrores = true;
  }

  const errorPago = validarMetodoPago(metodoPagoInput.value);
  if (errorPago) {
    mostrarError("metodoPago", errorPago);
    hayErrores = true;
  }

  if (hayErrores) {
    return;
  }

  panelExito.querySelector("[data-exito-nombre]").textContent = nombreInput.value.trim();
  panelExito.querySelector("[data-exito-cilindro]").textContent =
    cilindroInput.options[cilindroInput.selectedIndex].text;
  panelExito.querySelector("[data-exito-cantidad]").textContent = cantidadInput.value;
  panelExito.querySelector("[data-exito-zona]").textContent =
    zonaComunaInput.options[zonaComunaInput.selectedIndex].text;
  panelExito.querySelector("[data-exito-direccion]").textContent = direccionInput.value.trim();
  panelExito.querySelector("[data-exito-telefono]").textContent = telefonoInput.value.trim();
  panelExito.querySelector("[data-exito-pago]").textContent =
    metodoPagoInput.options[metodoPagoInput.selectedIndex].text;

  form.classList.add("is-hidden");
  panelExito.classList.remove("is-hidden");
});