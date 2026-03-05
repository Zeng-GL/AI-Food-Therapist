/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // App UI - 粉米色 + 墨綠風格
        brand: {
          DEFAULT: '#6C9A5D',  // 按鈕、主操作
          muted: '#4F6D50',    // 標題、強調文字
          light: '#5a7d5b',
          pale: '#6b8a6c',
        },
        surface: {
          DEFAULT: '#FDF8F7',  // 頁面背景（粉米色）
          card: '#FFFFFF',
        },
        // Legacy / 相容
        primary: {
          DEFAULT: '#6C9A5D',
          light: '#E8F5E9',
          dark: '#4F6D50',
        },
        teal: {
          DEFAULT: '#6C9A5D',
        },
        background: {
          DEFAULT: '#FDF8F7',
          light: '#E8F5E9',
        },
        text: {
          primary: '#1B5E20',   // Primary Text (Dark Green)
          secondary: '#424242', // Secondary Text (Dark Gray)
          white: '#FFFFFF',     // White Text
        },
        // Functional Colors
        success: '#4CAF50',
        error: '#F44336',
        warning: '#FF9800',
        info: '#2196F3',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(to right, #6C9A5D, #5a7d5b)',
        'gradient-bg': 'linear-gradient(to bottom, #FDF8F7, #F5F0ED)',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['48px', { lineHeight: '1.2', fontWeight: '700' }],
        'display-md': ['36px', { lineHeight: '1.2', fontWeight: '700' }],
        'heading-1': ['32px', { lineHeight: '1.2', fontWeight: '700' }],
        'heading-2': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'heading-3': ['20px', { lineHeight: '1.3', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '1.5', fontWeight: '400' }],
        'body': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '1.5', fontWeight: '400' }],
      },
      borderRadius: {
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
};

