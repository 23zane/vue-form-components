<template>
	<div
		:class="{
			'range-input--invalid': invalid,
			'range-input--hidden': hidden,
			'range-input--readonly': $attrs.readonly,
		}"
		class="range-input"
	>
		<full-datepicker
			ref="picker"
			v-bind="$attrs"
			:connected="$attrs.id ? `#${$attrs.id}_connected` : 'connected'"
			:date="values[0]"
			:format="format"
			:label="label"
			:max="max"
			:min="min"
			:multiple="true"
			:ranges="ranges"
			:toggle="toggle"
			:value="values[0]"
			v-on:input="setFirstDate($event)"
		>
			<template v-slot:connected>
				<full-datepicker
					:id="$attrs.id ? `${$attrs.id}_connected` : 'connected'"
					:date="values[1]"
					:format="format"
					:max="max"
					:min="min"
					:value="values[1]"
					v-on:input="setSecondDate($event)"
				>
				</full-datepicker>
			</template>
			<div class="range-input__input" v-on:click="openPicker">
				<input :value="formattedInternalValue" readonly type="text" />
				<div class="range-input__icon" v-on:click.self="openPicker">
					<calendar-icon />
				</div>
			</div>
		</full-datepicker>
		<slot></slot>
		<div v-if="invalid" class="input-error">
			{{ errorLabel }}
		</div>
	</div>
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, toRefs, watch } from "vue-demi";
import moment from "moment";
import FullDatepicker from "./FullDatepicker.vue";
import { DatePickerRange, FullDatepickerType } from "@/components/types";
import CalendarIcon from "../../assets/svg/calendar-icon.svg";

export default defineComponent({
	name: "RangePicker",
	components: { FullDatepicker, CalendarIcon },
	props: {
		label: {
			required: false,
			type: String,
		},
		format: {
			required: false,
			type: String,
			default: "YYYY-MM-DD",
		},
		value: {
			required: true,
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
		hidden: {
			type: Boolean,
			required: false,
			default: false,
		},
		ranges: {
			required: false,
			type: Array as PropType<
				Array<{
					label: string;
					value: string | DatePickerRange;
				}>
			>,
			default: () => [],
		},
		toggle: {
			type: Boolean,
			required: false,
			default: false,
		},
		min: {
			type: [String, null] as PropType<string | null>,
			default: null,
		},
		max: {
			type: [String, null] as PropType<string | null>,
			default: null,
		},
	},
	setup(props, context) {
		const { value, format } = toRefs(props);
		const dateRegex = new RegExp(/^([0-9]{4})-([0-9]{2})-([0-9]{2})$/);
		const rangeRegex = new RegExp(/^([0-9]{4})-([0-9]{2})-([0-9]{2})\s-\s([0-9]{4})-([0-9]{2})-([0-9]{2})$/);
		const internalValue = ref<string>(value.value);

		const setFirstDate = (value: string) => {
			if (!internalValue.value || !rangeRegex.test(internalValue.value)) {
				internalValue.value = value + " - " + value;
			} else {
				const lastValue = internalValue.value.substr(12).trim();
				internalValue.value = value + " - " + lastValue;
			}
			context.emit("input:start-date", value);
		};

		const setSecondDate = (value: string) => {
			if (!internalValue.value || !rangeRegex.test(internalValue.value)) {
				internalValue.value = value + " - " + value;
			} else {
				const firstValue = internalValue.value.substr(0, 10).trim();
				internalValue.value = firstValue + " - " + value;
			}

			context.emit("input:end-date", value);
		};

		watch(internalValue, () => {
			context.emit("input", internalValue.value);
		});

		const values = computed<[string, string]>(() => {
			if (rangeRegex.test(internalValue.value)) {
				return [internalValue.value.substring(0, 10), internalValue.value.substring(12).trim()];
			}

			if (dateRegex.test(internalValue.value)) {
				return [internalValue.value, ""];
			}

			return [moment().format("YYYY-MM-DD"), moment().format("YYYY-MM-DD")];
		});

		const openPicker = () => {
			(context.refs.picker as FullDatepickerType).openPicker();
		};

		const formattedInternalValue = computed<string>(() => {
			return moment(values.value[0]).format(format.value) + " - " + moment(values.value[1]).format(format.value);
		});

		watch(value, () => {
			internalValue.value = value.value;
		});

		return {
			openPicker,
			setFirstDate,
			setSecondDate,
			values,
			internalValue,
			formattedInternalValue,
		};
	},
});
</script>

<style lang="scss" scoped>
.range-input {
	padding-top: 30px;
	position: relative;
	margin-bottom: 20px;
	opacity: 1;
	@apply flex flex-row flex-wrap;

	&:last-of-type {
		margin-bottom: 0;
	}

	&--hidden {
		display: none;
	}

	&__icon {
		@apply text-gray-500;
		padding: 10px 0;
		position: absolute;
		bottom: 0.125rem;
		right: 0.75rem;
		font-size: 1rem;
		cursor: pointer;

		::v-deep svg {
			@apply w-5 h-5;
		}
	}

	::v-deep .datepicker__wrapper {
		> .datepicker-input__icon,
		input {
			visibility: hidden;
		}
	}

	::v-deep .datepicker__wrapper &__input {
		position: relative;
		flex: 0 0 100%;
		cursor: pointer;

		> input,
		> input[readonly] {
			opacity: 1;
			visibility: visible;
			cursor: pointer;
		}
	}

	::v-deep .datepicker__wrapper .datepicker-input {
		position: static;
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
		flex: 0 0 100%;
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
