<template>
  <div>
    <!-- {{ tableOptions }} -->
    <!-- {{ selected }} -->
    <!-- table keyModel = {{ keyModel }} -->
    <!-- {{ filters }} -->
    <!-- printable={{ printable }} -->
    <abp-simple-table
      v-if="tableModel && tableOptions && dataItems"
      :title="title"
      :model="tableModel"
      v-model="selected"
      :items="dataItems"
      :itogs="dataItogs"
      :total="tableDataCount"
      :options="tableOptions"
      :show-only-columns="cols"
      :show-column-setup="true"
      :show-reload-button="true"
      :show-filters-button="true"
      :loading="tableLoading"
      :filters-disabled="filtersDisabled"
      :filters-count="filtersCounter"
      :show-row-actions="true"
      :expanded="withExpander"
      :show-footer="true"
      :show-header="true"
      :selectable="selectable"
      :multi-select="multiSelect"
      :item-value="itemValue"
      :selected-id="selectedId"
      @optionsChanged="changeOptions($event)"
      @refreshData="getData"
      @clearFilters="clearFilters"
      @rowClick="rowClick($event)"
      @changeColumns="changeCols($event)"
      @expanded="rowExpanded($event)"
    >
      <!-- кнопка добавить -->
      <template v-slot:prepend-top-actions v-if="editable">
        <!-- для мобилы -->
        <v-btn v-if="isMobile && !searchFocused" text @click="actionAdd">
          Новая запись
        </v-btn>
        <!-- для десктопа -->
        <abp-icon-button
          v-else
          icon="mdi-plus-circle"
          tip="Добавить запись"
          :disabled="!hasAddPermission"
          @click="actionAdd"
        ></abp-icon-button>
      </template>
      <!-- поиск -->
      <template v-slot:top-actions>
        <v-divider vertical class="mx-1"></v-divider>
        <abp-filter
          v-if="hasSearchFilter"
          v-model="searchFilter"
          dark
          :filter="searchFilterModel"
          @selected="setSearchFocus($event)"
        ></abp-filter>
      </template>
      <!-- фильтры -->
      <template v-slot:filters>
        <abp-filters
          v-if="tableName && filters"
          v-model="filters"
          :table="tableName"
          @input="changeFilters($event)"
        ></abp-filters>
      </template>
      <!-- слот за фильтрами -->
      <template v-slot:append-top-actions>
        <slot name="append-top-actions"></slot>
      </template>
      <!-- вывод действий в строке -->
      <template v-slot:[`item.actions`]="{ item }">
        <!-- для мобилы -->
        <div v-if="isMobile">
          <template v-if="editable">
            <v-btn
              color="primary"
              text
              :to="{
                name: 'form',
                params: {
                  table: tableName,
                  id: item.id,
                  modType: 'edit',
                  keyModel: keyModel,
                },
              }"
            >
              Править
            </v-btn>
            <v-btn
              color="primary"
              text
              :to="{
                name: 'form',
                params: {
                  table: tableName,
                  id: item.id,
                  modType: 'copy',
                  keyModel: keyModel,
                },
              }"
            >
              Копировать
            </v-btn>
            <abp-delete-button
              title="Подтвердите удаление"
              :text="'Вы действительно хотите удалить запись из таблицы?'"
              :disabled="item.permissions.delete != 1"
              tip="удалить"
              :icon="false"
              btn-text="Удалить"
              :btn-props="{ text: true, color: 'secondary' }"
              @click="actionDelete(item)"
            >
            </abp-delete-button>
          </template>
          <!-- <template v-if="printable">
            <v-btn color="primary" text @click="printForm(item.id)">
              Печать
            </v-btn>
          </template> -->
        </div>
        <!-- для десктопа -->
        <v-row v-else class="action-table-buttons">
          <template v-if="printable">
            <abp-icon-button
              icon="mdi-printer"
              tip="Печать"
              :disabled="parseInt(item.id) < 2"
              @click="printForm(item.id)"
            ></abp-icon-button>
          </template>
          <template v-if="editable">
            <template v-if="itemsTable && isDocument">
              <abp-icon-button
                v-if="parseInt(item.is_active) === 1"
                icon="mdi-checkbox-marked-circle"
                tip="распровести"
                color="success"
                @click="actionSetUnactive(item)"
              ></abp-icon-button>
              <abp-icon-button
                v-else
                icon="mdi-checkbox-marked-circle"
                tip="провести"
                @click="actionSetActive(item)"
              ></abp-icon-button>
              <v-divider vertical></v-divider>
            </template>
            <abp-icon-button
              icon="mdi-content-copy"
              tip="копировать"
              :disabled="item.permissions.copy != 1"
              @click="actionCopy(item)"
            ></abp-icon-button>
            <abp-delete-button
              title="Подтвердите удаление"
              :text="'Вы действительно хотите удалить запись из таблицы?'"
              :disabled="item.permissions.delete != 1"
              tip="удалить"
              @click="actionDelete(item)"
            ></abp-delete-button>
          </template>
        </v-row>
      </template>
      <!-- вывод экспандера -->
      <template v-slot:expander="{ item }">
        <template v-if="hasItemsTable">
          <abp-items-table
            :key="`items_table${item.id}`"
            v-if="!!item.items && !!itemsModel"
            :items="item.items"
            :model="itemsModel.fields"
            :actions="withSeries || withSeriesEditor"
          >
            <template v-slot:actions="{ item }">
              <!-- серийные номера -->
              <div v-if="withSeries">
                <v-btn
                  color="primary"
                  text
                  v-if="isMobile"
                  @click="series(item)"
                >
                  Серийные №
                </v-btn>
                <abp-icon-button
                  v-else
                  icon="mdi-music-accidental-sharp"
                  :tip="`Серийные номера`"
                  :color="color"
                  :disabled="!item.id"
                  @click="series(item)"
                ></abp-icon-button>
              </div>
              <div v-if="withSeriesEditor">
                <v-btn
                  color="primary"
                  text
                  v-if="isMobile"
                  @click="seriesEditor(item)"
                >
                  Серийные №
                </v-btn>
                <abp-icon-button
                  v-else
                  icon="mdi-music-accidental-sharp"
                  :tip="`Серийные номера`"
                  :color="color"
                  :disabled="!item.id"
                  @click="seriesEditor(item)"
                ></abp-icon-button>
              </div>
            </template>
          </abp-items-table>
        </template>
      </template>
      <!-- картинка или проведение в prepend-блоке данных -->
      <template v-slot:[`item.prepend`]="{ item }">
        <!-- картинка для справочников-->
        <v-list-item-avatar v-if="hasImages" tile>
          <v-img :src="item.main_image"></v-img>
        </v-list-item-avatar>
        <!-- отметка о проведении для документов -->
        <v-list-item-action v-if="itemsTable && isDocument">
          <abp-icon-button
            v-if="parseInt(item.is_active) === 1"
            icon="mdi-checkbox-marked-circle"
            tip="распровести"
            color="success"
            @click="actionSetUnactive(item)"
          ></abp-icon-button>
          <abp-icon-button
            v-else
            icon="mdi-checkbox-marked-circle"
            tip="провести"
            @click="actionSetActive(item)"
          ></abp-icon-button>
        </v-list-item-action>
      </template>
    </abp-simple-table>

    <!-- диалог редактора серийных номеров -->
    <abp-dialog v-model="openSerialsEditor">
      <abp-series-editor
        v-if="currentItemEditor"
        :id="currentItemEditor.id"
        :table="itemsTable.table"
        :kolvo="currentItemEditor.kolvo"
        @close="closeSeriesEditor"
      ></abp-series-editor>
    </abp-dialog>
    <!-- диалог выбора серийных номеров -->
    <abp-dialog v-model="openSerials">
      <abp-series
        v-if="currentItem"
        :id="currentItem.id"
        :table="itemsTable.table"
        :kolvo="currentItem.kolvo"
        @close="closeSeries"
      ></abp-series>
    </abp-dialog>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import ABPItemsTableVue from "./ABPItemsTable.vue";
