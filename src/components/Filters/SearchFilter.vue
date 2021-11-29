<template>
  <div>
    <v-text-field
      v-model="searchText"
      label="Поиск по таблице..."
      hint="Введите фразу для поиска в таблице"
      single-line
      hide-details
      :dark="dark"
      :class="currentClass"
      @change="searchTextChange"
      @focus="focus"
      @blur="blur"
    >
      <!-- <template v-slot:append>
        <abp-icon-button
          :disabled="searchText.length == 0"
          icon="mdi-close"
          tip="Очистить"
          @click="clearText"
        ></abp-icon-button>
      </template> -->
      <template v-slot:append>
        <v-icon :disabled="!hasText" @click="clearText">
          {{ hasText ? "mdi-magnify-close" : "mdi-magnify" }}
        </v-icon>
      </template>
    </v-text-field>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
// import ABPIconButtonVue from "../Form/ABPIconButton.vue";
export default {
  name: "search-filter",
  components: {
    // "abp-icon-button": ABPIconButtonVue,
  },
  model: {
    prop: "inputValue",
    event: "change",
  },
  props: {
    inputValue: {
      required: true,
    },
    dark: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      currentValue: this.inputValue ? this.inputValue : "",
      focused: false,
    };
  },
  methods: {
    searchTextChange() {
      this.$emit("input", this.currentValue);
    },
    clearText() {
      this.currentValue = "";
      this.searchTextChange();
    },
    focus() {
      this.focused = true;
      this.$emit("selected", true);
    },
    blur() {
      this.focused = false;
      this.$emit("selected", false);
    },
  },
  computed: {
    ...mapGetters(["isMobile"]),
    currentClass() {
      return !this.focused && this.isMobile ? "tiny-width" : "full-width";
    },
    searchText: {
      get() {
        return this.inputValue ? this.inputValue : "";
      },
      set(newValue) {
        this.currentValue = newValue;
      },
    },
    hasText() {
      return this.searchText.length > 0;
    },
  },
};
</script>

<style lang="scss" scoped>
.full-width {
  width: calc(100% - 15px);
}
.tiny-width {
  width: 70px;
}
</style>
