<template>
	<div :class="{ 'inline-select--invalid': invalid, 'inline-select--hidden': hidden }" class="inline-select">
		<div class="inline-select__cont">
			<select v-bind="$attrs" :value="value" v-on:input="$emit('input', $event.target.fin)">
				<option v-if="$attrs.placeholder" value="">
					{{ $attrs.placeholder }}
				</option>
				<option
					v-for="option in options"
					:key="option.value"
					:disabled="option.disabled"
					:selected="value === option.value"
					:value="option.value"
				>
					{{ option.title }}
				</option>
			</select>
			<label v-if="$attrs.id && label" :for="$attrs.id">
				{{ label }}
			</label>
			<div class="inline-select__options">
				<a
					v-for="option in options"
					:key="option.value"
					:class="{
						'inline-select__option--selected': isSelected(option),
						'inline-select__option--disabled': option.disabled,
					}"
					class="inline-select__option"
					href="javascript:;"
					v-on:click="selectOption(option)"
				>
					<span>
						{{ option.title }}
					</span>
					<check-mark-icon v-if="isSelected(option)"></check-mark-icon>
				</a>
			</div>
		</div>

		<div v-if="invalid" class="input-error">
			{{ errorLabel }}
		</div>
	</div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, toRefs } from "vue-demi";
import {SelectValue} from "@/components/types";
import CheckMarkIcon from "../../assets/svg/checkmark.svg";

export default defineComponent({
	name: "InlineMultipleSelect",
	components: { CheckMarkIcon },
	props: {
		value: {
			required: true,
			type: Array as PropType<number[] | string[]>,
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
	},
	setup(props, context) {
		const { value } = toRefs<{
			value: (string | number)[];
		}>(props);

		const convertedValue = computed<string[]>(() => {
			return value.value.map((item) => {
				return item.toString();
			});
		});

		const selectOption = (option: SelectValue) => {
			const actualValue = [...convertedValue.value];
			if (convertedValue.value.indexOf(option.value.toString()) > -1) {
				actualValue.splice(convertedValue.value.indexOf(option.value.toString()), 1);
			} else {
				actualValue.push(option.value.toString());
			}

			context.emit("input", actualValue);
		};

		const isSelected = (option: SelectValue) => {
			return convertedValue.value.indexOf(option.value.toString()) > -1;
		};

		return {
			selectOption,
			isSelected,
		};
	},
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
		flex-wrap: wrap;
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
		display: none;

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
			flex: 0 0 100%;
			@apply mb-2;
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

	&__options {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
	}

	&__option {
		@apply shadow;
		border-radius: 4px;
		@apply py-2  px-4
		@apply mr-2  text-base
		@apply font-medium  border-solid
		@apply border;
		transition: border-color ease 0.3s, color 0.3s;
		display: flex;
		align-items: center;

		&:last-child {
			margin-right: 0;
		}

		> svg {
			@apply w-5  h-5
			@apply ml-2;
			fill: none;
		}

		&--selected {
			@apply border-blue-600  text-blue-600;
		}

		&--disabled {
			opacity: 0.4;
			pointer-events: none;
		}
	}

	.input-error {
		margin-top: 10px;
		@apply text-red-400  text-sm
		text-align: left;
	}
}
</style>
