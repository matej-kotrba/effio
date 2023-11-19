/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				light_primary: '#6433F0',
				light_primary_transparent: '#6433F025',
				light_primary_dark: '#5521e4',
				light_secondary: '#646FD4',
				light_terciary: '#8677ff',
				light_quaternary: '#DBDFFD',
				light_text_black: '#343540',
				light_text_black_80: '#343540cc',
				light_text_black_60: '#34354099',
				light_text_black_40: '#34354066',
				light_text_black_20: '#34354033',
				light_text_black_10: '#34354015',
				light_transparent_blue: '#242f9b26',
				light_white: '#EFEFEF',
				light_whiter: '#F5F5F5',
				light_grey: '#e7e5e4',
				light_grey_dark: '#cccccc',

				dark_primary: '#0092CA',
				dark_primary_light: '#393E46',
				dark_secondary: '#0e3979',
				dark_terciary: '#393E46',
				dark_quaternary: '#222831',
				dark_text_white: '#F3F3F3',
				dark_text_white_80: '#F3F3F3cc',
				dark_text_white_60: '#F3F3F399',
				dark_text_white_40: '#F3F3F366',
				dark_text_white_20: '#F3F3F333',
				dark_text_white_10: '#F3F3F315',
				dark_light_grey: '#292929',
				dark_grey: '#1f1f1f',
				dark_black: '#111111',
				dark_blacker: '#000000',

				success: '#5cb85c',
				error: '#B00020',
				dark_error: '#e12345',
				warning: '#fbbd23',

				correct: '#5cb85c',
				dark_correct: '#4a9d4a',
				incorrect: '#b00020',
				dark_incorrect: '#a0001f'
			},
			fontSize: {
				h1: '45px',
				h2: '36px',
				h3: '33px',
				h4: '28px',
				h5: '24px',
				h6: '20px',
				body1: '18px',
				body2: '14px',
				body3: '11px',
				body4: '9px',
				semiBody1: '16px'
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
				primary: '#6533f043',
				dark_primary: '#0092ca43'
			},
			dropShadow: {
				primary: '0 0 6px var(--light-primary-transparent)',
				primary_dark: '0 0 6px var(--dark-primary-transparent)'
			},
			screens: {
				xs: '420px'
			},
			keyframes: {
				fly_x: {
					'0%': {
						transform: 'translateX(-200%)',
						opacity: 0
					},
					'100%': {
						transform: 'translateX(0)',
						opacity: 1
					}
				},
				fly_x_reversed: {
					'0%': {
						transform: 'translateX(200%)',
						opacity: 0
					},
					'100%': {
						transform: 'translateX(0)',
						opacity: 1
					}
				}
			},
			animation: {
				fly_x: 'fly_x 0.8s ease-out',
				fly_x_reversed: 'fly_x_reversed 0.8s ease-out'
			}
		}
	},
	darkMode: 'class',
	plugins: [require('daisyui'), require('@tailwindcss/container-queries')],
	daisyui: {
		styled: true,
		themes: [
			{
				effio: {
					primary: '#6433f0',
					secondary: '#d926a9',
					accent: '#0092ca',
					neutral: '#2a323c',
					'base-100': '#f5f5f5',
					info: '#3abff8',
					success: '#36d399',
					warning: '#fbbd23',
					error: '#B00020'
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
