<template>
  <div>
    <!-- {{dataLoaded}} -->
    <!-- {{ table }} -->
    <!-- abp-select-input={{val}} -->
    <!-- lazyLoad= {{ lazyLoad }} val={{ val }} total = {{ total }}, page =
    {{ page }}, itemsPerPage = {{ itemsPerPage }} search={{ search }},
    useCache={{ useCache }}, dataCache={{ dataCache }}, pageLoadComplete={{
      pageLoadComplete
    }} -->
    <!-- val={{ val }}, isSelected={{ isSelected }} -->
    <!-- {{ tableParams }} -->
    <!-- storeLoadComplete={{ storeLoadComplete }}, storeData={{ storeData.length }},
    total={{ total }}, searchDataCount={{ searchDataCount }},
    dataTotalCompleteLoaded={{ dataTotalCompleteLoaded }} -->
    <select-input
      v-if="data"
      v-model="val"
      v-bind="settings"
      :loading="setLoading"
      :disabled="disabled"
      :items="data"
      :title="title"
      :multiple="multiple"
      :readonly="readonly"
      :required="required"
      :clearable="true"
      :hint="hint"
      :withChips="withChips"
      :dense="dense"
      :total="total"
      cache-items
      :auto-select-first="true"
      @change="change($event)"
      @search="doSearch($event)"
      @clear="clear"
    >
      <template v-slot:append-item>
        <slot name="append-item">
          <v-lazy
            v-model="lazyLoad[page]"
            v-if="
              !!pageLoadComplete[page] &&
                total > dataCount &&
                data.length >= itemsPerPage
            "
          >
          </v-lazy>
        </slot>
      </template>

      <template v-slot:append>
        <slot name="append"></slot>
      </template>
      <template v-slot:item="{ data }">
        <template v-if="data.item.id > 1">
          <slot name="item" v-bind:data="data">
            <template v-if="useImages">
              <v-list-item-avatar tile v-if="data.item.main_image">
                <v-img :src="data.item.main_image"></v-img>
              </v-list-item-avatar>
              <v-list-item-icon v-else>
                <v-icon color="grey lighten-1">mdi-image-remove</v-icon>
              </v-list-item-icon>
            </template>
            <v-list-item-content>
              <v-list-item-title
                v-text="data.item.select_list_title"
              ></v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <abp-icon-button
                v-if="editable"
                icon="mdi-pencil"
                tip="Редактировать выбранное"
                :disabled="disabled"
                @click="editItem(data.item.id)"
              ></abp-icon-button>
            </v-list-item-action>
          </slot>
        </template>
        <template v-else>
          <v-list-item-content>
            <v-list-item-title
              v-text="data.item.select_list_title"
            ></v-list-item-title>
          </v-list-item-content>
          <v-list-item-action v-if="showParamsButton">
            <abp-icon-button
              class="float-right"
              icon="mdi-sort-bool-descending-variant"
              tip="Подбор по параметрам"
              :disabled="disabled"
              @click="openParamsForm"
            ></abp-icon-button>
          </v-list-item-action>
          <v-list-item-action v-if="editable">
            <abp-icon-button
              class="float-right"
              icon="mdi-playlist-plus"
              tip="Добавить запись"
              :disabled="disabled"
              @click="addItem"
            ></abp-icon-button>
          </v-list-item-action>
        </template>
      </template>
      <!-- <template v-slot:append>
                <abp-icon-button
                    v-if="clearable"
                    :disabled="!isClearable"
                    icon="mdi-close"
                    tip="Очистить"
                    @click="changeInput(null)"
                ></abp-icon-button>
            </template> -->
    </select-input>
    <!-- добавление / редактирование выбранной записи -->
    <abp-dialog
      :title="formTitle"
      v-model="showForm"
      v-if="table"
      :width="formWidth"
    >
      <abp-form
        v-if="showForm"
        v-model="formSelector"
        :table="table"
        :id="inputId"
        :modType="modType"
        :miniForm="miniForm"
        :canSwitchMini="true"
        :singleFieldRow="miniForm"
        :disableDefaultSubmit="false"
        :inDialog="true"
        :showFilters="true"
        @closeForm="showForm = false"
        @submitSuccess="submitted($event)"
        @toggleMiniForm="toggleMiniForm"
      >
      </abp-form>
    </abp-dialog>
    <!-- подбор по параметрам -->
    <abp-dialog
      title="Подбор по параметрам"
      v-model="showFiltersForm"
      v-if="table && !customParamForm"
    >
      <abp-select-params-table
        v-if="showFiltersForm"
        v-model="tableSelector"
        :table="table"
        :tableParams="tableParams"
        :options="options"
        @selected="selectFromTable"
      ></abp-select-params-table>
    </abp-dialog>
  </div>
