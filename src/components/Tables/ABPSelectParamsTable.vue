<template>
  <div>
    <!-- {{ tableParams }} -->
    <!-- {{ multiSelect }} -->
    <!-- {{ val }} -->
    <abp-table
      v-model="val"
      title="Подбор по параметрам"
      :table="table"
      :editable="false"
      :selectable="multiSelect"
      :multi-select="multiSelect"
      :dense="true"
      :show-filters="true"
      :hide-footer="false"
      :hide-header="false"
      :use-data-array="useDataArray"
      :array-count="arrayCount"
      :data-array="dataArray"
      :options="options"
      v-bind="tableParams"
      :item-value="itemValue"
      :selected-id="selectedId"
      @input="changeVal($event)"
      @getData="getData"
      @optionsChanged="optionsChanged($event)"
    >
      <template v-slot:append-top-actions>
        <abp-icon-button
          icon="mdi-check"
          tip="Выбрать"
          @click="selected"
        ></abp-icon-button>
      </template>
    </abp-table>
  </div>
</template>

<script>
export default {
  name: "abp-select-params-table",
  components: {
    "abp-table": () => import("./ABPTable"),
    "abp-icon-button": () => import("../Form/ABPIconButton"),
  },
  model: {
    prop: "inputValue",
    event: "input",
  },
  props: {
    inputValue: {
      required: true,
    },
    table: {
      type: String,
      required: true,
    },
    // данные из внешнего источника
    dataArray: {
      type: Array,
      required: false,
      default() {
        return null;
      },
    },
    // использовать данные из внешнего источника
    useDataArray: {
      type: Boolean,
      required: false,
      default: false,
    },
    // кол-во данных из внешнего источника
    arrayCount: {
      type: Number,
      required: false,
      default: 10,
    },
    // параметры таблицы
    tableParams: {
      type: Object,
      require: false,
    },
    // миксин опций загрузки данных
    options: {
      type: Object,
      required: false,
      default() {
        return {};
      },
    },
    // мультиселект
    multiSelect: {
      type: Boolean,
      required: false,
      default: false,
    },
    // наименование поля с идентификатором в объекте
    itemValue: {
      type: String,
      required: false,
      default: "id",
    },
    // выбранные записи
    selectedId: {
      type: Array || String || Number,
      required: false,
      default() {
        return null;
      },
    },
  },
  computed: {
    val: {
      get() {
        return this.inputValue;
      },
      set(newVal) {
        this.$emit("input", newVal);
      },
    },
  },
  methods: {
    changeVal(newVal) {
      this.val = newVal;
      if (!this.multiSelect) this.selected();
    },
    selected() {
      this.$emit("selected");
    },
    getData() {
      this.$emit("getData");
    },
    optionsChanged(options) {
      this.$emit("optionsChanged", options);
    },
  },
};
</script>

<style lang="scss" scoped></style>
