<template>
  <div>
    <!-- {{allSelectsLoaded}} {{selectsLoaded}} {{selects}} -->
    <!-- {{tableColItog}} -->
    <!-- {{subTableValid}} -->
    <!-- {{items}} -->
    <!-- {{headers}} -->
    <!-- {{formModel}} -->
    <v-form v-model="subTableValid">
      <template v-if="isMobile">
        <v-card width="100%" :elevation="0">
          <v-toolbar elevation="0">
            <v-toolbar-title v-if="title" :class="`${color}--text`">
              {{ title }}
            </v-toolbar-title>
            <v-spacer></v-spacer>
            <div v-if="!noNds"></div>
            <abp-icon-button
              v-if="!noNds"
              icon="mdi-dots-vertical"
              tip="Параметры"
              :color="color"
              @click="toggleParams"
            ></abp-icon-button>
            <template v-slot:extension v-if="showParams">
              <v-spacer></v-spacer>
              <abp-select-input
                class="pt-4"
                table="nds"
                v-model="defaultNds"
                title="Для всех новых записей ставка НДС"
                hint="Суммы вводятся без учета НДС"
                :clearable="false"
              ></abp-select-input>
            </template>
          </v-toolbar>

          <v-card-text>
            <v-list v-if="items && headers">
              <template v-for="(row, rowIndex) in items">
                <abp-document-table-row-form
                  :key="`form_${rowIndex}`"
                  :id="`row_${tableId}_${rowIndex}`"
                  :row-num="rowIndex + 1"
                  :row="row"
                  :headers="headers"
                  :color="color"
                  :sklad-id="skladId"
                  :readonly="readonly"
                  :deleted="row.deleted"
                  :with-series="withSeries"
                  :with-series-editor="withSeriesEditor"
                  :table="table"
                  :is-expanded="newRowLoaded && rowIndex == items.length - 1"
                  @remove="removeRow(rowIndex)"
                  @restore="restoreRow(rowIndex)"
                  @loaded="loaded"
                ></abp-document-table-row-form>
                <v-divider :key="`divider_${rowIndex}`"></v-divider>
              </template>
            </v-list>
          </v-card-text>
        </v-card>
      </template>
      <template v-else>
        <v-data-table
          v-if="items && headers"
          :id="tableId"
          :items="items"
          :headers="headers"
          :items-per-page="-1"
          :page="1"
          :hide-default-footer="true"
          dense
          :sklad-id="skladId"
          :loading="isLoading"
        >
          <!-- заголовок таблицы -->
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title v-if="title" :class="`${color}--text`">{{
                title
              }}</v-toolbar-title>
              <v-spacer></v-spacer>
              <div v-if="!noNds"></div>
              <abp-icon-button
                v-if="!noNds"
                icon="mdi-dots-vertical"
                tip="Параметры"
                :color="color"
                @click="toggleParams"
              ></abp-icon-button>
              <template v-slot:extension v-if="showParams">
                <v-row>
                  <v-spacer></v-spacer>
                  <v-col cols="auto" md="6">
                    <abp-select-input
                      table="nds"
                      v-model="defaultNds"
                      title="Для всех новых записей ставка НДС"
                      hint="Суммы вводятся без учета НДС"
                      :clearable="false"
                    ></abp-select-input>
                  </v-col>
                </v-row>
              </template>
            </v-toolbar>
          </template>
          <!-- тело таблицы - поля ввода заменим инпутами -->
          <template v-slot:body="{ items, headers }">
            <tbody v-if="allSelectsLoaded">
              <template v-for="(row, rowIndex) in items">
                <tr
                  is="abp-document-table-row"
                  :id="`row_${tableId}_${rowIndex}`"
                  :row-num="rowIndex + 1"
                  :key="`row_${rowIndex}`"
                  :row="row"
                  :headers="headers"
                  :color="color"
                  :sklad-id="skladId"
                  :readonly="readonly"
                  :deleted="row.deleted"
                  :with-series="withSeries"
                  :with-series-editor="withSeriesEditor"
                  :table="table"
                  @remove="removeRow(rowIndex)"
                  @restore="restoreRow(rowIndex)"
                  @loaded="loaded"
                ></tr>
              </template>
              <tr class="itogs" v-if="tableColItog && !isLoading">
                <td v-for="(col, i) in headers" :key="`itogCol_${i}`">
                  {{ tableColItog[col.value] }}
                </td>
              </tr>
            </tbody>
            <div v-else>
              <v-progress-linear
                indeterminate
                :color="color"
              ></v-progress-linear>
            </div>
          </template>
        </v-data-table>
      </template>
    </v-form>
    <v-row v-if="!isLoading">
      <v-col>
        <v-btn
          v-if="isMobile"
          text
          :disabled="!subTableValid || readonly"
          :color="color"
          @click="addRow"
        >
          добавить
        </v-btn>
        <abp-icon-button
          v-else
          icon="mdi-plus-circle"
          tip="Новая запись"
          :disabled="!subTableValid || readonly"
          :color="color"
          @click="addRow"
        ></abp-icon-button>
      </v-col>
      <v-col cols="auto"
        >Всего заполнено {{ undeleteItems.length }} наименований</v-col
      >
    </v-row>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import Vue from "vue";
