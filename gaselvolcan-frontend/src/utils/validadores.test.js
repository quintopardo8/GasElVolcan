import { describe, expect, it } from 'vitest'
import {
  correoValido, estaVacio, longitudMaxima, longitudMinima, obligatorio, soloLetras, telefonoChileno,
  validarDireccion, validarMensaje, validarMotivo, validarNombre, validarTelefono,
} from './validadores.js'

describe('estaVacio', () => {
  it.each([null, undefined, '', '   ', '\n\t'])('considera vacío %j', (valor) => {
    expect(estaVacio(valor)).toBe(true)
  })

  it.each(['a', ' a ', 0, false])('no considera vacío %j', (valor) => {
    expect(estaVacio(valor)).toBe(false)
  })
})

describe('obligatorio', () => {
  it('devuelve el mensaje por defecto si está vacío', () => {
    expect(obligatorio('')).toBe('Este campo es obligatorio')
  })

  it('devuelve un mensaje personalizado', () => {
    expect(obligatorio('  ', 'Falta')).toBe('Falta')
  })

  it('devuelve null si tiene valor', () => {
    expect(obligatorio('hola')).toBeNull()
  })
})

describe('longitudMinima', () => {
  it('ignora valores vacíos', () => {
    expect(longitudMinima('', 3)).toBeNull()
  })

  it('cuenta el texto sin espacios de los extremos', () => {
    expect(longitudMinima('  ab  ', 3)).toBe('Debe tener al menos 3 caracteres')
  })

  it('acepta exactamente el mínimo', () => {
    expect(longitudMinima('abc', 3)).toBeNull()
  })

  it('usa el mensaje personalizado', () => {
    expect(longitudMinima('a', 3, 'Muy corto')).toBe('Muy corto')
  })
})

describe('longitudMaxima', () => {
  it('ignora valores vacíos', () => {
    expect(longitudMaxima('', 3)).toBeNull()
  })

  it('acepta exactamente el máximo', () => {
    expect(longitudMaxima('abc', 3)).toBeNull()
  })

  it('rechaza si supera el máximo', () => {
    expect(longitudMaxima('abcd', 3)).toBe('No puede superar 3 caracteres')
  })
})

describe('soloLetras', () => {
  it.each(['Juan Pérez', 'Ñandú Güemes', 'MARÍA'])('acepta %j', (valor) => {
    expect(soloLetras(valor)).toBeNull()
  })

  it.each(['Juan123', 'Juan_Pérez', 'Ana!'])('rechaza %j', (valor) => {
    expect(soloLetras(valor)).toBe('Usa solo letras y espacios')
  })

  it('ignora valores vacíos', () => {
    expect(soloLetras('')).toBeNull()
  })
})

describe('telefonoChileno', () => {
  it.each(['912345678', '9 1234 5678', '+56912345678', '56 9 1234 5678'])('acepta %j', (valor) => {
    expect(telefonoChileno(valor)).toBeNull()
  })

  it.each(['812345678', '91234567', '9123456789', '+56812345678', 'abc'])('rechaza %j', (valor) => {
    expect(telefonoChileno(valor)).toBe('Ingresa un celular chileno válido')
  })

  it('ignora valores vacíos', () => {
    expect(telefonoChileno('')).toBeNull()
  })
})

describe('correoValido', () => {
  it.each(['ana@correo.com', ' ana.perez@sub.dominio.cl '])('acepta %j', (valor) => {
    expect(correoValido(valor)).toBeNull()
  })

  it.each(['ana', 'ana@', 'ana@correo', 'ana correo@x.com', '@correo.com'])('rechaza %j', (valor) => {
    expect(correoValido(valor)).toBe('Ingresa un correo electrónico válido')
  })

  it('el correo es opcional', () => {
    expect(correoValido('')).toBeNull()
  })
})

describe('validarNombre', () => {
  it('exige el nombre', () => {
    expect(validarNombre('')).toBe('El nombre completo es obligatorio')
  })

  it('exige al menos 3 caracteres', () => {
    expect(validarNombre('Al')).toBe('El nombre debe tener al menos 3 caracteres')
  })

  it('no permite más de 60 caracteres', () => {
    expect(validarNombre('a'.repeat(61))).toBe('El nombre no puede superar 60 caracteres')
  })

  it('solo permite letras y espacios', () => {
    expect(validarNombre('Juan 2')).toBe('El nombre solo puede contener letras y espacios')
  })

  it('acepta un nombre válido', () => {
    expect(validarNombre('Juan Pérez')).toBeNull()
  })
})

describe('validarTelefono', () => {
  it('exige el teléfono principal', () => {
    expect(validarTelefono('')).toBe('El teléfono principal es obligatorio')
  })

  it('el teléfono alternativo puede quedar vacío', () => {
    expect(validarTelefono('', false)).toBeNull()
  })

  it('valida el formato aunque sea opcional', () => {
    expect(validarTelefono('123', false)).toBe('Ingresa un celular válido de 9 dígitos (ej: 912345678)')
  })

  it('acepta un celular válido', () => {
    expect(validarTelefono('912345678')).toBeNull()
  })
})

describe('validarMotivo', () => {
  it.each(['pedido', 'consulta', 'proveedor', 'reclamo'])('acepta %j', (valor) => {
    expect(validarMotivo(valor)).toBeNull()
  })

  it.each(['', 'otro', undefined])('rechaza %j', (valor) => {
    expect(validarMotivo(valor)).toBe('Selecciona un motivo de contacto válido')
  })
})

describe('validarDireccion', () => {
  it('es opcional', () => {
    expect(validarDireccion('')).toBeNull()
  })

  it('no permite más de 120 caracteres', () => {
    expect(validarDireccion('a'.repeat(121))).toBe('La dirección no puede superar 120 caracteres')
  })
})

describe('validarMensaje', () => {
  it('exige el mensaje', () => {
    expect(validarMensaje('   ')).toBe('El mensaje es obligatorio')
  })

  it('exige al menos 10 caracteres', () => {
    expect(validarMensaje('Hola')).toBe('El mensaje debe tener al menos 10 caracteres')
  })

  it('no permite más de 500 caracteres', () => {
    expect(validarMensaje('a'.repeat(501))).toBe('El mensaje no puede superar 500 caracteres')
  })

  it('acepta un mensaje válido', () => {
    expect(validarMensaje('Necesito dos balones de 15 kg')).toBeNull()
  })
})
