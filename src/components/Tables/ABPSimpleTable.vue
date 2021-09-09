<template>
  <div data-app>
    <!-- таблица, если данные загружены -->
    <div v-if="tableLoaded">
      <!-- мобильное отображение таблицы -->
      <div v-if="isMobile">
        <v-card width="100%" :loading="isLoading">
          <v-toolbar :color="color" dark dense flat tile v-if="showHeader">
            <!-- слот выбора столбцов  -->
            <slot name="column-setup"></slot>
            <!-- слот заголовка  -->
            <slot name="title"></slot>
            <!-- слот перед кнопками действий  -->
            <slot name="prepend-top-actions"></slot>
            <slot name="top-actions"></slot>
            <!-- обновление таблицы -->
            <v-spacer></v-spacer>
            <abp-icon-button
              v-if="showReloadButton"
              :icon="reloadIcon"
              tip="Обновить данные в таблице"
              @click="refreshData"
            ></abp-icon-button>
            <v-divider vertical></v-divider>
            <!-- отображение фильтров -->
            <template v-if="showFiltersButton">
              <abp-icon-button
                :icon="clearFiltersIcon"
                tip="Очистить фильтры"
                :disabled="filtersDisabled"
                @click="clearFilters"
              ></abp-icon-button>
              <v-badge
                :content="filtersCount"
                color="red"
                right
                overlap
                offset-x="20"
                offset-y="20"
                :value="filtersCount"
              >
                <abp-icon-button
                  :icon="filtersBtnIcon"
                  :tip="`${showFilters ? 'Скрыть' : 'Показать'} фильтры`"
                  @click="toggleFilters"
                ></abp-icon-button>
              </v-badge>
            </template>
            <!-- слот после кнопок действий  -->
            <slot name="append-top-actions"></slot>
          </v-toolbar>
          <!-- блок фильтров -->
          <template v-if="showFiltersButton && showHeader">
            <v-card-text v-show="showFilters">
              <slot name="filters"></slot>
            </v-card-text>
          </template>
          <!-- между фильтрами и данными -->
          <slot name="append-top"></slot>
          <!-- данные таблицы -->
          <v-progress-linear
            height="2"
            indeterminate
            :color="color"
            v-if="isLoading"
          ></v-progress-linear>

          <div>
            <v-list
              :disabled="isLoading"
              :elevation="0"
              :class="{
                'pt-0': !showHeader,
                'pb-0': !showFooter,
                'data-list': showActiveDecoration,
              }"
              :style="borderColor"
            >
              <template v-for="(item, i) in items">
                <v-list-group
                  :key="`row${item.id}`"
                  :no-action="true"
                  :append-icon="showRowActions ? '$expand' : null"
                >
                  <template v-slot:activator>
                    <v-list-item-content class="pa-0">
                      <v-list
                        :three-line="treeLines"
                        :two-line="twoLines"
                        class="pa-0"
                      >
                        <v-list-item class="pa-0">
                          <!-- столбец перед выводом данных -->
                          <slot :name="`item.prepend`" :item="item"></slot>
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

                  <v-list-item class="pa-0" v-if="showRowActions">
                    <v-list-item-content class="pa-0">
                      <!-- подчиненная таблица и действия -->
                      <v-card dense :elevation="0">
                        <!-- действия над записью -->
                        <v-card-actions v-if="showRowActions">
                          <v-spacer></v-spacer>
                          <slot :name="`item.actions`" :item="item"></slot>
                        </v-card-actions>
                        <!-- подчиненная таблица, если есть -->
                        <template v-if="expanded">
                          <v-divider inset></v-divider>
                          <v-card-text class="pa-0">
                            <slot
                              name="expander"
                              v-bind="{ headers, item }"
                            ></slot>
                          </v-card-text>
                        </template>
                      </v-card>
                    </v-list-item-content>
                  </v-list-item>
                </v-list-group>
                <v-divider :key="`divider${i}`"></v-divider>
              </template>
            </v-list>
            <!-- паджинатор -->
            <v-row justify="center" v-if="showFooter">
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
        <v-data-table
          :fixed-header="fixedHeader"
          :dense="dense"
          :loading="isLoading"
          :loading-text="tableLoadingText"
          :headers="headers"
          :options.sync="tableOptions"
          :server-items-length="totalItems"
          :items="items"
          :show-select="selectable"
          v-model="selected"
          items-per-page-text="записей на странице"
          class="elevation-0"
          :show-expand="expanded"
          :single-expand="true"
          :expanded.sync="expArray"
          :expand-icon="expandIcon"
          :footer-props="{
            'show-current-page': true,
            'show-first-last-page': true,
          }"
          :hide-default-footer="!showFooter"
          @click:row="rowClick"
          @startLoading="startLoading"
          @endLoading="endLoading"
        >
          <!-- заголовок -->
          <template v-slot:top>
            <slot name="top" v-if="showHeader">
              <v-toolbar :color="color" dark dense>
                <!-- выбор столбцов -->
                <slot name="column-setup">
                  <template v-if="showColumnSetup">
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
                              <v-list-item-title>{{
                                field.title
                              }}</v-list-item-title>
                            </template>
                          </v-list-item>
                        </v-list>
                      </v-card>
                    </v-menu>
                  </template>
                </slot>
                <!-- слот перед заголовком -->
                <slot name="prepend-title"></slot>
                <v-divider vertical></v-divider>
                <!-- заголовок таблицы -->
                <slot name="title">
                  <v-toolbar-title v-if="title">
                    {{ title }}
                  </v-toolbar-title>
                </slot>
                <!-- слот после заголовка -->
                <slot name="append-title"></slot>
                <v-spacer></v-spacer>
                <!-- слот перед кнопками действий  -->
                <slot name="prepend-top-actions"></slot>
                <slot name="top-actions"></slot>
                <!-- обновление таблицы -->
                <abp-icon-button
                  v-if="showReloadButton"
                  :icon="reloadIcon"
                  tip="Обновить данные в таблице"
                  @click="refreshData"
                ></abp-icon-button>
                <v-divider vertical></v-divider>
                <!-- отображение фильтров -->
                <template v-if="showFiltersButton">
                  <abp-icon-button
                    :icon="clearFiltersIcon"
                    tip="Очистить фильтры"
                    :disabled="filtersDisabled"
                    @click="clearFilters"
                  ></abp-icon-button>
                  <v-badge
                    :content="filtersCount"
                    color="red"
                    right
                    overlap
                    offset-x="20"
                    offset-y="20"
                    :value="filtersCount"
                  >
                    <abp-icon-button
                      :icon="filtersBtnIcon"
                      :tip="`${showFilters ? 'Скрыть' : 'Показать'} фильтры`"
                      @click="toggleFilters"
                    ></abp-icon-button>
                  </v-badge>
                </template>
                <!-- слот после кнопок действий  -->
                <slot name="append-top-actions"></slot>
              </v-toolbar>
              <!-- блок фильтров -->
              <template v-if="showFiltersButton">
                <div v-show="showFilters" class="light-blue lighten-5">
                  <slot name="filters"></slot>
                </div>
              </template>
              <slot name="append-top"></slot>
            </slot>
          </template>

          <!-- форматирование значений в ячейках таблицы в соответствии с типом -->
          <template
            v-slot:[`item.${field.value}`]="{ item }"
            v-for="field in headers"
          >
            <slot
              :value="`item.${field.name}`"
              v-bind="{ field: field, item: item }"
            >
              <div :key="`item.${field.value}`">
                <!-- чекбоксы -->
                <div v-if="field.type == 'boolean'">
                  <v-simple-checkbox
                    :key="`item.${field.value}`"
                    :value="Boolean(item[field.value])"
                    disabled
                  ></v-simple-checkbox>
                </div>
                <!-- остатки -->
                <div v-else-if="field.type == 'stock_balance'">
                  {{ item["nomenklatura"] }}
                </div>
                <!-- деньги и кол-во -->
                <div
                  v-else-if="['money', 'kolvo'].indexOf(field.type) !== -1"
                  class="text-right"
                  :class="{ 'error--text': parseFloat(item[field.value]) < 0 }"
                >
                  {{ formatVal(item[field.value], field.type) }}
                </div>
                <!-- даты -->
                <div v-else-if="field.type == 'date'">
                  {{ formatDate(item[field.value]) }}
                </div>
                <!-- картинки -->
                <div v-else-if="field.type == 'image'">
                  <v-img
                    v-if="!!item[field.value] && item[field.value].length > 4"
                    :lazy-src="item[field.value]"
                    :contain="false"
                    max-width="50"
                    max-height="38"
                    :src="item[field.value]"
                  ></v-img>
                  <div v-else></div>
                </div>
                <!-- селекты -->
                <div
                  v-else-if="
                    ['select', 'foreign_select'].indexOf(field.type) !== -1
                  "
                >
                  <!-- будем выводить значение читателя (без последнего _id, например manufacturer вместо manufacturer_id) -->
                  <div v-if="item[field.value]">
                    {{ item[field.value] }}
                  </div>
                  <div v-else>
                    <!-- нет смысла выводить нелепые цифры -->
                  </div>
                </div>
                <!-- все остальные типы полей - простой вывод значения -->
                <div v-else>
                  {{ item[field.value] }}
                </div>
              </div>
            </slot>
          </template>
          <!-- вывод действий в строке -->
          <template v-slot:[`item.actions`]="{ item }" v-if="showRowActions">
            <slot :name="`item.actions`" :item="item"> </slot>
          </template>
          <!-- вывод экспандера -->
          <template v-slot:expanded-item="{ headers, item }">
            <td :colspan="headers.length" class="expander-column">
              <slot
                name="expander"
                v-bind="{ headers: headers, item: item }"
              ></slot>
            </td>
          </template>

          <!-- настройки вывода футера -->
          <v-data-footer
            :items-per-page-text="tableItemsPerPageText"
          ></v-data-footer>
        </v-data-table>
      </div>
    </div>
    <abp-waiting-message v-else :loading="true">
      Идет начальная инициализация. Это не должно занять много времени...
    </abp-waiting-message>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import ABPWaitingMessageVue from "../Info/ABPWaitingMessage.vue";
