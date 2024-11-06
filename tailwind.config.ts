import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        'korean': ['Pretendard Variable', 'sans-serif'],
        'english': ['Inter', 'sans-serif'],
      },
      borderRadius: {
        '2.5xl': '1.25rem',
      },
      colors: {
        gray:{
            300: '#DBEDEE2', 
            400: '#BBC0C8', 
        },
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
