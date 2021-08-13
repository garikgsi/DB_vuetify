<template>
  <v-list-group :value="isExpanded">
    <template v-slot:activator>
      <v-list-item-title class="pa-0" :class="{ 'grey--text': deleted }">
        {{ rowTitle }}
      </v-list-item-title>
    </template>
    <v-list-item>
      <v-row dense class="py-3">
        <v-col
          :cols="12"
          v-for="(col, colIndex) in inputFields"
          :key="`col_${colIndex}`"
          :id="rowId"
          dense
        >
          <nomenklatura-input
            :id="`${rowId}_col_${colIndex}`"
            :title="col.text"
            v-if="col.type == 'nomenklatura'"
            v-model="row[col.value]"
            :clearable="false"
            :required="!deleted"
            :readonly="readonly"
            :disabled="deleted"
            dense
            @loaded="fieldLoaded(col)"
          ></nomenklatura-input>
          <abp-select-input
            :id="`${rowId}_col_${colIndex}`"
            :title="col.text"
            v-else-if="col.type == 'select'"
            :table="col.table"
            v-model="row[col.value]"
            :clearable="false"
            :required="!deleted"
            :readonly="readonly"
            :disabled="deleted"
            dense
            @loaded="fieldLoaded(col)"
          ></abp-select-input>
          <money-input
            :id="`${rowId}_col_${colIndex}`"
            :title="col.text"
            v-else-if="col.type == 'money'"
            v-model="row[col.value]"
            :clearable="false"
            dense
            :require="!deleted"
            :readonly="readonly"
            :disabled="deleted"
            @change="changeInput($event, col)"
            @loaded="fieldLoaded(col.value)"
          ></money-input>
          <kolvo-input
            :id="`${rowId}_col_${colIndex}`"
            :title="col.text"
            v-else-if="col.type == 'kolvo'"
            v-model="row[col.value]"
            :clearable="false"
            dense
            :require="!deleted"
            :readonly="readonly"
            :disabled="deleted"
            @change="changeInput($event, col)"
            @loaded="fieldLoaded(col.value)"
          ></kolvo-input>
          <stock-balance-input
            :id="`${rowId}_col_${colIndex}`"
            :title="col.text"
            v-else-if="col.type == 'stock_balance'"
            v-model="row[col.value]"
            :sklad-id="skladId"
            :clearable="false"
            dense
            :required="!deleted"
            :readonly="readonly"
            :disabled="deleted"
            @change="changeInput($event, col)"
            @loaded="fieldLoaded(col.value)"
          ></stock-balance-input>
          <text-input
            :id="`${rowId}_col_${colIndex}`"
            :title="col.text"
            v-else
            :type="!!col.type ? col.type : 'text'"
            v-model="row[col.value]"
            :clearable="false"
            dense
            :require="!deleted"
            :readonly="readonly"
            :disabled="deleted"
            @change="changeInput($event, col)"
            @loaded="fieldLoaded(col.value)"
          ></text-input>
        </v-col>
        <v-col :cols="12" class="text-right">
          <v-btn
            v-if="deleted"
            text
            color="primary"
            :disabled="readonly"
            @click="restoreRow"
          >
            Восстановить
          </v-btn>
          <v-btn
            v-else
            text
            color="secondary"
            :disabled="readonly"
            @click="removeRow"
          >
            Удалить
          </v-btn>
        </v-col>
      </v-row>
    </v-list-item>
  </v-list-group>
</template>

<script>
import { mapGetters } from "vuex";
import ABPSelectInput from "../Form/ABPSelectInput";
import TextInput from "../Form/TextInput";
import MoneyInputVue from "../Form/MoneyInput.vue";
import KolvoInputVue from "../Form/KolvoInput.vue";
import StockBalanceInputVue from "../Form/StockBalanceInput.vue";
import NomenklaturaInputVue from "../Form/NomenklaturaInput.vue";

