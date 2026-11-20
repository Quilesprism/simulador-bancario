'use client';

import { useMemo, useState } from 'react';
import {
  calcularAhorro, calcularCredito, convertirTasa, miles, pesos, textoPlazo, TIPOS_TASA, type TipoTasa,
} from '@/lib/finanzas';
import Grafica from './Grafica';
import Tabla from './Tabla';

type Modo = 'credito' | 'ahorro';

const TIPOS = [
  { id: 'libre', titulo: 'Lo que quieras', detalle: 'Libre inversión', tasa: 24, plazoMax: 84 },
  { id: 'vehiculo', titulo: 'Carro o moto', detalle: 'Vehículo', tasa: 18, plazoMax: 84 },
  { id: 'vivienda', titulo: 'Casa o apartamento', detalle: 'Vivienda', tasa: 12, plazoMax: 240 },
];

const MODALIDAD: Record<TipoTasa, { caja: string; corta: string; nombre: string }> = {
  EA: { caja: '% al año (E.A.)', corta: '% E.A.', nombre: 'efectiva anual' },
  NAMV: { caja: '% al año (N.M.V.)', corta: '% N.M.V.', nombre: 'nominal mes vencido' },
  MV: { caja: '% al mes (M.V.)', corta: '% mensual', nombre: 'mensual' },
};

/** Lee lo que escribió la persona; no deja pasar más del equivalente a 100 % E.A. */
const leerTasa = (s: string, tipo: TipoTasa) => {
  const v = parseFloat(s.replace(',', '.'));
  return Number.isFinite(v) && v >= 0 ? Math.min(v, convertirTasa(100, 'EA', tipo)) : 0;
};
const textoTasa = (n: number) => String(Number(n.toFixed(2))).replace('.', ',');
const relleno = (valor: number, min: number, max: number) =>
  ({ ['--p' as string]: `${Math.min(100, Math.max(0, ((valor - min) / (max - min)) * 100))}%` });

