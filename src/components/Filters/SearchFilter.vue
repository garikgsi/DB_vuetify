<template>
    <div>
        <v-text-field
            v-model="searchText"
            label="Поиск по таблице..."
            hint="Введите фразу для поиска в таблице"
            single-line
            hide-details
            @change="searchTextChange($event)"
            @click:clear="searchTextChange('')"
        >
            <template v-slot:append>
                <abp-icon-button
                    :disabled="searchText.length==0"
                    icon="mdi-close"
                    tip="Очистить"
                    @click="searchTextChange('')"
                ></abp-icon-button>
            </template>
            <template v-slot:prepend>
                <v-btn icon disabled>
                    <v-icon>
                        mdi-magnify
                    </v-icon>
                </v-btn>
            </template>
        </v-text-field>
    </div>
</template>

<script>
    import ABPIconButtonVue from '../Form/ABPIconButton.vue';
    export default {
        name: 'search-filter',
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
        },
        data() {
            return {

            }
        },
        methods: {
            searchTextChange(newValue) {
                this.$emit('input', newValue)
            }
        },
        computed: {
            searchText: {
                get() {
                    return this.inputValue || ''
                },
                set(newVal) {
                    // nothing
                    console.log(newVal)
                }
            }
        }

    }
</script>

<style lang="scss" scoped>

</style>
