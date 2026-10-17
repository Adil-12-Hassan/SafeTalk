export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    theme: {
        extend: {
            colors: {
                primary: '#005C4B',
                secondary: '#128C7E',
                bubble: {
                    out: '#005C4B',
                    in: '#1F2C34'
                },
                dark: {
                    bg: '#111B21',
                    sidebar: '#202C33',
                    hover: '#2A3942',
                    border: '#2A3942'
                }
            }
        }
    },
    plugins: []
}