<template>
  <div>
    <!-- {{ optionsMixin }} -->
    <abp-select
      table="nomenklatura"
      :inputValue="inputValue"
      :editable="false"
      :title="title"
      :hint="hint"
      :required="required"
      :readonly="readonly"
      :disabled="disabled"
      :closable="closable"
      :options="optionsMixin"
      :tableParamsMixin="tableParams"
      dense
      @input="changeInput($event)"
      @loaded="loaded($event)"
    >
      <template v-slot:item="{ data }">
        <v-list-item-action>
          <stock-balance-chip v-if="!data.item.stock_balance"
            >0</stock-balance-chip
          >
          <stock-balance-chip
            :val="data.item.stock_balance"
            v-else
          ></stock-balance-chip>
        </v-list-item-action>
        <!-- <v-list-item-avatar tile v-if="data.item.main_image">
          <v-img :src="data.item.main_image"></v-img>
        </v-list-item-avatar>
        <v-list-item-icon v-else>
          <v-icon color="grey lighten-1">mdi-image-remove</v-icon>
        </v-list-item-icon>
 -->
        <v-list-item-content>
          <v-list-item-title
            v-text="data.item.select_list_title"
          ></v-list-item-title>
        </v-list-item-content>
      </template>
    </abp-select>
  </div>
</template>

<script>
import ABPSelectVue from "./ABPSelect.vue";
export default {
  name: "stock-balance-input",
  components: {
    // "abp-select-input": () => import("./ABPSelectInput"),
    "stock-balance-chip": () => import("../Misc/StockBalanceChip.vue"),
    "abp-select": ABPSelectVue,
  },
  model: {
    prop: "inputValue",
    event: "input",
  },
  props: {
    inputValue: {
      required: true,
    },
    sklad_id: {
      type: [Number, String],
      required: true,
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
    closable: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  data() {
    return {
      tableParams: {
        modelMixin: [
          { name: "ostatok", show_in_table: false },
          {
            name: "stock_balance",
            show_in_table: true,
            title: "Остаток",
            type: "kolvo",
          },
        ],
      },
    };
  },
  computed: {
    // передаем что данные выбирать из scope
    optionsMixin() {
      return { scope: `stock_balance.${this.sklad_id}` };
    },
    // значение
    val: {
      get() {
        return [this.inputValue];
      },
      set(newVal) {
        this.$emit("input", newVal[0].id);
      },
    },
  },
  methods: {
    // передача значение вместо v-model
    changeInput(newValue) {
      this.$emit("input", newValue);
    },
    // поле ввода загружено
    loaded(isLoaded) {
      if (isLoaded) {
        this.$emit("loaded");
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>
