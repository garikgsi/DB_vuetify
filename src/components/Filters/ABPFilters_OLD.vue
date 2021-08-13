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
    import { mapActions } from 'vuex'
    import ABPFilter from './ABPFilter'

    export default {
        name: 'abp-filters',
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
            table: {
                type : String,
                required: true
            },
        },
        data() {
            return {
                // vals: this.inputValue
            }
        },
        created() {
            // проверим фильтры в стейте
            if (!this.$store.state.table.filters[this.table]) {
                this.getTableFilters(this.table)
            }
        },
        computed: {
            filters() {
                return this.$store.state.table.filters[this.table] || null
            },
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
            ...mapActions(['getTableFilters']),
            syncFilters(){
                this.$emit('input',this.vals)
            }
        },
    }
</script>

<style lang="scss" scoped>

</style>
