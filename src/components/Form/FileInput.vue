<template>
  <div>
    <v-file-input
      v-if="!isServerFile"
      counter
      show-size
      :value="files"
      :label="settings.title"
      :readonly="readonly"
      :hint="settings.hint"
      :prepend-icon="preIcon"
      :rules="rules"
      clearable
      :multiple="false"
      @change="changeInput($event)"
    >
    </v-file-input>
    <v-text-field
      v-else
      :label="settings.title"
      :readonly="true"
      :prepend-icon="preIcon"
      :value="fileSrc"
      autocomplete="off"
      @click:append="downloadClick"
    >
      <template v-slot:append>
        <v-btn icon :href="fileSrc" target="_blank">
          <v-icon>mdi-download</v-icon>
        </v-btn>
        <confirm
          :disabled="readonly"
          title="Подтвердите удаление"
          :text="'Вы действительно хотите удалить файл?'"
          @confirmPress="deleteFile()"
        >
          <v-btn :disabled="readonly" icon>
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </confirm>
      </template>
    </v-text-field>
  </div>
</template>

<script>
import { mapState } from "vuex";
import Confirm from "../Dialogs/Confirm.vue";

export default {
  components: {
    confirm: Confirm,
  },
  model: {
    prop: "inputValue",
    event: "input",
  },
  props: {
    inputValue: {
      required: true,
    },
    settings: {
      type: Object,
      required: false,
    },
  },
  data() {
    return {
      files: null,
    };
  },
  created() {
    this.files = null;
  },
  mounted() {
    this.$emit("loaded");
  },
  methods: {
    changeInput(newValue) {
      this.files = newValue;
      this.$emit("input", newValue);
    },
    deleteFile() {
      this.fileSrc = null;
      this.files = null;
    },
    downloadClick() {
      // console.log('downloading...')
    },
  },
  computed: {
    ...mapState([]),
    fileSrc: {
      get() {
        return this.inputValue;
      },
      set(val) {
        this.$emit("input", val);
      },
    },
    rules() {
      let myRules = [];
      let baseRules = [
        () => !!this.files || `Заполните ${this.settings.title}`,
      ];
      if (this.settings.max) {
        // переведем размер в байты
        let maxSize = parseInt(this.settings.max) * 1024;
        let mbSize = (parseInt(this.settings.max) / 1024.0).toFixed(1);
        if (maxSize > 0) {
          myRules.push(
            (v) =>
              (!!v && v.length > 0 && v[0].size < maxSize) ||
              !v ||
              `Размер не должен превышать ${mbSize} Мб`
          );
        }
      }

      if (!this.readonly && this.required) {
        if (myRules) {
          return [...baseRules, ...myRules];
        } else {
          return baseRules;
        }
      } else {
        return myRules;
      }
    },
    readonly() {
      return this.settings.readonly || false;
    },
    required() {
      return this.settings.require || false;
    },
    preIcon() {
      return this.settings.icon || "mdi-paperclip";
    },
    isServerFile() {
      if (
        this.fileSrc &&
        typeof this.fileSrc == "string" &&
        this.fileSrc.length > 4
      ) {
        return true;
      } else {
        return false;
      }
    },
    imageSrc() {
      // return this.fileSrc.replace('/storage/thumbs/','/storage/')
      return this.fileSrc;
    },
  },
};
</script>
