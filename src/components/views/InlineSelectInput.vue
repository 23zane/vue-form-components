<template>
	<div :class="{ 'inline-select--invalid': invalid, 'inline-select--hidden': hidden }" class="inline-select">
		<div class="inline-select__cont">
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
		</div>

		<div v-if="invalid" class="input-error">
			{{ errorLabel }}
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue-demi";
import {SelectValue} from "@/components/types";

export default defineComponent({
	name: "InlineSelectInput",
	components: { },
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
			default: "error",
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
	}
});
</script>

<style lang="scss" scoped>
.inline-select {
	padding-top: 30px;
	position: relative;
	margin-bottom: 20px;
	opacity: 1;

	&--hidden {
		display: none;
	}

	&__cont {
		display: flex;
		align-items: center;
	}

	&:last-of-type {
		margin-bottom: 0;
	}

	input,
	textarea,
	select {
		border-radius: 4px;
		appearance: none;
		transition: all ease 0.3s;
		background-color: white;
		@apply text-blue-600;
		width: auto;
		flex: 0 0 auto;

		&:focus,
		&:hover {
			@apply border-blue-600;
			outline: none !important;
		}

		& + label {
			@apply text-gray-700  text-base
			order: -1;

			&:after {
				content: ":";
			}

			display: flex;
			align-items: center;
			flex: 0 0 auto;
			@apply mr-2;
		}

		&:disabled {
			opacity: 0.5;
			@apply bg-gray-100;
		}

		background-image: url("/svg/cheveron-down-blue.svg");
		background-position: calc(100% - 15px) center;
		background-size: 12px;
		background-repeat: no-repeat;
		padding: 10px 35px 10px 12px;
	}

	.input-error {
		margin-top: 10px;
		@apply text-red-400  text-sm
		text-align: left;
	}
}
</style>
