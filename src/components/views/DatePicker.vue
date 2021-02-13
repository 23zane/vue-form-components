<template>
	<div ref="base" :class="{ 'datepicker__full--toggle': toggle || hasRanges }" class="datepicker__full">
		<div v-if="ranges.length > 0" :class="{ '-open': openRanges }" class="datepicker__ranges">
			<div :class="{ '-active': openRanges }" class="datepicker__ranges__title" v-on:click="toggleRanges()">
				{{ moment(selectedDate).format("DD MMM YYYY") }} -
				{{ typeof otherPickerDate != "undefined" ? moment(otherPickerDate).format("DD MMM YYYY") : "" }}
			</div>
			<div class="datepicker__ranges__items">
				<a
					v-for="(r, k) in ranges"
					:key="k"
					:class="{ '-active': selectedRange === k }"
					class="datepicker__ranges__item"
					href="javascript:"
					v-on:click="setRange(k)"
				>
					{{ r.label }}
				</a>
			</div>
		</div>
		<div ref="picker" :class="{ '-open': open, '-with-inputs': showInputPickers }" class="datepicker">
			<div
				v-if="
					(typeof firstPickerDate !== 'undefined' || typeof otherPickerDate !== 'undefined') &&
					open &&
					hasRanges &&
					!openRanges
				"
				class="datepicker__back"
				v-on:click="showRanges()"
			>
				<p class="datepicker__back__title">
					Personalizza
				</p>
			</div>
			<div
				v-if="showInputPickers"
				:class="{ '-single': typeof firstPickerDate === 'undefined' && typeof otherPickerDate === 'undefined' }"
				class="datepicker__inputs"
			>
				<div
					:class="{ '-active': typeof firstPickerDate === 'undefined' }"
					class="datepicker__input__row"
					v-on:click.prevent="selectFirstPicker()"
				>
					<input
						:value="firstPickerDate ? firstPickerDate : selectedDate"
						class="datepicker__input"
						readonly
						type="text"
					/>
					<label v-if="$attrs.first_placeholder">{{ $attrs.first_placeholder }}</label>
				</div>
				<template v-if="typeof otherPickerDate != 'undefined' || typeof firstPickerDate != 'undefined'">
					<div class="datepicker__input__icon"></div>
					<div
						:class="{ '-active': typeof firstPickerDate != 'undefined' }"
						class="datepicker__input__row"
						v-on:click.prevent="selectSecondPicker()"
					>
						<input
							:value="typeof firstPickerDate != 'undefined' ? selectedDate : otherPickerDate"
							class="datepicker__input"
							readonly
							type="text"
						/>
						<label v-if="$attrs.first_placeholder">{{ $attrs.first_placeholder }}</label>
					</div>
				</template>
			</div>
			<div v-if="areYearsOpen" class="datepicker__years">
				<div class="datepicker__years__head">
					<div class="datepicker__years__head__cont">
						Scegli anno
					</div>
				</div>

				<ul class="datepicker__years__items">
					<li v-for="y in years" class="datepicker__years__item" :key="y">
						<a
							:class="{ '-active': selectedYear == y.value, '-disabled': y.disabled }"
							href="javascript:"
							v-on:click="selectYear(y.value)"
						>
							{{ y.value }}
						</a>
					</li>
				</ul>
			</div>
			<div v-if="areMonthsOpen" class="datepicker__months">
				<div class="datepicker__months__years">
					<div class="datepicker__months__years__cont" v-on:click="openYearPicker">
						{{ visibleYear }}
					</div>
				</div>
				<ul class="datepicker__months__items">
					<li
						v-for="m in monthNames"
						:key="m"
						:class="{
							'-active': m.value == selectedMonth && selectedYear == visibleYear,
							'-disabled': m.disabled,
						}"
						class="datepicker__months__item"
					>
						<a href="javascript:" v-on:click="selectMonth(m.id)">
							{{ m.value }}
						</a>
					</li>
				</ul>
			</div>
			<div v-if="areDaysOpen" class="datepicker__days">
				<div class="datepicker__days__month">
					<div
						:class="{ '-disabled': previousMonthDisabled }"
						class="datepicker__days__month__left"
						v-on:click="previousMonth()"
					></div>
					<div class="datepicker__days__month__cont" v-on:click="openMonthPicker">
						{{ visibleMonthLabel }} {{ visibleYear }}
					</div>
					<div
						:class="{ '-disabled': nextMonthDisabled }"
						class="datepicker__days__month__right"
						v-on:click="nextMonth()"
					></div>
				</div>
				<ul class="datepicker__days__items">
					<li
						v-for="d in visibleDays"
						:key="d"
						:class="{
							'-active':
								selectedDay == d.value &&
								selectedMonth == visibleMonth &&
								selectedYear == visibleYear &&
								!d.disabled,
							'-disabled': d.disabled,
						}"
						class="datepicker__days__item"
					>
						<a href="javascript:" v-on:click="selectDay(d.value)">
							{{ d.value }}
						</a>
					</li>
				</ul>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, PropType, ref, toRefs, watch } from "vue-demi";
