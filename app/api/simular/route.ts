import { NextResponse } from 'next/server';
import { calcularAhorro, calcularCredito, convertirTasa, TIPOS_TASA, type TipoTasa } from '@/lib/finanzas';

/**
 * POST /api/simular
 *   { "tipo": "credito", "monto": 20000000, "meses": 36, "tasa": 24, "tipoTasa": "EA" }
 *   { "tipo": "credito", "monto": 20000000, "meses": 36, "tasa": 1.8, "tipoTasa": "MV" }
 *   { "tipo": "ahorro", "inicial": 1000000, "aporte": 300000, "meses": 60, "tasa": 8.7, "tipoTasa": "NAMV" }
 *
 * "tipoTasa" puede ser "EA" (efectiva anual), "NAMV" (nominal anual mes vencido) o "MV" (mensual).
 * Si no se envía, se asume "EA". "tasaAnual" se sigue aceptando como alias de "tasa" con tipo "EA".
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
  const tasa = num(datos.tasa ?? datos.tasaAnual);
  const tipoTasa = (datos.tipoTasa ?? 'EA') as TipoTasa;

  if (!Number.isInteger(meses) || meses < 1 || meses > 480) return error('"meses" debe ser un entero entre 1 y 480.');
  if (!TIPOS_TASA.includes(tipoTasa)) return error('"tipoTasa" debe ser "EA", "NAMV" o "MV".');
  if (!(tasa >= 0)) return error('"tasa" debe ser un número mayor o igual a 0.');
  if (convertirTasa(tasa, tipoTasa, 'EA') > 100) return error('"tasa" no puede equivaler a más de 100 % E.A.');

  if (datos.tipo === 'credito') {
    const monto = num(datos.monto);
    if (!(monto > 0)) return error('"monto" debe ser mayor que 0.');
    return NextResponse.json(calcularCredito(monto, meses, tasa, tipoTasa));
  }

  if (datos.tipo === 'ahorro') {
    const inicial = num(datos.inicial);
    const aporte = num(datos.aporte);
    if (!(inicial >= 0) || !(aporte >= 0)) return error('"inicial" y "aporte" deben ser 0 o más.');
    return NextResponse.json(calcularAhorro(inicial, aporte, meses, tasa, tipoTasa));
  }

  return error('"tipo" debe ser "credito" o "ahorro".');
}

function error(mensaje: string) {
  return NextResponse.json({ error: mensaje }, { status: 400 });
}
