<script lang="ts">
	import { onMount } from 'svelte';

	onMount(() => {
		const sealSvgWrapper = document.getElementById('seal__wrapper');
		const sealSvg = document.getElementById('seal');
		const sealLeftEye = document.getElementById('seal__left-eye');
		const sealRightEye = document.getElementById('seal__right-eye');

		const bounceEasing =
			'linear(0, 1 44.7%, 0.898 51.8%, 0.874 55.1%, 0.866 58.4%, 0.888 64.3%, 1 77.4%, 0.98 84.5%, 1)';

		function bounceMustache() {
			function bouncePath(
				id: string,
				paths: { start: string; bounce: string }
			) {
				const el = document.getElementById(id);
				if (!el) return;
				el.animate(
					[
						{ d: `path("${paths.start}")` },
						{ d: `path("${paths.bounce}")` },
						{ d: `path("${paths.start}")` }
					],
					{
						duration: 600,
						iterations: 1,
						easing: bounceEasing
					}
				);
			}

			bouncePath('seal__mustache-upper-left', {
				start: 'M -40 70 Q -250 30, -400 120',
				bounce: 'M -40 70 Q -250 80, -400 0'
			});

			bouncePath('seal__mustache-bottom-left', {
				start: 'M -45 90 Q -200 50, -300 180',
				bounce: 'M -45 90 Q -100 100, -300 120'
			});

			bouncePath('seal__mustache-upper-right', {
				start: 'M 90 70 Q 310 30, 460 120',
				bounce: 'M 90 70 Q 310 80, 460 0'
			});

			bouncePath('seal__mustache-bottom-right', {
				start: 'M 95 90 Q 260 50, 360 180',
				bounce: 'M 95 90 Q 160 100, 360 120'
			});
		}

		function bounceWholeSvg() {
			sealSvgWrapper?.animate(
				[
					{ transform: 'translateY(0px)' },
					{ transform: 'translateY(100px)' },
					{ transform: 'translateY(0px)' }
				],
				{
					duration: 500,
					iterations: 1,
					easing: 'ease-in-out'
				}
			);
		}

		// Add a bounce on click

		sealSvg?.addEventListener('click', () => {
			bounceWholeSvg();
			bounceMustache();
		});

		function moveEyeBasedOnMousePosition(
			eye: HTMLElement,
			mouseX: number,
			mouseY: number
		) {
			const eyeBoundingBox = eye?.getBoundingClientRect();
			const MOVE_STRENGTH = 10;
			const DISTANCE_THRESHOLD = 35;

			const distance = Math.sqrt(
				(mouseX - eyeBoundingBox!.x) ** 2 + (mouseY - eyeBoundingBox!.y) ** 2
			);

			const mouseEyeAngle =
				-Math.atan2(mouseX - eyeBoundingBox!.x, mouseY - eyeBoundingBox!.y) +
				Math.PI / 2;
			const eyeTranslationX = Math.cos(mouseEyeAngle) * MOVE_STRENGTH;
			const eyeTranslationY = Math.sin(mouseEyeAngle) * MOVE_STRENGTH;

			eye!.setAttribute(
				'transform',
				distance < DISTANCE_THRESHOLD
					? 'translate(0, 0)'
					: `translate(${eyeTranslationX}, ${eyeTranslationY})`
			);
		}

		function moveEyesBasedOnMousePosition(mouseX: number, mouseY: number) {
			moveEyeBasedOnMousePosition(sealLeftEye!, mouseX, mouseY);
			moveEyeBasedOnMousePosition(sealRightEye!, mouseX, mouseY);
		}

		const controller = new AbortController();

		window.addEventListener(
			'mousemove',
			(e) => {
				moveEyesBasedOnMousePosition(e.clientX, e.clientY);
			},
			{ signal: controller.signal }
		);

		const interval = setInterval(() => {
			const fin = document.getElementById('seal__fin');
			console.log(fin);
			fin?.animate(
				[
					{ rotate: '0deg' },
					{ rotate: '18deg' },
					{ rotate: '-18deg' },
					{ rotate: '0deg' }
				],
				{ duration: 500, easing: 'ease' }
			);
		}, 2000);

		return () => {
			clearInterval(interval);
			controller.abort();
		};
	});
</script>

