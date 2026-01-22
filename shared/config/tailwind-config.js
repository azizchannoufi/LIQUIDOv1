// Centralized Tailwind CSS Configuration for LIQUIDO
tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#F8ED70",
                "background-light": "#333333",
                "background-dark": "#000000",
                "charcoal": "#333333",
                "dark-gray": "#2D2D2D",
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
