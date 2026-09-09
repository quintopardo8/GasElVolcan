export function estaVacio(valor){
    if(valor === null || valor === undefined){
        return true;
    }
    if(typeof valor === "boolean"){
        return false;
    }
    return String(valor).trim()==="";
}

export function obligatorio(valor, mensaje="Este campo es obligatorio"){
    return estaVacio(valor) ? mensaje : null;
}

export function longitudMinima(valor, minimo, mensaje){
    if(estaVacio(valor)){
        return null;
    }
    const texto = String(valor).trim();
    return texto.length < minimo
        ? mensaje || `Debe tener al menos ${minimo} caracteres`
        : null;
}

export function longitudMaxima(valor, maximo, mensaje){
    if(estaVacio(valor)){
        return null;
    }
    const texto = String(valor).trim();
    return texto.length > maximo   
        ? mensaje || `No puede superar ${maximo} caracteres`
        : null;
}

export function soloLetras(valor, mensaje = "Usa solo letras y espacios") {
  if (estaVacio(valor)) {
    return null;
  }
  const patronLetras = /^[A-Za-zÁÉÍÓÚÜáéíóúüÑñ\s]+$/;
  return patronLetras.test(String(valor).trim()) ? null : mensaje;
}

export function telefonoChileno(
  valor,
  mensaje = "Ingresa un celular chileno válido (ej: 9 1234 5678)"
) {
  if (estaVacio(valor)) {
    return null;
  }
  const digitos = String(valor).replace(/\D/g, "");
  const esCelularLocal = digitos.length === 9 && digitos.startsWith("9");
  const esCelularInternacional = digitos.length === 11 && digitos.startsWith("569");

  return esCelularLocal || esCelularInternacional ? null : mensaje;
}

export function numeroRango(valor, min, max, mensaje) {
  if (estaVacio(valor)) {
    return null;
  }
  const numero = Number(valor);

  if (Number.isNaN(numero) || !Number.isInteger(numero) || numero < min || numero > max) {
    return mensaje || `Debe ser un número entero entre ${min} y ${max}`;
  }

  return null;
}

export function validarCilindro(valor) {
  const cilindrosValidos = ["5kg", "11kg", "15kg", "45kg"];
  
  const errorObligatorio = obligatorio(valor, "Debes seleccionar un tipo de cilindro");
  if (errorObligatorio) return errorObligatorio;

  return cilindrosValidos.includes(valor)
    ? null
    : "El tipo de cilindro seleccionado no es válido";
}

export function validarCantidad(valor) {
  return (
    obligatorio(valor, "Debes ingresar o seleccionar la cantidad") ||
    numeroRango(valor, 1, 10, "La cantidad debe ser entre 1 y 10 cilindros")
  );
}

export function validarNombre(valor) {
  return (
    obligatorio(valor, "El nombre completo es obligatorio") ||
    longitudMinima(valor, 3, "El nombre debe tener al menos 3 caracteres") ||
    longitudMaxima(valor, 60, "El nombre no puede superar 60 caracteres") ||
    soloLetras(valor, "El nombre solo puede contener letras y espacios")
  );
}

export function validarTelefono(valor) {
  return (
    obligatorio(valor, "El teléfono de contacto es obligatorio") ||
    telefonoChileno(valor, "Ingresa un celular válido de 9 dígitos (ej: 912345678)")
  );
}

export function validarZonaComuna(valor) {
  const zonasValidas = ["chillan-centro", "chillan-viejo", "san-ignacio", "pinto"];

  const errorObligatorio = obligatorio(valor, "Debes seleccionar una comuna o sector");
  if (errorObligatorio) return errorObligatorio;

  return zonasValidas.includes(valor)
    ? null
    : "La comuna o sector seleccionado no es válido";
}

export function validarDireccion(valor) {
  return (
    obligatorio(valor, "La dirección exacta de entrega es obligatoria") ||
    longitudMinima(valor, 5, "Indica al menos calle y numeración (mínimo 5 caracteres)") ||
    longitudMaxima(valor, 120, "La dirección no puede superar 120 caracteres")
  );
}

export function validarMetodoPago(valor) {
  const pagosValidos = ["efectivo", "transferencia"];

  const errorObligatorio = obligatorio(valor, "Debes seleccionar un método de pago");
  if (errorObligatorio) return errorObligatorio;

  return pagosValidos.includes(valor)
    ? null
    : "El método de pago no es válido";
}