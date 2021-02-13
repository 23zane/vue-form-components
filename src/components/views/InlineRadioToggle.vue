<template>
	<div
		:class="{
			'toggle-input--invalid': invalid,
			'toggle-input--hidden': hidden,
			'toggle-input--readonly': $attrs.readonly,
		}"
		class="toggle-input"
	>
		<div class="toggle-input__cont">
			<div v-for="radio in options" class="toggle-input__radio" :key="radio.value">
				<input
					:id="$attrs.id ? $attrs.id + '_' + radio.value : radio.value"
					v-bind="$attrs"
					:checked="isRadioChecked(radio)"
					type="radio"
					v-on:change="$emit('input', radio.value)"
				/>
				<label :for="$attrs.id ? $attrs.id + '_' + radio.value : radio.value">
					{{ radio.title }}
				</label>
			</div>
		</div>
		<div v-if="invalid" class="input-error">
			{{ errorLabel }}
		</div>
		<span class="toggle-input__radio-label">
			{{ label }}
		</span>
	</div>
</template>

<script lang="ts">
import { defineComponent, PropType, toRefs } from "vue-demi";
import {SelectValue} from "@/components/types";

export default defineComponent({
	name: "InlineRadioToggle",
	props: {
		value: {
			required: true,
			type: [String, Number, Boolean],
		},
		label: {
			required: false,
			type: String,
		},
		invalid: {
			required: false,
			type: Boolean,
			default: false,
		},
		errorLabel: {
			type: String,
			required: false,
		},
		options: {
			required: true,
			type: Array as PropType<SelectValue[]>,
		},
		hidden: {
			type: Boolean,
			required: false,
			default: false,
		},
	},
	setup(props) {
		const { value } = toRefs<{
			value: string | number | boolean;
		}>(props);

		const isRadioChecked = (radio: SelectValue) => {
			return value.value === radio.value;
		};

		return {
			isRadioChecked,
		};
	},
});
</script>

<style lang="scss" scoped>
.toggle-input {
	padding-top: 30px;
	position: relative;
	margin-bottom: 20px;
	opacity: 1;
	display: flex;
	align-items: center;

	&:last-of-type {
		margin-bottom: 0;
	}

	&--hidden {
		display: none;
	}

	&--readonly,
	&--disabled {
		opacity: 0.4;
		pointer-events: none;
	}

	&__cont {
		@apply bg-gray-200;
		border-radius: 2.5rem;
		display: flex;
		justify-content: flex-start;
	}

	.input-error {
		margin-top: 10px;
		@apply text-red-400  text-sm
		text-align: left;
	}

	&__radio {
		display: flex;
		flex-direction: row;

		&:nth-child(n + 2) {
			margin-left: -1rem;
		}

		input[type="radio"] {
			appearance: none;
			width: 0;
			height: 0;
			padding: 0;
			margin: 0;

			& + label {
				@apply text-sm  text-gray-600
				@apply font-bold;
				position: relative;
				border-radius: 2rem;
				transition: all ease 0.3s;
				@apply py-2  px-10
				cursor: pointer;
			}

			&:checked + label {
				@apply bg-blue-600  shadow
				color: white;
			}
		}
	}

	&__radio-label {
		@apply text-gray-700  text-base
		position: absolute;
		top: 0;
		left: 0;
	}
}
</style>
