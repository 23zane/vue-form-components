<template>
	<div :class="{ 'radio-input--invalid': invalid, 'radio-input--hidden': hidden }" class="radio-input">
		<div v-for="radio in options" class="radio-input__radio" :key="radio.value">
			<input
				:id="$attrs.id ? $attrs.id + '_' + radio.value : radio.value"
				v-bind="$attrs"
				:checked="value === radio.value"
				required
				type="radio"
				v-on:change="$emit('input', radio.value)"
			/>
			<label :for="$attrs.id ? $attrs.id + '_' + radio.value : radio.value">
				{{ radio.title }}
			</label>
		</div>
		<div v-if="invalid" class="input-error">
			{{ errorLabel }}
		</div>
		<span class="radio-input__radio-label">
			{{ label }}
		</span>
	</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue-demi";
import { SelectValue } from "@/components/types";

export default defineComponent({
	name: "InlineRadioInput",
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
});
</script>

<style lang="scss" scoped>
.radio-input {
	padding-top: 30px;
	position: relative;
	margin-bottom: 20px;
	opacity: 1;
	display: flex;
	align-items: center;

	&:last-of-type {
		margin-bottom: 0;
	}

	input,
	textarea,
	select {
		padding: 10px 12px;
		border-radius: 4px;
		appearance: none;
		transition: all ease 0.3s;
		background: white;
		@apply border-gray-300  border border-solid  text-gray-700;
		width: 100%;

		&:focus,
		&:hover {
			@apply border-blue-600;
			outline: none !important;

			& + label {
				@apply text-blue-600;
			}
		}

		& + label {
			@apply text-gray-700  text-sm
			position: absolute;
			top: 5px;
			left: 0;
		}

		&:disabled {
			opacity: 0.5;
			@apply bg-gray-100;
		}
	}

	select {
		background-image: url("/svg/icon-down.svg");
		background-position: calc(100% - 15px) center;
		background-size: 12px;
		background-repeat: no-repeat;
		padding-right: 35px;
	}

	.input-error {
		margin-top: 10px;
		@apply text-red-400  text-sm
		text-align: left;
	}

	&__radio {
		display: flex;
		flex-direction: row;
		margin-right: 20px;

		input[type="radio"] {
			appearance: none;
			width: 0;
			height: 0;
			padding: 0;
			margin: 0;

			& + label {
				@apply text-sm  text-gray-600 font-bold;
				padding-left: 25px;
				position: relative;

				&:before {
					transition: all ease 0.3s;
					content: "";
					left: 0;
					top: 50%;
					transform: translateY(-50%);
					height: 18px;
					width: 18px;
					@apply border-gray-400  border-2 border-solid;
					border-radius: 50%;
					margin-right: 10px;
					position: absolute;
				}

				&:after {
					transition: all ease 0.3s;
					position: absolute;
					content: "";
					top: 50%;
					left: 7px;
					height: 4px;
					width: 4px;
					border-radius: 50%;
					transform: translateY(-50%);
					background: white;
				}
			}

			&:checked + label {
				&:before {
					@apply border-blue-500  bg-blue-500;
				}
			}
		}
	}

	&__radio-label {
		@apply text-gray-700  text-sm
		position: absolute;
		top: 5px;
		left: 0;
	}
}
</style>