import ABPDeleteButtonVue from "../Form/ABPDeleteButton.vue";
import ABPDialogVue from "../Dialogs/ABPDialog.vue";
import ABPNomenklaturaSeriesVue from "../Form/ABPNomenklaturaSeries.vue";
import ABPNomenklaturaSeriesEditorVue from "../Form/ABPNomenklaturaSeriesEditor.vue";
import ABPFilterVue from "../Filters/ABPFilter.vue";
// import ABPSimpleTable from './ABPSimpleTable.vue'
// import ABPWaitingMessage from '../Info/ABPWaitingMessage'
// import ABPFilters from '../Filters/ABPFilters'
// import Confirm from '../Dialogs/Confirm.vue'
// import ABPIconButton from '../Form/ABPIconButton'
// import ABPItemsTableVue from './ABPItemsTable.vue'

export default {
  name: "abp-table",
  components: {
    "abp-simple-table": () => import("./ABPSimpleTable.vue"),
    "abp-filters": () => import("../Filters/ABPFilters"),
    "abp-icon-button": () => import("../Form/ABPIconButton"),
    "abp-items-table": ABPItemsTableVue,
    "abp-delete-button": ABPDeleteButtonVue,
    "abp-dialog": ABPDialogVue,
    "abp-series": ABPNomenklaturaSeriesVue,
    "abp-series-editor": ABPNomenklaturaSeriesEditorVue,
    "abp-filter": ABPFilterVue,
  },
  model: {
    prop: "inputValue",
    event: "input",
  },
  props: {
    inputValue: {},
    table: {
      type: String,
      required: true,
    },
    // цвет оформления
    color: {
      type: String,
      required: false,
      default: "primary",
    },
    title: {
      type: String,
      required: false,
    },
    // с селектами
    selectable: {
      type: Boolean,
      required: false,
      default: false,
    },
    // множественный выбор
    multiSelect: {
      type: Boolean,
      required: false,
      default: false,
    },
    // раскрывающиеся строки
    expanded: {
      type: Boolean,
      required: false,
      default: false,
    },
    // преобразователь базовой модели
    modelMixin: {
      type: Array,
      required: false,
    },
    // связи таблицы в виде массива [{key1:value1}, {key2:value2}]
    keyModel: {
      type: Array,
      required: false,
      default() {
        return [];
      },
    },
    // миксин опций загрузки данных
    options: {
      type: Object,
      required: false,
      default() {
        return {};
      },
    },
    // кнопки добавить, редактировать и т.д.
    editable: {
      type: Boolean,
      required: false,
      default: true,
    },
    // без лишних отступов (сжатый режим)
    dense: {
      type: Boolean,
      required: false,
      default: false,
    },
    // показывать фильтры при старте
    showFilters: {
      type: Boolean,
      required: false,
      default: false,
    },
    // скрывать футер
    hideFooter: {
      type: Boolean,
      required: false,
      default: false,
    },
    // скрывать хедер
    hideHeader: {
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
    // кол-во строк данных из внешнего источника
    arrayCount: {
      type: Number,
      required: false,
      default: 10,
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
    // наименование поля с идентификатором в объекте (при выборе в массив selected)
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
  data() {
    return {
      tableName: this.table,
      tableLoading: false,
      expArray: [],
      showFiltersBlock: this.showFilters,
      showColumns: false,
      formValues: {},
      showConfirmForm: false,
      // открыть форму редактора серийников
      openSerials: false,
      // открыть форму указания серийников
      openSerialsEditor: false,
      // обрабатываемая строка с редактором серийников
      currentItemEditor: null,
      // обрабатываемая строка с серийником
      currentItem: null,
      // поиск по таблице
      // searchFilter: null,
      // объект описания поиска для фильтра
      searchFilterModel: { name: "search", type: "string" },
      // фокус на поиске
      searchFocused: false,
    };
  },
  created() {
    this.startInit();
  },
  beforeRouteUpdate(to, from, next) {
    if (from.name == to.name) {
      this.tableName = to.params.table;
      this.startInit();
    }
    next();
  },
  methods: {
    ...mapActions([
      "getTableData",
      "syncTableOptions",
      "clearTableOptions",
      "getTableModel",
      "setTableFilterValues",
      "setTableColumns",
      "removeTableRow",
      "setPost",
      "setTitle",
      "addItemsData",
      "getPrintForm",
      "clearTableData",
    ]),
    // печатная форма
    printForm(id) {
      if (this.table) {
        this.getPrintForm({ table: this.table, id }).then((response) => {
          // console.log(`form=${JSON.stringify(response)}`);
          window.open(response, "_blank", `form_${this.table}_${id}_download`);
        });
      }
    },
    // открылся экспандер
    rowExpanded(event) {
      if (this.hasItemsTable) {
        if (event.value) {
          // console.log(`exp event=${JSON.stringify(event)}`);
          let needLod = false;
          // проверим, может уже все данные загружены
          try {
            if (
              this.totalItemsCount[event.item.id][this.itemsTable.method] >
              event.item[this.itemsTable.method].length
            ) {
              needLod = true;
            }
          } catch (error) {
            needLod = true;
          }
          // если не все данные загружены
          if (needLod) this.loadMoreItems(event.item.id);
        }
      }
    },
    // добавить очередную порцию итемсов
    loadMoreItems(id) {
      let loadSettings = {
        id,
        table: this.table,
        subTable: this.itemsTable,
      };
      this.addItemsData(loadSettings);
    },
    // установлен/снят фокус с инпута поиска
    setSearchFocus(isFocused) {
      this.searchFocused = isFocused;
    },
    // начальная инициализация
    startInit() {
      return new Promise((resolve) => {
        this.getTableModel(this.tableName).then(() => {
          if (this.itemsTable) {
            this.getTableModel(this.itemsTable.table);
          }
          // if (this.tableTitle) this.setTitle(this.tableTitle);
          // на мобиле - получим данные и опции таблицы
          if (this.tableOptions !== undefined) {
            if (this.isMobile) this.getData();
          } else {
            this.syncTableOptions({
              table: this.tableName,
              options: this.defaultTableOptions,
            });
          }
        });
        resolve();
      });
    },
    changeInput(newValue) {
      this.$emit("input", newValue);
    },
    clearFilters() {
      let newFilters = {};
      if (this.filters.search) {
        newFilters.search = this.filters.search;
      }
      this.changeFilters(newFilters);
    },
    changeOptions(newOptions) {
      this.$emit("optionsChanged", newOptions);
      this.syncTableOptions({
        table: this.tableName,
        options: newOptions,
      }).then(() => {
        this.getData();
      });
    },
    changeFilters(newVal) {
      this.filters = { ...newVal };
      // this.clearTableData("clearTableData", { table: this.table });
      this.tableOptions = {
        ...this.tableOptions,
        ...{ page: 1 },
      };
      // this.setTableFilterValues({'table':this.tableName, 'data':this.filters})
      //     .then(()=>{
      //         this.getData()
      //     })
    },
    refreshData() {
      this.getData();
    },
    getData() {
      // console.log(`getting data`);
      if (this.useDataArray) {
        this.$emit("getData");
      } else {
        return new Promise((resolve) => {
          this.tableLoading = true;
          this.getTableData({
            table: this.tableName,
            options: this.dataOptions,
          })
            .then(() => {
              resolve(true);
            })
            .finally(() => {
              this.tableLoading = false;
            });
        });
      }
    },
    changeCols(newCols) {
      this.setTableColumns({ table: this.tableName, data: newCols });
    },
    isCol(fieldName) {
      if (this.cols) {
        return this.cols.indexOf(fieldName) !== -1;
      } else {
        return true;
      }
    },
    toggleFilters() {
      this.showFiltersBlock = !this.showFiltersBlock;
    },
    rowClick(item) {
      if (this.editable && item.permissions.edit == 1) {
        this.actionEdit(item);
      }
    },
    actionEdit(item) {
      this.$router.push({
        name: "form",
        params: {
          table: this.tableName,
          id: item.id,
          modType: "edit",
          keyModel: this.keyModel,
        },
      });
      // this.$router.push({ path: `/form/${this.tableName}/edit/${item.id}`})
    },
    actionCopy(item) {
      this.$router.push({
        name: "form",
        params: {
          table: this.tableName,
          id: item.id,
          modType: "copy",
          keyModel: this.keyModel,
        },
      });
      // this.$router.push({ path: `/form/${this.tableName}/copy/${item.id}`})
    },
    actionAdd() {
      this.$router.push({
        name: "form",
        params: {
          table: this.tableName,
          modType: "add",
          keyModel: this.keyModel,
        },
      });
      // this.$router.push({ path: `/form/${this.tableName}/add`})
    },
    actionDelete(item) {
      this.removeTableRow({ table: this.tableName, id: item.id }).then(() => {
        this.refreshData();
      });
    },
    runDelete() {
      console.log("deleting");
    },
    actionSetActive(item) {
      this.setPost({
        table: this.tableName,
        id: item.id,
        values: { is_active: 1 },
      });
    },
    actionSetUnactive(item) {
      this.setPost({
        table: this.tableName,
        id: item.id,
        values: { is_active: 0 },
        msg: "Документ распроведен",
      });
    },
    formatVal(val, type) {
      switch (type) {
        case "kolvo": {
          return new Intl.NumberFormat("ru", {
            style: "decimal",
            minimumFractionDigits: 3,
          }).format(val);
        }
        case "money": {
          return new Intl.NumberFormat("ru", {
            style: "decimal",
            minimumFractionDigits: 2,
          }).format(val);
        }
        case "date": {
          return this.$moment(val).format("DD.MM.YYYY");
        }
        default: {
          return val;
        }
      }
    },
    formatDate(val) {
      return this.$moment(val).format("DD.MM.YYYY");
    },
    // добавление серийных номеров в подчиненную таблицу
    seriesEditor(item) {
      this.currentItemEditor = { ...item };
      this.openSerialsEditor = true;
    },
    // указание серийных номеров в расходе
    series(item) {
      this.currentItem = { ...item };
      this.openSerials = true;
    },
    // закрываем ввод серийников
    closeSeries() {
      this.openSerials = false;
    },
    //
    closeSeriesEditor() {
      this.openSerialsEditor = false;
    },
    // добавляем данные для мобильного вида
    addMobileData(items, table) {
      // результирующий массив данных
      let res = [];
      // обработаем каждую строку неформатированных данных
      for (let row of items) {
        // объект строки
        let currentRow = { ...row };
        // если переданы столбцы мобильной версии
        if (this.mobileTableCols[table] != undefined) {
          // неформатированные строки в списке полей таблицы store.table.showMobileCols[this.table]
          let lines = this.mobileTableCols[table];
          // чтобы не искать лишний раз создадим объект соответствия имени поля типу
          let fieldTypes = {};
          // форматированная строка
          let formatRow = [];
          // заменяем
          for (let line of lines) {
            // // имя поля
            // let fieldName = null
            // шаблон поиска совпадений поля ${fieldName}
            let tmplt = /\$\{(.*?)\}/g;
            // результат преобразования
            let resLine = "";
            // если совпадение найдено
            if (line.match(tmplt)) {
              // заменяем все совпадающие имена полей - свойствами неформатированного объекта
              resLine = line.replace(tmplt, (...match) => {
                // // установим имя поля - первое соответствие шаблону
                // if (!fieldName) fieldName = match[1]
                // выведем либо свойство объекта, либо пустую строку, если такого св-ва нет
                let fieldName = match[1];
                if (row[fieldName] != undefined) {
                  // найдем тип поля в моделе
                  if (fieldTypes[fieldName]) {
                    fieldTypes[fieldName];
                    return this.formatVal(
                      row[fieldName],
                      fieldTypes[fieldName]
                    );
                  } else {
                    // ищем тип поля в моделе
                    let field = this.tableModel.find((field) => {
                      return field.name == fieldName;
                    });
                    if (field) {
                      fieldTypes[fieldName] = field.type;
                      return this.formatVal(
                        row[fieldName],
                        fieldTypes[fieldName]
                      );
                    } else {
                      // передаем неформатированные данные - тип не найден в моделе
                      return row[fieldName];
                    }
                  }
                } else {
                  return "";
                }
              });
            } else {
              // // установим имя поля
              // fieldName = line
              // выведем свойство объекта, либо пустую строку, если такого св-ва нет
              if (row[line] != undefined) resLine = row[line];
            }
            // занесем новое форматированное свойство нового объекта
            formatRow.push(resLine);
          }
          // занесем в массив результата новый объект
          currentRow.lines = formatRow;
        } else {
          // тип документа из стора
          let tableType =
            this.$store.state.table.model[table] !== undefined
              ? this.$store.state.table.model[table].extensions.props.table_type
              : "catalog";
          // форматирование не передано - форматируем в зависимости от типа таблицы
          switch (tableType) {
            case "document":
              {
                // документ
                let formatDate = this.$moment(
                  row.doc_date,
                  "YYYY-MM-DD",
                  true
                ).format("DD.MM.YYYY");
                currentRow.lines = [`№${row.doc_num} от ${formatDate}`];
              }
              break;
            case "sub_table":
              {
                currentRow.lines = [];
                // если передана номенклатура - ее сначала
                if (row.nomenklatura !== undefined) {
                  let line1 = `${row.n === undefined ? "" : `${row.n}. `}${
                    row.nomenklatura
                  }`;
                  currentRow.lines.push(line1);
                  if (
                    row.kolvo !== undefined &&
                    row.price !== undefined &&
                    row.summa !== undefined
                  ) {
                    let line2 = `${this.formatVal(
                      row.price,
                      "money"
                    )} x ${this.formatVal(row.kolvo, "kolvo")} ${
                      row.ed_ism === undefined ? "" : row.ed_ism
                    } = ${this.formatVal(row.summa, "money")}`;
                    currentRow.lines.push(line2);
                  }
                } else {
                  let i = 1;
                  for (let line in row) {
                    if (i <= 3) {
                      if (i === 1) {
                        currentRow.lines.push(
                          `${row.n === undefined ? "" : `${row.n}. `}${
                            row[line]
                          }`
                        );
                      } else {
                        currentRow.lines.push(`${row[line]}`);
                      }
                    }
                    i++;
                  }
                }
              }
              break;
            case "catalog":
              {
                // справочник
                currentRow.lines = [row.name, row.comment];
              }
              break;
          }
        }
        // добавим подчиненную таблицу, если есть
        if (
          // this.isDocument &&
          this.hasItemsTable &&
          currentRow.items &&
          this.itemsTable.table
        ) {
          currentRow.items = [
            ...this.addMobileData(currentRow.items, this.itemsTable.table),
          ];
        }

        res.push(currentRow);
      }
      // выдаем результат
      return res;
    },
  },
  computed: {
    ...mapGetters([
      "defaultTableOptions",
      "serviceFieldNames",
      "sortFieldTypes",
      "mobileTableCols",
      "isMobile",
    ]),
    // миксин опций получения данных
    dataOptions() {
      let options = { ...this.options };
      if (this.keyModel.length > 0) {
        options.keyModel = [...this.keyModel];
      }
      let filters = {};
      // только указанные значения
      if (this.validItems) {
        if (this.itemValue == "id") {
          options.id = this.validItems;
        } else {
          filters[this.itemValue] = this.validItems;
        }
      }
      // исключить значения из списка - будут доступны только переданные в массиве
      if (this.exceptItems) {
        if (this.itemValue == "id") {
          options.not_id = this.exceptItems;
        } else {
          // не реализано языком api
        }
      }
      options.filters = filters;
      return options;
    },
    // общее кол-во подчиненных записей
    totalItemsCount() {
      if (this.hasItemsTable) {
        try {
          return this.$store.state.table.tableItemsDataCount[this.tableName];
        } catch (error) {
          return 0;
        }
      }
      return 0;
    },

    hasAddPermission() {
      if (this.fullModel) {
        return this.fullModel.extensions.permissions.add == 1;
      }
      return false;
    },
    tableTitle() {
      if (this.fullModel) {
        return this.fullModel.extensions.props.titles.table;
      }
      return null;
    },
    // есть печатная форма
    printable() {
      try {
        if (this.fullModel) {
          return this.fullModel.extensions.props.printable;
        }
      } catch (e) {
        // default return below
      }
      return false;
    },
    // выбранные значение
    selected: {
      get() {
        return this.inputValue || [];
      },
      set(newVal) {
        this.$emit("input", newVal);
      },
    },
    // все фильтры для таблицы
    filters: {
      get() {
        if (this.$store.state.table.filterValues[this.tableName]) {
          return this.$store.state.table.filterValues[this.tableName];
        }
        return {};
      },
      set(newValue) {
        this.setTableFilterValues({
          table: this.tableName,
          data: newValue,
        }).then(() => {
          // this.getData();
        });
      },
    },
    // есть фильтр - текстовый поиск
    hasSearchFilter() {
      try {
        return (
          this.$store.state.table.filters[this.table].findIndex((filter) => {
            return filter.name == "search";
          }) !== -1
        );
      } catch (e) {
        return false;
      }
    },
    // фильтр - сохраненное значение текстового поиска
    searchFilter: {
      get() {
        // console.log(`-->${this.filters.search}`);
        try {
          return this.filters.search;
        } catch (error) {
          return "";
        }
      },
      set(newValue) {
        // console.log(`newSearch=${newValue}`);
        this.changeFilters({
          ...this.filters,
          ...{ search: newValue },
        });
      },
    },
    // полная модель таблицы
    fullModel() {
      return this.$store.state.table.model[this.tableName] || null;
    },
    tableModel() {
      if (this.$store.state.table.model[this.tableName]) {
        let model = this.$store.state.table.model[this.tableName].fields;
        //  заменим свойства столбца переданными параметрами (идентификация столбца по name)
        // параметр model приоритетнее полученного из БД значения
        if (this.modelMixin) {
          // console.log(`model = ${JSON.stringify(this.model)}`)
          let resModel = [];
          let mixinsFoundArray = [];
          for (let i = 0; i < model.length; i++) {
            let dbField = model[i];
            // console.log(`dbField = ${JSON.stringify(dbField)}`)
            let isFind = false;
            for (let j = 0; j < this.modelMixin.length; j++) {
              let paramField = this.modelMixin[j];
              // console.log(`paramField = ${JSON.stringify(paramField)}`)
              if (
                paramField.name &&
                dbField.name &&
                dbField.name == paramField.name
              ) {
                mixinsFoundArray.push(j);
                isFind = true;
                resModel.push({ ...dbField, ...paramField });
                // console.log(resModel)
                break;
              }
            }
            if (!isFind) {
              resModel.push(dbField);
            }
          }
          // добавим все из ненайденных в модели миксинов
          for (let j = 0; j < this.modelMixin.length; j++) {
            if (mixinsFoundArray.indexOf(j) === -1) {
              let mixinField = this.modelMixin[j];
              resModel.push({ ...mixinField });
            }
          }

          model = resModel;
        }
        // главное изображения
        let isMainImg = false;
        // убираем сервисные поля
        let realFields = model.filter((field) => {
          if (
            this.hasImages &&
            field.type == "image" &&
            field.name == "main_image"
          )
            isMainImg = true;
          return this.serviceFieldNames.indexOf(field.name) === -1;
        });
        // если нет главного изображения - добавим
        if (this.hasImages && !isMainImg) {
          realFields.push({
            type: "image",
            title: "Изображение",
            name: "main_image",
          });
        }
        // выводим преобразованную модель
        return realFields;
      } else {
        return null;
      }
    },
    filtrableFields() {
      if (this.tableModel) {
        return this.tableModel.filter((field) => {
          return (
            this.serviceFieldNames.indexOf(field.name) === -1 &&
            (field.show_in_table == undefined ||
              field.show_in_table != false ||
              field.filter)
          );
        });
      }
      return [];
    },
    headers() {
      if (this.tableModel) {
        let fields = [];
        this.tableModel.forEach((field) => {
          if (field.show_in_table !== false) {
            let col = {
              text: field.title,
              value: field.name,
              type: field.type,
              sortable: this.sortFieldTypes.indexOf(field.type) !== -1,
            };
            switch (field.type) {
              case "kolvo":
              case "money":
                {
                  col.align = "end";
                }
                break;
              case "select":
                {
                  col.value = field.name.replace(/_id$/, "");
                }
                break;
              case "morph":
                {
                  col.value = `${field.name}_title`;
                }
                break;
              default: {
                col.value = field.name;
              }
            }
            // console.log(`field ${JSON.stringify(field)}, val=${col.value}`)
            if (this.isCol(field.name)) fields.push(col);
          }
        });
        if (this.editable) {
          fields.push({
            text: "",
            value: "actions",
            sortable: false,
            align: "end",
          });
        }
        return fields;
      } else {
        return [];
      }
    },
    cols() {
      if (this.$store.state.table.showCols[this.tableName]) {
        return this.$store.state.table.showCols[this.tableName];
      } else {
        if (this.tableModel) {
          let cols = this.tableModel.map((field) => {
            if (field.show_in_table !== false) return field.name;
          });
          if (this.hasImages) {
            cols.push("main_image");
          }
          return cols;
        } else {
          return [];
        }
      }
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
    items() {
      if (this.$store.state.table.tableData[this.tableName]) {
        let d = this.$store.state.table.tableData[this.tableName];
        // только указанные значения будут доступны для выбора
        // if (this.validItems) {
        //   d = d.filter((item) => {
        //     return this.ValidItems.indexOf(item.id) !== -1;
        //   });
        // }
        // // исключить значения из списка - будут доступны только переданные в массиве
        // if (this.exceptItems) {
        //   d = d.filter((item) => {
        //     return this.exceptItems.indexOf(item.id) === -1;
        //   });
        // }
        // добавим итемсы из formData
        if (this.hasItemsTable) {
          d = d.map((item) => {
            try {
              let newItem = { ...item };
              newItem[
                this.itemsTable.method
              ] = this.$store.state.table.formData[this.tableName][newItem.id][
                this.itemsTable.method
              ];
              return newItem;
            } catch (error) {
              return item;
            }
          });
        }
        return d;
      }
      return [];
    },
    arrayItems() {
      if (this.dataArray) return this.dataArray;
      return [];
    },
    // данные в зависимости от брейкпоинта и переданного массива или данных БД
    dataItems() {
      // неформатированные данные
      let unformat_data = this.useDataArray ? this.arrayItems : this.items;
      // если мобила
      if (this.isMobile) {
        // добавим массив lines в каждую строку в зависимости от переданного форматирования или типа документа
        return this.addMobileData(unformat_data, this.table);
      } else {
        // в таблице не форматируем результат
        return unformat_data;
      }
    },
    // итоги
    dataItogs() {
      try {
        let itogs = this.$store.state.table.tableDataItogs[this.tableName];
        if (!Array.isArray(itogs)) {
          if (Object.keys(itogs).length > 0) return itogs;
        }
      } catch (e) {
        return null;
      }
      return null;
    },
    // страница списка
    page: {
      get() {
        return this.tableOptions != undefined &&
          this.tableOptions.page != undefined
          ? this.tableOptions.page
          : 1;
      },
      set(page) {
        this.changeOptions({ ...this.tableOptions, ...{ page: page } });
      },
    },
    // всего страниц
    pages() {
      return Math.ceil(this.tableDataCount / this.tableOptions.itemsPerPage);
    },
    // кол-во элементов массива значений
    arrayItemsCount() {
      return this.arrayCount ? this.arrayCount : 10;
    },
    tableDataCount() {
      if (this.useDataArray) {
        return this.arrayItemsCount;
      } else {
        if (this.$store.state.table.tableDataCount[this.tableName]) {
          return this.$store.state.table.tableDataCount[this.tableName];
        } else {
          return 0;
        }
      }
    },
    hasImages() {
      if (this.fullModel.extensions) {
        let ext = this.fullModel.extensions;
        if (ext.has_images) return ext.has_images;
      }
      return false;
    },
    // количество выбранных фильтров
    filtersCounter() {
      let counter = 0;
      for (let filter in this.filters) {
        if (filter !== "search") {
          if (Array.isArray(this.filters[filter])) {
            if (this.filters[filter].length > 0) counter++;
          } else {
            if (this.filters[filter]) counter++;
          }
        }
      }
      return counter;
    },
    // когда фильтры неактивны
    filtersDisabled() {
      return this.filtersCounter === 0;
    },
    // тип таблицы
    tableType() {
      if (this.fullModel.extensions) {
        return this.fullModel.extensions.props.table_type || null;
      }
      return null;
    },
    // таблица == документ
    isDocument() {
      return this.tableType == "document";
    },
    // описание табличной части
    itemsTable() {
      let it = null;
      if (this.fullModel && this.fullModel.extensions.sub_tables) {
        if (this.fullModel.extensions.sub_tables) {
          for (let subTable in this.fullModel.extensions.sub_tables) {
            let subTableItem = this.fullModel.extensions.sub_tables[subTable];
            if (subTableItem.method == "items") it = subTableItem;
          }
        }
      }
      return it;
    },
    // модель табличной части
    itemsModel() {
      if (this.itemsTable) {
        if (this.itemsTable.table) {
          if (this.$store.state.table.model[this.itemsTable.table])
            return this.$store.state.table.model[this.itemsTable.table];
        }
      }
      return null;
    },
    // заголовки табличной части
    itemsHeaders() {
      if (this.itemsModel) {
        let fields = [];
        this.itemsModel.fields.forEach((field) => {
          if (field.show_in_table !== false) {
            let col = {
              text: field.title,
              value: field.name,
              type: field.type,
              sortable: this.sortFieldTypes.indexOf(field.type) !== -1,
            };
            switch (field.type) {
              case "kolvo":
              case "money":
                {
                  col.align = "end";
                }
                break;
              case "select":
                {
                  col.value = field.name.replace(/_id$/, "");
                }
                break;
            }
            fields.push(col);
          }
        });
        return fields;
      }
      return null;
    },
    // есть табличная часть
    hasItemsTable() {
      return !!this.itemsTable;
    },
    // отображать экспандер
    withExpander() {
      return this.expanded || this.hasItemsTable;
    },
    // серийные номера в табличной части - списание серийников
    withSeries() {
      if (this.itemsModel && this.itemsModel.extensions)
        return this.itemsModel.extensions.has_sub_series;

      return false;
    },
    // серийные номера в табличной части - добавление бд серийников
    withSeriesEditor() {
      if (this.itemsModel.extensions)
        return this.itemsModel.extensions.has_series;
      else return false;
    },
  },
  watch: {
    openSerials(newVal) {
      if (!newVal) {
        this.currentItem = null;
      }
    },
    openSerialsEditor(newVal) {
      if (!newVal) {
        this.currentItemEditor = null;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.expander-column {
  padding: 0 !important;
}
.action-table-buttons {
  display: block;
  margin: 0;
}
</style>
