<template>
  <div>
    <div v-if="tableModel">
      <!-- мобильное отображение таблицы -->
      <div v-if="isMobile">
        <v-card width="100%">
          <v-toolbar>
            <!-- добавление записи -->
            <v-btn text color="primary" @click="actionAdd">
              Новая запись
            </v-btn>
            <v-spacer></v-spacer>
            <!-- обновление таблицы -->
            <abp-icon-button
              icon="mdi-refresh"
              tip="Обновить данные в таблице"
              @click="refreshData"
            ></abp-icon-button>
            <!-- отображение фильтров -->
            <abp-icon-button
              icon="mdi-magnify-close"
              tip="Очистить фильтры"
              :disabled="filtersDisabled"
              @click="clearFilters"
            ></abp-icon-button>
            <abp-icon-button
              icon="mdi-magnify"
              :tip="`${showFiltersBlock ? 'Скрыть' : 'Показать'} фильтры`"
              @click="toggleFilters"
            ></abp-icon-button>
          </v-toolbar>
          <!-- фильтры -->
          <v-card-text v-show="showFiltersBlock" color="blue lighten-4">
            <abp-filters
              v-if="tableName && filters"
              v-model="filters"
              :table="tableName"
              @input="changeFilters($event)"
            ></abp-filters>
          </v-card-text>
          <!-- загрузка данных -->
          <v-card-text v-if="tableLoading">
            Загрузка данных ...
          </v-card-text>
          <!-- или данные таблицы -->
          <div v-else>
            <v-list>
              <template v-for="(item, i) in dataItems">
                <v-list-group :key="`row${item.id}`">
                  <template v-slot:activator>
                    <v-list-item-content class="pa-0">
                      <v-list
                        :three-line="treeLines"
                        :two-line="twoLines"
                        class="pa-0"
                      >
                        <v-list-item
                          :to="{
                            name: 'form',
                            params: {
                              table: tableName,
                              id: item.id,
                              modType: 'edit',
                              keyModel: keyModel,
                            },
                          }"
                          class="pa-0"
                        >
                          <!-- картинка для справочников-->
                          <v-list-item-avatar
                            v-if="hasImages && !isDocument"
                            tile
                          >
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

                          <!-- строки вывода -->
                          <v-list-item-content>
                            <template v-for="(line, i) in item.lines">
                              <div :key="`line_${i}`" v-if="i < 3">
                                <!-- заголовок -->
                                <v-list-item-title
                                  v-if="i == 0"
                                  v-text="line"
                                ></v-list-item-title>
                                <!-- 2 и 3 строки -->
                                <v-list-item-subtitle
                                  v-else
                                  v-text="line"
                                ></v-list-item-subtitle>
                              </div>
                            </template>
                          </v-list-item-content>
                        </v-list-item>
                      </v-list>
                    </v-list-item-content>
                  </template>

                  <v-list-item class="pa-0">
                    <v-list-item-content class="pa-0">
                      <!-- подчиненная таблица и действия -->
                      <v-card dense :elevation="0">
                        <!-- действия над записью -->
                        <v-card-actions>
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
                            :text="
                              'Вы действительно хотите удалить запись из таблицы?'
                            "
                            :disabled="item.permissions.delete != 1"
                            tip="удалить"
                            :icon="false"
                            btn-text="Удалить"
                            :btn-props="{ text: true, color: 'secondary' }"
                            @click="actionDelete(item)"
                          >
                          </abp-delete-button>
                        </v-card-actions>
                        <!-- подчиненная таблица, если есть -->
                        <template v-if="withExpander">
                          <slot name="expander">
                            <abp-items-table
                              v-if="!!item.items && !!itemsHeaders"
                              :items="item.items"
                              :headers="itemsHeaders"
                              :actions="true"
                            >
                              <template v-slot:actions="{ item }">
                                <!-- серийные номера -->
                                <div v-if="withSeries">
                                  <abp-icon-button
                                    icon="mdi-music-accidental-sharp"
                                    :tip="`Серийные номера`"
                                    :color="color"
                                    :disabled="!item.id"
                                    @click="series(item)"
                                  ></abp-icon-button>
                                </div>
                                <div v-if="withSeriesEditor">
                                  <abp-icon-button
                                    icon="mdi-music-accidental-sharp"
                                    :tip="`Серийные номера`"
                                    :color="color"
                                    :disabled="!item.id"
                                    @click="seriesEditor(item)"
                                  ></abp-icon-button>
                                </div>
                              </template>
                            </abp-items-table>
                          </slot>
                        </template>
                      </v-card>
                    </v-list-item-content>
                  </v-list-item>
                </v-list-group>
                <v-divider :key="`divider${i}`"></v-divider>
              </template>
            </v-list>
            <!-- паджинатор -->
            <v-row justify="center">
              <v-col cols="12">
                <v-container class="max-width">
                  <v-pagination
                    v-model="page"
                    class="my-2"
                    :length="pages"
                    :total-visible="5"
                  ></v-pagination>
                </v-container>
              </v-col>
            </v-row>
          </div>
        </v-card>
      </div>
      <!-- десктопное отображение таблицы -->
      <div v-else>
        <!-- {{headers}} -->
        <!-- {{withExpander}} -->
        <!-- {{itemsTable}} -->
        <v-data-table
          :fixed-header="true"
          :dense="dense"
          :loading="tableLoading"
          loading-text="Загрузка данных..."
          :headers="headers"
          :options.sync="tableOptions"
          :server-items-length="tableDataCount"
          :items="dataItems"
          :show-select="selectable"
          :single-select="!multiSelect"
          v-model="selected"
          items-per-page-text="записей на странице"
          class="elevation-1"
          :show-expand="withExpander"
          :single-expand="true"
          :expanded.sync="expArray"
          :footer-props="{
            'show-current-page': true,
            'show-first-last-page': true,
          }"
          :hide-default-footer="hideFooter"
          :hide-default-header="hideHeader"
          @input="changeInput"
          @click:row="rowClick($event)"
        >
          <template v-slot:top>
            <v-toolbar color="indigo" dark dense>
              <!-- кнопка отображения столбцов -->
              <abp-icon-button
                icon="mdi-view-column"
                tip="Выбор столбцов"
                @click="showColumns = !showColumns"
              ></abp-icon-button>
              <!-- выбор отображения столбцов -->
              <v-menu
                v-model="showColumns"
                v-if="cols"
                :close-on-content-click="false"
                :nudge-width="200"
                offset-x
              >
                <v-card>
                  <v-card-title>
                    Выбор столбцов
                  </v-card-title>
                  <v-divider></v-divider>
                  <v-list dense>
                    <v-list-item
                      v-for="field in filtrableFields"
                      :key="`${field.name}_selector`"
                    >
                      <template v-if="field.show_in_table !== false">
                        <v-list-item-action>
                          <v-switch
                            :input-value="isCol(field.name)"
                            :disabled="cols.length == 1"
                            color="indigo lighten-1"
                            @change="changeCols($event, field.name)"
                          ></v-switch>
                        </v-list-item-action>
                        <v-list-item-title>{{ field.title }}</v-list-item-title>
                      </template>
                    </v-list-item>
                  </v-list>
                </v-card>
              </v-menu>
              <!-- слот перед заголовком -->
              <slot name="prepend-title"></slot>
              <v-divider vertical></v-divider>
              <!-- заголовок таблицы -->
              <v-toolbar-title v-if="title">
                {{ title }}
              </v-toolbar-title>
              <!-- слот после заголовка -->
              <slot name="append-title"></slot>
              <v-spacer></v-spacer>
              <!-- слот перед кнопками действий  -->
              <slot name="prepend-top-actions"></slot>
              <!-- добавление записи -->
              <abp-icon-button
                v-if="editable"
                icon="mdi-plus-circle"
                tip="Добавить запись"
                :disabled="!hasAddPermission"
                @click="actionAdd"
              ></abp-icon-button>
              <v-divider vertical></v-divider>
              <!-- обновление таблицы -->
              <abp-icon-button
                icon="mdi-refresh"
                tip="Обновить данные в таблице"
                @click="refreshData"
              ></abp-icon-button>
              <!-- отображение фильтров -->
              <abp-icon-button
                icon="mdi-magnify-close"
                tip="Очистить фильтры"
                :disabled="filtersDisabled"
                @click="clearFilters"
              ></abp-icon-button>
              <abp-icon-button
                icon="mdi-magnify"
                :tip="`${showFiltersBlock ? 'Скрыть' : 'Показать'} фильтры`"
                @click="toggleFilters"
              ></abp-icon-button>
              <!-- слот после кнопок действий  -->
              <slot name="append-top-actions"></slot>
            </v-toolbar>
            <abp-filters
              v-if="tableName && filters"
              v-show="showFiltersBlock"
              v-model="filters"
              :table="tableName"
              @input="changeFilters($event)"
            ></abp-filters>
            <v-divider></v-divider>
          </template>

          <!-- форматирование значений в ячейках таблицы в соответствии с типом -->
          <template
            v-slot:[`item.${field.name}`]="{ item }"
            v-for="field in tableModel"
          >
            <div :key="`item.${field.name}`" v-show="isCol(field.name)">
              <!-- остатки -->
              <div v-if="field.type == 'stock_balance'">
                {{ item["nomenklatura"] }}
              </div>
              <!-- чекбоксы -->
              <div v-else-if="field.type == 'boolean'">
                <v-simple-checkbox
                  :key="`item.${field.name}`"
                  :value="Boolean(item[field.name])"
                  disabled
                ></v-simple-checkbox>
              </div>
              <!-- деньги и кол-во -->
              <div
                v-else-if="['money', 'kolvo'].indexOf(field.type) !== -1"
                class="text-right"
                :class="{ 'error--text': parseFloat(item[field.value]) < 0 }"
              >
                {{ formatVal(item[field.name], field.type) }}
              </div>
              <!-- селекты -->
              <div
                v-else-if="
                  ['select', 'foreign_select'].indexOf(field.type) !== -1
                "
              >
                <!-- будем выводить значение читателя (без последнего _id, например manufacturer вместо manufacturer_id) -->
                <div
                  v-if="
                    field.name.lastIndexOf('_id') !== -1 &&
                      item[`${field.name.replace(/\_id$/, '')}`]
                  "
                >
                  {{ item[`${field.name.replace(/\_id$/, "")}`] }}
                </div>
                <div v-else>
                  <!-- нет смысла выводить нелепые цифры -->
                </div>
              </div>
              <!-- даты -->
              <div v-else-if="field.type == 'date'">
                {{ formatDate(item[field.name]) }}
              </div>
              <!-- картинки -->
              <div v-else-if="field.type == 'image'">
                <v-img
                  v-if="!!item[field.name] && item[field.name].length > 4"
                  :lazy-src="item[field.name]"
                  :contain="false"
                  max-width="50"
                  max-height="38"
                  :src="item[field.name]"
                ></v-img>
                <div v-else></div>
              </div>
              <!-- все остальные типы полей - простой вывод значения -->
              <div v-else>
                {{ item[field.name] }}
              </div>
            </div>
          </template>

          <!-- вывод действий в строке -->
          <template v-slot:[`item.actions`]="{ item }" v-if="editable">
            <v-row>
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
            </v-row>
          </template>
          <!-- вывод экспандера -->
          <template
            v-slot:expanded-item="{ headers, item }"
            v-if="withExpander"
          >
            <td :colspan="headers.length" class="expander-column">
              <slot name="expander">
                <abp-items-table
                  v-if="!!item.items && !!itemsHeaders"
                  :items="item.items"
                  :headers="itemsHeaders"
                  :actions="true"
                >
                  <template v-slot:actions="{ item }">
                    <!-- серийные номера -->
                    <div v-if="withSeries">
                      <abp-icon-button
                        icon="mdi-music-accidental-sharp"
                        :tip="`Серийные номера`"
                        :color="color"
                        :disabled="!item.id"
                        @click="series(item)"
                      ></abp-icon-button>
                    </div>
                    <div v-if="withSeriesEditor">
                      <abp-icon-button
                        icon="mdi-music-accidental-sharp"
                        :tip="`Серийные номера`"
                        :color="color"
                        :disabled="!item.id"
                        @click="seriesEditor(item)"
                      ></abp-icon-button>
                    </div>
                  </template>
                </abp-items-table>
              </slot>
            </td>
          </template>

          <!-- настройки вывода футера -->
          <v-data-footer items-per-page-text="записей на стр"></v-data-footer>
        </v-data-table>
      </div>
    </div>
    <div v-else>
      <abp-waiting-message :loading="true">
        Идет начальная инициализация. Это не должно занять много времени...
      </abp-waiting-message>

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
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import ABPItemsTableVue from "./ABPItemsTable.vue";
import ABPDeleteButtonVue from "../Form/ABPDeleteButton.vue";
import ABPDialogVue from "../Dialogs/ABPDialog.vue";
import ABPNomenklaturaSeriesVue from "../Form/ABPNomenklaturaSeries.vue";
import ABPNomenklaturaSeriesEditorVue from "../Form/ABPNomenklaturaSeriesEditor.vue";
// import ABPSimpleTable from './ABPSimpleTable.vue'
// import ABPWaitingMessage from '../Info/ABPWaitingMessage'
// import ABPFilters from '../Filters/ABPFilters'
// import Confirm from '../Dialogs/Confirm.vue'
// import ABPIconButton from '../Form/ABPIconButton'
// import ABPItemsTableVue from './ABPItemsTable.vue'

