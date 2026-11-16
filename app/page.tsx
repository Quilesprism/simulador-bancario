import Nav from '@/components/Nav';
import Simulador from '@/components/Simulador';

export default function Inicio() {
  return (
    <>
      <Nav />
      <main id="inicio">
        <Simulador />

        <section className="seccion tinte" id="glosario">
          <div className="contenedor">
            <h2>Qué significa cada número</h2>
            <div className="glosario">
              <article>
                <h3>Cuota</h3>
                <p>Lo que pagas cada mes. Es siempre el mismo valor, así sabes desde el primer día cuánto apartar.</p>
              </article>
              <article>
                <h3>Intereses</h3>
                <p>
                  Lo que el banco te cobra por prestarte. Al comienzo la cuota tiene más intereses; con el tiempo, casi
                  todo va a tu deuda.
                </p>
              </article>
              <article>
                <h3>Interés al año</h3>
                <p>
                  El porcentaje que el banco cobra en un año. En los anuncios aparece como “E.A.”. Entre más bajo, menos
                  pagas en total.
                </p>
              </article>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="contenedor">
          <p>
            simulador con fines educativos, no un banco. Los valores son aproximados y no incluyen seguros
            ni otros cobros; el interés y la cuota reales los define cada entidad.
          </p>
        </div>
      </footer>
    </>
  );
}
