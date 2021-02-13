import { VueConstructor } from "vue/types/umd";
import { DurationInputArg2 } from "moment";

export type FullDatepickerType = InstanceType<VueConstructor> & {
	getDate: () => string;
	setDate: (value: string) => void;
	setMinDate: (value: string) => void;
	setMaxDate: (value: string) => void;
	setVisibleDate: (value: string) => void;
	openPicker: (data?: Partial<{ showInputPickers: boolean }>) => void;
	closePicker: (data?: Partial<{ showInputPickers: boolean; openRanges: boolean }>) => void;
	setFirstDatePicker: (item: FullDatepickerType) => void;
};

export type DatePickerType = InstanceType<VueConstructor> & {
	selectedDate: string;
	visibleDate: string;
	minDate: string | null;
	closePicker: () => void;
	showInputPickers: boolean;
	open: boolean;
	openRanges: boolean;
	firstPicker: FullDatepickerType;
	otherPicker: FullDatepickerType;
};

export type DatePickerRange = {
	range?: {
		value: string;
		field: DurationInputArg2;
	};
	min?: string;
	max?: string;
}

export type SelectValue = {
	value: string;
	title: string;
};
