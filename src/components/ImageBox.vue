<template>
    <div>
        <v-card
            :disabled="isDisabled"
        >
            <v-img
                :src="file.preview"
                :lazy-src="file.preview"
                :aspect-ratio="1.3333"
                min-height="98px"
                class="white--text align-end"
            >
                <v-card-title>
                    <v-icon
                        color="white"
                        large
                    >
                        {{file.driver=='google'?'mdi-google-drive':'mdi-database'}}
                    </v-icon>
                </v-card-title>
                <v-card-text>{{file.name}}</v-card-text>
            </v-img>

            <v-card-actions>
                <v-spacer></v-spacer>
                    <v-btn
                        icon
                        :color="file.is_main?'pink':''"
                        @click="!file.is_main?makeMain(file.id):null"
                    >
                        <v-icon>mdi-star</v-icon>
                    </v-btn>
                    <v-btn
                        icon
                        :href="file.url"
                        target="_blank"
                    >
                        <v-icon>mdi-download</v-icon>
                    </v-btn>
                    <v-btn
                        icon
                        @click="editImage(file)"
                    >
                        <v-icon>mdi-pencil</v-icon>
                    </v-btn>
                    <abp-confirm
                        title="Действительно удалить?"
                        text="Внимание! Файл удаляется без возможности восстановления"
                        v-model="deleteDialogOpen"
                        @confirmPress="removeFile(file.id)"
                    >
                        <template v-slot:activator="{ on, attrs }">
                            <v-btn
                                v-bind="attrs"
                                v-on="on"
                                icon
                            >
                                <v-icon>mdi-delete</v-icon>
                            </v-btn>
                        </template>
                    </abp-confirm>
                <v-spacer></v-spacer>
            </v-card-actions>
        </v-card>
    </div>
</template>

<script>
    import Confirm from './Dialogs/Confirm.vue'
    export default {
        name: 'image-box',
        props: {
            file: {
                type: Object,
                required: true
            },
            loading: {
                type: Boolean,
                required: false,
                default: false
            },
            disabled: {
                type: Boolean,
                required: false,
                default: false
            }

        },
        components:{
            'abp-confirm' : Confirm,
        },
        data() {
            return {
                deleteDialogOpen: false
            }
        },
        methods: {
            makeMain(id) {
                this.$emit('makeMain', id)
            },
            removeFile(file) {
                this.$emit('removeFile', file)
            },
            editImage(file) {
                this.$emit('editFile', file)
            }
        },
        computed: {
            isDisabled() {
                return this.loading || this.disabled || false
            }
        }
    }
</script>

<style lang="scss" scoped>

</style>
