<template>
	<div
		:class="{
			'datetime-input--invalid': invalid,
			'datetime-input--hidden': hidden,
			'datetime-input--readonly': $attrs.readonly,
		}"
		class="datetime-input"
	>
		<full-datepicker
			v-bind="$attrs"
			:date="value[0]"
			:max="maxAttribute"
			:min="minAttribute"
			:value="values[0]"
			label="Data"
			v-on:input="setDate($event)"
		></full-datepicker>
		<text-input
			v-bind="$attrs"
			:invalid="isTimeInvalid"
			:value="values[1]"
			ref="textInput"
			label="Ora"
			placeholder="HH:mm"
			v-on:change="setHour($event)"
		></text-input>
		<slot></slot>
		<div v-if="invalid" class="input-error">
			{{ errorLabel }}
		</div>
	</div>
</template>

<script lang="ts">
import { computed, defineComponent, toRefs } from "vue-demi";

import FullDatepicker from "./FullDatepicker.vue";
import TextInput from "./TextInput.vue";
import moment from "moment/moment";
import Vue from "vue/types/umd";
import useCommonFunctions from "@/hooks/commonFunctions";

export default defineComponent({
	name: "DatetimeInput",
	components: { TextInput, FullDatepicker },
	props: {
		value: {
			required: false,
			type: String,
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
	setup(props, context) {
		const { checkDateValidity } = useCommonFunctions();
		const { value, invalid } = toRefs(props);

		const dateRegex = new RegExp(/^([0-9]{4})-([0-9]{2})-([0-9]{2})$/);
		const hourRegex = new RegExp(/^([0-9]{2}):([0-9]{2})$/);
		const fullRegex = new RegExp(/^([0-9]{4})-([0-9]{2})-([0-9]{2})\s([0-9]{2}):([0-9]{2})$/);

		const isTimeValid = (time: string): boolean => {
			if (!hourRegex.test(time)) {
				return false;
			}

			const [hour, minute] = time.split(":");
			return parseInt(hour) >= 0 && parseInt(hour) <= 23 && parseInt(minute) >= 0 && parseInt(minute) <= 59;
		};

		const isDateValid = (date: string): boolean => {
			if (!dateRegex.test(date)) {
				return false;
			}

			const [year, month, day] = date.split("-");

			return parseInt(day) === checkDateValidity(+day, +month, +year);
		};

		const values = computed<[string, string]>(() => {
			if (!value?.value || (!dateRegex.test(value.value) && !fullRegex.test(value.value))) {
				return ["", ""];
			}

			if (dateRegex.test(value.value) && !fullRegex.test(value.value)) {
				return [value.value!, ""];
			}

			return value.value!.split(" ") as [string, string];
		});

		const maxAttribute = computed<string | null>(() => {
			if (
				typeof context.attrs.max === "undefined" ||
				!context.attrs.max ||
				(!dateRegex.test(context.attrs.max as string) && !fullRegex.test(context.attrs.max as string))
			) {
				return null;
			}

			return (context.attrs.max as string).substring(0, 10);
		});

		const minAttribute = computed<string | null>(() => {
			if (
				typeof context.attrs.min === "undefined" ||
				!context.attrs.min ||
				(!dateRegex.test(context.attrs.min as string) && !fullRegex.test(context.attrs.min as string))
			) {
				return null;
			}

			return (context.attrs.min as string).substring(0, 10);
		});

		const isTimeInvalid = computed<boolean>(() => {
			return !invalid.value && dateRegex.test(value!.value ?? "") && !fullRegex.test(value!.value ?? "");
		});

		const setDate = (date: string) => {
			const actualValue: string = value!.value ?? "";
			if (!date || !isDateValid(date)) {
				context.emit("input", "");
			} else {
				if (actualValue.length >= 10) {
					context.emit("input", date + actualValue.substring(10));
				} else {
					context.emit("input", date + " " + moment().format("HH:mm"));
				}

				const textInput: Vue | undefined = context.refs.textInput as Vue | undefined;
				if (textInput && textInput.$refs.input) {
					(textInput.$refs.input as HTMLElement).focus();
				}
			}
		};

		const setHour = (hour: string) => {
			const actualValue: string = value!.value ?? "";
			if (!hour || !isTimeValid(hour)) {
				context.emit("input", actualValue.substring(0, 10));
			} else {
				context.emit("input", actualValue.substring(0, 10) + " " + hour);
			}
		};

		return {
			values,
			maxAttribute,
			minAttribute,
			isTimeInvalid,
			setDate,
			setHour,
		};
	},
});
</script>

<style lang="scss" scoped>
.datetime-input {
	padding-top: 30px;
	position: relative;
	margin-bottom: 20px;
	opacity: 1;
	@apply flex flex-row flex-wrap;

	.datepicker-input,
	.text-input {
		flex: 0 0 calc(50% - 0.3125rem);
	}

	.datepicker-input {
		margin-right: 0.625rem;
	}

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