import { VueConstructor } from "vue";
import { DatePickerRange } from "@/components/types";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const moment = require("moment");
moment.locale("it");
export default defineComponent({
	name: "DatePicker",
	props: {
		open: {
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
		firstPickerDate: {
			type: String,
			required: false,
		},
		otherPickerDate: {
			type: String,
			required: false,
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
		const { ranges, min, max, date, multiple, connected, firstPickerDate, open } = toRefs(props);

		const hasRanges = computed(() => {
			return ranges.value.length > 0;
		});

		const openRanges = ref<boolean>(false);
		const openInput = ref<boolean>(false);
		const openOther = ref<boolean>(false);
		const minDate = ref<string | null>(null);
		const maxDate = ref<string | null>(null);
		const selectedDate = ref<string>(moment().format("YYYY-MM-DD"));
		const areYearsOpen = ref<boolean>(false);
		const areMonthsOpen = ref<boolean>(false);
		const areDaysOpen = ref<boolean>(!hasRanges.value);
		const selectedRange = ref<string | null | number>(null);
		const showInputPickers = ref<boolean>(false);
		const visibleDate = ref<string>(moment().format("YYYY-MM-DD"));
		const mountInterval = ref<number | null>(null);
		const parent: InstanceType<VueConstructor> & {
			setDate: (value: string) => void;
		} = context.parent as InstanceType<VueConstructor> & {
			setDate: (value: string) => void;
		};

		const closePicker = () => {
			showInputPickers.value = false;
			context.emit("dropdown:closed");
		};

		const showRanges = () => {
			if (ranges.value.length == 0) {
				if (typeof firstPickerDate?.value != "undefined") {
					closePicker();
					context.emit("picker:close-first-picker", {
						openRanges: true,
						showInputPickers: false,
					});
				}
			} else {
				closePicker();
				showInputPickers.value = false;
				openRanges.value = true;
			}
		};

		const openCallback = () => {
			if (!areDaysOpen.value && !areMonthsOpen.value && !areYearsOpen.value) {
				areDaysOpen.value = true;
			}
			context.emit("dropdown:opened");
			if (parseFloat(getComputedStyle(parent.$el).width) < 360) {
				(context.refs["picker"] as HTMLElement).style.left = "auto";
				(context.refs["picker"] as HTMLElement).style.right = "0";
				(context.refs["base"] as HTMLElement).style.left = "auto";
				(context.refs["base"] as HTMLElement).style.right = "0";
			}
		};

		const toggleRanges = () => {
			if (!openRanges.value && open.value) {
				closePicker();
			}
			openRanges.value = !openRanges.value;
			if (openRanges.value && selectedRange.value == ranges.value.length - 1) {
				toggleRanges();
				showInputPickers.value = true;
				openCallback();
			}
		};

		const actualDate = computed<string>(() => {
			if (!selectedDate.value) {
				return moment().format("YYYY-MM-DD");
			}

			return selectedDate.value;
		});

		const actualVisibleDate = computed<string>(() => {
			if (!visibleDate.value) {
				return moment().format("YYYY-MM-DD");
			}

			return visibleDate.value;
		});

		const days = computed<number>(() => {
			return moment(actualDate.value).daysInMonth();
		});

		const selectedDay = computed<string>(() => {
			return moment(actualDate.value).format("D");
		});

		const selectedMonth = computed<string>(() => {
			return moment(actualDate.value).format("M");
		});

		const selectedYear = computed<string>(() => {
			return moment(actualDate.value).format("YYYY");
		});

		const visibleDay = computed<string>(() => {
			return moment(actualVisibleDate.value).format("DD");
		});

		const visibleMonth = computed<string>(() => {
			return moment(actualVisibleDate.value).format("M");
		});

		const visibleMonthLabel = computed<string>(() => {
			return moment(actualVisibleDate.value).format("MMM");
		});

		const visibleYear = computed<string>(() => {
			return moment(actualVisibleDate.value).format("YYYY");
		});

		const monthNames = computed<
			{
				id: string;
				value: string;
				disabled: boolean;
			}[]
		>(() => {
			const months = [];
			for (let i = 0; i <= 11; i++) {
				months.push({
					id: moment().month(i).format("MM"),
					value: moment().month(i).format("MMM"),
					disabled:
						moment().year(visibleYear.value).month(i).endOf("month").isBefore(minDate.value) ||
						moment().year(visibleYear.value).month(i).startOf("month").isAfter(maxDate.value),
				});
			}

			return months;
		});

		const nextMonthDisabled = computed<boolean>(() => {
			if (maxDate.value === null) {
				return false;
			}
			const newDate = moment(actualVisibleDate.value).clone().subtract("1", "month").startOf("month");
			return newDate.isAfter(maxDate.value);
		});

		const previousMonthDisabled = computed<boolean>(() => {
			if (minDate.value === null) {
				return false;
			}
			const newDate = moment(actualVisibleDate.value).clone().subtract("1", "month").endOf("month");
			return newDate.isSameOrBefore(minDate.value);
		});

		const visibleDays = computed<
			{
				value: number;
				disabled: boolean;
			}[]
		>(() => {
			const momentDate = moment(actualVisibleDate.value, "YYYY-MM-DD");
			const previousMonth = momentDate.clone().subtract("1", "months");
			let lastPreviousMonthDate = previousMonth.daysInMonth();
			const monthDays = momentDate.daysInMonth();
			const firstDay = momentDate.clone().startOf("month").startOf("week").format("D");
			let lastDay = momentDate.clone().endOf("month").endOf("week").format("D");
			const items = [];

			if (lastDay == monthDays) {
				lastDay = 0;
			}
			if (firstDay == 1) {
				lastPreviousMonthDate = 1;
			}

			for (let i = firstDay; i <= lastPreviousMonthDate; i++) {
				items.push({
					value: i,
					disabled: true,
				});
			}

			for (let i = 1; i <= monthDays; i++) {
				const date = momentDate
					.clone()
					.startOf("month")
					.add(i - 1, "days");
				items.push({
					value: i,
					disabled: date.isBefore(minDate.value) || date.isAfter(maxDate.value),
				});
			}

			for (let i = 1; i < lastDay; i++) {
				items.push({
					value: i,
					disabled: true,
				});
			}

			return items;
		});

		const years = computed<
			{
				value: number;
				disabled: boolean;
			}[]
		>(() => {
			const minYear: number = parseInt(
					minDate.value === null
						? moment().subtract(100, "year").clone().format("YYYY")
						: moment(minDate.value).clone().format("YYYY")
				),
				maxYear: number = parseInt(
					maxDate.value === null
						? moment().add(100, "year").clone().format("YYYY")
						: moment(maxDate.value).clone().format("YYYY")
				),
				years: Array<{
					value: number;
					disabled: boolean;
				}> = [];

			for (let i = maxYear; i >= minYear; i--) {
				years.push({
					value: i,
					disabled: false,
				});
			}

			return years;
		});

		watch(
			date,
			(value) => {
				selectedDate.value = value;
				visibleDate.value = value;
			},
			{
				immediate: true,
			}
		);

		watch(
			min,
			(value) => {
				minDate.value = value;
			},
			{
				immediate: true,
			}
		);

		watch(
			max,
			(value) => {
				maxDate.value = value;
			},
			{
				immediate: true,
			}
		);

		watch(
			selectedDate,
			(newVal: string) => {
				if (minDate.value !== null && newVal !== "" && moment(newVal).isBefore(minDate.value)) {
					selectedDate.value = minDate.value;
					visibleDate.value = minDate.value;
					return;
				}

				if (maxDate.value !== null && newVal !== "" && moment(newVal).isAfter(maxDate.value)) {
					selectedDate.value = maxDate.value;
					visibleDate.value = maxDate.value;
					return;
				}

				context.emit("input", newVal);
				context.emit("picker:check-other-date", selectedDate.value);
				context.emit("picker:check-first-date", selectedDate.value);
			},
			{
				immediate: true,
			}
		);

		watch(open, (value: boolean) => {
			if (value) {
				openCallback();
			}
		});

		const nextMonth = () => {
			if (!nextMonthDisabled.value) {
				visibleDate.value = moment(actualVisibleDate.value).clone().add("1", "month").format("YYYY-MM-DD");
			}
		};

		const openMonthPicker = () => {
			areMonthsOpen.value = true;
			areDaysOpen.value = false;
		};

		const openYearPicker = () => {
			areDaysOpen.value = false;
			areMonthsOpen.value = false;
			areYearsOpen.value = true;
		};

		const previousMonth = () => {
			if (!previousMonthDisabled.value) {
				visibleDate.value = moment(actualVisibleDate.value).clone().subtract("1", "month").format("YYYY-MM-DD");
			}
		};

		const selectDay = (d: number) => {
			const actualDate = moment(actualVisibleDate.value);
			visibleDate.value = actualDate.format("YYYY-MM-") + d.toString().padStart(2, "0");
			selectedDate.value = visibleDate.value;
			closePicker();

			if (multiple.value && connected.value) {
				context.emit("picker:open-other-picker", {
					showInputPickers: showInputPickers.value,
				});
			}
		};

		const selectFirstPicker = () => {
			closePicker();
			context.emit("picker:open-first-picker", {
				showInputPickers: true,
			});
		};

		const selectSecondPicker = () => {
			closePicker();
			context.emit("picker:open-other-picker", {
				showInputPickers: true,
			});
		};

		const selectYear = (y: string) => {
			const actualDate = moment(actualVisibleDate.value);
			visibleDate.value = y + "-" + actualDate.format("MM-DD");

			areYearsOpen.value = false;
			areMonthsOpen.value = true;
			areDaysOpen.value = false;
		};

		const selectMonth = (m: string) => {
			const actualDate = moment(actualVisibleDate.value);

			visibleDate.value = actualDate.format("YYYY-") + m.padStart(2, "0") + "-" + actualDate.format("DD");

			areYearsOpen.value = false;
			areMonthsOpen.value = false;
			areDaysOpen.value = true;
		};

		const setRange = (index: number) => {
			if (ranges.value.length <= index) {
				return;
			}

			const range = ranges.value[index];

			if (typeof range.value !== "undefined") {
				if (range.value === "custom") {
					selectedRange.value = index.toString();
					showInputPickers.value = true;
					toggleRanges();
					openCallback();
				} else if (typeof range.value === "object") {
					if (typeof range.value.range !== "undefined") {
						const valueRange = range.value.range!;
						const date = moment()
							.subtract(valueRange!["value"], valueRange!["field"])
							.clone()
							.format("YYYY-MM-DD");
						selectedDate.value = date;
						visibleDate.value = date;
						selectedRange.value = index.toString();
						context.emit("picker:set-other-selected-date", moment().clone().format("YYYY-MM-DD"));
					} else if (typeof range.value.min !== "undefined" && typeof range.value.max !== "undefined") {
						const minRange = range.value.min!,
							maxRange = range.value.max!;

						if (minRange == null) {
							selectedDate.value = minDate.value!;
							visibleDate.value = minDate.value!;
						} else {
							selectedDate.value = range.value.min!;
							visibleDate.value = range.value.min!;
						}

						if (maxRange == null) {
							context.emit("picker:set-other-selected-date", maxDate.value);
							context.emit("picker:set-other-visible-date", maxDate.value);
						} else {
							context.emit("picker:set-other-selected-date", range.value.max!);
							context.emit("picker:set-other-visible-date", range.value.max!);
						}

						selectedRange.value = index.toString();
					}
				}
			}
		};

		onMounted(() => {
			if (multiple.value && connected.value) {
				context.emit("picker:needs-other", connected.value);
			}
		});
		if (multiple.value && connected.value) {
			if (ranges.value.length) {
				const values = ranges.value.filter((f) => f.value === "custom");

				if (values.length === 0) {
					ranges.value.push({
						label: "Personalizza",
						value: "custom",
					});
				}
			}
		}

		return {
			actualDate,
			actualVisibleDate,
			closePicker,
			visibleDate,
			visibleDay,
			visibleDays,
			visibleMonth,
			visibleMonthLabel,
			visibleYear,
			areDaysOpen,
			areMonthsOpen,
			areYearsOpen,
			openInput,
			openOther,
			openRanges,
			hasRanges,
			toggleRanges,
			moment,
			selectedRange,
			showRanges,
			showInputPickers,
			selectSecondPicker,
			selectFirstPicker,
			selectedDate,
			selectedDay,
			selectedYear,
			selectedMonth,
			previousMonthDisabled,
			nextMonthDisabled,
			previousMonth,
			nextMonth,
			openMonthPicker,
			openYearPicker,
			selectDay,
			selectMonth,
			selectYear,
			minDate,
			maxDate,
			monthNames,
			years,
			days,
			setRange,
		};
	},
});
</script>

<style lang="scss" scoped>
.datepicker {
	transition: all ease 0.3s;
	position: absolute;
	width: 100%;
	background: #fff;
	top: 100%;
	z-index: 2;
	height: 0;
	left: 0;
	opacity: 0.3;
	@apply shadow-sm;
	padding: 0;
	border-radius: 5px;
	min-width: 360px;
	display: flex;
	flex-direction: column;

	@media (max-width: 360px) {
		min-width: 0;
		width: 100%;
	}

	@include media-breakpoint-down(sm) {
		position: fixed;
	}

	&.-open {
		height: 300px;
		padding: 30px;
		opacity: 1;

		@include media-breakpoint-down(sm) {
			top: 72.22px;
			height: calc(100% - 72.22px);
			width: 100%;
			z-index: 4;
		}

		@include media-breakpoint-down(sm) {
			padding-left: 5%;
			padding-right: 5%;
		}

		@media (max-width: 360px) {
			padding: 15px;
		}

		&.-with-inputs {
			height: 460px;
		}
	}

	&__wrapper {
		position: relative;

		.input-row {
			margin: 0;
		}
	}

	&__days,
	&__months,
	&__years {
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		overflow-y: hidden;

		&__items {
			display: flex;
			flex-direction: row;
			flex-wrap: wrap;
			align-self: flex-start;
			justify-content: flex-start;
			flex-grow: 1;
			overflow-y: auto;
		}

		&__item {
			flex-basis: 14.2857142857%;
			flex-shrink: 0;
			@apply text-sm;
			text-align: center;
			margin-bottom: 20px;
			text-transform: uppercase;

			&.-disabled {
				pointer-events: none;
				cursor: default;
				@apply text-gray-300;
				a {
					@apply text-gray-300;
				}
			}

			&.-active {
				@apply text-blue-600;

				a {
					@apply text-blue-600;
				}
			}

			a {
				padding: 6px 10px;
				@apply text-gray-700;
				text-decoration: none !important;

				&:hover {
					@apply text-blue-600;
				}
			}
		}
	}

	&__days {
		&__month {
			margin-bottom: 20px;
			display: flex;
			justify-content: space-between;
			text-align: center;
			cursor: pointer;

			&__cont {
				@apply text-base;
				font-weight: 600;
				position: relative;
				text-transform: uppercase;
				padding-right: 20px;

				&:after {
					position: absolute;
					right: 0;
					top: 50%;
					transform: translateY(-50%);
					content: "";
					width: 14px;
					height: 14px;
					background-size: 14px;
					background-repeat: no-repeat;
					background-image: url("/svg/arrow-picker.svg");
				}
			}

			&__left,
			&__right {
				width: 14px;
				height: 14px;
				background-size: 14px;
				background-image: url("/svg/arrow-prev.svg");

				&.-disabled {
					opacity: 0.3;
					pointer-events: none;
					cursor: default;
				}
			}

			&__right {
				background-image: url("/svg/arrow-next-black.svg");
			}
		}
	}

	&__months {
		&__years {
			margin-bottom: 20px;
			display: flex;
			justify-content: center;
			text-align: center;
			cursor: pointer;

			&__cont {
				@apply text-base;
				font-weight: 600;
				position: relative;
				text-transform: uppercase;
				padding-right: 20px;

				&:after {
					position: absolute;
					right: 0;
					top: 50%;
					transform: translateY(-50%);
					content: "";
					width: 14px;
					height: 14px;
					background-size: 14px;
					background-repeat: no-repeat;
					background-image: url("/svg/arrow-picker.svg");
				}
			}
		}

		&__item {
			flex-basis: 33.333333%;
		}
	}

	&__years {
		&__head {
			display: flex;
			justify-content: center;
			margin-bottom: 20px;
			cursor: default;
			pointer-events: none;

			&__cont {
				@apply text-base;
				font-weight: 600;
				position: relative;
				text-transform: uppercase;
			}
		}

		&__item {
			flex-basis: 25%;
		}
	}

	&__full {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
	}

	&__ranges {
		width: 100%;

		&.-open {
			.datepicker__ranges__items {
				max-height: 300px;
				overflow-y: auto;
				margin-top: 10px;
				padding: 15px 20px;
			}
		}

		&__title {
			transition: all ease 0.3s;
			@apply text-gray-700;
			border-radius: 12px;
			padding: 6px 30px 6px 10px;
			@apply text-sm;
			position: relative;
			text-transform: uppercase;
			cursor: pointer;
			white-space: nowrap;

			@include media-breakpoint-down(md) {
				padding-top: 10px;
				padding-bottom: 10px;
			}

			&.-active {
				@apply bg-blue-700;
				color: white;

				&:after {
					background-image: url("/svg/calendar-white.svg");
				}
			}

			&:after {
				position: absolute;
				content: "";
				top: 50%;
				transform: translateY(-50%);
				background-image: url("/svg/calendar.svg");
				background-size: 14px;
				width: 14px;
				height: 14px;
				right: 10px;
			}
		}

		&__items {
			transition: all ease 0.3s;
			max-height: 0;
			margin: 0;
			padding: 0;
			background: white;
			border-radius: 5px;
			@apply shadow-sm;
			display: flex;
			flex-direction: column;
			align-items: stretch;
			overflow-y: auto;
		}

		&__item {
			@apply text-sm;
			text-transform: uppercase;
			cursor: pointer;
			@apply text-gray-700;
			text-decoration: none !important;

			&.-active,
			&:hover {
				@apply text-blue-700;
			}

			&:not(:last-of-type) {
				margin-bottom: 10px;
			}
		}
	}

	&__full--toggle &__ranges__title {
		@apply bg-blue-700;
		padding: 5px 10px;
		border-radius: 5px;
		@apply text-sm;
		color: white;
		text-transform: uppercase;

		&:after {
			display: none;
		}
	}

	&__inputs {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 20px;
	}

	&__input {
		&__row {
			flex-basis: 40%;
			max-width: 40%;
			/*@include input-row;*/
			margin-bottom: 0;
			height: 100%;

			input[readonly] {
				pointer-events: all;
				cursor: pointer;
				opacity: 1;
				padding-bottom: 5px;
				height: auto;
				font-size: 14px;
				line-height: 17px;

				& + label {
					font-size: 8px;
					line-height: 10px;
					text-transform: none;
					opacity: 1;
				}
			}

			&.-active {
				input {
					@apply text-blue-700;
					pointer-events: none;
					cursor: default;
					@apply border-solid  border-blue-700

					& + label {
						@apply text-blue-700;
					}
				}
			}
		}

		&__icon {
			padding-left: 15px;
			padding-right: 15px;
			position: relative;
			width: 24px;
			height: 24px;
			background-image: url("/svg/full-arrow-right.svg");
			background-size: 24px;
			background-position: center center;
			background-repeat: no-repeat;
		}
	}

	&__back {
		padding-left: 20px;
		margin-bottom: 20px;
		position: relative;
		cursor: pointer;
		pointer-events: all;

		&__title {
			@apply text-base;
			text-transform: uppercase;
		}

		&:before {
			position: absolute;
			left: 0;
			top: 50%;
			content: "";
			transform: translateY(-50%);
			background-image: url("/svg/arrow-prev.svg");
			background-size: 14px;
			width: 14px;
			height: 14px;
		}
	}
}
</style>