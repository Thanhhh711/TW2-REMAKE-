const plugin = require('tailwindcss/plugin')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  corePlugins: {
    container: false
  },
  theme: {
    extend: {
      colors: {
        orange: '#ee4d2d'
      },
      fontFamily: {
        segoe: ['Segoe UI', 'Arial', 'sans-serif']
      }
    }
  },
  plugins: [
    plugin(function ({ addComponents, theme }) {
      addComponents({
        '.container': {
          maxWidth: theme('columns.7xl'), // 90 rem
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: theme('spacing.4'),
          paddingRight: theme('spacing.4')
        }
      })
    })
    //  thằng này phải cài nha truncate mutiple-line (tailwind)
    //  giúp đoạn chữ quá dài thì chúng ta sẽ cho 3 chấm
    // require('@tailwindcss/line-clamp')
  ]
}
