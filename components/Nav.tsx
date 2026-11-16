'use client';

import { useEffect, useState } from 'react';

export default function Nav() {
  const [conFondo, setConFondo] = useState(false);

  useEffect(() => {
    const alBajar = () => setConFondo(window.scrollY > 12);
    alBajar();
    window.addEventListener('scroll', alBajar, { passive: true });
    return () => window.removeEventListener('scroll', alBajar);
  }, []);

  return (
    <header className={`nav${conFondo ? ' con-fondo' : ''}`}>
      <div className="contenedor nav-fila">
        <a className="marca" href="#inicio" aria-label="inicio">
          Simulador
        </a>
        <nav className="nav-enlaces" aria-label="Principal">
          <a href="#evolucion">Mes a mes</a>
          <a href="#tabla">Tabla de amortización</a>
          <a href="#glosario">Qué significa cada número</a>
          <a className="principal" href="#simulador">Simular</a>
        </nav>
      </div>
    </header>
  );
}
