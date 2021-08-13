<template>
    <div>
        <v-row
            v-if="filters && !!vals"
            dense
        >
            <v-col
                cols="12"
                :sm="6"
                :md="4"
                :lg="3"
                :xl="2"
                class="px-2"
                v-for="(filter,i) in filters"
                :key="`filter_${i}`"
            >
                <abp-filter
                    v-model="vals[filter.name]"
                    :filter="filter"
                    @input="syncFilters()"
                />
            </v-col>
        </v-row>
    </div>
</template>

<script>
    import ABPFilter from './ABPFilter'

    export default {
        name: 'simple-filters',
        components: {
            'abp-filter' : ABPFilter
        },
        model: {
            prop: "inputValue",
            event: "input"
        },
        props: {
            inputValue: {
                type: Object,
                required: true
            },
            filters: {
                required: true
            },
        },
        computed: {
            vals: {
                get() {
                    return this.inputValue
                },
                set(newVal) {
                    this.$emit('input', newVal)
                }
            }
        },
        methods: {
            syncFilters(){
                this.$emit('input',this.vals)
            }
        },
    }
</script>

<style lang="scss" scoped>

</style>
