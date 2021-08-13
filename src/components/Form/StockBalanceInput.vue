<template>
  <div>
    <abp-select-input
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
    </abp-select-input>
    <!-- кастомный подбор по параметрам -->
    <abp-dialog title="Подбор по параметрам" v-model="showParamsForm">
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
      ></abp-select-params-table>
    </abp-dialog>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "stock-balance-input",
  components: {
    "abp-select-input": () => import("./ABPSelectInput"),
    "stock-balance-chip": () => import("../Misc/StockBalanceChip.vue"),
    "abp-select-params-table": () => import("../Tables/ABPSelectParamsTable"),
    "abp-dialog": () => import("../Dialogs/ABPDialog.vue"),
  },
  model: {
    prop: "inputValue",
    event: "input",
  },
  props: {
    inputValue: {
      required: true,
    },
    skladId: {
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
    };
  },
  created() {
    this.getStockBalance(this.skladId);
  },
  computed: {
    val: {
      get() {
        return [this.inputValue];
      },
      set(newVal) {
        this.$emit("input", newVal[0].id);
      },
    },
    selectData() {
      if (this.$store.state.stock_balance.selectData[this.skladId]) {
        let stockBalance = this.$store.state.stock_balance.selectData[
          this.skladId
        ].filter((item) => {
          return parseFloat(item.stock_balance) > 0;
        });
        return Object.keys(this.item).length > 0
          ? [...stockBalance, ...[this.item]]
          : [...stockBalance];
      }
      return null;
    },
    tableDataArray() {
      if (this.$store.state.stock_balance.tableData[this.skladId]) {
        // return this.$store.state.stock_balance.tableData[this.skladId].filter(=>{
        //     return parseFloat(item.stock_balance)>0
        // })
        return this.$store.state.stock_balance.tableData[this.skladId];
      }
      return null;
    },
    dataArrayCount() {
      if (this.$store.state.stock_balance.count[this.skladId]) {
        return this.$store.state.stock_balance.count[this.skladId];
      }
      return 0;
    },
    isLoading() {
      return this.loading;
    },
    sklad() {
      return this.skladId;
    },
  },
  methods: {
    ...mapActions([
      "getSelectStockBalance",
      "getTableStockBalance",
      "getSelectData",
    ]),
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
    getStockBalance(skladId) {
      // console.log(`get stock balance started`)
      this.loaded(false);
      if (!this.$store.state.stock_balance.selectData[this.skladId]) {
        // console.log(`getting stock_balance`)
        this.startLoading();
        this.getSelectStockBalance(skladId)
          .then(() => {
            // console.log(`stock balance for ${skladId} loaded`)
            if (this.inputValue > 1) {
              if (this.selectData) {
                // если в полученных данных нет такого наименования
                // (нет на остатках) - добавим это значение из списка селектов номенклатур с признаком disabled
                if (
                  this.selectData.findIndex((item) => {
                    item.id == this.inputValue;
                  }) === -1
                ) {
                  // console.log(`not found ${this.inputValue} in stock`)
                  this.item = this.findItemInStore(this.inputValue);
                  this.loaded(true);
                } else {
                  // console.log(`nomenklatura ${this.inputValue} found in stock`)
                }
              }
            } else {
              this.loaded(true);
            }
          })
          .finally(() => {
            this.endLoading();
          });
      } else {
        // console.log(`not need load data ${JSON.stringify(this.selectData)}`)
        if (
          this.selectData.findIndex((item) => {
            item.id == this.inputValue;
          }) === -1
        ) {
          this.item = this.findItemInStore(this.inputValue);
          this.loaded(true);
        }
      }
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
    getTableData(skladId) {
      return this.getTableStockBalance(skladId);
    },
    openParamTable() {
      this.getTableData(this.skladId);
    },
    selectedFromParamsTable() {
      this.showParamsForm = false;
    },
    showDialog() {
      this.showParamsForm = true;
    },
  },
  watch: {
    sklad(newSkladId) {
      // console.log(`changed sklad to ${newSkladId}`)
      this.getStockBalance(newSkladId);
      this.getTableData(newSkladId);
      this.item = {};
    },
  },
};
</script>

<style lang="scss" scoped></style>
