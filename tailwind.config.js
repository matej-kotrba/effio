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
				light_whiter: '#F5F5F5',
				light_grey: '#999999',
				success: '#5cb85c',
				error: '#B00020'
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
				body3: '11px',
				body4: '9px'
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
			},
			maxWidth: {
				xxs: '16rem'
			},
			maxHeight: {
				xxs: '16rem'
			},
			boxShadow: {
				surrounding: '3px 1px 10px 2px var(--light-text-black-20)'
			},
			boxShadowColor: {
				primary: '#6533f053'
			}
		}
	},
	plugins: [require('daisyui')],
	daisyui: {
		styled: true,
		themes: false,
		base: true,
		utils: true,
		logs: true,
		rtl: false,
		prefix: '',
		darkTheme: 'dark'
	}
};
