import { NextResponse } from 'next/server';
import { calcularAhorro, calcularCredito } from '@/lib/finanzas';

/**
 * POST /api/simular
 *   { "tipo": "credito", "monto": 20000000, "meses": 36, "tasaAnual": 24 }
 *   { "tipo": "ahorro", "inicial": 1000000, "aporte": 300000, "meses": 60, "tasaAnual": 9 }
 */
export async function POST(req: Request) {
  let datos: Record<string, unknown>;
  try {
    datos = await req.json();
  } catch {
    return error('El cuerpo debe ser JSON.');
  }

  const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : NaN);
  const meses = num(datos.meses);
  const tasaAnual = num(datos.tasaAnual);

  if (!Number.isInteger(meses) || meses < 1 || meses > 480) return error('"meses" debe ser un entero entre 1 y 480.');
  if (!(tasaAnual >= 0 && tasaAnual <= 100)) return error('"tasaAnual" debe estar entre 0 y 100.');

  if (datos.tipo === 'credito') {
    const monto = num(datos.monto);
    if (!(monto > 0)) return error('"monto" debe ser mayor que 0.');
    return NextResponse.json(calcularCredito(monto, meses, tasaAnual));
  }

  if (datos.tipo === 'ahorro') {
    const inicial = num(datos.inicial);
    const aporte = num(datos.aporte);
    if (!(inicial >= 0) || !(aporte >= 0)) return error('"inicial" y "aporte" deben ser 0 o más.');
    return NextResponse.json(calcularAhorro(inicial, aporte, meses, tasaAnual));
  }

  return error('"tipo" debe ser "credito" o "ahorro".');
}

function error(mensaje: string) {
  return NextResponse.json({ error: mensaje }, { status: 400 });
}
