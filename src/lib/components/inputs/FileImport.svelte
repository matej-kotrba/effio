<div
	class="relative w-full p-5 duration-300 rounded-xl shadow-surrounding max-w-xxs aspect-square box"
>
	<div>
		<h4 class="text-center text-h6 text-light_text_black">Import file</h4>
		<div class="grid place-content-center">
			<img
				src={'/imgs/svgs/import.svg'}
				alt="Tempalte"
				class="object-cover"
				width="150"
			/>
		</div>
	</div>
	<input
		on:dragover={() => console.log('asdasd')}
		type="file"
		class="absolute w-full h-full input-styled"
	/>
</div>

<style>
	.box {
		display: grid;
		grid-template-rows: auto 1fr;
	}

	.input-styled {
		color: transparent;
		cursor: pointer;
		background-color: transparent;
	}

	.input-styled::-webkit-file-upload-button {
		display: none;
	}
</style>
