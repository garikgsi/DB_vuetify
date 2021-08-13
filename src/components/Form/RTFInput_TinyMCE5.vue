<template>
    <div>
        <span>{{label}}</span>
        <editor
            :disabled="isDisabled"
            :value="inputValue"
            :init="{file_picker_callback: file_picker_callback}"
            :inline=false
            :plugins="tinyMcePlugins"
            :toolbar="tinyMceToolbar"
            @change="changeInput($event)"
        />
    </div>
</template>

<script>
    import Editor from '@tinymce/tinymce-vue'

    export default {
        model: {
            prop: "inputValue",
            event: "change"
        },
        props: ['inputValue','label','required','readonly'],
        data() {
            return {
                tinyMcePlugins: 'image imagetools',
                tinyMceToolbar: 'undo redo | styleselect | bold italic | link image editimage',
            }
        },
        methods: {
            changeInput(newValue) {
                this.$emit('change',newValue)
            },
            file_picker_callback : function(callback) {
                callback('1.jpg')
                // const body = document.getElementsByTagName('body')[0];
                // var x = window.innerWidth || document.documentElement.clientWidth || body.clientWidth;
                // var y = window.innerHeight|| document.documentElement.clientHeight|| body.clientHeight;

                // let input_id = 'tiny_input'
                // var input = document.createElement('input')
                // input.id = input_id
                // body.appendChild(input)
                // input.addEventListener('change',function() {
                //     let ret_val = this.value
                //     callback(ret_val)
                //     body.removeChild(input)
                // })

                // var cmsURL = window.location.origin + '/laravel-filemanager?type=Files&field_name='+input_id;

                // tinymce.activeEditor.windowManager.open({
                //     file : cmsURL,
                //     title : 'Filemanager',
                //     width : x * 0.8,
                //     height : y * 0.8,
                //     resizable : "yes",
                //     close_previous : "no"
                // });
            }
        },
        computed: {
            isDisabled() {
                return this.readonly || false
            }
        },
        components: {
            'editor': Editor,
        },
    }
</script>

<style lang="scss">
    .tox-notification--in {
        display: none !important;
    }
</style>
