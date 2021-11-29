<template>
  <div>
    111{{ optionsMixin }}
    <!-- <abp-select-input
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
      dense
      @input="changeInput($event)"
    ></abp-select-input> -->

    <!-- <abp-select-input
      table="nomenklatura"
      :inputValue="inputValue"
      :editable="false"
      :title="title"
      :hint="hint"
      :required="required"
      :readonly="readonly"
      :disabled="disabled"
      :use-data-array="true"
      :data-array="selectData"
      :loading="isLoading"
      :custom-param-form="true"
      :closable="closable"
      dense
      @input="changeInput($event)"
      @open-param-table="showDialog"
      @search="doSearch($event)"
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
        <v-list-item-content>
          <v-list-item-title
            v-text="data.item.select_list_title"
          ></v-list-item-title>
        </v-list-item-content>
      </template>
    </abp-select-input> -->
    <!-- кастомный подбор по параметрам -->
    <!-- <abp-dialog title="Подбор по параметрам" v-model="showParamsForm">
      <abp-select-params-table
        v-if="showParamsForm"
        v-model="val"
        table="nomenklatura"
        :use-data-array="true"
        :data-array="tableDataArray"
        :array-count="dataArrayCount"
        :table-params="tableParams"
        @getData="openParamTable"
        @selected="selectedFromParamsTable"
        @optionsChanged="tableOptionsChanged($event)"
      ></abp-select-params-table>
    </abp-dialog> -->
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "abp-stock-balance-input",
  components: {
    // "abp-select-input": () => import("./ABPSelectInput"),
    // "stock-balance-chip": () => import("../Misc/StockBalanceChip.vue"),
    // "abp-select-params-table": () => import("../Tables/ABPSelectParamsTable"),
    // "abp-dialog": () => import("../Dialogs/ABPDialog.vue"),
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
      loading: false,
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
      showParamsForm: false,
      item: {},
      tableOptions: { page: 1, itemsPerPage: 10 },
      // данные таблицы
      tableDataArray: null,
      // данные селекта
      selectData: null,
      // фраза поиска селекта
      search: null,
    };
  },
  created() {
    // this.clearStockFilters({ sklad_id: this.skladId });
    // this.getData();
  },
  computed: {
    optionsMixin() {
      return { scope: `stock_balance.${this.sklad_id}` };
    },

    val: {
      get() {
        return [this.inputValue];
      },
      set(newVal) {
        this.$emit("input", newVal[0].id);
      },
    },
    // selectData() {
    //   if (this.$store.state.stock_balance.selectData[this.skladId]) {
    //     return this.$store.state.stock_balance.selectData[this.skladId];
    //   } else {
    //     return null;
    //   }

    // if (this.$store.state.stock_balance.selectData[this.skladId]) {
    //   let stockBalance = this.$store.state.stock_balance.selectData[
    //     this.skladId
    //   ]
    //     .filter((item) => {
    //       return parseFloat(item.stock_balance) > 0;
    //     })
    //     .map((item) => {
    //       return {
    //         id: item.id,
    //         stock_balance: item.stock_balance,
    //         select_list_title: item.select_list_title,
    //       };
    //     });
    //   return Object.keys(this.item).length > 0
    //     ? [...stockBalance, ...[this.item]]
    //     : [...stockBalance];
    // }
    // return null;
    // },
    // tableDataArray() {
    //   try {
    //     return this.$store.state.stock_balance.tableData[this.skladId];
    //   } catch (error) {
    //     return null;
    //   }
    // },
    dataArrayCount() {
      try {
        return this.$store.state.stock_balance.count[this.sklad_id];
      } catch (error) {
        return 0;
      }
    },
    isLoading() {
      return this.loading;
    },
    sklad() {
      return this.sklad_id;
    },
  },
  methods: {
    ...mapActions([
      "getSelectStockBalance",
      "getTableStockBalance",
      // "getSelectData",
      "getStockBalanceForSelect",
      "getStockBalanceForTable",
      "changeStockFilters",
      "clearStockFilters",
    ]),
    // получение данных
    getData() {},

    // поиск в селекте
    doSearch(text) {
      this.search = text;
      console.log(`search =${this.search}`);
      this.getSelectData();
    },
    // изменен набор опций таблицы
    tableOptionsChanged(options) {
      this.changeStockFilters({
        sklad_id: this.sklad_id,
        filters: options,
      }).then(() => {
        this.getStockBalance();
      });
      // this.tableOptions = { ...this.tableOptions, ...options };
      // this.getStockBalanceForTable({
      //   sklad_id: this.skladId,
      //   options: this.tableOptions,
      // });
    },
    changeInput(newValue) {
      this.$emit("input", newValue);
    },
    loaded(isLoaded) {
      if (isLoaded) {
        this.$emit("loaded");
      }
    },
    startLoading() {
      this.loading = true;
    },
    endLoading() {
      this.loading = false;
    },
    getSelectData() {
      this.startLoading();
      // new data loader
      let dataOptions = {
        sklad_id: this.sklad_id,
        search: this.search,
        id: this.inputValue,
      };
      // console.log(`dataOptions=${JSON.stringify(dataOptions)}`);
      this.getStockBalanceForSelect(dataOptions)
        .then((data) => {
          console.log(`getSelectData=${JSON.stringify(data)}`);
          this.selectData = data;
        })
        .finally(() => {
          this.endLoading();
        });
    },
    getStockBalance() {
      this.startLoading();
      // new data loader
      this.getStockBalanceForTable({ sklad_id: this.sklad_id })
        .then((data) => {
          this.tableDataArray = data;
        })
        .finally(() => {
          this.endLoading();
        });
      // this.getStockBalanceForSelect({
      //   sklad_id: this.skladId,
      //   id: this.inputValue,
      // });
      // // console.log(`get stock balance started`)
      // this.loaded(false);
      // if (!this.$store.state.stock_balance.selectData[this.skladId]) {
      //   // console.log(`getting stock_balance`)
      //   this.startLoading();
      //   this.getSelectStockBalance(skladId)
      //     .then(() => {
      //       // console.log(`stock balance for ${skladId} loaded`)
      //       if (this.inputValue > 1) {
      //         if (this.selectData) {
      //           // если в полученных данных нет такого наименования
      //           // (нет на остатках) - добавим это значение из списка селектов номенклатур с признаком disabled
      //           if (
      //             this.selectData.findIndex((item) => {
      //               item.id == this.inputValue;
      //             }) === -1
      //           ) {
      //             // console.log(`not found ${this.inputValue} in stock`)
      //             this.item = this.findItemInStore(this.inputValue);
      //             this.loaded(true);
      //           } else {
      //             // console.log(`nomenklatura ${this.inputValue} found in stock`)
      //           }
      //         }
      //       } else {
      //         this.loaded(true);
      //       }
      //     })
      //     .finally(() => {
      //       this.endLoading();
      //     });
      // } else {
      //   // console.log(`not need load data ${JSON.stringify(this.selectData)}`)
      //   if (
      //     this.selectData.findIndex((item) => {
      //       item.id == this.inputValue;
      //     }) === -1
      //   ) {
      //     this.item = this.findItemInStore(this.inputValue);
      //     this.loaded(true);
      //   }
      // }
    },
    // выдаем item из стора номенклатуры
    findItemInStore(id) {
      // console.log(`try to find nomenklatura ${id} in store`)
      if (this.$store.state.table.selectData.nomenklatura) {
        let item = this.$store.state.table.selectData.nomenklatura.find(
          (ni) => {
            return ni.id == id;
          }
        );
        if (item) {
          // console.log(`nomenklatura finded ${JSON.stringify(item)}`)
          return { ...item };
        } else {
          // console.log(`nomenklatura ${id} not found in ${JSON.stringify(this.$store.state.table.selectData.nomenklatura)}`)
        }
      }
      return {};
    },
    openParamTable() {
      this.getStockBalance();
    },
    selectedFromParamsTable() {
      // закрываем форму выбора
      this.showParamsForm = false;
    },
    showDialog() {
      this.showParamsForm = true;
    },
  },
  watch: {
    sklad() {
      // console.log(`changed sklad to ${newSkladId}`)
      this.getSelectData();
      // this.getTableData(newSkladId);
      this.item = {};
    },
  },
};
</script>

<style lang="scss" scoped></style>
