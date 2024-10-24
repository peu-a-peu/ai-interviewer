import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans],
      },
      borderRadius: {
        '2.5xl': '1.25rem',
      },
      colors: {
        purple: {
          DEFAULT: '#735CFE',     
          50: '#F4F2FF',          
          100: '#E9E7FE',
          200: '#C7C1FD',
          300: '#A49CFC',
          400: '#8277FB',
          500: '#735CFE',        
          600: '#5848C9',
          700: '#443798',
          800: '#302667',
          900: '#1C1537',         
        }
      }
    },
  },
  plugins: [],
} satisfies Config;
