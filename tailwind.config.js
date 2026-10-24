/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        graph: {
          bg: '#090d16',
          panel: '#0f172a',
          surface: '#1e293b',
          border: '#334155',
          node: '#38bdf8',
          visited: '#10b981',
          current: '#f59e0b',
          queue: '#8b5cf6',
          edge: '#475569',
          edgeActive: '#38bdf8',
          edgeVisited: '#10b981',
        }
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      }
    },
  },
  plugins: [],
}
