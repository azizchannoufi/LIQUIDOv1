// Centralized Tailwind CSS Configuration for LIQUIDO
tailwind.config = {
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#F2EA7E",
                "background-light": "#1a1a1a",
                "background-dark": "#0A0A0A",
                "charcoal": "#121212",
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
