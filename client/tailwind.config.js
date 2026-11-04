/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        tuyo: '#16a34a',     // verde: lo que de verdad ganas
        iva: '#f97316',      // naranja: IVA (no es tuyo)
        hacienda: '#dc2626', // rojo: cuota + IRPF
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
