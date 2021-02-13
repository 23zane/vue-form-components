<template>
	<div id="app">
		<text-input label="text input" v-model="formData.name"></text-input>
		<select-input :options="[{
			value: 'ciao',
			title : 'ciao'
		}]" placeholder="seleziona x" value=""></select-input>
	</div>
</template>

<script lang="ts">
import useValidation, { GenericInput } from "@23zane/vue-validator";
import { defineComponent, reactive } from "vue-demi";
import TextInput from "@/components/views/TextInput.vue";
import SelectInput from "@/components/views/SelectInput.vue";

export default defineComponent({
	name: "App",
	components: {
		SelectInput,
		TextInput,
	},
	setup(){
		type FormData = {
			name: string;
			surname: string;
			email: string;
			privacy: boolean;
		}

		const inputs: Record<keyof FormData, GenericInput> = {
			name: {
				name: 'name',
				mandatory: false,
				rules: ['requiredIf:surname,'],
			},
			surname: {
				name: 'surname',
				mandatory: false,
				rules: ['requiredIf:name,'],
			},
			email: {
				name: 'email',
				mandatory: true,
				rules: []
			},
			privacy: {
				name: 'privacy',
				mandatory: true,
				rules: ['boolean']
			}
		};
		const formData = reactive<FormData>({
			name: "test",
			surname: "",
			email: "",
			privacy: false
		});

		const {v, isInvalid, isInputInvalid, isInputTouched} = useValidation<FormData, string | boolean>(inputs, formData, false, undefined, {
			onInputChange(key){
				v.value[key].$touch();
			},
			onInputInvalid(key){
				console.info(`${key} invalid`);
			}
		});

		return {
			formData,
			v,
			isInvalid,
			isInputInvalid,
			isInputTouched
		}
	}
});
</script>

<style lang="scss">
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
	margin-top: 60px;
}
</style>