export default {
  name: "abp-document-table-row-form",
  components: {
    "abp-select-input": ABPSelectInput,
    "nomenklatura-input": NomenklaturaInputVue,
    "text-input": TextInput,
    "money-input": MoneyInputVue,
    "kolvo-input": KolvoInputVue,
    "stock-balance-input": StockBalanceInputVue,
  },
  model: {
    prop: "row",
    event: "input",
  },
  props: {
    // строка данных
    row: {
      type: Object,
      required: true,
    },
    // заголовки таблицы
    headers: {
      type: Array,
      required: false,
    },
    // # строки
    rowNum: {
      type: [String, Number],
      required: true,
    },
    // таблица
    table: {
      type: String,
      required: false,
    },
    // цветовое оформление иконок и текста
    color: {
      type: String,
      required: false,
      default: null,
    },
    // id строки
    id: {
      type: String,
      required: false,
    },
    // имя поля Цена
    priceName: {
      type: String,
      required: false,
      default: "price",
    },
    // имя поля Количество
    quantityName: {
      type: String,
      required: false,
      default: "kolvo",
    },
    // имя поля Сумма
    amountName: {
      type: String,
      required: false,
      default: "summa",
    },
    // склад для остатков
    skladId: {
      type: [Number, String],
      required: false,
      default: 1,
    },
    // без возможности вносить изменения
    readonly: {
      type: Boolean,
      required: false,
      default: false,
    },
    // удаленная строка
    deleted: {
      type: Boolean,
      required: false,
      default: false,
    },
    // раскрытый итем
    isExpanded: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      rowId: null,
      loadedFields: [],
      openSerials: false,
      openSerialsEditor: false,
    };
  },
  created() {
    // присвоим id строке
    if (this.id) {
      this.rowId = this.id;
    } else {
      this.rowId = `f${(~~(Math.random() * 1e8)).toString(16)}`;
    }
  },
  computed: {
    ...mapGetters(["isMobile"]),
    rowLoaded() {
      // кол-во загруженных полей дб на 2 меньше, чем заголовков (действия и №п/п)
      return Object.keys(this.headers).length == this.loadedFields.length + 2;
    },
    inputFields() {
      let ignoreArray = ["n", "actions"];
      return this.headers.filter((f) => ignoreArray.indexOf(f.value) === -1);
    },
    // номенклатура из стора
    nomenklatura() {
      if (this.$store.state.table.selectData.nomenklatura) {
        return this.$store.state.table.selectData.nomenklatura;
      }
      return [];
    },
    // тайтл строки в отформатированном состоянии
    rowTitle() {
      // если есть номенклатура или остаток - это будет заголовок (в основном только номенклатурный ввод в таблице документов)
      // поищем селект с таблицей номенклатур
      let nomenklaturaField = this.headers.find(
        (f) => f.table == "nomenklatura"
      );
      // тайтл номенклатуры
      //   let nomenklaturaTitle = "";
      // id номенклатуры
      let nomenklaturaId = 0;
      // если найдено поле с выбором номенклатуры
      if (nomenklaturaField) {
        nomenklaturaId = this.row[nomenklaturaField.value];
      }
      // если получен id номенклатуры
      if (nomenklaturaId) {
        // поищем название номенклатуры
        let nomenklatura = this.nomenklatura.find(
          (n) => n.id === nomenklaturaId
        );
        if (nomenklatura) {
          return `${this.rowNum}. ${nomenklatura.select_list_title}`;
        } else {
          // не найдена такая номенклатура в сторе
          return `Запись № ${this.rowNum}`;
        }
      } else {
        return `${this.rowNum}. Новая запись`;
      }
    },
  },
  methods: {
    changeInput(newValue, field) {
      let fieldName = field.value;
      //   let fieldType = field.type;
      if (fieldName == this.priceName) {
        if (this.row[this.quantityName])
          this.row[this.amountName] = parseFloat(
            (newValue * this.row[this.quantityName]).toFixed(2)
          );
      } else if (fieldName == this.quantityName) {
        if (this.row[this.priceName])
          this.row[this.amountName] = parseFloat(
            (newValue * this.row[this.priceName]).toFixed(2)
          );
      } else if (fieldName == this.amountName) {
        if (this.row[this.quantityName])
          this.row[this.priceName] = parseFloat(
            (newValue / this.row[this.quantityName]).toFixed(2)
          );
      }
    },
    removeRow() {
      this.$emit("remove");
    },
    restoreRow() {
      this.$emit("restore");
    },
    seriesEditor() {
      this.openSerialsEditor = true;
    },
    series() {
      this.openSerials = true;
    },
    fieldLoaded(fieldName) {
      this.loadedFields.push(fieldName);
    },
  },
  watch: {
    rowLoaded(newValue) {
      if (newValue) this.$emit("loaded");
    },
  },
};
</script>

<style lang="scss" scoped>
.v-text-field > .v-input__control > .v-input__slot:before {
  border: none;
}
</style>
