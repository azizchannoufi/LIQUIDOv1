// Centralized Tailwind CSS Configuration for LIQUIDO
tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#F8ED70",
                "primary-light": "#FFD700",
                "background-light": "#333333",
                "background-dark": "#000000",
                "background-white": "#FFFFFF",
                "charcoal": "#333333",
                "dark-gray": "#2D2D2D",
                "surface-light": "#F5F5F5",
                "surface-alt": "#E5E5E5",
            },
            fontFamily: {
                "display": ["Plus Jakarta Sans", "sans-serif"]
            },
            borderRadius: {
                "DEFAULT": "0.125rem",
                "lg": "0.25rem",
                "xl": "0.5rem",
                "full": "9999px"
            },
        },
    },
}
