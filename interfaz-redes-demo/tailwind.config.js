/** @type {import('tailwindcss').Config} */
// v3 · Dirección de arte: corporativa, luminosa y editorial.
// Azules de Interfaz como jerarquía, neutros claros como base.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    // El margen lateral crece con la pantalla mediante --gutter (index.css). Tailwind ignora los
    // márgenes por breakpoint cuando el contenedor sólo define `2xl`, por eso no se usa aquí.
    container: { center: true, padding: 'var(--gutter)', screens: { '2xl': '1400px' } },
    extend: {
      colors: {
        navy: { DEFAULT: '#081D36', 900: '#061528', 800: '#0B2442' },
        corp: { DEFAULT: '#0E4C92', deep: '#0A3B73' },  // azul oscuro del logotipo
        tech: '#1769C8',  // azul de la placa del logotipo
        lumen: '#26A5DC',
        ink: '#0E1C2D',
        body: '#3A4656',
        muted: '#6A7685',
        faint: '#98A2AE',
        line: '#E1E6EB',
        mist: '#F4F6F8',
        ice: '#EAF1F7',
        // compatibilidad con componentes previos
        cold: '#F4F6F8',
        paper: '#FFFFFF',
        slate: { DEFAULT: '#3A4656', muted: '#6A7685', faint: '#98A2AE' },
      },
      fontFamily: {
        display: ['Archivo', 'Helvetica Neue', 'Arial', 'sans-serif'],
        sans: ['"DM Sans"', 'Helvetica Neue', 'Arial', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'Menlo', 'monospace'],
      },
      fontSize: {
        display: ['clamp(2.6rem, 1.4rem + 4.2vw, 5rem)', { lineHeight: '1.0', letterSpacing: '-0.032em' }],
        h1: ['clamp(2.25rem, 1.5rem + 2.8vw, 3.75rem)', { lineHeight: '1.04', letterSpacing: '-0.028em' }],
        h2: ['clamp(1.85rem, 1.35rem + 1.9vw, 2.9rem)', { lineHeight: '1.08', letterSpacing: '-0.022em' }],
        h3: ['clamp(1.3rem, 1.1rem + 0.7vw, 1.65rem)', { lineHeight: '1.2', letterSpacing: '-0.012em' }],
        h4: ['1.15rem', { lineHeight: '1.3', letterSpacing: '-0.005em' }],
        lead: ['clamp(1.12rem, 1.05rem + 0.3vw, 1.3rem)', { lineHeight: '1.55' }],
        body: ['1.0625rem', { lineHeight: '1.65' }],
        small: ['0.9375rem', { lineHeight: '1.55' }],
        label: ['0.8125rem', { lineHeight: '1.4', letterSpacing: '0.01em' }],
      },
      // frame: ancho máximo de las imágenes a sangre; evita estirarlas (y pixelarlas) en pantallas muy anchas.
      maxWidth: { prose: '62ch', measure: '38rem', frame: '1600px' },
    },
  },
  plugins: [],
}
