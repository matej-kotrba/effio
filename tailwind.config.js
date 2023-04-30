/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				light_primary: '#6433F0',
				light_secondary: '#646FD4',
				light_terciary: '#9BA3EB',
				light_quaternary: '#DBDFFD',
				light_text_black: '#343540',
				light_text_black_80: '#343540cc',
				light_text_black_60: '#34354099',
				light_text_black_40: '#34354066',
				light_text_black_20: '#34354033',
				light_transparent_blue: '#242f9b26',
				light_white: '#EFEFEF',
				light_grey: '#999999',
				success: '#5cb85c'
			},
			fontSize: {
				h1: '85px',
				h2: '55px',
				h3: '44px',
				h4: '35px',
				h5: '28px',
				h6: '23px',
				body1: '18px',
				body2: '14px',
				body3: '11px'
			},
			fontWeight: {
				thicker: 700,
				thick: 600,
				normal: 400,
				light: 300
			},
			fontFamily: {
				primary: ['"Poppins"', 'sans-serif']
			},
			borderRadius: {
				'4xl': '32px'
			}
		}
	},
	plugins: []
};
