<template>
	<div :class="{ 'file-input-uploaded': value != null, 'file-input--hidden': hidden }" class="file-input">
		<h3 class="file-input__title">
			{{ label }}
		</h3>
		<div class="file-input__cont">
			<template v-if="value == null">
				<input
					:id="$attrs.id ? $attrs.id : name"
					v-bind="$attrs"
					:name="name"
					accept="image/*"
					required
					type="file"
					value=""
					v-on:change="$emit('input', $event.target.files.length > 0 ? $event.target.files[0] : null)"
				/>
				<label :for="$attrs.id ? $attrs.id : name">
					<span>
						{{ __("privacy_pmc.step[2].upload_new") }}
					</span>
					<camera-icon/>
				</label>
			</template>

			<template v-else>
				<div class="file-uploaded">
					<div class="file-uploaded__preview">
						<img :src="preview" />
					</div>
					<div class="file-uploaded__change">
						<span class="file-uploaded__change-text">
							{{ __("privacy_pmc.step[2].load_new") }}: {{ value.name }}
						</span>
						<input
							:id="$attrs.id ? $attrs.id : name"
							v-bind="$attrs"
							:name="name"
							accept="image/*"
							type="file"
							value=""
							v-on:change="$emit('input', $event.target.files.length > 0 ? $event.target.files[0] : null)"
						/>
						<label :for="$attrs.id ? $attrs.id : name">
							<span>{{ __("privacy_pmc.step[2].edit") }}</span>
						</label>
					</div>
				</div>
			</template>
		</div>
		<div v-if="invalid" class="input-error">
			{{ errorLabel }}
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from "vue-demi";
import CameraIcon from "../../assets/svg/camera.svg";

export default defineComponent({
	name: "SingleFileInput",
	components: {
		CameraIcon,
	},
	inheritAttrs: false,
	props: {
		value: {
			required: true,
		},
		label: {
			required: false,
			type: String,
		},
		preview: {
			type: String,
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		invalid: {
			required: false,
			type: Boolean,
			default: false,
		},
		errorLabel: {
			required: false,
			type: String,
			default: "error",
		},
		hidden: {
			type: Boolean,
			required: false,
			default: false,
		},
	},
});
</script>

<style lang="scss" scoped>
.file-input {
	margin-bottom: 30px;

	&--hidden {
		display: none;
	}

	&__title {
		@apply text-base  text-gray-700
		margin-bottom: 15px;

		&--bottom {
			margin-bottom: 0;
		}
	}

	&__subtitle {
		margin-top: 5px;
		margin-bottom: 15px;
		@apply text-gray-600  text-xs
		@apply font-bold;
	}

	&-loader {
		display: flex;
		flex-direction: row;
		align-items: stretch;
	}

	input[type="file"] {
		appearance: none;
		height: 0;
		width: 0;
		visibility: hidden;

		& + label {
			@apply border-gray-500  border
			@apply border-dashed  text-blue-600
			@apply text-xs;
			padding: 30px;

			width: 100%;
			display: flex;
			justify-content: center;
			align-items: center;
			cursor: pointer;

			svg {
				width: 20px;
				height: 20px;
				margin-left: 10px;
			}
		}
	}
}

.file-uploaded {
	display: flex;
	flex-direction: row;
	align-items: flex-start;
	margin-bottom: 15px;

	&:last-child {
		margin-bottom: 0;
	}

	&__preview {
		min-height: 100px;
		width: 150px;
		text-align: center;
		max-width: 300px;
		margin-right: 30px;

		img {
			max-width: 100%;
			max-height: 100%;
			margin: 0 auto;
		}
	}

	&__remove {
		margin-top: 15px;
		@apply bg-gray-100;
		border-radius: 4px;
		padding: 11px 16px;
		@apply text-sm  font-bold
		cursor: pointer;
		display: flex;
		flex-direction: row;
		align-items: center;
		@apply text-gray-700;

		svg {
			width: 20px;
			height: 20px;
			margin-right: 8px;
		}
	}

	&__change {
		display: flex;
		flex-direction: column;
		justify-content: flex-start;

		input[type="file"] {
			appearance: none;
			height: 0;
			width: 0;
			visibility: hidden;

			& + label {
				@apply text-blue-600;
				cursor: pointer;
				width: auto;
				@apply text-sm  font-bold
				border: none;
				padding: 0;
				margin-top: 10px;
				display: block;
			}
		}
	}

	&__change-text {
		@apply text-xs  text-gray-700
		@apply font-bold;
		max-width: 200px;
		text-overflow: ellipsis;
		overflow-x: hidden;
		white-space: nowrap;
	}
}
</style>
