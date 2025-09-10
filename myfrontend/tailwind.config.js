/** @type {import('tailwindcss').Config} */
export default {
	content: [
		'./index.html',
		'./src/**/*.{js,jsx,ts,tsx}',
	],
	theme: {
		extend: {
			colors: {
				infobeans: {
					red: '#b30000',
				},
			},
			boxShadow: {
				card: '0 0.125rem 0.25rem rgba(0,0,0,0.075)',
				cardHover: '0 0.5rem 1rem rgba(0,0,0,0.15)'
			},
			borderRadius: {
				xl: '1rem',
			},
		},
	},
	plugins: [],
}
