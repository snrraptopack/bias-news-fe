/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        bias: {
          ideological: '#6366F1',
          factual: '#0EA5E9',
          framing: '#F59E0B',
          emotional: '#EF4444',
          transparency: '#10B981'
        }
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        soft: '0 4px 16px -2px rgba(0,0,0,0.08)',
        insetTop: 'inset 0 1px 0 0 rgba(255,255,255,0.4)'
      }
    }
  },
  plugins: []
}
