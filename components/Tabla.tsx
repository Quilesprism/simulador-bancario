'use client';

import { useState } from 'react';

interface Props {
  descripcion: string;
  columnas: string[];
  filas: number[][]; 
  totales: (number | null)[]; 
  archivo: string;
}

const pesos = (n: number) => '$ ' + Math.round(n).toLocaleString('es-CO');

export default function Tabla({ descripcion, columnas, filas, totales, archivo }: Props) {
  const [verTodo, setVerTodo] = useState(false);
  const visibles = verTodo ? filas : filas.slice(0, 12);

  function descargar() {
    const lineas = [columnas, ...filas.map((f) => f.map((v) => Math.round(v)))].map((f) => f.join(';'));
    const blob = new Blob(['﻿' + lineas.join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const enlace = document.createElement('a');
    enlace.href = URL.createObjectURL(blob);
    enlace.download = archivo;
    enlace.click();
    URL.revokeObjectURL(enlace.href);
  }

  return (
    <div className="tabla-caja">
      <div className="tabla-barra">
        <p>{descripcion}</p>
        <button type="button" className="boton-linea" onClick={descargar}>Descargar para Excel</button>
      </div>
      <div className="tabla-scroll">
        <table>
          <thead>
            <tr>{columnas.map((c) => <th key={c} scope="col">{c}</th>)}</tr>
          </thead>
          <tbody>
            {visibles.map((f) => (
              <tr key={f[0]}>
                {f.map((v, j) => (
                  <td key={j} className={j === f.length - 1 ? 'fuerte' : undefined}>{j === 0 ? v : pesos(v)}</td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td>Total</td>
              {totales.map((t, j) => <td key={j}>{t === null ? '' : pesos(t)}</td>)}
            </tr>
          </tfoot>
        </table>
      </div>
      {filas.length > 12 && (
        <button type="button" className="ver-mas" onClick={() => setVerTodo(!verTodo)}>
          {verTodo ? 'Ver solo el primer año' : `Ver los ${filas.length} meses`}
        </button>
      )}
    </div>
  );
}
