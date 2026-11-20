# Marea — Simulador de crédito y ahorro

Simulador bancario pensado para personas que no saben de finanzas. Un solo proyecto
(Next.js + TypeScript) con la interfaz y la API juntas.

## Correrlo en tu computador

Necesitas Node.js 20 o superior.

```bash
npm install
npm run dev
```

Abre http://localhost:3000

## Subirlo a Vercel

**Opción A, con GitHub (recomendada)**

1. Sube esta carpeta a un repositorio de GitHub.
2. En https://vercel.com elige *Add New → Project* e importa el repositorio.
3. Vercel detecta Next.js solo (además `vercel.json` lo fija). Presiona *Deploy*.
   Si subiste la carpeta padre `marea-simulador/` en vez de `marea/`, en
   *Root Directory* escribe `marea`.

**Opción B, desde la terminal**

```bash
npx vercel
```

No se necesitan variables de entorno ni base de datos.

## Estructura

```
app/
  layout.tsx            Página base y fuentes
  page.tsx              Página principal
  globals.css           Estilos (colores en :root)
  api/simular/route.ts  API: POST /api/simular
components/
  Nav.tsx               Barra transparente que sigue al usuario
  Simulador.tsx         Preguntas, resultado, gráfica y tabla
  Grafica.tsx           Gráfica en SVG
  Tabla.tsx             Tabla de amortización con totales y descarga
lib/
  finanzas.ts           Toda la lógica financiera
```

## API

```bash
curl -X POST http://localhost:3000/api/simular \
  -H "Content-Type: application/json" \
  -d '{"tipo":"credito","monto":20000000,"meses":36,"tasa":24,"tipoTasa":"EA"}'
```

También acepta `{"tipo":"ahorro","inicial":1000000,"aporte":300000,"meses":60,"tasa":0.72,"tipoTasa":"MV"}`.

`tipoTasa` indica cómo viene la tasa:

| Valor  | Significa                              | Ejemplo equivalente |
|--------|----------------------------------------|---------------------|
| `EA`   | Efectiva anual (por defecto)           | 24 %                |
| `NAMV` | Nominal anual mes vencido (N.M.V.)     | 21,71 %             |
| `MV`   | Efectiva mensual, mes vencido          | 1,81 %              |

Todas se convierten a tasa efectiva mensual antes de calcular. `tasaAnual` se sigue
aceptando como alias de `tasa` con tipo `EA`.

## Qué cambiar primero

- **Intereses de ejemplo:** constante `TIPOS` en `components/Simulador.tsx`.
- **Colores:** variables de `:root` en `app/globals.css`.
- **Nombre y logo:** `components/Nav.tsx` y `app/layout.tsx`.
