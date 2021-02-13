<template>
	<div
		:class="{
			'autocomplete-input--invalid': invalid,
			'autocomplete-input--hidden': hidden,
			'autocomplete-input--readonly': $attrs.readonly
		}"
		class="autocomplete-input"
	>
		<input ref="input" v-model="internalValue" v-bind="$attrs" v-on:focus="showDropdown" />
		<label v-if="$attrs.id && label" :for="$attrs.id">
			{{ label }}
		</label>
		<div
			ref="wrapper"
			:class="{ 'autocomplete-input__options--open': dropdownShown }"
			class="autocomplete-input__options"
		>
			<a
				v-for="option in options"
				:key="option.value"
				class="autocomplete-input__option"
				href="javascript:;"
				v-on:click="selectOption(option)"
			>
				{{ option.description }}
			</a>
		</div>
		<slot></slot>
		<div v-if="invalid" class="input-error">
			{{ errorLabel }}
				</div>
	</div>
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, onMounted, PropType, ref, toRefs, watch } from "vue-demi";

import useCommonFunctions from "@/hooks/commonFunctions";
import axios from "axios";

export default defineComponent({
	name: "RemoteAutocompleteInput",
	props: {
		value: {
			required: true,
			type: String
		},
		label: {
			required: false,
			type: String
		},
		routeName: {
			type: String,
			required: true
		},
		errorLabel: {
	required: false,
			type: String,
			default: 'error',
		},
		invalid: {
			required: false,
			type: Boolean,
			default: false
		},
		hidden: {
			required: false,
			type: Boolean,
			default: false
		},
		additionalData: {
			type: Object as PropType<Record<string, any>>,
			required: false
		}
	},
	setup(props, context) {
		const {  isSameOrChild } = useCommonFunctions();

		type Prediction = {
			description: string;
			place_id: string;
		};

		type PredictionsResponse = {
			status: "OK" | "KO";
			predictions: Prediction[];
		};

		const internalValue = ref<string>("");
		const options = ref<Prediction[]>([]);
		const dropdownShown = ref<boolean>(false);

		const showDropdown = () => {
			dropdownShown.value = true;
		};

		const hideDropdown = () => {
			dropdownShown.value = false;
		};

		const { value, routeName, additionalData } = toRefs<{
			value: string;
			routeName: string;
			additionalData?: Record<string, any>;
		}>(props);

		watch(
			value,
			() => {
				internalValue.value = value.value;
			},
			{
				immediate: true
			}
		);

		watch(
			internalValue,
			(newValue: string) => {
				setTimeout(async () => {
					if (internalValue.value.length > 0 && internalValue.value === newValue) {

						const parametersData: Record<string, string> & {
							query: string;
						} = {
							query: internalValue.value,
							...(additionalData?.value ?? {})
						};

						const keys: Array<keyof typeof parametersData> = Object.keys(parametersData) as Array<keyof typeof parametersData>;

						const parametersString = "?"+keys.map(key => `${key}=${parametersData[key]}`).join('&');

						const {
							data: { status, predictions }
						} = await axios.get<PredictionsResponse>(routeName.value+parametersString)

						if (status === "OK" && predictions.length > 0) {
							options.value = [...predictions];
						}

						context.emit("input", internalValue.value);
					}
				}, 500);
			},
			{
				immediate: true
			}
		);

		const selectOption = (option: Prediction) => {
			internalValue.value = option.description;
			context.emit("input:place", option.place_id);
			context.emit("input", internalValue.value);
			hideDropdown();
		};

		const bodyListener = (event: Event) => {
			const target: HTMLElement = event.target as HTMLElement;
			const wrapper: HTMLElement = context.refs["wrapper"] as HTMLElement;
			const input: HTMLElement = context.refs["input"] as HTMLElement;

			if (wrapper && dropdownShown.value) {
				if (!isSameOrChild(wrapper, target) && !isSameOrChild(input, target)) {
					hideDropdown();
				}
			}
		};

		onMounted(() => {
			document.addEventListener("click", bodyListener);
		});

		onBeforeUnmount(() => {
			document.removeEventListener("click", bodyListener);
		});

		return {
			internalValue,
			dropdownShown,
			selectOption,
			options,
			showDropdown,
			hideDropdown
		};
	}
});
</script>

<style lang="scss" scoped>


.autocomplete-input {
	padding-top: 30px;
	position: relative;
	margin-bottom: 20px;
	opacity: 1;

	&:last-of-type {
		margin-bottom: 0;
	}

	&--readonly {
		opacity: 0.4;
		pointer-events: none;
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

	&__options {
		max-height: 0;
		overflow: hidden;
		position: absolute;
		bottom: 0;
		transform: translateY(100%);
		display: flex;
		flex-direction: column;
		z-index: 2;
		@apply shadow-md;
		border-radius: 4px;
		width: 100%;

		&--open {
			max-height: 300px;
			overflow-y: auto;
		}
	}

	&__option {
		background: white;
		@apply px-4;
		padding-top: 0.625rem;
		padding-bottom: 0.625rem;
		@apply text-base;
		transition: background-color ease 0.3s, font-weight ease 0.3s;
		cursor: pointer;

		&:hover,
		&--selected {
@apply bg-gray-100  font-bold
		}
	}
}
</style>