</template>

<script>
import { mapActions } from "vuex";
// import stock_balance from "../../store/modules/tables/stock_balance";

// import ABPDialog from '../Dialogs/ABPDialog.vue'
// import SelectInput from './SelectInput'
// import ABPTable from '../Tables/ABPTable'
// import ABPIconButton from './ABPIconButton'

export default {
  name: "AbpSelectInput",
  components: {
    "abp-dialog": () => import("../Dialogs/ABPDialog.vue"),
    "select-input": () => import("./SelectInput.vue"),
    "abp-select-params-table": () => import("../Tables/ABPSelectParamsTable"),
    "abp-icon-button": () => import("./ABPIconButton"),
    "abp-form": () => import("../Forms/ABPForm.vue"),
  },
  model: {
    prop: "inputValue",
    event: "input",
  },
  props: {
    inputValue: {
      required: true,
    },
    settings: {
      type: Object,
      required: false,
    },
    // добавлять кнопки "добавить" и "редактировать"
    editable: {
      type: Boolean,
      required: false,
      default: true,
    },
    table: {
      type: String,
      required: true,
    },
    multiple: {
      type: Boolean,
      required: false,
      default: false,
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    clearable: {
      type: Boolean,
      required: false,
      default: true,
    },
    // выбирать единственную запись
    chooseEqual: {
      type: Boolean,
      required: false,
      default: true,
    },
    // кол-во значений, при котором появляется кнопка подбора по параметрам
    showParams: {
      type: Number,
      required: false,
      default: 1,
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
    // индикация загрузки
    loading: {
      type: Boolean,
      required: false,
      default: false,
    },
    // использовать собственную форму отбора по параметрам
    customParamForm: {
      type: Boolean,
      required: false,
      default: false,
    },
    // только указанные значения будут доступны для выбора
    validItems: {
      type: Array,
      required: false,
    },
    // исключить значения из списка - будут доступны только переданные в массиве
    exceptItems: {
      type: Array,
      required: false,
    },
    // миксин опций загрузки данных
    options: {
      type: Object,
      required: false,
      default() {
        return {};
      },
    },
    // миксин параметров таблицы подбора по параметрам
    tableParamsMixin: {
      type: Object,
      required: false,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      isLoading: false,
      miniForm: true,
      showForm: false,
      modType: "add",
      showFiltersForm: false,
      filters: {},
      formSelector: {},
      tableSelector: [],
      inputId: 1,
      loadingTable: null,
      stateLoaded: false,
      // поисковая фраза
      search: null,
      // осуществляется поиск
      isSearchLoading: false,
      // данные загруженные с сервера
      dataCache: [],
      // текущая страница
      page: 1,
      // записей на страницу
      itemsPerPage: 50,
      // анализ достижения последней строки - пора грузить следующий блок данных
      lazyLoad: { 1: false },
      // завершена загрузка страницы
      pageLoadComplete: { 1: false },
      // кол-во записей при поиске
      searchDataCount: null,
      // вся таблица помещается в селект и/или данные полностью загружены в кэш селекта
      dataTotalCompleteLoaded: false,
    };
  },
  created() {
    // console.log(typeof(this.table))

    // this.table();

    if (!this.useDataArray) {
      // this.initInput(this.table);
      this.getData();
    }
  },
  methods: {
    ...mapActions(["getSelectData"]),
    // очистка
    clear() {
      // console.log(`clear`);
      this.search = null;
      this.dataCache = [];
      // this.setValue(null);
      if (this.multiple) {
        this.val = [];
      } else {
        this.val = null;
      }
      if (!this.dataTotalCompleteLoaded) this.page = 1;
    },
    // поиск
    doSearch(str) {
      // console.log(`str=${str}`);
      if (!this.dataTotalCompleteLoaded) {
        // console.log(`search str=${str}`);
        // очищаем массив кэша для селекта если поисковая фраза была пустой или стала пустой
        // для правильно работы lazy-паджинатора
        if (
          !this.search ||
          this.search.length == 0 ||
          !str ||
          str.length == 0
        ) {
          this.page = 1;
          this.dataCache = [];
        } else {
          // console.log(`no search`);
        }
        this.search = str;
        this.getData();
      } else {
        // console.log(`no search: storeLoadComplete==true`);
      }
    },
    // получаем данные
    async getData() {
      // console.log(
      //   `getting data for [${this.title}] field, isSelected=${this.isSelected},this.inputValue=${this.inputValue} `
      // );
      if (this.useDataArray) {
        // данные уже загружены
      } else {
        if (this.dataTotalCompleteLoaded) {
          // console.log(`данные загружены для ${this.table}`);
          this.$emit("loaded", true);
        } else {
          // console.log(
          //   `load data for ${this.table} (this.dataTotalCompleteLoaded=${this.dataTotalCompleteLoaded})`
          // );
          this.isLoading = true;
          this.stateLoaded = false;
          // добавить в запрос id-шники
          let id = [];
          if (this.isSelected) {
            let v = this.inputValue;
            if (Array.isArray(v)) {
              id = [...v];
            } else {
              id = [v];
            }
          } else {
            id = [];
          }
          // console.log(`id=${JSON.stringify(id)}`);
          if (this.table) {
            let selectDataOptions = {
              table: this.table,
              search: this.search,
              page: this.page,
              itemsPerPage: this.itemsPerPage,
              options: this.options,
            };
            if (this.isSelected && id) selectDataOptions.id = id;

            this.pageLoadComplete[this.page] = false;
            await this.getSelectData(selectDataOptions)
              .then(({ data, count }) => {
                this.page += 1;
                this.pageLoadComplete[this.page] = true;
                // console.log(`data = ${JSON.stringify(data)}`);
                // this.stateLoaded = true;
                if (data) {
                  if (this.dataCache) {
                    this.dataCache = [...new Set([...this.dataCache, ...data])];
                  } else {
                    this.dataCache = [...data];
                  }
                }
                // this.dataCache = [...new Set([...this.dataCache, ...data])];
                // console.log(`dataCache=${JSON.stringify(this.dataCache)}`);
                if (this.search) {
                  this.searchDataCount = count;
                }
                // проверим, может загружено 100% данных
                if (!this.search && !this.isSelected) {
                  this.dataTotalCompleteLoaded = this.storeLoadComplete;
                }
                this.$emit("loaded", true);
              })
              .finally(() => {
                this.isLoading = false;
              });
          }
          // this.dataCache = [];
        }
      }
    },

    // initInput(table) {
    // this.isLoading = true;
    // // проверим, может уже есть загруженные данные для селекта и кол-во данных таблицы совпадает с кол-вом в селекте
    // try {
    //   if (
    //     this.$store.state.table.tableDataCount[table] ==
    //     this.$store.state.table.selectData[table].length
    //   )
    //     this.stateLoaded = true;
    // } catch (error) {
    //   this.stateLoaded = false;
    // }
    // //   если данные не загружены - загружаем, иначе используем их
    // if (this.stateLoaded) {
    //   // console.log(`select ${this.title} loaded`);
    //   this.$emit("loaded");
    //   this.loading = false;
    //   this.isLoading = false;
    // } else {
    //   this.getSelectData({ table, search: this.search }).then(() => {
    //     // console.log(`get data for table=${table}, serach=${this.search}`);
    //     //   console.log(
    //     //     `select ${this.title} new load data, data=${JSON.stringify(
    //     //       this.$store.state.table.selectData[table]
    //     //     )}`
    //     //   );
    //     this.$emit("loaded");
    //     this.isLoading = false;
    //     this.stateLoaded = true;
    //   });
    // }
    //   this.getData();
    // },

    changeInput(newValue) {
      this.$emit("input", newValue);
    },
    change(newValue) {
      // this.search = null;
      // console.log(`abp-select-input [change] emit`);
      this.$emit("change", newValue);
      // this.$emit("input", newValue);
    },
    addItem() {
      this.modType = "add";
      this.formSelector = {};
      this.showForm = true;
    },
    selectFromTable() {
      if (this.tableSelector.length > 0) {
        this.setValue(this.tableSelector[0].id);
      } else {
        // очищаем
        this.changeInput(null);
      }
      if (!this.customParamForm) {
        this.showFiltersForm = false;
      }
    },
    setValue(id) {
      let newValue = this.inputValue;
      if (this.multiple) {
        if (newValue && Array.isArray(newValue)) {
          newValue.push(id);
        } else {
          newValue = [id];
        }
      } else {
        newValue = id;
      }
      if (newValue) this.changeInput(newValue);
    },
    editItem(id) {
      if (id > 1) {
        // добавить опцию на открытие формы по переданному id
        this.inputId = id;
        this.modType = "edit";
        this.showForm = true;
      }
    },
    submitted(data) {
      // выберем созданную запись
      if (data.id) {
        this.setValue(data.id);
      }
      // закрываем форму, если миниформа
      if (this.miniForm) {
        this.showForm = false;
      } else {
        this.modType = "edit";
      }
    },
    toggleMiniForm() {
      this.miniForm = !this.miniForm;
    },
    openParamsForm() {
      if (this.customParamForm) {
        this.$emit("open-param-table");
      } else {
        this.showFiltersForm = true;
      }
    },
  },
  computed: {
    // переданы дополнительные scope в запросе данных
    scope() {
      try {
        return this.options.scope;
      } catch (error) {
        return null;
      }
    },
    // выбрана запись селекта
    isSelected() {
      if (this.inputValue) {
        if (Array.isArray(this.inputValue)) {
          if (this.inputValue.length == 1) {
            return parseInt(this.inputValue[0]) > 1;
          } else {
            return true;
          }
        } else {
          return this.inputValue > 1;
        }
      }
      return false;
    },
    // модель таблицы
    model() {
      try {
        return this.$store.state.table.model[this.table];
      } catch (error) {
        return null;
      }
    },
    // в таблице используются картинки
    useImages() {
      try {
        return this.model.extensions.has_images;
      } catch (error) {
        return false;
      }
    },
    // всего записей
    total() {
      try {
        if (this.useDataArray) {
          return this.dataArray.length;
        } else {
          if (this.search) {
            let totalCount = this.searchDataCount ? this.searchDataCount : 0;
            if (this.inputValue) {
              totalCount += Array.isArray(this.inputValue)
                ? this.inputValue.length
                : 1;
            }
            return totalCount;
          } else {
            if (this.scope) {
              // возвращаем кол-во в scope
              return this.$store.state.table.scopeCount[this.table][this.scope];
            } else {
              return this.$store.state.table.totalCount[this.table];
            }
          }
        }
      } catch (error) {
        return 0;
      }
    },
    // кол-во данных из стора
    dataCount() {
      return this.data.length;
    },
    // данные полностью загружены из стора
    storeLoadComplete() {
      return this.storeData.length >= this.total;
    },
    // таблица кэшируется
    useCache() {
      return !this.useDataArray && !this.search;
    },
    // данные из кэша стора
    storeData() {
      if (this.useCache) {
        try {
          if (this.scope) {
            return this.$store.state.table.scopeSelectData[this.table][
              this.scope
            ]
              ? this.$store.state.table.scopeSelectData[this.table][this.scope]
              : [];
          } else {
            return this.$store.state.table.selectData[this.table]
              ? this.$store.state.table.selectData[this.table]
              : [];
          }
        } catch (error) {
          // no data
        }
      }
      // по умолчанию - выдадим пустой массив
      return [];
    },
    // значение селекта
    val: {
      get() {
        return this.inputValue;
      },
      set(newValue) {
        this.$emit("input", newValue);
      },
    },
    rules() {
      if (this.required && !this.readonly) {
        if (this.multiple) {
          return [
            (v) =>
              (!!v && v.length > 1) ||
              (v.length == 1 && v[0] > 1) ||
              this.requireMsg,
          ];
        } else {
          return [(v) => (!!v && v > 1) || this.requireMsg];
        }
      } else {
        return [true];
      }
    },
    tableParams() {
      let res = {};
      // только указанные значения будут доступны для выбора
      if (this.validItems) res.validItems = this.validItems;
      // исключить значения из списка - будут доступны только переданные в массиве
      if (this.exceptItems) res.exceptItems = this.exceptItems;
      // если переданы дополнительные параметры - укажем их с перезаписью значений
      if (this.tableParamsMixin) res = { ...res, ...this.tableParamsMixin };
      return res;
    },
    // сырые данные
    sourceData() {
      if (this.useDataArray) {
        if (this.dataArray) return this.dataArray;
      } else {
        // данные из стора
        if (this.useCache) {
          // если вся таблица загружена в селект
          if (this.storeLoadComplete) {
            if (this.storeData && this.storeData.length == 0) {
              return this.dataCache;
            } else {
              return this.storeData;
            }
          } else {
            // если поиск - берем только dataCache
            if (this.search) {
              return this.dataCache;
            } else {
              return [...new Set([...this.dataCache, ...this.storeData])];
            }
          }
        } else {
          return this.dataCache;
        }
      }
      return [];
    },
    // отформатированные данные
    data() {
      let d = [...this.sourceData];
      if (d) {
        if (!this.multiple) {
          try {
            if (
              d.findIndex((item) => {
                item.id == 1;
              }) === -1
            )
              d.unshift({ id: 1, select_list_title: "Не выбрано" });
          } catch (error) {
            // nothing to do
          }
        }
        // только указанные значения будут доступны для выбора
        if (this.validItems) {
          try {
            d = d.map((item) => {
              if (this.ValidItems.indexOf(item.id) === -1) {
                return item;
              } else {
                return { ...item, ...{ readonly: true } };
              }
            });
          } catch (error) {
            // nothing to do
          }
        }
        // исключить значения из списка - будут доступны только переданные в массиве
        if (this.exceptItems) {
          try {
            d = d.map((item) => {
              if (this.exceptItems.indexOf(item.id) === -1) {
                return item;
              } else {
                return { ...item, ...{ disabled: true } };
              }
            });
          } catch (error) {
            // nothing to do
          }
        }
        // лишние поля - удалим
        try {
          d = d.map((row) => {
            return {
              id: row.id,
              select_list_title: row.select_list_title,
              disabled: row.deleted_at ? true : false,
              stock_balance: row.stock_balance
                ? parseFloat(row.stock_balance)
                : null,
              main_image: row.main_image,
            };
          });
        } catch (error) {
          // nothing to do
        }
      }
      // console.log(`d=${JSON.stringify(d)}`);

      // если запись единственная - выберем ее
      // if (this.chooseEqual && d.length==2 && this.dataTotalCompleteLoaded) {
      //     if (d[1].id!==undefined) this.val = d[1].id
      // }

      return d;
    },
    isClearable() {
      if (this.multiple) {
        return !!this.inputValue && this.inputValue.length > 0;
      } else {
        return !!this.inputValue && this.inputValue > 1;
      }
    },
    dataLoaded() {
      return this.data.length > 0;
    },
    formWidth() {
      if (this.miniForm) return 300;
      else return "auto";
    },
    showParamsButton() {
      return this.showParams > 0 && this.data.length > this.showParams;
    },
    formTitle() {
      switch (this.modType) {
        case "add": {
          return `добавление записи`;
        }
        case "copy": {
          return `копирование записи`;
        }
        case "edit": {
          return `редактирование записи`;
        }
        default: {
          return ``;
        }
      }
    },
    setLoading() {
      return this.loading || this.isLoading || false;
    },
    // required() {
    //     return this.require || false
    // }
  },
  watch: {
    table() {
      // this.initInput(newTable);
      // console.log(`changing table`);
      this.page = 1;
      this.search = null;
      this.getData();
    },
    options() {
      this.getData();
    },
    data() {
      if (
        this.data.length == 2 &&
        this.chooseEqual &&
        this.dataTotalCompleteLoaded
      ) {
        this.$emit("input", this.data[1].id);
      }
    },
    lazyLoad() {
      // console.log(`грузим следующую порцию данных`);
      this.getData();
    },
    inputValue() {
      this.dataCache = [];
      this.getData();
    },
  },
};
</script>

<style lang="scss" scoped></style>
