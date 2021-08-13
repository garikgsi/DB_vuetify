<template>
  <div :style="untouchStyle">
    <v-input
      :label="settings.title"
      :rules="rules"
      :readonly="readonly"
      v-model="inputValue"
    >
      <textarea :value="inputValue" :id="id"></textarea>
    </v-input>
  </div>
</template>

<script>
import tinymce from "tinymce";
// import theme from 'tinymce/themes/modern/theme'
// import autolink from 'tinymce/plugins/autolink'
// import advlist from 'tinymce/plugins/advlist'
// import lists from 'tinymce/plugins/lists'
// import link from 'tinymce/plugins/link'
// import image from 'tinymce/plugins/image'
// import charmap from 'tinymce/plugins/charmap'
// import print from 'tinymce/plugins/print'
// import preview from 'tinymce/plugins/preview'
// import anchor from 'tinymce/plugins/anchor'
// import searchreplace from 'tinymce/plugins/searchreplace'
// import visualblocks from 'tinymce/plugins/visualblocks'
// import tinymce_code from 'tinymce/plugins/code'
// import fullscreen from 'tinymce/plugins/fullscreen'
// import insertdatetime from 'tinymce/plugins/insertdatetime'
// import media from 'tinymce/plugins/media'
// import table from 'tinymce/plugins/table'
// import contextmenu from 'tinymce/plugins/contextmenu'
// import paste from 'tinymce/plugins/paste'
// import code from 'tinymce/plugins/code'
// import codesample from 'tinymce/plugins/codesample'

import Services from "../../siteAdminServices.js";

export default {
  model: {
    prop: "inputValue",
    event: "input",
  },
  props: {
    inputValue: {
      required: true,
      default: "",
    },
    settings: {
      type: Object,
      required: false,
    },
  },

  mounted() {
    // Init tinymce
    tinymce.init({
      selector: "#" + this.id,
      menubar: false,
      toolbar: this.toolbar,
      readonly: this.readonly,
      language: "ru",
      plugins: [
        "advlist autolink lists link image charmap print preview anchor",
        "searchreplace visualblocks code fullscreen",
        "insertdatetime media table contextmenu paste code",
      ],
      init_instance_callback: (editor) => {
        this.editor = editor;

        editor.on("input", () => {
          this.changeInput(editor.getContent());
        });
        editor.on("change", () => {
          this.changeInput(editor.getContent());
        });

        if (this.inputValue) editor.setContent(this.inputValue);
        // поле формы загружено
        this.$emit("loaded");
        // console.log('tinymce initialized')
      },
      relative_urls: false,
      file_browser_callback: function(field_name, url, type) {
        var x =
          window.innerWidth ||
          document.documentElement.clientWidth ||
          document.getElementsByTagName("body")[0].clientWidth;
        var y =
          window.innerHeight ||
          document.documentElement.clientHeight ||
          document.getElementsByTagName("body")[0].clientHeight;

        var cmsURL = "/laravel-filemanager?field_name=" + field_name;
        if (type == "image") {
          cmsURL = cmsURL + "&type=Images";
        } else {
          cmsURL = cmsURL + "&type=Files";
        }

        tinymce.activeEditor.windowManager.open({
          file: cmsURL,
          title: "Выбор файлов и изображений на сервере",
          width: x * 0.8,
          height: y * 0.8,
          resizable: "yes",
          close_previous: "no",
        });
      },
    });
  },
  data() {
    return {
      editor: null,
      changed: false,
      toolbar:
        "undo redo | insert | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | code",
    };
  },
  methods: {
    changeInput(newValue) {
      this.changed = true;
      this.$emit("input", newValue);
    },
  },
  watch: {
    inputValue(newValue) {
      if (this.editor) {
        if (!this.changed) this.editor.setContent(newValue);
        this.changed = false;
      }
      this.$emit("input", newValue);
    },
  },
  computed: {
    isDisabled() {
      return this.readonly || false;
    },
    id() {
      return "tinyMce_" + Services.genS4();
    },
    rules() {
      if (!this.readonly && this.required) {
        return [(v) => !!v || `Заполните ${this.settings.title}`];
      } else {
        return [true];
      }
    },
    untouchStyle() {
      if (this.readonly) {
        return {
          touchAction: "none",
        };
      } else {
        return {};
      }
    },
    readonly() {
      return this.settings.readonly || false;
    },
    required() {
      return this.settings.require || false;
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep .v-input__slot {
  width: 100% !important;
  display: block !important;
}
</style>
