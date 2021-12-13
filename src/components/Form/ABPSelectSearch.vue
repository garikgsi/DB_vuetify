<template>
  <v-toolbar color="primary" dark dense flat tile>
    <abp-icon-button
      v-if="!disableParams"
      icon="mdi-sort-bool-descending-variant"
      large
      tip="Подбор по параметрам"
      :disabled="disabled"
      @click="doParams"
    ></abp-icon-button>
    <v-text-field
      v-model="search"
      clearable
      hide-details
      hint="test"
      persistent-hint
      autofocus
      prepend-inner-icon="mdi-magnify"
      :loading="loading"
      @blur="focusOut"
    >
    </v-text-field>
    <abp-icon-button
      v-if="!disableAdd"
      :disabled="!completeLoaded || !editable"
      icon="mdi-plus-circle-outline"
      large
      tip="Добавить запись"
      @click="doAdd"
    ></abp-icon-button>
  </v-toolbar>
</template>

<script>
import ABPIconButtonVue from "./ABPIconButton.vue";
export default {
  name: "abp-select-search",
  components: {
    "abp-icon-button": ABPIconButtonVue,
  },
  model: {
    prop: "inputValue",
    event: "input",
  },
  props: {
    inputValue: {
      required: true,
    },
    // добавлять кнопки "добавить" и "редактировать"
    editable: {
      type: Boolean,
      required: false,
      default: true,
    },
    // компонент не активен
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    // индикация загрузки
    loading: {
      type: Boolean,
      required: false,
      default: false,
    },
    // полностью загружены все данные
    completeLoaded: {
      type: Boolean,
      required: false,
      default: true,
    },
    // отключить подбор по параметрам
    disableParams: {
      type: Boolean,
      required: false,
      default: false,
    },
    // убрать функционал добавления записи
    disableAdd: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      //   поисковая фраза
      //   search: this.inputValue,
    };
  },
  methods: {
    // выполняем поиск
    doSearch() {
      //   this.$emit("input", this.search);
    },
    // изменение текстового поля поиска
    doSearchInput() {
      //   try {
      //     if (!this.search || this.search.length == 0) {
      //       this.$emit("input", this.search);
      //     }
      //   } catch (error) {
      //     // do nothing - everityng does this.doSearch
      //   }
      this.$emit("input", this.search);
    },
    // добавление записи
    doAdd() {
      this.$emit("addClick");
    },
    // подбор по параметрам
    doParams() {
      this.$emit("paramsClick");
    },
    // убираем фокус с поиска
    focusOut() {
      this.$emit("blur");
    },
  },
  computed: {
    search: {
      get() {
        return this.inputValue;
      },
      set(newValue) {
        this.$emit("input", newValue);
      },
    },
  },
};
</script>

<style lang="scss" scoped></style>