import ABPIconButton from "../Form/ABPIconButton";
import ABPSelectInputVue from "../Form/ABPSelectInput.vue";
import ABPDocumentTableRow from "./ABPDocumentTableRow.vue";
import ABPDocumentTableRowFormVue from "./ABPDocumentTableRowForm.vue";

export default {
  name: "abp-document-table",
  components: {
    "abp-icon-button": ABPIconButton,
    "abp-select-input": ABPSelectInputVue,
    "abp-document-table-row": ABPDocumentTableRow,
    "abp-document-table-row-form": ABPDocumentTableRowFormVue,
  },
  model: {
    prop: "inputValue",
    event: "input",
  },
  props: {
    // массив строк таблицы
    inputValue: {
      type: Array,
      required: true,
      default() {
        return [];
      },
    },
    // таблица
    table: {
      type: String,
      required: true,
    },
    // id таблицы
    id: {
      type: String,
      required: false,
    },
    // Тайтл таблицы
    title: {
      type: String,
      required: false,
    },
    // цветовое оформление иконок и текста
    color: {
      type: String,
      required: false,
      default: null,
    },
    // имя поля Цена
    "price-name": {
      type: String,
      required: false,
      default: "price",
    },
    // имя поля Количество
    "quantity-name": {
      type: String,
      required: false,
      default: "kolvo",
    },
    // имя поля Сумма
    "amount-name": {
      type: String,
      required: false,
      default: "summa",
    },
    // имя поля выбора НДС
    "nds-name": {
      type: String,
      required: false,
      default: "nds_id",
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
    // нет поля НДС
    noNds: {
      type: Boolean,
      required: false,
      default: false,
    },
    // с серийниками
    withSeries: {
      type: Boolean,
      required: false,
      default: false,
    },
    // с серийниками - редактирование
    withSeriesEditor: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      tableId: null,
      newRowLoaded: false,
      defaultNds: 8,
      subTableValid: false,
      loading: false,
      showParams: false,
      // все селекты выбраны в массив selects
      selectsChecked: false,
      // всего селектов в форме
      selects: [],
      // загруженных селектов в форме
      selectsLoaded: 0,
    };
  },
  created() {
    // // проверим модель в стейте
    // if (!this.$store.state.table.model[this.table]) {
    //     // модель не найдена - загружаем
    //     this.startLoading()
    //     this.getTableModel(this.table)
    //         .finally(()=>{
    //             this.endLoading()
    //         })
    // }
    this.initTable();
    // присвоим id таблице
    if (this.id) {
      this.tableId = this.id;
    } else {
      this.tableId = `f${(~~(Math.random() * 1e8)).toString(16)}`;
    }
  },
  computed: {
    ...mapGetters(["isMobile"]),
    // модель полностью
    fullModel() {
      return this.$store.state.table.model[this.table] || null;
    },
    items: {
      get() {
        if (this.allSelectsLoaded) return this.inputValue;
        else return [];
      },
      set(newValue) {
        this.$emit("input", newValue);
      },
    },
    undeleteItems() {
      return this.items.filter((item) => {
        return !item.deleted;
      });
    },
    allSelectsLoaded() {
      if (this.selectsChecked && this.selectsLoaded == this.selects.length)
        return true;
      return false;
    },
    // набор полей ввода
    formModel() {
      if (this.fullModel && this.fullModel.fields) return this.fullModel.fields;
      else return null;
    },
    // модель без ненужных полей
    trueModel() {
      if (this.formModel) {
        return this.formModel.filter((field) => {
          return this.checkFieldProp(field, "show_in_form", false);
        });
      }
      return null;
    },
    // заголовки табличной части
    headers() {
      if (this.trueModel) {
        let headers = this.trueModel.map((field) => {
          return {
            text: field.title,
            value: field.name,
            sortable: false,
            type: field.type,
            table: field.table ? field.table : null,
            default: field.default ? field.default : null,
          };
        });
        headers.unshift({ text: "№ п/п", value: "n", sortable: false });
        headers.push({ text: "", value: "actions", sortable: false });
        return headers;
      }
      return null;
    },
    tableColItog() {
      let res = {};
      let itogableFieldNames = [this.quantityName, this.amountName];
      this.headers.forEach((field) => {
        if (itogableFieldNames.indexOf(field.value) !== -1) {
          let itog = 0;
          this.undeleteItems.forEach((element) => {
            if (element[field.value]) itog += parseFloat(element[field.value]);
          });
          res[field.value] = this.formatFloat(itog, field.type);
        } else {
          res[field.value] = "";
        }
      });
      return res;
    },
    isLoading() {
      return this.loading || this.headers.length == 0 || !this.allSelectsLoaded;
    },
  },
  methods: {
    ...mapActions([
      "getTableModel",
      "setLoading",
      "getSelectData",
      "getSelectStockBalance",
    ]),
    // проверяем булев признак поля, например require, show_in_form и т.п.
    checkFieldProp(field, prop, defaultVal = false) {
      let fieldProp = defaultVal;
      if (typeof field[prop] == "boolean") {
        fieldProp = field[prop];
      } else {
        if (Array.isArray(field[prop])) {
          fieldProp = field[prop].indexOf(this.modType) !== -1;
          // console.log(`for field ${JSON.stringify(field)} and modType=${this.modType} res=${fieldProp}`)
        }
      }
      return fieldProp;
    },
    // инициализация таблицы
    initTable() {
      if (this.fullModel) {
        this.initSelects();
      } else {
        // модель не найдена - загружаем
        this.startLoading();
        this.getTableModel(this.table)
          .then(() => {
            this.initSelects();
          })
          .finally(() => {
            this.endLoading();
          });
      }
    },
    // инициализация селектов
    initSelects() {
      if (this.headers) {
        if (!this.allSelectsLoaded && !this.selectsChecked) {
          this.headers.forEach((field) => {
            switch (field.type) {
              case "select":
                {
                  if (this.selects.indexOf(field.table) === -1) {
                    this.selects.push(field.table);
                    if (!this.$store.state.table.selectData[field.table]) {
                      this.getSelectData(field.table).then(() => {
                        this.selectsLoaded++;
                      });
                    } else {
                      this.selectsLoaded++;
                    }
                  }
                }
                break;
              case "stock_balance":
                {
                  if (this.selects.indexOf(`sb__${field.name}`) === -1) {
                    this.selects.push(`sb__${field.name}`);
                    this.getSelectStockBalance(this.skladId).then(() => {
                      this.selectsLoaded++;
                    });
                  }
                }
                break;
            }
          });
          this.selectsChecked = true;
        }
      }
    },
    formatFloat(val, type) {
      let n = 0;
      switch (type) {
        case "money":
          {
            n = 2;
          }
          break;
        case "kolvo":
          {
            n = 3;
          }
          break;
      }
      let formatter = new Intl.NumberFormat("ru", {
        style: "decimal",
        minimumFractionDigits: n,
      });
      return formatter.format(val);
    },
    toggleParams() {
      this.showParams = !this.showParams;
    },
    removeRow(i) {
      if (this.items[i].deleted) {
        this.items[i].deleted = true;
      } else {
        Vue.set(this.items[i], "deleted", true);
      }
      // this.items.splice(i,1)
    },
    restoreRow(i) {
      this.items[i].deleted = false;
    },
    setFocus() {
      let el = `#row_${this.tableId}_${this.items.length - 1}_col_${
        this.isMobile ? "0" : "1"
      } input`;
      let input = document.querySelector(el);
      if (input) {
        input.focus();
      } else {
        // console.log(`cannot find focus input ${el}`)
      }
    },
    addRow() {
      this.newRowLoaded = false;
      let row = {};
      this.headers.map((field) => {
        if (field.value == this.ndsName) {
          row[field.value] = this.defaultNds;
        } else {
          row[field.value] = field.default;
        }
      });
      Vue.set(this.items, this.items.length, row);
      this.newRowLoaded = true;
    },
    loaded() {
      if (this.newRowLoaded) {
        this.setFocus();
      }
    },
    startLoading() {
      this.loading = true;
    },
    endLoading() {
      this.loading = false;
    },
  },
  watch: {
    subTableValid(newValue) {
      this.$emit("validated", newValue);
    },
    skladId() {
      // console.log(`sklad changed`)
      this.selectsChecked = false;
      this.selects = [];
      this.selectsLoaded = 0;
      this.initSelects();
    },
  },
};
</script>

<style lang="scss" scoped>
tr.itogs {
  td {
    border-top: 2px solid black;
  }
}
</style>
