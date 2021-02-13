import {  ref, Ref, watch } from "@vue/composition-api";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const moment = require("moment/moment");

export default function useCommonFunctions() {
	const currencyAmount = (
		value: string | number
	) => {
		return new Intl.NumberFormat("it-IT", {
			style: "currency",
			currency: "EUR",
		}).format(+value);
	};


	const compressImage = (
		event: ProgressEvent<FileReader>,
		file: File
	): Ref<string | null> => {
		const img = new Image();

		img.src = event.target ? event.target.result as string : "";
		const image = ref<string | null>(null);

		img.onload = () => {
			const maxWidth = 1280;
			let width: number;

			const elem = document.createElement(
				"canvas"
			);

			if (img.width < maxWidth) {
				width = img.width;
			} else {
				width = maxWidth;
			}

			const scaleFactor = width / img.width;
			elem.width = width;
			elem.height = img.height * scaleFactor;
			const ctx = elem.getContext("2d");
			// img.width and img.height will contain the original dimensions
			if(ctx) {
				ctx.drawImage(
					img,
					0,
					0,
					width,
					img.height * scaleFactor
				);

				image.value = ctx.canvas.toDataURL(
					file.type,
					0.8
				);
			}
		};

		return image;
	};
	const getFilePreview = (
		file: File
	): Ref<string> => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		const image = ref<string>("");
		reader.onload = (e) => {
			const resultImage = compressImage(
				e,
				file
			);
			watch(resultImage, () => {
				if (resultImage.value) {
					image.value = resultImage.value;
				}
			});
		};

		return image;
	};


	const formatDate = (
		date: string,
		format = "DD/MM/YYYY"
	) => {
		return moment(date, "YYYY-MM-DD").format(
			format
		);
	};

	const checkDateValidity = (
		day: number,
		month: number,
		year: number
	): number => {
		let newDay = day;
		if (day > 0 && month && year) {
			switch (day) {
				case 4:
				case 6:
				case 9:
				case 11:
					if (day > 30) {
						newDay = 30;
					}
					break;
				case 2:
					if (
						day % 4 === 0 &&
						(day % 100 !== 0 ||
							day % 400 === 0)
					) {
						if (day > 29) {
							newDay = 29;
						}
					} else {
						if (day > 28) {
							newDay = 28;
						}
					}
					break;
				default:
					if (day > 31) {
						day = 31;
					}
			}
		}

		return newDay;
	};

	const isSameOrChild = (
		element: HTMLElement,
		target: HTMLElement
	) => {
		if (target === element) {
			return true;
		}

		let currentTarget: HTMLElement | null = target;

		let returnData = false;

		while (currentTarget != null) {
			currentTarget =
				currentTarget.parentElement;
			if (currentTarget === element) {
				returnData = true;
				break;
			}
		}

		return returnData;
	};

	const mapErrorMessage = (
		message?: string,
		errors?: Record<string, string[]>
	) => {
		let finalMessage = "";
		if (errors) {
			finalMessage = Object.keys(errors)
				.map((f) => errors[f].join("<br>"))
				.join("<br>");
		} else if (message) {
			finalMessage = message;
		}

		return finalMessage;
	};

	const mapAmountToString = (value: number) => {
		const stringValue = value.toFixed(2);
		return stringValue.replace(".", ",");
	};

	const mapStringToAmount = (value: string) => {
		const [
			int,
			decimal,
		]: number[] = value
			.split(",")
			.map((item) => +item);
		if (!decimal) {
			return +int;
		}

		return int + decimal * 0.01;
	};

	return {
		currencyAmount,
		getFilePreview,
		compressImage,
		formatDate,
		isSameOrChild,
		mapErrorMessage,
		mapStringToAmount,
		mapAmountToString,
		checkDateValidity,
	};
}
