<template>
    <div>
        <abp-select-input
            table="nomenklatura"
            :inputValue="inputValue"
            :editable="false"
            :title="title"
            :hint="hint"
            :required="required"
            :readonly="readonly"
            :disabled="disabled"
            dense
            @input="changeInput($event)"
        >
            <template v-slot:append>
                <abp-icon-button
                    icon="mdi-music-accidental-sharp"
                    tip="Серийные номера"
                    :disable-tab="true"
                    @click="openSeries"
                ></abp-icon-button>
            </template>
        </abp-select-input>

        <!-- диалог управления серийниками -->
        <abp-dialog
            title = "Серийные номера"
            v-model = "showSeries"
        >
            серийники здесь
        </abp-dialog>
    </div>
</template>

<script>
    import ABPDialogVue from '../Dialogs/ABPDialog.vue'
    import ABPIconButtonVue from './ABPIconButton.vue'
    import ABPSelectInputVue from './ABPSelectInput.vue'

    export default {
        name: 'nomenklatura-input',
        components: {
            'abp-select-input' : ABPSelectInputVue,
            'abp-icon-button' : ABPIconButtonVue,
            'abp-dialog': ABPDialogVue
        },
        model: {
            prop: "inputValue",
            event: "input"
        },
        props: {
            inputValue: {
                required: true,
            },
            readonly: {
                type: Boolean,
                required: false,
                default: false
            },
            required: {
                type: Boolean,
                required: false,
                default: false
            },
            disabled: {
                type: Boolean,
                required: false,
                default: false
            },
            title: {
                type: String,
                required: false,
                default: ''
            },
            hint: {
                type: String,
                required: false,
                default: ''
            },
        },
        data() {
            return {
                // открыт диалог ввода серийников
                showSeries: false
            }
        },
        methods: {
            changeInput(newValue) {
                this.$emit('input',newValue)
            },
            // открываем диалог управления серийными номерами
            openSeries() {
                this.showSeries = true
            }
        }
    }
</script>

<style lang="scss" scoped>

</style>