export default function Simulador() {
  const [modo, setModo] = useState<Modo>('credito');

  // Préstamo
  const [monto, setMonto] = useState(20_000_000);
  const [plazo, setPlazo] = useState(36);
  const [tipo, setTipo] = useState('libre');
  const [tasa, setTasa] = useState('24');
  const [tipoTasa, setTipoTasa] = useState<TipoTasa>('EA');

  // Ahorro
  const [inicial, setInicial] = useState(1_000_000);
  const [aporte, setAporte] = useState(300_000);
  const [plazoAhorro, setPlazoAhorro] = useState(60);
  const [tasaAhorro, setTasaAhorro] = useState('9');
  const [tipoTasaAhorro, setTipoTasaAhorro] = useState<TipoTasa>('EA');

  const plazoMax = TIPOS.find((t) => t.id === tipo)?.plazoMax ?? 84;
  const tasaNum = leerTasa(tasa, tipoTasa);
  const tasaAhorroNum = leerTasa(tasaAhorro, tipoTasaAhorro);
  const tasaEA = convertirTasa(tasaNum, tipoTasa, 'EA');

  const credito = useMemo(
    () => calcularCredito(Math.max(monto, 1), plazo, tasaNum, tipoTasa),
    [monto, plazo, tasaNum, tipoTasa],
  );
  const ahorro = useMemo(
    () => calcularAhorro(inicial, aporte, plazoAhorro, tasaAhorroNum, tipoTasaAhorro),
    [inicial, aporte, plazoAhorro, tasaAhorroNum, tipoTasaAhorro],
  );

  function elegirTipo(id: string) {
    const t = TIPOS.find((x) => x.id === id)!;
    setTipo(id);
    setTasa(textoTasa(convertirTasa(t.tasa, 'EA', tipoTasa)));
    if (plazo > t.plazoMax) setPlazo(t.plazoMax);
  }

  const esCredito = modo === 'credito';
  const plazoTxt = textoPlazo(plazo);
  const plazoAhorroTxt = textoPlazo(plazoAhorro);
  const baseAhorro = Math.max(ahorro.final, 1);

  return (
    <>
      <div className="cabecera">
        <div className="contenedor">
          <h1>
            {esCredito
              ? 'Antes de pedir un préstamo, mira cuánto vas a pagar'
              : 'Mira cuánto puede crecer lo que guardas cada mes'}
          </h1>
          <p className="bajada">
            {esCredito
              ? 'Mueve los valores y verás tu cuota al instante. Sin fórmulas ni palabras raras.'
              : 'Mueve los valores y verás cuánto tendrás al final. Sin fórmulas ni palabras raras.'}
          </p>

          <section className="simulador" id="simulador" aria-label="Simulador">
            <div className="modos" role="tablist" aria-label="Qué quieres simular">
              <button role="tab" aria-selected={esCredito} onClick={() => setModo('credito')}>Pedir un préstamo</button>
              <button role="tab" aria-selected={!esCredito} onClick={() => setModo('ahorro')}>Ahorrar</button>
            </div>

            <div className="tablero">
              {esCredito ? (
                <form className="preguntas" autoComplete="off" onSubmit={(e) => e.preventDefault()}>
                  <CampoDinero
                    id="c-monto" etiqueta="¿Cuánto dinero necesitas?" valor={monto} onChange={setMonto}
                    min={1_000_000} max={200_000_000} paso={500_000} desde="$ 1 millón" hasta="$ 200 millones"
                  />

                  <div className="pregunta">
                    <label htmlFor="c-plazo">¿En cuánto tiempo lo quieres pagar?</label>
                    <div className="valor-plazo">
                      {plazo} meses{plazoTxt && <small>{plazoTxt}</small>}
                    </div>
                    <input
                      type="range" id="c-plazo" min={6} max={plazoMax} step={1} value={plazo}
                      style={relleno(plazo, 6, plazoMax)} onChange={(e) => setPlazo(Number(e.target.value))}
                    />
                    <div className="extremos"><span>6 meses</span><span>{textoPlazo(plazoMax)}</span></div>
                  </div>

                  <div className="pregunta">
                    <span className="titulo-pregunta" id="c-tipo-lbl">¿Para qué es?</span>
                    <p className="ayuda">Cada tipo de préstamo cobra un interés distinto.</p>
                    <div className="opciones" role="group" aria-labelledby="c-tipo-lbl">
                      {TIPOS.map((t) => (
                        <button
                          key={t.id} type="button" onClick={() => elegirTipo(t.id)}
                          aria-pressed={t.id === tipo && Math.abs(t.tasa - tasaEA) < 0.01}
                        >
                          <strong>{t.titulo}</strong><em>{t.detalle}</em>
                        </button>
                      ))}
                    </div>
                    <CampoTasa
                      id="c-tasa" valor={tasa} tipo={tipoTasa} numero={tasaNum}
                      onValor={setTasa} onTipo={setTipoTasa}
                      ayuda="Es un interés de ejemplo. Si tu banco ya te dio uno, escríbelo aquí y elige cómo te lo dieron: E.A., N.M.V. o mensual."
                    />
                  </div>
                </form>
              ) : (
                <form className="preguntas" autoComplete="off" onSubmit={(e) => e.preventDefault()}>
                  <CampoDinero
                    id="a-inicial" etiqueta="¿Con cuánto empiezas?" valor={inicial} onChange={setInicial}
                    min={0} max={50_000_000} paso={100_000} desde="$ 0" hasta="$ 50 millones"
                  />
                  <CampoDinero
                    id="a-aporte" etiqueta="¿Cuánto puedes guardar cada mes?" valor={aporte} onChange={setAporte}
                    min={0} max={5_000_000} paso={50_000} desde="$ 0" hasta="$ 5 millones"
                  />
                  <div className="pregunta">
                    <label htmlFor="a-plazo">¿Durante cuánto tiempo?</label>
                    <div className="valor-plazo">
                      {plazoAhorroTxt || `${plazoAhorro} meses`}{plazoAhorroTxt && <small>{plazoAhorro} meses</small>}
                    </div>
                    <input
                      type="range" id="a-plazo" min={6} max={240} step={6} value={plazoAhorro}
                      style={relleno(plazoAhorro, 6, 240)} onChange={(e) => setPlazoAhorro(Number(e.target.value))}
                    />
                    <div className="extremos"><span>6 meses</span><span>20 años</span></div>
                    <CampoTasa
                      id="a-tasa" valor={tasaAhorro} tipo={tipoTasaAhorro} numero={tasaAhorroNum}
                      onValor={setTasaAhorro} onTipo={setTipoTasaAhorro}
                      ayuda="Es lo que el banco te paga por guardar tu dinero. Cámbialo por el que ofrezca tu cuenta o CDT."
                    />
                  </div>
                </form>
              )}

              <aside className="resultado" aria-live="polite">
                <p className="rotulo">{esCredito ? 'Pagarías cada mes' : 'Al final tendrías'}</p>
                <p className="cifra">{pesos(esCredito ? credito.cuota : ahorro.final)}</p>
                <p className="nota">
                  {esCredito
                    ? `Durante ${plazo} meses, con un interés del ${textoTasa(tasaNum)} ${MODALIDAD[tipoTasa].corta}.`
                    : `En ${plazoAhorroTxt || plazoAhorro + ' meses'}, con un interés del ${textoTasa(tasaAhorroNum)} ${MODALIDAD[tipoTasaAhorro].corta}.`}
                </p>
                <div className="reparto">
                  <div className="barra" aria-hidden="true">
                    <i className="a" style={{ width: `${esCredito ? (monto / credito.total) * 100 : (ahorro.puesto / baseAhorro) * 100}%` }} />
                    <i className="b" style={{ width: `${esCredito ? (credito.intereses / credito.total) * 100 : (ahorro.ganado / baseAhorro) * 100}%` }} />
                  </div>
                  <dl className="leyenda">
                    <div>
                      <dt style={{ ['--c' as string]: '#6fd3c6' }}>{esCredito ? 'Lo que te prestan' : 'Lo que pusiste tú'}</dt>
                      <dd>{pesos(esCredito ? monto : ahorro.puesto)}</dd>
                    </div>
                    <div>
                      <dt style={{ ['--c' as string]: '#e9b65c' }}>{esCredito ? 'Intereses' : 'Lo que ganaste en intereses'}</dt>
                      <dd>{pesos(esCredito ? credito.intereses : ahorro.ganado)}</dd>
                    </div>
                  </dl>
                </div>
                <div className="total">
                  <span>{esCredito ? 'En total pagarás' : 'Total ahorrado'}</span>
                  <strong>{pesos(esCredito ? credito.total : ahorro.final)}</strong>
                </div>
                <p className="frase">
                  {esCredito ? (
                    <>Por cada <b>$&nbsp;100</b> que te prestan, devuelves <b>$&nbsp;{Math.round((credito.total / Math.max(monto, 1)) * 100)}</b>.</>
                  ) : ahorro.puesto > 0 ? (
                    <>Tu dinero habrá crecido un <b>{((ahorro.ganado / ahorro.puesto) * 100).toFixed(1).replace('.', ',')}&nbsp;%</b> sin que hagas nada más.</>
                  ) : (
                    'Escribe con cuánto empiezas o cuánto puedes guardar cada mes.'
                  )}
                </p>
                <a className="boton-claro" href="#tabla">
                  {esCredito ? 'Ver la tabla de amortización' : 'Ver el ahorro mes a mes'}
                </a>
              </aside>
            </div>
          </section>
        </div>
      </div>

      <section className="seccion tinte" id="evolucion">
        <div className="contenedor">
          <h2>{esCredito ? 'Así baja tu deuda mes a mes' : 'Así crece tu ahorro mes a mes'}</h2>
          <p className="intro">
            {esCredito
              ? 'Al principio la deuda baja despacio porque buena parte de la cuota son intereses. Después baja cada vez más rápido.'
              : 'La línea de arriba es lo que tendrás; la de abajo, lo que has puesto tú. El espacio entre las dos es lo que el banco te paga.'}
          </p>
          {esCredito ? (
            <Grafica
              titulo="Lo que te falta por pagar en cada mes" max={Math.max(monto, 1)}
              series={[{ nombre: 'Lo que te falta por pagar', color: '#0a7d75', relleno: 'rgba(10,125,117,.14)', puntos: [monto, ...credito.filas.map((f) => f.saldo)] }]}
            />
          ) : (
            <Grafica
              titulo="Crecimiento del ahorro en cada mes" max={baseAhorro}
              series={[
                { nombre: 'Lo que tendrás', color: '#0a7d75', relleno: 'rgba(10,125,117,.14)', puntos: [inicial, ...ahorro.filas.map((f) => f.saldo)] },
                { nombre: 'Lo que pusiste tú', color: '#e9b65c', relleno: 'rgba(233,182,92,.22)', puntos: [inicial, ...ahorro.filas.map((f) => f.puesto)] },
              ]}
            />
          )}
        </div>
      </section>

      <section className="seccion" id="tabla">
        <div className="contenedor">
          <h2>{esCredito ? 'Tabla de amortización' : 'Tu ahorro, mes por mes'}</h2>
          <p className="intro">
            {esCredito
              ? 'Es el detalle de cada cuota: cuánto baja tu deuda, cuánto son intereses y cuánto te queda por pagar.'
              : 'El detalle de cada mes: lo que guardas, lo que el banco te paga y cuánto llevas.'}
          </p>
          {esCredito ? (
            <Tabla
              key="credito"
              descripcion={`${plazo} cuotas de ${pesos(credito.cuota)}.`}
              columnas={['Mes', 'Cuota', 'Va a tu deuda', 'Intereses', 'Te falta por pagar']}
              filas={credito.filas.map((f) => [f.mes, f.cuota, f.abono, f.interes, f.saldo])}
              totales={[credito.total, monto, credito.intereses, null]}
              archivo="tabla-de-amortizacion.csv"
            />
          ) : (
            <Tabla
              key="ahorro"
              descripcion={`${plazoAhorro} meses guardando ${pesos(aporte)} cada mes.`}
              columnas={['Mes', 'Guardas', 'Intereses que ganas', 'Tienes']}
              filas={ahorro.filas.map((f) => [f.mes, f.aporte, f.interes, f.saldo])}
              totales={[aporte * plazoAhorro, ahorro.ganado, ahorro.final]}
              archivo="plan-de-ahorro.csv"
            />
          )}
        </div>
      </section>
    </>
  );
}

