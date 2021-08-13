<template>
    <div>
        <v-combobox
            v-model="values"
            :items="groups"
            label="Группы"
            item-text="tag"
            item-value="tag_id"
            multiple
            chips
            deletable-chips
            clearable
            hide-selected
            :persistent-hint="!loading"
            :loading="tagsLoading"
            :disabled="tagsLoading"
            hint="Выбирайте из списка или напечатайте новую группу"
            prepend-icon="mdi-pound"
            @blur="save"
        >
        </v-combobox>
    </div>
</template>

<script>
    import { mapGetters, mapActions } from 'vuex'
    export default {
        name: 'abp-groups',
        props: {
            table: {
                type: String,
                required: true,
            },
            id: {
                type: [Number, String],
                required: true
            },
        },
        data() {
            return {
                modData: [],
                loading: false,
                changed: false,
                groupsLoaded: false,
                groupValuesLoaded: false,
            }
        },
        created() {
            // подгрузим список групп
            this.getGroups(this.table).then(()=>{
                this.groupsLoaded = true
            })
            // подгрузим значения
            this.getGroupValues({table:this.table, id:this.id}).then(()=>{
                this.groupValuesLoaded = true
            })
        },
        computed: {
            ...mapGetters(['isLoading']),
            groups() {
                if (this.$store.state.groups.groups[this.table]) {
                    return this.$store.state.groups.groups[this.table]
                } else {
                    return []
                }
            },
            tagsLoading() {
                return this.loading || this.isLoading || !this.groupsLoaded || !this.groupValuesLoaded
            },
            saveBtnDisabled() {
                return this.tagsLoading || !this.changed
            },
            values: {
                get() {
                    if (this.$store.state.groups.groups_values[`${this.table}_${this.id}`]) {
                        let vals = this.$store.state.groups.groups_values[`${this.table}_${this.id}`]
                        return vals.map(item=>{
                            return {tag_id:item.tag_id, tag:item.tag}
                        })
                    } else {
                        return []
                    }
                },
                set(newValue) {
                    this.modData = newValue
                    this.changed = true
                }
            }
        },
        methods: {
            ...mapActions(['getGroups','getGroupValues','saveGroups']),
            save() {
                if (this.changed) {
                    this.saveGroups({table:this.table, id:this.id, data:this.modData})
                        .then(()=>{
                            this.changed = false
                        })
                }
            },
        }
    }
</script>

<style lang="scss" scoped>

</style>
