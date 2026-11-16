
export interface FilaCredito {
  mes: number;
  cuota: number;
  abono: number; 
  interes: number;
  saldo: number;
}

export interface ResultadoCredito {
  cuota: number;
  intereses: number;
  total: number;
  filas: FilaCredito[];
}

export interface FilaAhorro {
  mes: number;
  aporte: number;
  interes: number;
  saldo: number;
  puesto: number; 
}

export interface ResultadoAhorro {
  final: number;
  ganado: number;
  puesto: number;
  filas: FilaAhorro[];
}


export function tasaMensual(tasaAnual: number): number {
  return Math.pow(1 + tasaAnual / 100, 1 / 12) - 1;
}

export function calcularCredito(monto: number, meses: number, tasaAnual: number): ResultadoCredito {
  const i = tasaMensual(tasaAnual);
  const cuota = i === 0 ? monto / meses : (monto * i) / (1 - Math.pow(1 + i, -meses));
  const filas: FilaCredito[] = [];
  let saldo = monto;
  let intereses = 0;

  for (let mes = 1; mes <= meses; mes++) {
    const interes = saldo * i;
    const abono = cuota - interes;
    saldo = mes === meses ? 0 : Math.max(0, saldo - abono);
    intereses += interes;
    filas.push({ mes, cuota, abono, interes, saldo });
  }
  return { cuota, intereses, total: monto + intereses, filas };
}

/** Ahorro con un valor inicial y un aporte al final de cada mes (interés compuesto). */
export function calcularAhorro(inicial: number, aporte: number, meses: number, tasaAnual: number): ResultadoAhorro {
  const i = tasaMensual(tasaAnual);
  const filas: FilaAhorro[] = [];
  let saldo = inicial;
  let ganado = 0;

  for (let mes = 1; mes <= meses; mes++) {
    const interes = saldo * i;
    saldo += interes + aporte;
    ganado += interes;
    filas.push({ mes, aporte, interes, saldo, puesto: inicial + aporte * mes });
  }
  return { final: saldo, ganado, puesto: inicial + aporte * meses, filas };
}

/* ── Formato ── */
export const pesos = (n: number) => '$ ' + Math.round(n).toLocaleString('es-CO');
export const miles = (n: number) => Math.round(n).toLocaleString('es-CO');

export function textoPlazo(meses: number): string {
  if (meses < 12) return '';
  const a = Math.floor(meses / 12);
  const r = meses % 12;
  const anios = `${a} ${a === 1 ? 'año' : 'años'}`;
  return r ? `${anios} y ${r} ${r === 1 ? 'mes' : 'meses'}` : anios;
}
