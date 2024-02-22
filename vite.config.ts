import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import path from "path"

export default defineConfig({
	plugins: [sveltekit()],
	worker: {
		plugins: [sveltekit()],
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	},
	resolve: {
		alias: {
			$lib: path.resolve("./src/lib")
		}
	}
});