function CampoDinero(props: {
  id: string; etiqueta: string; valor: number; onChange: (n: number) => void;
  min: number; max: number; paso: number; desde: string; hasta: string;
}) {
  const { id, etiqueta, valor, onChange, min, max, paso, desde, hasta } = props;
  const enRango = Math.min(Math.max(valor, min), max);
  return (
    <div className="pregunta">
      <label htmlFor={id}>{etiqueta}</label>
      <div className="campo-grande">
        <span>$</span>
        <input
          id={id} inputMode="numeric" value={valor ? miles(valor) : ''} placeholder="0"
          onChange={(e) => onChange(Math.min(Number(e.target.value.replace(/\D/g, '')) || 0, 2_000_000_000))}
          onBlur={() => valor < min && onChange(min)}
        />
      </div>
      <input
        type="range" min={min} max={max} step={paso} value={enRango} aria-label={etiqueta}
        style={relleno(enRango, min, max)} onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="extremos"><span>{desde}</span><span>{hasta}</span></div>
    </div>
  );
}

function CampoTasa(props: {
  id: string; valor: string; tipo: TipoTasa; numero: number; ayuda: string;
  onValor: (s: string) => void; onTipo: (t: TipoTasa) => void;
}) {
  const { id, valor, tipo, numero, ayuda, onValor, onTipo } = props;
  const otras = TIPOS_TASA.filter((t) => t !== tipo);

  // Al cambiar la modalidad se convierte el número, así la cuota no cambia por accidente.
  function cambiarTipo(nuevo: TipoTasa) {
    onValor(textoTasa(convertirTasa(numero, tipo, nuevo)));
    onTipo(nuevo);
  }

  return (
    <div className="tasa-fila">
      <div className="tasa-caja">
        <input
          id={id} inputMode="decimal" value={valor} onChange={(e) => onValor(e.target.value)}
          aria-label={`Interés ${MODALIDAD[tipo].nombre}, en porcentaje`}
        />
        <select value={tipo} onChange={(e) => cambiarTipo(e.target.value as TipoTasa)} aria-label="Cómo te dieron el interés">
          {TIPOS_TASA.map((t) => <option key={t} value={t}>{MODALIDAD[t].caja}</option>)}
        </select>
      </div>
      <p>
        {ayuda}
        <span className="tasa-equivale">
          Equivale a {otras.map((t) => `${textoTasa(convertirTasa(numero, tipo, t))} ${MODALIDAD[t].corta}`).join(' o ')}.
        </span>
      </p>
    </div>
  );
}
