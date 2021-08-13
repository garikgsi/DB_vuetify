<template>
  <div>
    <!-- {{fileSrc}} -->
    <v-file-input
      v-if="!isServerImg"
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
      accept="image/png, image/jpeg, image/bmp"
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
      :loading="imgLoading"
    >
      <template v-slot:append>
        <div v-if="!imgLoadingError">
          <v-row no-gutters>
            <v-col cols="1" class="text-left">
              <v-btn icon @click="toggleImagePreview">
                <v-icon>{{ resizeIcon }}</v-icon>
              </v-btn>
            </v-col>
            <v-col cols="10">
              <v-img
                :contain="imageContain"
                :max-height="maxHeight"
                :height="maxHeight"
                max-width="500"
                :src="imageSrc"
                @error="imageError"
                @load="imgLoadComplete"
              ></v-img>
            </v-col>
            <v-col cols="1" class="text-left">
              <confirm
                :disabled="readonly"
                title="Подтвердите удаление"
                :text="'Вы действительно хотите удалить изображение?'"
                @confirmPress="deleteFile()"
              >
                <v-btn :disabled="readonly" icon>
                  <v-icon>{{ icons.delete }}</v-icon>
                </v-btn>
              </confirm>
            </v-col>
          </v-row>
        </div>
      </template>
    </v-text-field>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
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
      showSmallImage: true,
      files: null,
      imgLoading: true,
      imgLoadingError: false,
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
    toggleImagePreview() {
      this.showSmallImage = !this.showSmallImage;
    },
    deleteFile() {
      this.fileSrc = null;
      this.files = null;
      // this.$emit('input', this.fileSrc)
    },
    imageError() {
      console.log("Не удалось загрузить изображение " + this.imageSrc);
      this.deleteFile();
      this.imgLoadingError = true;
    },
    imgLoadComplete() {
      this.imgLoading = false;
    },
  },
  computed: {
    ...mapState([]),
    ...mapGetters(["icons"]),
    fileSrc: {
      get() {
        return this.inputValue;
      },
      set(val) {
        this.$emit("input", val);
      },
    },
    imageContain() {
      return !this.showSmallImage;
    },
    maxHeight() {
      if (this.showSmallImage) return 35;
      else return null;
    },
    resizeIcon() {
      if (this.showSmallImage) return "mdi-image-size-select-large";
      else return "mdi-image-size-select-small";
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
      return this.settings.icon || "mdi-camera";
    },
    isServerImg() {
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
      return `http://api.test/storage/thumbs/${this.fileSrc}`;
    },
  },
};
</script>