import ABPIconButtonVue from "../Form/ABPIconButton.vue";

export default {
  props: {
    title: {
      type: String,
      required: false,
    },
    // модель из АБП
    model: {
      type: Array,
      required: false,
    },
    // или готовый массив headers
    colHeaders: {
      type: Array,
      required: false,
    },
    // данные
    items: {
      type: Array,
    },
    total: {
      type: Number,
      required: false,
    },
    selectable: {
      type: Boolean,
      required: false,
      default: false,
    },
    expanded: {
      type: Boolean,
      required: false,
      default: false,
    },
    actions: {
      type: Array,
      required: false,
    },
    topActions: {
      type: Array,
      required: false,
    },
    defaultActions: {
      type: Boolean,
      required: false,
      default: true,
    },
    // добавлять столбец с действиями
    addActions: {
      type: Boolean,
      required: false,
      default: false,
    },
    loading: {
      type: Boolean,
      required: false,
      default: false,
    },
    options: {
      type: Object,
      required: false,
      default() {
        return this.defaultOptions;
      },
    },
    fixedHeader: {
      type: Boolean,
      required: false,
      default: false,
    },
    dense: {
      type: Boolean,
      required: false,
      default: false,
    },
    // цветовое оформление (шапка, кнопки и т.п.)
    color: {
      type: String,
      required: false,
      default: "primary",
    },
    // показывать кнопку перезагрузки
    showReloadButton: {
      type: Boolean,
      required: false,
      default: false,
    },
    // иконка обновления таблицы
    reloadIcon: {
      type: String,
      required: false,
      default: "mdi-refresh",
    },
    // показывать кнопку фильтрации
    showFiltersBlock: {
      type: Boolean,
      required: false,
      default: false,
    },
    // показывать кнопку фильтрации
    showFiltersButton: {
      type: Boolean,
      required: false,
      default: false,
    },
    // иконка октрытия / скрытия блока фильтров
    toggleFiltersIcon: {
      type: String,
      required: false,
      default: "mdi-filter",
      // default: "mdi-magnify",
    },
    // иконка очистки фильтров
    clearFiltersIcon: {
      type: String,
      required: false,
      default: "mdi-filter-off",
      // default: "mdi-magnify-close",
    },
    // фильтры не выбраны
    filtersDisabled: {
      type: Boolean,
      required: false,
      default: true,
    },
    // количнство выбранных фильтров
    filtersCount: {
      type: Number,
      required: false,
      default: 0,
    },
    // иконка раскрывающегося блока
    expandIcon: {
      type: String,
      required: false,
      default: "$expand",
    },
    // отображать header
    showHeader: {
      type: Boolean,
      required: false,
      default: true,
    },
    // отображать footer
    showFooter: {
      type: Boolean,
      required: false,
      default: true,
    },
    // отображать выбор столбцов
    showColumnSetup: {
      type: Boolean,
      required: false,
      default: true,
    },
    // отображать только эти столбцы
    showOnlyColumns: {
      type: Array,
      required: false,
      default() {
        return [];
      },
    },
    // отображать действия
    showActions: {
      type: Boolean,
      required: false,
      default: true,
    },
    // отображать полосу выделения экспандера
    showActiveDecoration: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  components: {
    "abp-waiting-message": ABPWaitingMessageVue,
    "abp-icon-button": ABPIconButtonVue,
  },
  created() {},
  data() {
    return {
      selected: [],
      expArray: [],
      showDialog: false,
      defaultOptions: {
        page: 1,
        itemsPerPage: 10,
      },
      showFilters: this.showFiltersBlock,
      // отображать выбор столбцов
      showColumns: false,
      // массив запрещенных к отображению столбцов
      excludeCols: [],
      // массив отображаемых столбцов
      includeCols: [],
    };
  },
  computed: {
    ...mapGetters([
      "tableItemsPerPageText",
      "tableLoadingText",
      "defaultTableOptions",
      "serviceFieldNames",
      "sortFieldTypes",
      "isMobile",
    ]),
    // иконка кнопки фильтрации
    filtersBtnIcon() {
      return this.showFilters ? "mdi-filter-menu" : "mdi-filter";
    },
    // тип кнопки фильтрации
    filterBtnTitlte() {
      return `${this.showFilters ? "Скрыть" : "Показать"} фильтры`;
    },
    // стиль css для активного бордера
    borderColor() {
      return {
        "--border-color": "#1976d2",
      };
    },
    // показывать экспандер
    showExpander() {
      if (this.isMobile) {
        return this.showRowActions;
      } else {
        return true;
      }
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
        this.tableOptions = { ...this.tableOptions, ...{ page: page } };
      },
    },
    // всего страниц
    pages() {
      return this.totalItems && this.tableOptions.itemsPerPage
        ? Math.ceil(this.totalItems / this.tableOptions.itemsPerPage)
        : 1;
    },
    // 3-линейный вывод список в мобиле
    treeLines() {
      return this.isLinesCount(3);
    },
    // 3-линейный вывод список в мобиле
    twoLines() {
      return this.isLinesCount(2);
    },
    // заголовки (шапка таблицы)
    headers() {
      if (this.colHeaders) {
        return this.colHeaders;
      } else {
        if (this.model) {
          let fields = [];
          this.model.forEach((field) => {
            let sortableTypes = [
              "integer",
              "string",
              "select",
              "date",
              "datetime",
              "boolean",
            ];
            let rightAlignTypes = ["money", "kolvo"];
            // умолчальное значение value = name модели
            let valueName = field.name;
            // если селекты
            if (["select", "foreign_select"].indexOf(field.type) !== -1) {
              // будем выводить значение читателя (без последнего _id, например manufacturer вместо manufacturer_id)
              if (field.name.lastIndexOf("_id") !== -1) {
                valueName = field.name.replace(/_id$/, "");
              }
            }

            if (
              field.show_in_table !== false &&
              ((this.showColumnSetup && this.isCol(field.name)) ||
                !this.showColumnSetup)
            ) {
              fields.push({
                type: field.type,
                text: field.title,
                value: valueName,
                sortable: sortableTypes.indexOf(field.type) !== -1,
                align:
                  rightAlignTypes.indexOf(field.type) !== -1 ? "end" : "start",
              });
              // let col = {text: field.title, value: field.name, type: field.type, sortable: this.sortFieldTypes.indexOf(field.type)!==-1}
            }
          });
          if (this.showRowActions) {
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
      }
    },
    // столбцы, которые можно фильтровать
    filtrableFields() {
      if (this.model) {
        return this.model.filter((field) => {
          return (
            this.serviceFieldNames.indexOf(field.name) === -1 &&
            (field.show_in_table == undefined || field.show_in_table != false)
          );
        });
      }
      return [];
    },
    // отображаемые столбцы
    cols() {
      // сложим include и showOnly
      let includeFields = [...this.showOnlyColumns, ...this.includeCols];
      // вычтем exclude
      return includeFields.filter((field) => {
        return !this.excludeCols.includes(field);
      });
    },
    tableLoaded() {
      return this.headers && this.items;
    },
    isLoading() {
      return !this.items || this.loading;
    },
    booleanFields() {
      if (this.model) {
        return this.model.filter((field) => {
          return field.type == "boolean";
        });
      } else {
        return null;
      }
    },
    imageFields() {
      if (this.model) {
        return this.model.filter((field) => {
          return field.type == "image";
        });
      } else {
        return null;
      }
    },
    totalItems() {
      return this.total || this.items.length;
    },
    showRowActions() {
      if (this.showActions === false) {
        return false;
      } else {
        return (
          this.addActions ||
          this.actions !== undefined ||
          this.defaultActions ||
          this.showActions
        );
      }
    },
    tableOptions: {
      get() {
        return this.options;
      },
      set(newValue) {
        this.$emit("optionsChanged", newValue);
      },
    },
  },
  methods: {
    ...mapActions(["setLoading"]),
    rowClick(item) {
      // console.log(item)
      this.formValues = { ...item };
      this.selected = [item];
      this.$emit("rowClick", item);
    },
    startLoading() {
      this.setLoading(true);
    },
    endLoading() {
      this.setLoading(false);
    },
    clickAction(action, item) {
      // console.log(`form emit action [${action}]`)
      this.$emit(action, item);
    },
    // обновление данных таблицы
    refreshData() {
      this.$emit("refreshData");
    },
    // действие - очистка фильтров
    clearFilters() {
      this.$emit("clearFilters");
    },
    // тоггл блока фильтров таблицы
    toggleFilters() {
      this.showFilters = !this.showFilters;
    },
    // форматирование дробных
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
    // форматирование дат
    formatDate(val) {
      return this.$moment(val).format("DD.MM.YYYY");
    },
    // отображать столбец в таблице?
    isCol(fieldName) {
      if (this.cols) {
        return this.cols.indexOf(fieldName) !== -1;
      } else {
        return true;
      }
    },
    // проверяем будет ли список в мобиле n-строчным
    isLinesCount(n) {
      if (this.items && this.items[0] != undefined) {
        let firstObj = this.items[0];
        // кол-во элементов в объекте
        if (firstObj.lines !== undefined) {
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
      }
      return false;
    },
    // изменение перечня отображаемых столбцов
    changeCols(colValue, fieldName) {
      if (colValue) {
        let findedIndex = this.includeCols.indexOf(fieldName);
        if (findedIndex === -1) {
          this.includeCols.push(fieldName);
        }
        // удалим из эксклюдов
        findedIndex = this.excludeCols.indexOf(fieldName);
        if (findedIndex !== -1) {
          this.excludeCols.splice(findedIndex, 1);
        }
      } else {
        let findedIndex = this.excludeCols.indexOf(fieldName);
        if (findedIndex === -1) {
          this.excludeCols.push(fieldName);
        }
        // удалим из инклюдов
        findedIndex = this.includeCols.indexOf(fieldName);
        if (findedIndex !== -1) {
          this.includeCols.splice(findedIndex, 1);
        }
      }
      this.$emit("changeColumns", this.cols);
    },
  },
  watch: {},
};
</script>

<style lang="scss">
.expander-column {
  padding: 0 !important;
}
.data-list > .v-list-group--active {
  border-right: 5px solid;
  border-color: var(--border-color);
}
</style>
