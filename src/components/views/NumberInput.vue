<template>
	<div
		:class="{
			'number-input--invalid': invalid,
			'number-input--hidden': hidden,
			'number-input--readonly': $attrs.readonly
		}"
		class="number-input"
	>
		<div class="number-input__cont">
			<a
				:class="{ 'number-input__minus--disabled': !canDecrease }"
				class="number-input__minus"
				href="javascript:;"
				v-on:click="decreaseNumber"
			>
				-
			</a>
			<input v-bind="$attrs" :value="value" type="number" v-on:input="$emit('input', $event.target.value)" />
			<label v-if="$attrs.id && label" :for="$attrs.id">
				{{ label }}
			</label>
			<a
				:class="{ 'number-input__more--disabled': !canIncrease }"
				class="number-input__more"
				href="javascript:;"
				v-on:click="increaseNumber"
			>
				+
			</a>
		</div>

		<div v-if="invalid" class="input-error">
			{{ errorLabel }}
				</div>
		<div v-if="note" class="input-note">
			<note-block :notes="note.title" :text="note.text"></note-block>
		</div>
	</div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, toRefs, watch } from "vue-demi";

import NoteBlock from "../NoteBlock.vue";

export default defineComponent({
	name: "NumberInput",
	components: { NoteBlock },
	props: {
		value: {
			required: true,
			type: [String, Number]
		},
		label: {
			required: false,
			type: String
		},
		invalid: {
			required: false,
			type: Boolean,
			default: false
		},
		errorLabel: {
	required: false,
			type: String,
			default: 'error',
		},
		hidden: {
			type: Boolean,
			required: false,
			default: false
		},
		note: {
			type: Object as PropType<{ title: string; text: string }>,
			required: false
		}
	},
	setup(props, context) {
		const { value: currentValue } = toRefs(props);
		const max: string | null = (context.attrs.max ?? null) as string | null;
		const min: string | null = (context.attrs.min ?? null) as string | null;

		const canIncrease = computed<boolean>(() => {
			return (
				!context.attrs.readonly &&
				!context.attrs.disabled &&
				(max === null || parseInt(currentValue.value.toString()) < parseInt(max))
			);
		});

		const canDecrease = computed<boolean>(() => {
			return (
				!context.attrs.readonly &&
				!context.attrs.disabled &&
				(min === null || parseInt(currentValue.value.toString()) > parseInt(min))
			);
		});

		const increaseNumber = () => {
			if (canIncrease.value) {
				context.emit("input", parseInt(currentValue.value.toString()) + 1);
			}
		};
		const decreaseNumber = () => {
			if (canDecrease.value) {
				context.emit("input", parseInt(currentValue.value.toString()) - 1);
			}
		};

		return {
			increaseNumber,
			decreaseNumber,
			canIncrease,
			canDecrease,
		};
	}
});
</script>

<style lang="scss" scoped>


.number-input {
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

	&__cont {
		display: flex;
		align-items: center;
		justify-content: flex-start;
	}

	&__minus,
	&__more {
		@apply bg-blue-600;
		border-radius: 20px;
@apply text-base  font-medium
		line-height: 1.25rem;
		cursor: pointer;
		color: white;
		width: 1.25rem;
		text-align: center;

		&--disabled {
			opacity: 0.4;
		}
	}

	&__minus {
		@apply mr-4;
		order: -1;
	}

	&__more {
		@apply ml-4;
		order: 2;
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
		@apply text-blue-600;
		width: auto;
		flex: 0 0 auto;
		text-align: center;

		&:focus,
		&:hover {
			@apply border-blue-600;
			outline: none !important;
		}

		& + label {
@apply text-gray-700  text-base
			order: -2;
			@apply mr-2;
			flex: 0 0 auto;

			&:after {
				content: ":";
			}

			display: flex;
			align-items: center;

			> svg {
				@apply ml-2;
				width: 20px;
				height: 20px;
			}
		}

		&[readonly],
		&:disabled {
			opacity: 0.5;
			@apply bg-gray-100;
		}
	}

	.input-error {
		margin-top: 10px;
@apply text-red-400  text-sm
		text-align: left;
	}

	.input-error {
		@apply mt-4;
	}
}
</style>
