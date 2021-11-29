<template>
  <div>
    <!-- {{itemValue}} {{itemText}} -->
    <!-- {{ items }} -->
    <!-- select-input = {{val}} -->
    <!-- {{this.required}} || {{this.readonly}} -->
    <!-- {{ lazyLoad }} -->
    <v-autocomplete
      v-model="val"
      :loading="selectLoading"
      :items="items"
      :item-value="itemValue"
      :item-text="itemText"
      :label="title"
      :multiple="multiple"
      :readonly="readonly"
      :rules="rules"
      :hint="hint"
      persistent-hint
      :clearable="false"
      :chips="withChips"
      :deletable-chips="withChips"
      :small-chips="withChips"
      :dense="dense"
      :disabled="disabled"
      :search-input.sync="search"
      @change="change($event)"
    >
      <template v-slot:prepend-item>
        <slot name="prepend-item"></slot>
      </template>
      <template v-slot:item="data">
        <slot name="item" v-bind:data="data"></slot>
      </template>
      <template v-slot:append>
        <slot name="append"></slot>
        <abp-icon-button
          :disabled="!isClearable"
          icon="mdi-close"
          tip="Очистить"
          :disable-tab="true"
          @click="clearInput"
        ></abp-icon-button>
      </template>
      <template v-slot:prepend-inner>
        <slot name="prepend"></slot>
      </template>
      <template v-slot:append-item>
        <slot name="append-item"> </slot>
      </template>
    </v-autocomplete>
  </div>
</template>

<script>
import ABPIconButtonVue from "./ABPIconButton.vue";
import _ from "lodash";

export default {
  name: "select-input",
  model: {
    prop: "inputValue",
    event: "input",
  },
  props: {
    inputValue: {
      required: true,
    },
    loading: {
      type: Boolean,
      required: false,
      default: false,
    },
    items: {
      type: Array,
      required: true,
    },
    itemValue: {
      type: String,
      required: false,
      default: "id",
    },
    itemText: {
      type: String,
      required: false,
      default: "select_list_title",
    },
    clearable: {
      type: Boolean,
      required: false,
      default: true,
    },
    multiple: {
      type: Boolean,
      required: false,
      default: false,
    },
    readonly: {
      type: Boolean,
      required: false,
      default: false,
    },
    required: {
      type: Boolean,
      required: false,
      default: false,
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    title: {
      type: String,
      required: false,
      default: "",
    },
    hint: {
      type: String,
      required: false,
      default: "",
    },
    // чипсы вместо наименования
    withChips: {
      type: Boolean,
      required: false,
      default: false,
    },
    // без отступов - сжатый по высоте режим
    dense: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  components: {
    "abp-icon-button": ABPIconButtonVue,
  },
  mounted() {
    this.$emit("loaded");
  },
  data() {
    return {
      search: null,
    };
  },
  methods: {
    changeInput(newValue) {
      this.$emit("input", newValue);
    },
    change(newValue) {
      this.$emit("change", newValue);
    },
    // поиск с ожиданием
    doSearch: _.debounce(function(string) {
      let needSearch = true;
      if (this.val) {
        if (
          this.items.findIndex((row) => {
            return row.select_list_title == string;
          }) !== -1
        )
          needSearch = false;
      }
      // console.log(`search = ${string}, needSearch=${needSearch}`);
      if (needSearch) this.$emit("search", string);
    }, 1200),
    // очистка
    clearInput() {
      // if (this.multiple) {
      //   this.changeInput([]);
      // } else {
      //   this.changeInput(null);
      // }
      this.$emit("clear");
    },
  },
  computed: {
    // значение селекта
    val: {
      get() {
        if (this.multiple) {
          if (Array.isArray(this.inputValue)) {
            return this.inputValue.map((i) => {
              return parseInt(i);
            });
          } else {
            return this.inputValue;
          }
        } else {
          return parseInt(this.inputValue);
        }
      },
      set(newValue) {
        this.$emit("input", newValue);
      },
    },
    rules() {
      if (this.required && !this.readonly) {
        if (this.multiple) {
          return [
            // v => (!!v && v.length>1 || (v.length==1 && v[0]>1)) || this.requireMsg
            true,
          ];
        } else {
          return [(v) => (!!v && v > 1) || this.requireMsg];
        }
      } else {
        return [true];
      }
    },
    requireMsg() {
      if (this.multiple) {
        return `Выберите 1 или несколько значений из спиcка`;
      } else {
        return `Выберите значение из спиcка`;
      }
    },
    isClearable() {
      return this.clearable && !this.readonly;
    },
    selectLoading() {
      return this.loading;
      // return false
    },
  },
  watch: {
    search(val) {
      this.doSearch(val);
    },
  },
};
</script>

<style lang="scss" scoped></style>
