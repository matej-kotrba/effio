/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				primary: {
					light_primary: '#6433F0',
					light_secondary: '#646FD4',
					light_terciary: '#9BA3EB',
					light_quaternary: '#DBDFFD',
					light_text_black: '#343540',
					light_text_black_80: '#343540cc',
					light_text_black_60: '#34354099',
					light_text_black_40: '#34354066',
					light_text_black_20: '#34354033',
					light_white: '#EFEFEF'
				}
			}
		}
	},
	plugins: []
};