export default {
  name: "abp-table",
  components: {
    "abp-waiting-message": () => import("../Info/ABPWaitingMessage"),
    "abp-filters": () => import("../Filters/ABPFilters"),
    "abp-icon-button": () => import("../Form/ABPIconButton"),
    "abp-items-table": ABPItemsTableVue,
    "abp-delete-button": ABPDeleteButtonVue,
    "abp-dialog": ABPDialogVue,
    "abp-series": ABPNomenklaturaSeriesVue,
    "abp-series-editor": ABPNomenklaturaSeriesEditorVue,
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
    ]),
    startInit() {
      return new Promise((resolve) => {
        this.getTableModel(this.tableName).then(() => {
          if (this.itemsTable) {
            this.getTableModel(this.itemsTable.table);
          }
          if (this.tableTitle) this.setTitle(this.tableTitle);
          // на мобиле - получим данные и опции таблицы
          if (this.isMobile) {
            if (this.tableOptions !== undefined) {
              this.getData();
            } else {
              this.syncTableOptions({
                table: this.tableName,
                options: this.defaultTableOptions,
              });
            }
          }
        });
        resolve();
      });
    },
    changeInput(newValue) {
      this.$emit("input", newValue);
    },
    clearFilters() {
      this.changeFilters({});
    },
    changeOptions(newOptions) {
      this.syncTableOptions({
        table: this.tableName,
        options: newOptions,
      }).then(() => {
        this.getData();
      });
    },
    changeFilters(newVal) {
      this.filters = { ...newVal };
      // this.setTableFilterValues({'table':this.tableName, 'data':this.filters})
      //     .then(()=>{
      //         this.getData()
      //     })
    },
    refreshData() {
      this.getData();
    },
    getData() {
      if (this.useDataArray) {
        this.$emit("getData");
      } else {
        return new Promise((resolve) => {
          this.tableLoading = true;
          this.getTableData({ table: this.tableName, keyModel: this.keyModel })
            .then(() => {
              resolve(true);
            })
            .finally(() => {
              this.tableLoading = false;
            });
        });
      }
    },
    changeCols(colValue, fieldName) {
      if (colValue) {
        if (this.cols.indexOf(fieldName) === -1) {
          let resArr = [...this.cols];
          resArr.push(fieldName);
          this.setTableColumns({ table: this.tableName, data: resArr });
        }
      } else {
        let findedIndex = this.cols.indexOf(fieldName);
        if (findedIndex !== -1) {
          let resArr = [...this.cols];
          resArr.splice(findedIndex, 1);
          this.setTableColumns({ table: this.tableName, data: resArr });
        }
      }
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
      } else {
        if (this.selectable) {
          if (this.multiSelect) {
            this.changeInput([...this.selected], [item]);
          } else {
            this.changeInput([item]);
          }
        }
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
        message: "Документ распроведен",
      });
    },
    formatVal(val, type) {
      let dig = 2;
      switch (type) {
        case "kolvo": {
          dig = 3;
        }
      }
      let formatter = new Intl.NumberFormat("ru", {
        style: "decimal",
        minimumFractionDigits: dig,
      });
      return formatter.format(val);
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
    // проверяем будет ли список в мобиле n-строчным
    isLinesCount(n) {
      if (this.dataItems && this.dataItems[0] != undefined) {
        let firstObj = this.dataItems[0];
        // кол-во элементов в объекте
        let elCount = firstObj.lines.length;
        // проверим, есть ли изображение
        if (firstObj.main_image != undefined) {
          if (n >= 3) {
            return elCount > 3;
          } else {
            return n == elCount - 1;
          }
        } else {
          return n == elCount;
        }
      }
      return false;
    },
  },
  computed: {
    ...mapGetters([
      "defaultTableOptions",
      "serviceFieldNames",
      "sortFieldTypes",
      "mobileTableCols",
    ]),
    // breakpoint by vuetify
    breakPoint() {
      return this.$vuetify.breakpoint.name;
    },
    // вывод в мобиле?
    isMobile() {
      // let mobileBreakPoints = ['xs', 'sm']
      let mobileBreakPoints = ["xs"];
      return mobileBreakPoints.indexOf(this.breakPoint) !== -1;
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
    selected: {
      get() {
        return this.inputValue || [];
      },
      set(newVal) {
        this.$emit("input", newVal);
      },
    },
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
          this.getData();
        });
      },
    },
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
            (field.show_in_table == undefined || field.show_in_table != false)
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
        if (this.validItems) {
          d = d.map((item) => {
            return this.ValidItems.indexOf(item.id) === -1;
          });
        }
        // исключить значения из списка - будут доступны только переданные в массиве
        if (this.exceptItems) {
          d = d.map((item) => {
            return this.exceptItems.indexOf(item.id) !== -1;
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
        // результирующий массив данных
        let res = [];
        // обработаем каждую строку неформатированных данных
        for (let row of unformat_data) {
          // объект строки
          let currentRow = { ...row };
          // если переданы столбцы мобильной версии
          if (this.mobileTableCols[this.table] != undefined) {
            // неформатированные строки в списке полей таблицы store.table.showMobileCols[this.table]
            let lines = this.mobileTableCols[this.table];
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
                  return row[`${match[1]}`] != undefined
                    ? row[`${match[1]}`]
                    : "";
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
            // форматирование не передано - форматируем в зависимости от типа таблицы
            if (this.isDocument) {
              // документ
              let formatDate = this.$moment(
                row.doc_date,
                "YYYY-MM-DD",
                true
              ).format("DD.MM.YYYY");
              currentRow.lines = [`№${row.doc_num} от ${formatDate}`];
            } else {
              // справочник
              currentRow.lines = [row.name, row.comment];
            }
          }
          res.push(currentRow);
        }
        // выдаем результат
        return res;
      } else {
        // в таблице не форматируем результат
        return unformat_data;
      }
    },
    // 3-линейный вывод список в мобиле
    treeLines() {
      return this.isLinesCount(3);
    },
    // 3-линейный вывод список в мобиле
    twoLines() {
      return this.isLinesCount(2);
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
    // когда фильтры неактивны
    filtersDisabled() {
      return Object.keys(this.filters).length == 0;
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
      if (this.fullModel.extensions.sub_tables) {
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
      if (this.itemsModel.extensions)
        return this.itemsModel.extensions.has_sub_series;
      else return false;
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
</style>
