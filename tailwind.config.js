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
				h1: '65px',
				h2: '45px',
				h3: '36px',
				h4: '28px',
				h5: '24px',
				h6: '20px',
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
			},
			screens: {
				xs: '420px'
			}
		}
	},
	plugins: [require('daisyui')],
	daisyui: {
		styled: true,
		themes: [
			{
				mytheme: {
					primary: '#6433f0',

					secondary: '#d926a9',

					accent: '#1fb2a6',

					neutral: '#2a323c',

					'base-100': '#f5f5f5',

					info: '#3abff8',

					success: '#36d399',

					warning: '#fbbd23',

					error: '#f87272'
				}
			}
		],
		base: false,
		utils: true,
		logs: false,
		rtl: false,
		prefix: '',
		darkTheme: 'dark'
	}
};
