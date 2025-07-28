/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./src/**/*.{html,js,ts,jsx,tsx}'],
  theme: {
    container: {
      center: true,
    },
    extend: {
      fontFamily: {
        'sans': ['Manrope', 'system-ui', '-apple-system', 'sans-serif'], // Manrope as primary per Figma
        'brand': ['Manrope', 'system-ui', '-apple-system', 'sans-serif'], // Manrope for brand elements
        'manrope': ['Manrope', 'system-ui', '-apple-system', 'sans-serif'],
        'montserrat': ['Manrope', 'system-ui', '-apple-system', 'sans-serif'],
        'satoshi': ['Satoshi', 'system-ui', '-apple-system', 'sans-serif'], // Satoshi for hero section
      },
      colors: {
        // Figma Design System Colors
        figma: {
          'primary': '#143197',      // Primary Blue
          'secondary': '#EB5857',    // Secondary Red  
          'success': '#1FBB65',      // Success Green
          'warning': '#FFE81A',      // Warning Yellow
          'info': '#57C7EB',         // Info Blue
          'purple': '#6941C6',       // Purple
          'orange': '#FF9772',       // Orange
          'black': '#000000',
          'gray-dark': '#434242',
          'gray-medium': '#454343',
          'gray': '#5F5F5F',
          'gray-light': '#ADADAD',
          'gray-lighter': '#C9C9C9',
          'gray-border': '#E9E9E9',
          'gray-bg': '#F1F1F1',
          'gray-bg-light': '#F6F6F6',
          'white': '#FFFFFF',
        },
        // Updated Krushr Brand Colors (Figma-aligned)
        krushr: {
          'primary': '#143197',      // Updated to Figma primary blue
          'secondary': '#EB5857',    // Updated to Figma secondary red
          'blue': '#143197',         // Figma primary blue
          'red': '#EB5857',          // Figma secondary red
          'gray': '#5F5F5F',         // Figma gray
          'success': '#1FBB65',      // Figma success green
          'warning': '#FF9772',      // Figma warning orange
          'info': '#57C7EB',         // Figma info blue
          'purple': '#6941C6',       // Figma purple
          'orange': '#FF9772',       // Figma orange
          'coral-red': '#EB5857',    // Accent color for badges and highlights
          
          // Priority Colors (from brandkit)
          'priority-low': '#10b981',      // Green for low priority
          'priority-medium': '#f59e0b',   // Orange for medium priority  
          'priority-high': '#ef4444',     // Red for high priority
          'priority-critical': '#dc2626', // Dark red for critical priority
          
          // Task Status Colors (from brandkit)
          'task-todo': '#6b7280',         // Gray for todo tasks
          'task-progress': '#3b82f6',     // Blue for in-progress
          'task-review': '#8b5cf6',       // Purple for review
          'task-done': '#10b981',         // Green for completed
          
          // Panel Colors (from brandkit)
          'panel-bg': '#ffffff',          // Panel background
          'panel-border': '#e5e7eb',      // Panel border
          'sidebar-bg': '#f8fafc',        // Sidebar background
          
          // Extended Color Palette (from brandkit)
          'primary-50': '#f0f3ff',
          'primary-100': '#e1e8ff', 
          'primary-200': '#c9d6ff',
          'primary-600': '#143197',
          'primary-700': '#3f4bdb',
          'secondary-50': '#fdf2f2',
          'secondary-600': '#e74c3c',
          'success-50': '#f0fdf4',
          'success-600': '#1FBB65',
          'warning-50': '#fefce8',
          'info-600': '#0284c7',
          
          // Brandkit Gray Palette
          'black': '#000000',
          'gray-900': '#111827',
          'gray-800': '#1f2937', 
          'gray-700': '#374151',
          'gray-dark': '#434242',
          'gray-600': '#4b5563',
          'gray-medium': '#454343',
          'gray-500': '#6b7280',
          'gray': '#5F5F5F',
          'gray-400': '#9ca3af',
          'gray-light': '#ADADAD',
          'gray-300': '#d1d5db',
          'gray-lighter': '#C9C9C9',
          'gray-200': '#e5e7eb',
          'gray-border': '#E9E9E9',
          'gray-100': '#f3f4f6',
          'gray-bg': '#F1F1F1',
          'gray-50': '#f9fafb',
          'gray-bg-light': '#F6F6F6',
          'white': '#FFFFFF',
          
          // Legacy aliases for backward compatibility
          'light-blue': '#57C7EB',
          'aqua': '#1FBB65',
          'medium-blue': '#143197',
        },
        // Design System Colors (shadcn/ui compatible)
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          icon: 'hsl(var(--sidebar-icon))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
        'fade-in': {
          from: {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.5s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
