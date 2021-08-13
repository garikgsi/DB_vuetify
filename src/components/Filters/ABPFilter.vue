<template>
    <div>
        <component
            :is="componentName"
            v-if="componentLoaded"
            v-bind="filter"
            :inputValue="inputValue"
            @input="changeInput($event)"
        />
        <!-- <ul>
            <li>{{filter.name}}({{filter.type}})={{inputValue}}</li>
        </ul> -->
    </div>
</template>

<script>
import BooleanFilterVue from './BooleanFilter.vue';
import DateFilterVue from './DateFilter.vue';

    export default {
        name: 'abp-filter',
        components: {
            'groups-filter': () => import('./GroupsFilter.vue'),
            'select-filter': () => import('./SelectFilter.vue'),
            'boolean-filter': BooleanFilterVue,
            'date-filter' : DateFilterVue,
            'radio-filter': () => import('./RadioFilter.vue'),
            'search-filter': () => import('./SearchFilter.vue'),
        },
        model: {
            prop: "inputValue",
            event: "input"
        },
        props: {
            inputValue: {
                required: true,
            },
            filter: {
                type: Object,
                required: true
            }
        },
        computed: {
            componentName() {
                let componentName = null
                switch(this.filter.type) {
                    case 'string': {
                        componentName = 'search-filter'
                    } break;
                    case 'groups': {
                        componentName = 'groups-filter'
                    } break;
                    case 'select': {
                        componentName = 'select-filter'
                    } break;
                    case 'boolean': {
                        componentName = 'boolean-filter'
                    } break;
                    case 'radio': {
                        componentName = 'radio-filter'
                    } break;
                    case 'date': {
                        componentName = 'date-filter'
                    } break;
                }
                return componentName
            },
            componentLoaded() {
                if (this.componentName) {
                    switch(this.filter.type) {
                        case 'select': {
                            return !!this.filter.table
                        }
                        default: {
                            return true
                        }
                    }
                }
                return false
            }
        },
        methods: {
            changeInput(newValue) {
                this.$emit('input', newValue)
            },
        }
    }
</script>

<style lang="scss" scoped>
</style>
