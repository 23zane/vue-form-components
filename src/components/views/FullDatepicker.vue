<template>
	<div
		:class="{
			'datepicker-input--invalid': invalid,
			'datepicker-input--hidden': hidden,
			'datepicker-input--readonly': $attrs.readonly,
			'with-ranges': ranges.length > 0,
		}"
		class="datepicker-input datepickered datepicker-applied"
	>
		<div
			ref="first_picker"
			:class="{ '-open': opened, 'datepicker__wrapper--with-otherpicker': hasOtherPicker }"
			class="datepicker__wrapper"
			v-on:click.self="openPicker"
		>
			<slot></slot>
			<div class="datepicker-input__icon" v-on:click.self="openPicker">
				<calendar-icon />
			</div>
			<input
				v-bind="$attrs"
				:max="localeMax"
				:min="localeMin"
				:value="formattedValue"
				class="datepick"
				placeholder="DD/MM/YYYY"
				readonly
				type="text"
				v-on:click="openPicker"
				v-on:focus="openPicker"
				v-on:focusout="setDate($event.target.value)"
			/>
			<label v-if="$attrs.id && label" :for="$attrs.id">
				{{ label }}
			</label>
			<date-picker
				ref="datepicker"
				v-bind="$props"
				:date="value"
				:first-picker-date="firstPicker ? firstPicker.getDate() : undefined"
				:max="localeMax"
				:min="localeMin"
				:open="opened"
				:other-picker-date="otherPicker ? otherPicker.getDate() : undefined"
				v-on:input="setDate"
				v-on:picker:needs-other="setOtherDatePicker"
				v-on:picker:check-other-date="checkOtherPickerDate"
				v-on:picker:set-other-selected-date="setOtherSelectedDate"
				v-on:picker:set-other-visible-date="setOtherVisibleDate"
				v-on:picker:open-other-picker="openOtherPicker"
				v-on:picker:open-first-picker="openFirstPicker"
				v-on:dropdown:closed="childPickerOpened(false)"
			></date-picker>
			<slot name="connected"></slot>
		</div>
	</div>
</template>

<script lang="ts">
import DatePicker from "./DatePicker.vue";
import moment, { DurationInputArg2 } from "moment";
import { computed, defineComponent, onBeforeUnmount, onMounted, PropType, ref, toRefs, watch } from "vue-demi";
import { DatePickerType, FullDatepickerType } from "@/components/types";

import Vue from "vue/types/umd";
import CalendarIcon from "../../assets/svg/calendar-icon.svg";
import useCommonFunctions from "@/hooks/commonFunctions";

