<template>
    <div>
        <v-autocomplete
            v-model="val"
            :items="items"
            item-value="id"
            item-text="text"
            :label="title"
            :multiple="false"
            chips
            deletable-chips
            small-chips
        >
            <template v-slot:append>
                <abp-icon-button
                    :disabled="!val"
                    icon="mdi-close"
                    tip="Очистить"
                    @click="changeInput(null)"
                ></abp-icon-button>
            </template>
        </v-autocomplete>
    </div>
</template>

<script>
    import ABPIconButtonVue from '../Form/ABPIconButton.vue';

    export default {
        name: 'boolean-filter',
        components: {
            'abp-icon-button': ABPIconButtonVue
        },
        model: {
            prop: "inputValue",
            event: "input"
        },
        props: {
            inputValue: {
                required: true,
            },
            title: {
                type: String,
                required: false
            },
        },
        data() {
            return {
                items:[
                    {'id':1, 'text':'Да'},
                    {'id':0, 'text':'Нет'}
                ]
            }
        },
        computed: {
            val: {
                get() {
                    if (this.inputValue==1 || this.inputValue==0)
                        return this.inputValue;
                    else
                        return null
                },
                set(newValue) {
                    this.$emit('input', newValue)
                }
            }
        },
        methods: {
            changeInput(newValue) {
                this.$emit('input',newValue)
            },
        },

    }
</script>

<style lang="scss" scoped>

</style>
