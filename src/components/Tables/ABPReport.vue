<template>
  <div>
    <!-- {{filterValues}} -->
    <abp-simple-table
      v-if="items"
      title="Отчет по остаткам"
      :model="headers"
      :items="items"
      :expanded="true"
      :defaultActions="false"
      :loading="loading"
      :show-reload-button="true"
      @refreshData="refreshData"
      :show-filters-button="true"
      @clearFilters="clearFilters"
      :filters-disabled="emptyFiltersValues"
      :options="tableOptions"
      :show-column-setup="false"
      @optionsChanged="changeOptions($event)"
    >
      <!-- вывод экспандера -->
      <template v-slot:expander="{ item }">
        <!-- <td
                    :colspan="headers.length"
                    class="expander-column"
                > -->
        <abp-items-table
          :items="item.items"
          :headers="itemsHeaders"
          :disable-npp="true"
          height="auto"
        ></abp-items-table>
        <!-- </td> -->
      </template>
      <!-- блок фильтрации -->
      <template v-slot:filters>
        <simple-filters
          v-if="filters"
          :inputValue="filterValues"
          :filters="filters"
          @input="changeFilters($event)"
        ></simple-filters>
      </template>
    </abp-simple-table>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import SimpleFilters from "../Filters/SimpleFilters.vue";
import ABPItemsTableVue from "./ABPItemsTable.vue";
import ABPSimpleTable from "./ABPSimpleTable.vue";

export default {
  name: "abp-report",
  components: {
    "abp-simple-table": ABPSimpleTable,
    "abp-items-table": ABPItemsTableVue,
    "simple-filters": SimpleFilters,
  },
  props: {
    table: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      loading: false,
      filterValues: { date: this.$moment().format("YYYY-MM-DD") },
    };
  },
  created() {
    // this.getTableModel(this.table).then(() => {
    //   if (this.$store.state.table.filterValues[this.table]) {
    //     this.filterValues = {
    //       ...this.filterValues,
    //       ...this.$store.state.table.filterValues[this.table],
    //     };
    //   }
    //   this.changeFilters(this.filterValues);
    // });
  },
  computed: {
    headers() {
      return [{ name: "name", title: "Склад", type: "string" }];
    },

    items() {
      try {
        let storeData = this.$store.state.table.tableData[this.table];
        if (storeData) {
          return storeData.map((item) => {
            let lines = [`${item.name}`];
            let items = item.items.map((i) => {
              return {
                ...i,
                ...{
                  lines: [
                    `${i.nomenklatura}`,
                    `остаток: ${i.kolvo} ${i.ed_ism}`,
                  ],
                },
              };
            });

            return { ...item, ...{ lines: lines }, ...{ items: items } };
          });
        }
      } catch (e) {
        return [];
      }
      return [];
    },
    itemsHeaders() {
      return [
        { value: "nomenklatura", text: "Номенклатура", type: "text" },
        { value: "kolvo", text: "Остаток", type: "kolvo", align: "end" },
        { value: "ed_ism", text: "Ед. изм", type: "text" },
      ];
    },
    filters() {
      return [
        { name: "ou_date", title: "Остаток на дату", type: "date" },
        {
          name: "nomenklatura_id",
          title: "Номенклатура",
          type: "select",
          table: "nomenklatura",
        },
        {
          name: "nomenklatura_groups",
          title: "Группы номенклатур",
          type: "groups",
          table: "nomenklatura",
        },
        { name: "sklad_id", title: "Склад", type: "select", table: "sklads" },
      ];
    },
    emptyFiltersValues() {
      return Object.keys(this.filterValues).length === 0;
    },
    tableOptions: {
      get() {
        if (this.$store.state.table.tableOptions[this.tableName]) {
          return this.$store.state.table.tableOptions[this.tableName];
        } else {
          return this.defaultTableOptions;
        }
      },
      set(newValue) {
        this.changeOptions(newValue);
      },
    },
  },
  methods: {
    ...mapActions([
      "getTableData",
      "syncTableOptions",
      "clearTableOptions",
      "getTableModel",
      "setTableFilterValues",
      "getTableFilters",
    ]),
    refreshData() {
      this.loading = true;
      this.getTableData({ table: this.table }).finally(() => {
        this.loading = false;
      });
    },
    clearFilters() {
      this.filterValues = {};
      this.setTableFilterValues({ table: this.table, data: this.filterValues });
      this.refreshData();
    },
    changeFilters(newFilters) {
      this.setTableFilterValues({ table: this.table, data: newFilters }).then(
        () => {
          this.refreshData();
        }
      );
    },
    changeOptions(newOptions) {
      this.syncTableOptions({ table: this.table, options: newOptions }).then(
        () => {
          this.refreshData();
        }
      );
    },
  },
};
</script>

<style lang="scss" scoped>
.expander-column {
  padding: 0 !important;
}
</style>
