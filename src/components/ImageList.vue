<template>
    <div>
        <v-row
            v-if="files.length>0"
        >
            <v-col
                v-for="file in files"
                :key="`file${file.id}`"
                class="d-flex child-flex"
                cols="12"
                sm="6"
                md="4"
                lg="3"
                xl="2"
            >
                <image-box
                    :file="file"
                    :loading="loading"
                    :disabled="disabled"
                    @makeMain="makeMain($event)" 
                    @editFile="editTheFile($event)"
                    @removeFile="removeFile($event)"
                >
                </image-box>
            </v-col>
        </v-row>
        <v-card
            v-else
            tile
            flat
        >
            <v-card-text>
                Пока нет изображений
            </v-card-text>
        </v-card>
    </div>
</template>

<script>
    import ImageBox from './ImageBox.vue'

    export default {
        name: 'image-list',
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
            'image-box' : ImageBox,
        },
        methods: {
            makeMain(id) {
                this.$emit('makeMain', id)
            },
            removeFile(file) {
                this.$emit('removeFile', file)
            },
            editTheFile(file) {
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
