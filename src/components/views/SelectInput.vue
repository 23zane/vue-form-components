<template>
	<div
		:class="{
			'select-input--invalid': invalid,
			'select-input--hidden': hidden,
			'select-input--readonly': $attrs.readonly,
		}"
		class="select-input"
	>
		<select v-bind="$attrs" :value="value" v-on:input="$emit('input', $event.target.value)">
			<option v-if="$attrs.placeholder" value="">
				{{ $attrs.placeholder }}
			</option>
			<option v-for="option in options" :selected="value === option.value" :value="option.value" :key="option.value">
				{{ option.title }}
			</option>
		</select>
		<label v-if="$attrs.id && label" :for="$attrs.id">
			{{ label }}
		</label>
		<div v-if="invalid" class="input-error">
			{{ errorLabel }}
				</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue-demi";
import { SelectValue } from "../types";

export default defineComponent({
	name: "SelectInput",
	inheritAttrs: false,
	props: {
		value: {
			required: true,
			type: [String, Number],
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
	required: false,
			type: String,
			default: 'error',
		},
		options: {
			required: true,
			type: Array as PropType<SelectValue[]>,
		},
		searchable: {
			type: Boolean,
			default: false,
			required: false,
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
.select-input {
	padding-top: 30px;
	position: relative;
	margin-bottom: 20px;
	opacity: 1;

	&--hidden {
		display: none;
	}

	&--readonly {
		opacity: 0.4;
		pointer-events: none;
	}

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
		@apply border-gray-300 border border-solid text-gray-700;
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
			@apply text-gray-700 text-sm;
			position: absolute;
			top: 5px;
			left: 0;
		}

		&:disabled,
		&[readonly] {
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
		@apply text-red-400  text-sm;
		text-align: left;
	}
}
</style>