<div id="seal__wrapper" style="position: relative;">
	<svg
		id="seal"
		viewBox="0 0 1027 622"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		style="cursor: pointer;"
	>
		<defs>
			<mask id="mouthMask">
				<!-- The mouth shape (white reveals) -->
				<path
					id="seal__mouth__mask"
					d="M 283.5 440 L 343.5 440 A 20 20 0 0 1 283.5 440 Z"
					stroke="black"
					stroke-width="6px"
					fill="white"
				/>
			</mask>
		</defs>
		<g transform="translate(200, 0)">
			<!-- Fin -->
			<g
				transform="translate(95.5, 40)"
				id="seal__fin"
				style="transform-origin: 313.5px 300px;"
			>
				<path
					d="M263.643 5.08806C284.068 2.03839 311.021 1.43251 337.328 2.46599C363.642 3.49976 389.44 6.179 407.573 9.74431C416.598 11.5188 423.899 13.5443 428.417 15.7756C430.611 16.859 432.525 18.167 433.455 19.8312C433.96 20.7357 434.189 21.7754 433.967 22.8693C433.752 23.9255 433.159 24.8215 432.414 25.5666L276.828 181.153H159.224L3.63779 25.5666C2.8928 24.8215 2.29991 23.9254 2.08506 22.8693C1.8626 21.7755 2.09148 20.7357 2.59678 19.8312C3.52671 18.1669 5.44086 16.859 7.63486 15.7756C12.1532 13.5443 19.4536 11.5188 28.4786 9.74431C46.6121 6.17899 72.4095 3.49976 98.7237 2.46599C125.031 1.4325 151.983 2.03841 172.409 5.08806C182.602 6.60985 191.315 8.75995 197.532 11.7004C203.635 14.5867 208.052 18.6038 208.052 24.1525V52.1525C208.052 53.5837 208.562 54.5378 209.311 55.2551C210.115 56.0262 211.278 56.5926 212.611 56.9816C213.799 57.3279 215.011 57.5004 216 57.5842V57.5666L218.025 57.6506L220.052 57.5666V57.5842C221.041 57.5004 222.253 57.3279 223.441 56.9816C224.774 56.5926 225.937 56.0263 226.741 55.2551C227.49 54.5378 228 53.5838 228 52.1525V24.1525C228 18.6038 232.417 14.5867 238.52 11.7004C244.737 8.75992 253.45 6.60986 263.643 5.08806Z"
					fill="#A4C4DB"
				/>
				<path
					d="M263.643 5.08806L263.347 3.10998L263.347 3.10999L263.643 5.08806ZM337.328 2.46599L337.407 0.46753L337.407 0.46753L337.328 2.46599ZM407.573 9.74431L407.959 7.78188L407.959 7.78188L407.573 9.74431ZM428.417 15.7756L429.303 13.9823L429.303 13.9823L428.417 15.7756ZM433.455 19.8312L435.201 18.8558L435.201 18.8556L433.455 19.8312ZM433.967 22.8693L435.927 23.268L435.927 23.2679L433.967 22.8693ZM432.414 25.5666L433.828 26.9808L433.828 26.9808L432.414 25.5666ZM276.828 181.153V183.153H277.657L278.242 182.567L276.828 181.153ZM159.224 181.153L157.81 182.567L158.395 183.153H159.224V181.153ZM3.63779 25.5666L2.22353 26.9807L2.22358 26.9808L3.63779 25.5666ZM2.08506 22.8693L0.125178 23.2679L0.125202 23.268L2.08506 22.8693ZM2.59678 19.8312L0.850836 18.8557L0.850787 18.8558L2.59678 19.8312ZM7.63486 15.7756L6.74931 13.9823L6.7493 13.9823L7.63486 15.7756ZM28.4786 9.74431L28.0928 7.78188L28.0928 7.78188L28.4786 9.74431ZM98.7237 2.46599L98.6452 0.46753L98.6452 0.46753L98.7237 2.46599ZM172.409 5.08806L172.705 3.10999L172.705 3.10998L172.409 5.08806ZM197.532 11.7004L198.387 9.89237L198.387 9.89236L197.532 11.7004ZM208.052 24.1525L210.052 24.1525L210.052 24.1525L208.052 24.1525ZM208.052 52.1525L206.052 52.1525L206.052 52.1526L208.052 52.1525ZM209.311 55.2551L207.927 56.699L207.927 56.6991L209.311 55.2551ZM212.611 56.9816L212.051 58.9016L212.051 58.9016L212.611 56.9816ZM216 57.5842L215.831 59.577L218 59.7606V57.5842H216ZM216 57.5666L216.083 55.5683L214 55.4819V57.5666H216ZM218.025 57.6506L217.943 59.6488L218.025 59.6523L218.108 59.6488L218.025 57.6506ZM220.052 57.5666H222.052V55.482L219.969 55.5683L220.052 57.5666ZM220.052 57.5842H218.052V59.7606L220.221 59.577L220.052 57.5842ZM223.441 56.9816L224 58.9016L224.001 58.9016L223.441 56.9816ZM226.741 55.2551L228.125 56.6991L228.125 56.699L226.741 55.2551ZM228 52.1525L230 52.1526V52.1525H228ZM228 24.1525L226 24.1525V24.1525H228ZM238.52 11.7004L237.665 9.89236L237.665 9.89237L238.52 11.7004ZM263.643 5.08806L263.938 7.06613C284.188 4.04274 311 3.43324 337.25 4.46445L337.328 2.46599L337.407 0.46753C311.041 -0.568226 283.949 0.0340428 263.347 3.10998L263.643 5.08806ZM337.328 2.46599L337.25 4.46445C363.5 5.49569 389.188 8.16767 407.187 11.7067L407.573 9.74431L407.959 7.78188C389.692 4.19033 363.785 1.50383 337.407 0.46753L337.328 2.46599ZM407.573 9.74431L407.187 11.7067C416.187 13.4762 423.266 15.4624 427.532 17.5688L428.417 15.7756L429.303 13.9823C424.532 11.6263 417.009 9.56129 407.959 7.78188L407.573 9.74431ZM428.417 15.7756L427.532 17.5688C429.662 18.621 431.093 19.7047 431.709 20.8068L433.455 19.8312L435.201 18.8556C433.957 16.6292 431.56 15.097 429.303 13.9823L428.417 15.7756ZM433.455 19.8312L431.709 20.8067C432.017 21.3582 432.12 21.9136 432.007 22.4707L433.967 22.8693L435.927 23.2679C436.258 21.6372 435.904 20.1131 435.201 18.8558L433.455 19.8312ZM433.967 22.8693L432.007 22.4706C431.894 23.0279 431.563 23.5892 431 24.1524L432.414 25.5666L433.828 26.9808C434.755 26.0539 435.61 24.8231 435.927 23.268L433.967 22.8693ZM432.414 25.5666L431 24.1524L275.414 179.738L276.828 181.153L278.242 182.567L433.828 26.9808L432.414 25.5666ZM276.828 181.153V179.153H159.224V181.153V183.153H276.828V181.153ZM159.224 181.153L160.638 179.738L5.05201 24.1524L3.63779 25.5666L2.22358 26.9808L157.81 182.567L159.224 181.153ZM3.63779 25.5666L5.05205 24.1524C4.48885 23.5892 4.15828 23.0279 4.04492 22.4706L2.08506 22.8693L0.125202 23.268C0.441543 24.823 1.29675 26.0539 2.22353 26.9807L3.63779 25.5666ZM2.08506 22.8693L4.04494 22.4707C3.93165 21.9136 4.03465 21.3582 4.34277 20.8067L2.59678 19.8312L0.850787 18.8558C0.148321 20.1131 -0.206439 21.6373 0.125178 23.2679L2.08506 22.8693ZM2.59678 19.8312L4.34272 20.8068C4.95852 19.7047 6.38966 18.621 8.52042 17.5688L7.63486 15.7756L6.7493 13.9823C4.49206 15.097 2.0949 16.6292 0.850836 18.8557L2.59678 19.8312ZM7.63486 15.7756L8.52042 17.5688C12.7861 15.4623 19.8647 13.4762 28.8645 11.7067L28.4786 9.74431L28.0928 7.78188C19.0425 9.56131 11.5202 11.6263 6.74931 13.9823L7.63486 15.7756ZM28.4786 9.74431L28.8645 11.7067C46.8644 8.16766 72.5523 5.49569 98.8022 4.46445L98.7237 2.46599L98.6452 0.46753C72.2666 1.50383 46.3597 4.19032 28.0928 7.78188L28.4786 9.74431ZM98.7237 2.46599L98.8022 4.46445C125.052 3.43323 151.864 4.04276 172.114 7.06613L172.409 5.08806L172.705 3.10998C152.103 0.0340578 125.011 -0.56823 98.6452 0.46753L98.7237 2.46599ZM172.409 5.08806L172.114 7.06613C182.239 8.57785 190.724 10.6929 196.677 13.5084L197.532 11.7004L198.387 9.89236C191.906 6.82696 182.964 4.64185 172.705 3.10999L172.409 5.08806ZM197.532 11.7004L196.677 13.5084C202.636 16.3267 206.052 19.844 206.052 24.1525L208.052 24.1525L210.052 24.1525C210.052 17.3635 204.634 12.8468 198.387 9.89237L197.532 11.7004ZM208.052 24.1525H206.052V52.1525H208.052H210.052V24.1525H208.052ZM208.052 52.1525L206.052 52.1526C206.052 54.1516 206.802 55.6205 207.927 56.699L209.311 55.2551L210.695 53.8111C210.323 53.455 210.052 53.0158 210.052 52.1524L208.052 52.1525ZM209.311 55.2551L207.927 56.6991C209.052 57.7772 210.552 58.4642 212.051 58.9016L212.611 56.9816L213.172 55.0616C212.003 54.7209 211.179 54.2753 210.694 53.811L209.311 55.2551ZM212.611 56.9816L212.051 58.9016C213.407 59.2969 214.76 59.4863 215.831 59.577L216 57.5842L216.169 55.5913C215.263 55.5146 214.19 55.3588 213.171 55.0616L212.611 56.9816ZM216 57.5842H218V57.5666H216H214V57.5842H216ZM216 57.5666L215.917 59.5649L217.943 59.6488L218.025 57.6506L218.108 55.6523L216.083 55.5683L216 57.5666ZM218.025 57.6506L218.108 59.6488L220.135 59.5649L220.052 57.5666L219.969 55.5683L217.943 55.6523L218.025 57.6506ZM220.052 57.5666H218.052V57.5842H220.052H222.052V57.5666H220.052ZM220.052 57.5842L220.221 59.577C221.292 59.4863 222.645 59.2969 224 58.9016L223.441 56.9816L222.881 55.0616C221.861 55.3588 220.789 55.5146 219.883 55.5913L220.052 57.5842ZM223.441 56.9816L224.001 58.9016C225.5 58.4642 227 57.7772 228.125 56.6991L226.741 55.2551L225.358 53.811C224.873 54.2753 224.049 54.7209 222.88 55.0616L223.441 56.9816ZM226.741 55.2551L228.125 56.699C229.251 55.6205 230 54.1517 230 52.1526L228 52.1525L226 52.1524C226 53.0159 225.729 53.455 225.358 53.8111L226.741 55.2551ZM228 52.1525H230V24.1525H228H226V52.1525H228ZM228 24.1525L230 24.1525C230 19.844 233.416 16.3267 239.375 13.5084L238.52 11.7004L237.665 9.89237C231.418 12.8468 226 17.3635 226 24.1525L228 24.1525ZM238.52 11.7004L239.375 13.5084C245.328 10.6929 253.813 8.57786 263.938 7.06613L263.643 5.08806L263.347 3.10999C253.087 4.64186 244.146 6.82692 237.665 9.89236L238.52 11.7004Z"
					fill="black"
				/>
			</g>
			<g transform="translate(0, 140)">
				<!-- Head -->
				<path
					d="M623 310.5C587 482 483.985 482 312.5 482C141.016 482 29.0002 482 2.00015 310.5C-17 132.5 141.016 0 312.5 0C483.985 0 653.5 141 623 310.5Z"
					fill="#ABC3CD"
				/>
				<!-- Head shadow -->
				<path
					transform="translate(84, 20)"
					d="M228.987 0C320.309 7.65767e-05 411.03 42.966 466.652 109.29C403.909 57.3129 316.138 25 227.868 25C142.672 25 60.6443 53.2872 0 101.066C54.8337 38.3718 139.961 1.15539e-05 228.987 0Z"
					fill="#BDD1D9"
				/>
				<!-- Eye balls -->
				<circle fill="black" r="29" cx="200" cy="200" />
				<circle fill="black" r="29" cx="427" cy="200" />
				<!-- Eye white stuff -->
				<!-- Diff 10 -->
				<circle
					id="seal__left-eye"
					fill="white"
					r="8"
					cx="200"
					cy="200"
					style="transition: 50ms;"
				/>
				<circle
					id="seal__right-eye"
					fill="white"
					r="8"
					cx="427"
					cy="200"
					style="transition: 50ms;"
				/>
				<g transform="translate(0, -50)">
					<path
						id="seal__mouth"
						d="M 283.5 440 L 343.5 440 A 20 20 0 0 1 283.5 440 Z"
						stroke="black"
						stroke-width="6px"
						fill="#6e1221"
					/>
					<g mask="url(#mouthMask)">
						<ellipse cx="313.5" cy="460" rx="20" ry="8" fill="red" />
					</g>
				</g>
				<!-- Nose -->
				<g transform="translate(288.5, 275)">
					<!-- Cheeks -->
					<g transform="translate(-35, 70)">
						<circle fill="white" r="40" cx="20" cy="20" />
						<circle fill="black" r="4" cx="10" />
						<circle fill="black" r="4" cx="20" cy="10" />
						<circle fill="black" r="4" cx="10" cy="20" />
					</g>
					<g transform="translate(45, 70)">
						<circle fill="white" r="40" cx="20" cy="20" />
						<circle fill="black" r="4" cx="30" />
						<circle fill="black" r="4" cx="20" cy="10" />
						<circle fill="black" r="4" cx="30" cy="20" />
					</g>
					<ellipse fill="black" cx="25" cy="40" rx="60" ry="25" />
					<path
						transform="translate(8.5, 61)"
						d="M1.5 1.5C-7.28048 0.0612342 38.3181 0.948945 31 1.90823C23.682 2.86751 24.0001 35.0002 24.0001 35.0002H9.00005C9.00005 35.0002 10.2805 2.93877 1.5 1.5Z"
						fill="black"
					/>
					<circle
						fill="none"
						cx="-15"
						cy="90"
						r="40"
						stroke="black"
						stroke-width="14"
						stroke-linecap="round"
						pathLength="100"
						stroke-dasharray="100"
						stroke-dashoffset="60"
					/>
					<circle
						transform="scale(-1, 1)"
						fill="none"
						cx="-65"
						cy="90"
						r="40"
						stroke="black"
						stroke-width="14"
						stroke-linecap="round"
						pathLength="100"
						stroke-dasharray="100"
						stroke-dashoffset="60"
					/>
					<!-- Mustache -->
					<!-- Left -->
					<path
						id="seal__mustache-upper-left"
						d="M -40 70 Q -250 30, -400 120"
						fill="none"
						stroke="black"
						stroke-width="8"
						stroke-linecap="round"
					/>
					<path
						id="seal__mustache-bottom-left"
						d="M -45 90 Q -200 50, -300 180"
						fill="none"
						stroke="black"
						stroke-width="8"
						stroke-linecap="round"
					/>
					<!-- Right -->
					<path
						id="seal__mustache-upper-right"
						d="M 90 70 Q 310 30, 460 120"
						fill="none"
						stroke="black"
						stroke-width="8"
						stroke-linecap="round"
					/>
					<path
						id="seal__mustache-bottom-right"
						d="M 95 90 Q 260 50, 360 180"
						fill="none"
						stroke="black"
						stroke-width="8"
						stroke-linecap="round"
					/>
				</g>
				<!-- Chin -->
				<path
					transform="translate(75.5, 395)"
					d="M476.001 0C434.017 76.6792 354.875 76.6797 237.924 76.6797C123.821 76.6797 40.9779 76.6793 0 5.46777C48.1943 57.3062 129.88 57.3066 237.381 57.3066C348.535 57.3066 427.914 57.306 476.001 0Z"
					fill="#9BAFC0"
				/>
			</g>
		</g>
	</svg>
</div>

<style>
	#seal #seal__mouth {
		transform: scaleY(0.01);
		transform-origin: 313.5px 440px;
		transition: 200ms;
	}

	#seal #seal__mouth__mask {
		transform: scaleY(0.01);
		transform-origin: 313.5px 440px;
		transition: 200ms;
	}

	#seal:hover #seal__mouth {
		transform: scaleY(1);
	}

	#seal:hover #seal__mouth__mask {
		transform: scaleY(1);
	}
</style>
