import { describe, it, expect } from 'vitest';
import {
  formatoCLP,
  validarRunChileno,
  formatearRun,
  validarDominioCorreo,
  calcularPrecioFinal,
} from './validaciones';

describe('formatoCLP', () => {
  it.each([
    [0, '$0'],
    [1000, '$1.000'],
    [59990, '$59.990'],
    [1234567, '$1.234.567'],
  ])('formatea %i como %s', (entrada, esperado) => {
    expect(formatoCLP(entrada)).toBe(esperado);
  });

  it('redondea los decimales (1999.6 → $2.000)', () => {
    expect(formatoCLP(1999.6)).toBe('$2.000');
  });

  it('devuelve $0 con null, undefined o NaN', () => {
    expect(formatoCLP(null)).toBe('$0');
    expect(formatoCLP(undefined)).toBe('$0');
    expect(formatoCLP(NaN)).toBe('$0');
  });
});

describe('validarRunChileno', () => {
  it.each(['12.345.678-5', '12345678-5', '11.111.111-1', '10.000.013-K', '10.000.004-0'])(
    'acepta el RUN válido %s',
    (run) => expect(validarRunChileno(run)).toBe(true)
  );

  it.each(['12.345.678-9', 'abc', '', '1-9'])(
    'rechaza el RUN inválido "%s"',
    (run) => expect(validarRunChileno(run)).toBe(false)
  );

  it('acepta la K en minúscula', () => {
    expect(validarRunChileno('10.000.013-k')).toBe(true);
  });
});

describe('formatearRun', () => {
  it('quita puntos, guión y espacios, y pasa a mayúscula', () => {
    expect(formatearRun('12.345.678-k')).toBe('12345678K');
  });
});

describe('validarDominioCorreo', () => {
  it.each(['a@duoc.cl', 'a@profesor.duoc.cl', 'a@gmail.com', 'A@GMAIL.COM'])(
    'acepta %s',
    (correo) => expect(validarDominioCorreo(correo)).toBe(true)
  );

  it.each(['a@hotmail.com', 'a@duoc.cl.com', 'sin-arroba'])(
    'rechaza %s',
    (correo) => expect(validarDominioCorreo(correo)).toBe(false)
  );
});

describe('calcularPrecioFinal', () => {
  it('aplica el descuento y redondea al entero', () => {
    expect(calcularPrecioFinal({ precio: 59990, descuento_porcentaje: 20 })).toEqual({
      precioOriginal: 59990,
      precioFinal: 47992,
      enOferta: true,
      descuento: 20,
    });
  });

  it.each([null, 0, undefined])('sin descuento (%s) deja el precio original', (descuento) => {
    const r = calcularPrecioFinal({ precio: 5000, descuento_porcentaje: descuento });
    expect(r.precioFinal).toBe(5000);
    expect(r.enOferta).toBe(false);
  });

  it('acepta valores numéricos como string (vienen así desde la base de datos)', () => {
    const r = calcularPrecioFinal({ precio: '10000', descuento_porcentaje: '10' });
    expect(r.precioFinal).toBe(9000);
    expect(r.enOferta).toBe(true);
  });

  it('tolera un producto undefined sin lanzar error', () => {
    expect(calcularPrecioFinal(undefined)).toEqual({
      precioOriginal: 0,
      precioFinal: 0,
      enOferta: false,
      descuento: 0,
    });
  });
});
