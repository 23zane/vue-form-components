<template>
	<div
		:class="{ 'text-input--invalid': invalid, 'text-input--hidden': hidden, 'text-input--prefix': prefix }"
		class="text-input"
	>
		<span v-if="prefix" class="text-input__prefix" v-html="prefix"></span>
		<textarea v-bind="$attrs" v-on:input="$emit('input', $event.target.value)">{{ value }}</textarea>
		<label v-if="$attrs.id && label" :for="$attrs.id">
			{{ label }}
		</label>
		<slot></slot>
		<div v-if="invalid" class="input-error">
			{{ errorLabel }}
		</div>
	</div>
</template>

<script lang="ts">
import { defineComponent } from "vue-demi";

export default defineComponent({
	name: "TextAreaInput",
	inheritAttrs: false,
	props: {
		value: {
			required: false,
			type: [String, Number],
		},
		prefix: {
			required: false,
			type: String,
		},
		label: {
			required: false,
			type: String,
		},
		errorLabel: {
			required: false,
			type: String,
			default: "error",
		},
		invalid: {
			required: false,
			type: Boolean,
			default: false,
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
.text-input {
	padding-top: 30px;
	position: relative;
	margin-bottom: 20px;
	opacity: 1;

	&:last-of-type {
		margin-bottom: 0;
	}

	&--hidden {
		display: none;
	}

	input,
	textarea,
	select {
		padding: 10px 12px;
		border-radius: 4px;
		appearance: none;
		transition: all ease 0.3s;
		background: white;
		@apply border-gray-300  border
		@apply border-solid  text-gray-700
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

		&:disabled,
		&[readonly] {
			opacity: 0.5;
			@apply bg-gray-100;
		}
	}

	&__prefix {
		@apply text-gray-700;
		padding: 10px 0;
		position: absolute;
		bottom: 0.125rem;
		left: 0.75rem;
		font-size: 1rem;
	}

	&--prefix input {
		@apply pl-8;
	}

	&--invalid &__prefix {
		bottom: 2rem;
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

	&--date {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-around;

		input:first-of-type,
		select {
			margin-right: 5px;
		}
	}
}
</style>
