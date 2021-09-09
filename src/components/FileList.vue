<template>
    <div>
    <v-card
        class="mx-auto"
        tile
        flat
        :disabled="disabled"
        :loading="disabled"
    >
        <v-card-text>
        <slot name="top"></slot>
        <v-list
            two-line
            dense
            v-if="files.length>0"
        >
            <template
                v-for="file in files"
            >
                <v-divider
                    :key="`div_${file.id}`"
                ></v-divider>
                <v-list-item
                    :key="`item_${file.id}`"
                >
                    <v-list-item-icon>
                    <v-icon large color="grey lighten-2" v-text="file.driver=='google'?'mdi-google-drive':'mdi-database'"></v-icon>
                    </v-list-item-icon>

                    <v-list-item-content>
                        <v-list-item-title v-text="`${file.name} (${file.extension})`"></v-list-item-title>
                        <v-list-item-subtitle v-text="!!file.comment ? file.comment : ''"></v-list-item-subtitle>
                    </v-list-item-content>

                    <v-list-item-action>
                        <v-row>
                                <v-btn
                                    :disabled="!file.preview || file.driver!='google'"
                                    icon
                                    :href="file.preview"
                                    target="_blank"
                                >
                                    <v-icon>mdi-book-open-variant</v-icon>
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
                                    v-if="confirmDelete"
                                    title="Действительно удалить?"
                                    text="Внимание! Файл удаляется без возможности восстановления"
                                    @confirmPress="removeFile(file.id)"
                                >
                                    <v-btn
                                        icon
                                    >
                                        <v-icon>{{deleteIcon}}</v-icon>
                                    </v-btn>
                                </abp-confirm>
                                <v-btn
                                    v-else
                                    icon
                                    @click.stop="removeFile(file.id)"
                                >
                                    <v-icon>{{deleteIcon}}</v-icon>
                                </v-btn>
                        </v-row>

                    </v-list-item-action>
                </v-list-item>
            </template>
        </v-list>
        <div
            v-else
        >
            Пока нет файлов
        </div>
        </v-card-text>
        </v-card>
    </div>
</template>

<script>
    import Confirm from './Dialogs/Confirm.vue'

    export default {
        name: 'file-list',
        props: {
            files: {
                type: Array,
                required: true
            },
            loading: {
                type: Boolean,
                required: false,
                default: false
            },
            deleteIcon: {
                type:String,
                required: false,
                default: 'mdi-delete'
            },
            confirmDelete: {
                type: Boolean,
                required: false,
                default: true
            },
            disabled: {
                type: Boolean,
                required: false,
                default: false
            },
            color: {
                type: String,
                required: false,
                default: 'primary'
            }
        },
        components:{
            'abp-confirm' : Confirm,
        },
        methods: {
            removeFile(file) {
                this.$emit('removeFile', file)
            },
            editImage(file) {
                this.$emit('editFile', file)
            },
            addFile() {
                this.$emit('addFile')
            }
        }
    }
</script>

<style lang="scss" scoped>

</style>
