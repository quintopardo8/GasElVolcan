export function esVacio(valor) {
  if (valor === null || valor === undefined) return true;
  return String(valor).trim() === '';
}

export function validarCalleNumero(valor) {
  if (esVacio(valor)) return 'Debes ingresar calle y número.';
  if (String(valor).trim().length < 5) return 'La dirección debe tener al menos 5 caracteres.';
  return null;
}

export function validarComuna(valor) {
  const comunasValidas = [
    'Chillán',
    'Chillán Viejo',
    'Coihueco',
    'Pinto',
    'Bulnes',
    'San Carlos'
  ];
  if (esVacio(valor)) return 'Selecciona una comuna.';
  return comunasValidas.includes(valor) ? null : 'Comuna no válida.';
}

export function validarTelefono(valor) {
  if (esVacio(valor)) return 'El teléfono es obligatorio para la entrega.';
  const digitos = String(valor).replace(/\D/g, '');
  const esValido = (digitos.length === 9 && digitos.startsWith('9')) ||
                   (digitos.length === 11 && digitos.startsWith('569'));
  return esValido ? null : 'Ingresa un número chileno válido (ej: 912345678).';
}

export function validarNombreTitular(valor) {
  if (esVacio(valor)) return 'Ingresa el nombre del titular.';
  if (String(valor).trim().length < 3) return 'Nombre demasiado corto.';
  return null;
}

export function validarNumeroTarjeta(valor) {
  if (esVacio(valor)) return 'Ingresa el número de tarjeta.';
  const soloNumeros = String(valor).replace(/\s+/g, '');
  return /^\d{15,16}$/.test(soloNumeros) ? null : 'Debe tener 15 o 16 dígitos.';
}

export function validarVencimiento(valor) {
  if (esVacio(valor)) return 'Indica mes/año (MM/AA).';
  return /^(0[1-9]|1[0-2])\/\d{2}$/.test(valor.trim()) ? null : 'Formato inválido (ej: 08/27).';
}

export function validarCvv(valor) {
  if (esVacio(valor)) return 'Ingresa el código CVV.';
  return /^\d{3,4}$/.test(valor.trim()) ? null : 'Debe tener 3 o 4 dígitos.';
}