export default defineComponent({
	name: "FullDatepicker",
	components: { DatePicker, CalendarIcon },
	props: {
		label: {
			required: false,
			type: String,
		},
		value: {
			required: true,
			type: String,
		},
		format: {
			required: false,
			type: String,
			default: "YYYY-MM-DD",
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
					value:
						| string
						| {
								range?: {
									value: string;
									field: DurationInputArg2;
								};
								min?: string;
								max?: string;
					};
				}>
			>,
			default: () => [],
		},
		min: {
			type: [String, null] as PropType<string | null>,
			default: null,
		},
		max: {
			type: [String, null] as PropType<string | null>,
			default: null,
		},
		date: {
			type: String as PropType<string>,
			default: () => moment().format("YYYY-MM-DD"),
		},
		multiple: {
			type: Boolean,
			required: false,
			default: false,
		},
		toggle: {
			type: Boolean,
			required: false,
			default: false,
		},
		connected: {
			type: [String, null] as PropType<string | null>,
			required: false,
			default: null,
		},
	},
	setup(props, context) {
		const { min, max, value, format } = toRefs(props);
		const { isSameOrChild, checkDateValidity } = useCommonFunctions();
		const opened = ref<boolean>(false);

		const openPicker = ({ showInputPickers }: { showInputPickers?: boolean } = {}) => {
			opened.value = true;
			if (context.refs.datepicker && (showInputPickers === true || showInputPickers === false)) {
				(context.refs.datepicker as DatePickerType).showInputPickers = showInputPickers;
			}
		};

		const closePicker = ({
			showInputPickers,
			openRanges,
		}: { showInputPickers?: boolean; openRanges?: boolean } = {}) => {
			if (context.refs.datepicker) {
				(context.refs.datepicker as DatePickerType).closePicker();
				if (showInputPickers === true || showInputPickers === false) {
					(context.refs.datepicker as DatePickerType).showInputPickers = showInputPickers;
				}
				if (openRanges === true || openRanges === false) {
					(context.refs.datepicker as DatePickerType).openRanges = openRanges;
				}
			}
		};

		const getValidDate = (date: string): string => {
			const [year, month, day] = date.split("-");
			if (typeof year !== "undefined" && typeof month !== "undefined" && typeof day !== "undefined") {
				const newDay = checkDateValidity(+day, +month, +year);

				return year + "-" + month.toString().padStart(2, "0") + "-" + newDay.toString().padStart(2, "0");
			}

			return "";
		};

		const getDate = () => {
			return value.value;
		};

		const setDate = (value: string) => {
			context.emit("input", getValidDate(value));

			if (context.refs.datepicker) {
				(context.refs.datepicker as DatePickerType).selectedDate = getValidDate(value);
			}
		};
		const setVisibleDate = (value: string) => {
			context.emit("input", getValidDate(value));

			if (context.refs.datepicker) {
				(context.refs.datepicker as DatePickerType).visibleDate = getValidDate(value);
			}
		};

		const localeMin = ref<null | string>(min.value);
		const localeMax = ref<null | string>(max.value);

		const setMinDate = (value: string | null) => {
			localeMin.value = value;
		};

		const setMaxDate = (value: string | null) => {
			localeMax.value = value;
		};

		watch(min, () => {
			setMinDate(min.value);
		});

		watch(max, () => {
			setMaxDate(max.value);
		});

		const clickListener = (e: Event) => {
			const target: HTMLElement = e.target as HTMLElement;
			if (
				!target.classList.contains("datepicker__days__month__cont") &&
				!target.classList.contains("datepicker__months__years__cont") &&
				!isSameOrChild(context.refs.first_picker as HTMLElement, target)
			) {
				closePicker();
			}
		};

		onMounted(() => {
			document.addEventListener("click", clickListener);
		});

		onBeforeUnmount(() => {
			document.removeEventListener("click", clickListener);
		});

		const otherPicker = ref<FullDatepickerType | undefined>(undefined);
		const firstPicker = ref<FullDatepickerType | undefined>(undefined);

		const findElement = (id: string) =>
			new Promise<Element>((resolve, reject) => {
				let mountCount = 0;
				const elementInterval = setInterval(() => {
					const element = context.root.$el.querySelector(id);
					if (element) {
						clearInterval(elementInterval);
						resolve(element);
					}

					if (mountCount++ >= 20) {
						clearInterval(elementInterval);
						reject("not found");
					}
				}, 300);
			});

		const setFirstDatePicker = (item: FullDatepickerType) => {
			try {
				firstPicker.value = item;
			} catch (e) {
				console.warn(e);
			}
		};

		const setOtherDatePicker = async (id: string) => {
			try {
				const data: Element & {
					__vue__?: FullDatepickerType;
				} = await findElement(id);

				if (typeof data["__vue__"] !== "undefined") {
					otherPicker.value = (data as Element & {
						__vue__: FullDatepickerType;
					}).__vue__;

					otherPicker.value.setFirstDatePicker(
						(context.refs.datepicker as Vue & {
							$parent: FullDatepickerType;
						}).$parent
					);
				}
			} catch (e) {
				console.warn(e);
			}
		};

		const setOtherSelectedDate = (date: string) => {
			if (typeof otherPicker?.value != "undefined") {
				otherPicker.value.setDate(date);
			}
		};
		const setOtherVisibleDate = (date: string) => {
			if (typeof otherPicker?.value != "undefined") {
				otherPicker.value.setVisibleDate(date);
			}
		};

		const checkOtherPickerDate = (date: string) => {
			if (typeof otherPicker?.value != "undefined") {
				if (moment(otherPicker.value.getDate()).isBefore(date)) {
					otherPicker.value.setDate(date);
					otherPicker.value.setVisibleDate(date);
				}

				otherPicker.value!.setMinDate(date);
			}
		};

		const openOtherPicker = (data: Partial<{ showInputPickers: boolean }> = {}) => {
			if (typeof otherPicker?.value != "undefined") {
				setTimeout(() => {
					otherPicker.value!.openPicker(data);
				}, 200);
			}
		};
		const openFirstPicker = (data: Partial<{ showInputPickers: boolean }> = {}) => {
			if (typeof firstPicker?.value != "undefined") {
				setTimeout(() => {
					firstPicker.value!.openPicker(data);
				}, 200);
			}
		};
		const closeFirstPicker = (data: Partial<{ showInputPickers: boolean; openRanges: boolean }>) => {
			if (typeof firstPicker?.value != "undefined") {
				firstPicker.value!.closePicker(data);
			}
		};
		const childPickerOpened = (value: boolean) => {
			opened.value = value;
		};

		const hasOtherPicker = computed<boolean>(() => {
			return typeof otherPicker?.value !== "undefined";
		});

		const formattedValue = computed<string>(() => {
			if (!value.value) {
				return "";
			}

			return moment(value.value).format(format.value);
		});

		return {
			firstPicker,
			otherPicker,
			getDate,
			setDate,
			setVisibleDate,
			openPicker,
			openFirstPicker,
			closeFirstPicker,
			openOtherPicker,
			setOtherDatePicker,
			checkOtherPickerDate,
			setOtherSelectedDate,
			setOtherVisibleDate,
			childPickerOpened,
			opened,
			hasOtherPicker,
			setFirstDatePicker,
			setMinDate,
			setMaxDate,
			localeMin,
			localeMax,
			formattedValue,
		};
	},
});
</script>

<style lang="scss" scoped>
.datepicker {
	&__wrapper {
		&--with-otherpicker {
			@apply flex flex-row items-center;
		}

		> .datepicker-input {
			padding-top: 0;
		}
	}
}

.datepicker-input {
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

		&::-webkit-calendar-picker-indicator {
			display: none;
		}

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

		&[readonly] {
			opacity: 1;
			cursor: pointer;
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

	&--prefix input {
		@apply pl-8;
	}

	&--icon input {
		@apply pr-8;
	}

	&--invalid &__prefix,
	&--invalid &__icon {
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
