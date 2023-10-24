export const themes = {
    font: {
        regular: 'Montserrat',
    },
    light: {
        primary_light: '#0171BC',
        secondary_light: '#244257',
        background_light: '#FFFFFF',
    },
    dark: {
        primary_dark: '#0171BC',
        secondary_dark: '#244257',
        background: '#1F2B33',
    },
};

export const ThemeContext = React.createContext(themes.dark);