<template>
    <div>
        <v-autocomplete
            :disabled="!groupsLoaded"
            :loading="!groupsLoaded"
            :value="inputValue"
            small-chips
            :items="groups"
            label="Фильтр по группам"
            item-text="tag"
            item-value="tag_id"
            multiple
            chips
            deletable-chips
            hide-selected
            hint="Фильтр по группам"
            @input="changeInput($event)"
        >
            <template v-slot:append>
                <abp-icon-button
                    :disabled="!inputValue"
                    icon="mdi-close"
                    tip="Очистить"
                    @click="changeInput(null)"
                ></abp-icon-button>
            </template>
        </v-autocomplete>
    </div>
</template>

<script>
    import { mapActions } from 'vuex'
    import ABPIconButtonVue from '../Form/ABPIconButton.vue'

    export default {
        name: 'groups-filter',
        components: {
            'abp-icon-button': ABPIconButtonVue
        },
        model: {
            prop: "inputValue",
            event: "input"
        },
        props: {
            inputValue: {
                required: true
            },
            table: {
                type : String,
                required: true
            },
        },
        data() {
            return {
                groupsLoaded: false,
            }
        },
        created() {
            // подгрузим список групп
            this.getGroups(this.table).then(()=>{
                this.groupsLoaded = true
            })
        },
        computed: {
            groups() {
                if (this.$store.state.groups.groups[this.table]) {
                    return this.$store.state.groups.groups[this.table]
                } else {
                    return []
                }
            },

        },
        methods: {
            ...mapActions(['getGroups']),
            changeInput(newValue) {
                this.$emit('input',newValue)
            },

        }

    }
</script>

<style lang="scss" scoped>

</style>
