<template>
  <div>
    <abp-simple-table
      title="Список продукции, товаров и услуг"
      :model="tableModel"
      :items="items"
      :expanded="false"
      :selectable="true"
      :total="nomenklaturaTableDataCount"
      :options="nomenklaturaTableConfig"
      :fixedHeader="true"
      @actionEdit="actionEdit($event)"
      @actionCopy="actionCopy($event)"
      @actionDelete="actionDelete($event)"
      @actionAdd="actionAdd"
      @optionsChanged="changeOptions($event)"
      @searchTextChange="searchTextChange($event)"
    >
      <template v-slot:top>
        <v-row class="px-2">
          <v-col cols="12" sm="6" md="4" lg="3" xl="2" class="pl-2">
            <v-text-field
              v-model="searchText"
              append-icon="mdi-magnify"
              label="Поиск по таблице..."
              hint="Введите фразу для поиска в таблице"
              single-line
              hide-details
              clearable
              @change="searchTextChange($event)"
              @click:clear="searchTextChange('')"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="4" lg="3" xl="2" class="pl-2">
            <v-autocomplete
              :disabled="!groupsLoaded"
              :loading="!groupsLoaded"
              v-model="groupsValues"
              small-chips
              :items="groups"
              label="Фильтр по группам"
              item-text="tag"
              item-value="tag_id"
              multiple
              chips
              deletable-chips
              clearable
              hide-selected
              hint="Фильтр по группам"
              prepend-icon="mdi-pound"
            >
            </v-autocomplete>
          </v-col>
          <v-col cols="12" sm="6" md="4" lg="3" xl="2" class="pl-2">
            <v-autocomplete
              :disabled="!manufacturersLoaded"
              :loading="!manufacturersLoaded"
              v-model="manufacturersValues"
              small-chips
              :items="manufacturers"
              label="Фильтр по производителям"
              item-text="select_list_title"
              item-value="id"
              multiple
              chips
              deletable-chips
              clearable
              hide-selected
              hint="Фильтр по производителям"
            >
            </v-autocomplete>
          </v-col>
          <v-col>
            <v-btn
              fab
              dark
              small
              absolute
              top
              right
              color="success"
              class="mt-10"
              @click.stop="actionAdd"
            >
              <v-icon>mdi-plus</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </template>
    </abp-simple-table>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import ABPSimpleTable from "../Tables/ABPSimpleTable.vue";

export default {
  name: "nomenklatura",
  components: {
    "abp-simple-table": ABPSimpleTable,
  },
  data() {
    return {
      tableModel: [
        { name: "id", title: "id", type: "integer", show_in_table: false },
        { name: "name", title: "Наименование", type: "string" },
        // {name: 'part_num', title:'Каталожный №',type:'string'},
        // {name: 'artikul', title:'Артикул',type:'string'},
        // {name: 'manufacturer_id', title:'Производитель', type:'string'},
        { name: "main_image", title: "Изображение", type: "image" },
      ],
      groupsLoaded: false,
    };
  },
  created() {
    // тайтл
    this.setTitle("Справочник номенклатуры");
    // подгрузим список групп
    this.getGroups("nomenklatura").then(() => {
      this.groupsLoaded = true;
    });
    // подгрузим список производителей
    if (!this.$store.state.table.selectData["manufacturers"])
      this.getSelectData("manufacturers");
  },
  methods: {
    ...mapActions([
      "getSelectData",
      "getGroups",
      "setTitle",
      "getNamenklaturaData",
      "setNomenklaturaTableConfig",
      "removeNomenklaturaItem",
    ]),
    actionEdit(item) {
      // console.log(JSON.stringify(item))
      // this.$router.push({ name: 'nomenklatura-form', params: { id: item.id, modType:'edit' } })
      this.$router.push({
        name: "abp-form",
        params: {
          table: "nomenklatura",
          id: item.id,
          modType: "edit",
          disableDefaultSubmit: false,
        },
      });
    },
    actionCopy(item) {
      this.$router.push({
        name: "nomenklatura-form",
        params: { id: item.id, modType: "copy" },
      });
    },
    actionDelete(item) {
      this.removeNomenklaturaItem(item.id);
    },
    actionAdd() {
      this.$router.push({
        name: "abp-form",
        params: {
          table: "nomenklatura",
          modType: "add",
          disableDefaultSubmit: false,
        },
      });
      // this.$router.push({ name: 'nomenklatura-form'})
    },
    runDelete() {
      console.log("deleting");
    },
    changeOptions(newOptions) {
      this.setNomenklaturaTableConfig(newOptions);
      this.getNamenklaturaData();
    },
    searchTextChange(newVal) {
      let newOptions = {
        ...this.nomenklaturaTableConfig,
        ...{ search: newVal },
      };
      this.changeOptions(newOptions);
    },
    groupsChange(newGroups) {
      let newOptions = {
        ...this.nomenklaturaTableConfig,
        ...{ groups: newGroups },
      };
      this.changeOptions(newOptions);
    },
    filtersChange(filterValues) {
      let newFilters = {
        ...this.nomenklaturaTableConfig.filters,
        ...filterValues,
      };
      let newOptions = {
        ...this.nomenklaturaTableConfig,
        ...{ filters: newFilters },
      };
      this.changeOptions(newOptions);
    },
    filterValues(table) {
      if (
        this.nomenklaturaTableConfig &&
        this.nomenklaturaTableConfig.filters &&
        this.nomenklaturaTableConfig.filters[table]
      ) {
        return this.nomenklaturaTableConfig.filters[table];
      } else {
        return [];
      }
    },
  },
  computed: {
    ...mapGetters([
      "nomenklaturaTableData",
      "nomenklaturaTableDataCount",
      "nomenklaturaTableConfig",
    ]),
    items() {
      if (this.nomenklaturaTableData) {
        return this.nomenklaturaTableData.map((item) => {
          // {id:1, name:'test', part_num:'444',manufacturer_id:'test',main_image:''}
          return {
            id: item.id,
            name: `${item.artikul || ""} ${item.name ||
              ""} ${item.description || ""} ${item.manufacturer ||
              ""} ${item.part_num || ""}`,
            main_image: item.main_image,
          };
        });
      } else {
        return [];
      }
    },
    groups() {
      if (this.$store.state.groups.groups["nomenklatura"]) {
        return this.$store.state.groups.groups["nomenklatura"];
      } else {
        return [];
      }
    },
    manufacturers() {
      if (this.$store.state.table.selectData["manufacturers"]) {
        return this.$store.state.table.selectData["manufacturers"];
      } else {
        return [];
      }
    },
    manufacturersLoaded() {
      return this.manufacturers.length > 0;
    },
    searchText: {
      get() {
        if (
          this.nomenklaturaTableConfig &&
          this.nomenklaturaTableConfig.search
        ) {
          return this.nomenklaturaTableConfig.search;
        } else {
          return "";
        }
      },
      set() {
        // this.searchTextChange(newVal)
      },
    },
    groupsValues: {
      get() {
        if (
          this.nomenklaturaTableConfig &&
          this.nomenklaturaTableConfig.groups
        ) {
          return this.nomenklaturaTableConfig.groups;
        } else {
          return [];
        }
      },
      set(newVal) {
        this.groupsChange(newVal);
      },
    },
    manufacturersValues: {
      get() {
        return this.filterValues("manufacturer_id");
      },
      set(newVal) {
        this.filtersChange({ manufacturer_id: newVal });
      },
    },
  },
};
</script>

<style lang="scss" scoped></style>
