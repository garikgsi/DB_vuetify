<template>
  <div>
    <!-- {{formValid}} -->
    <!-- {{formExtensions}} -->
    <!-- {{subTableItems.length}} {{fullValid}} -->
    <!-- {{formValues}} -->
    <!-- {{fields}} -->
    <!-- {{allSelectsLoaded}} || {{selectsLoaded}} || {{selects}} || {{selects.length}} -->
    <!-- {{tableType}} -->
    <!-- {{isActive}} -->
    <!-- {{formModel}} -->
    <!-- {{permissions}} -->
    <!-- {{hasPermissions}} -->
    <abp-tabs v-model="activeTab" :tabs="tabs" :disabled="formDisabled">
      <!-- форма -->
      <!-- {{showWaitingMessage}} -->
      <template v-slot:[formSlot]>
        <abp-simple-form
          v-if="tableReady"
          v-model="formValues"
          :title="title"
          :model="visibleFields"
          :loading="formLoading"
          :buttons="null"
          :closable="closable"
          :singleFieldRow="singleFieldRow"
          :setFocus="setFocus"
          :readonly="readonly"
          :disabled="formDisabled"
          @startLoading="startLoading"
          @endLoading="endLoading"
          @buttonClick="onButtonClick"
          @clickClose="clickClose"
          @validated="formValidated($event)"
        >
          <template v-slot:after-fields>
            <abp-groups
              v-if="showGroups && !miniForm"
              :table="table"
              :id="id"
            ></abp-groups>
            <!-- табличная часть документа -->
            <div v-if="showSubTable">
              <v-divider></v-divider>
              <abp-document-table
                :table="subTable.table"
                :title="subTable.title"
                :sklad-id="formValues[subTable.skladId]"
                :no-nds="!withNds"
                color="light-green"
                v-model="subTableItems"
                :readonly="readonly"
                :with-series="withSeries"
                :with-series-editor="withSeriesEditor"
                @validated="tableValidated($event)"
              ></abp-document-table>
            </div>
            <slot name="after-fields"></slot>
          </template>
          <!-- левая секция кнопок -->
          <template v-slot:buttons-left>
            <slot name="buttons-left">
              <v-btn
                :disabled="!fullValid"
                color="primary"
                @click.stop="onSubmit(true)"
              >
                OK
              </v-btn>
              <template v-if="!miniForm">
                <v-btn
                  :disabled="!fullValid"
                  color="primary"
                  @click.stop="onSubmit(false)"
                >
                  Сохранить
                </v-btn>
                <template v-if="isDocument">
                  <v-btn
                    v-if="!isActive"
                    :disabled="!fullValid"
                    color="success"
                    @click.stop="makeActiveAndSubmit(true)"
                  >
                    Провести и закрыть
                  </v-btn>
                  <v-btn
                    v-if="isActive"
                    :disabled="!fullValid"
                    color="secondary"
                    @click.stop="makeUnactiveAndSubmit(true)"
                  >
                    Распровести и закрыть
                  </v-btn>
                </template>
              </template>
            </slot>
          </template>
          <!-- правая секция кнопок -->
          <template v-slot:buttons-right>
            <v-btn v-if="canSwitchMini" @click="toggleMiniForm" text>
              {{ miniFormTitle }}
            </v-btn>
          </template>
        </abp-simple-form>
        <abp-waiting-message v-else>
          {{ waitMessage }}
        </abp-waiting-message>
      </template>
      <!-- Все файлы в 1 вкладке -->
      <template v-slot:all-files v-if="showFilesTab">
        <v-expansion-panels multiple v-model="filesPanel">
          <template v-for="(panel, i) in filesPanelItems">
            <v-expansion-panel :key="`panel_${i}`">
              <v-expansion-panel-header>
                {{ panel.title }}
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <abp-table-files-extension
                  :table="table"
                  :id="id"
                  :type="panel.name"
                >
                </abp-table-files-extension>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </template>
        </v-expansion-panels>
      </template>
      <!-- подчиненные таблицы -->
      <template v-for="tab in subTableTabs" v-slot:[tab.name]>
        <abp-form-sub-table
          :key="`st_${tab.keys.foreign_table}_${id}`"
          :table="tab.keys.foreign_table"
          :keyModel="tab.keyModel"
        ></abp-form-sub-table>
      </template>
      <!-- кнопка закрыть -->
      <template v-slot:after>
        <slot name="after">
          <v-row>
            <v-col
              v-if="!miniForm && tableReady && withCloseButton"
              class="d-flex align-end flex-column"
            >
              <v-btn text @click.stop="closeAction">
                Закрыть
              </v-btn>
            </v-col>
          </v-row>
        </slot>
      </template>
    </abp-tabs>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import Vue from "vue";
import ABPFormSubTableVue from "../Tables/ABPFormSubTable.vue";

// import ABPSimpleForm from './ABPSimpleForm.vue'
// import ABPWaitingMessage from '../Info/ABPWaitingMessage.vue'
// import ABPTableFilesExtension from '../Form/ABPTableFilesExtension.vue'
// import ABPGroups from '../ABPGroups.vue'
// import ABPTabs from '../Misc/ABPTabs'
// import ABPDocumentTableVue from '../Tables/ABPDocumentTable.vue'

export default {
  name: "abp-form",
  components: {
    "abp-simple-form": () => import("./ABPSimpleForm.vue"),
    "abp-waiting-message": () => import("../Info/ABPWaitingMessage.vue"),
    "abp-table-files-extension": () =>
      import("../Form/ABPTableFilesExtension.vue"),
    "abp-groups": () => import("../ABPGroups.vue"),
    "abp-tabs": () => import("../Misc/ABPTabs"),
    "abp-document-table": () => import("../Tables/ABPDocumentTable.vue"),
    "abp-form-sub-table": ABPFormSubTableVue,
  },
  model: {
    prop: "modelValue",
    event: "input",
  },
  props: {
    modelValue: {
      type: Object,
      required: false,
      default() {
        return { items: [] };
      },
    },
    table: {
      type: String,
      required: false,
    },
    id: {
      type: [Number, String],
      required: false, // if add
    },
    modType: {
      type: String,
      required: false,
      default: "add" /* copy, edit */,
    },
    title: {
      type: String,
      required: false,
    },
    buttons: {
      type: Array,
      required: false,
    },
    modelMixin: {
      type: Array,
      required: false,
    },
    // связи таблицы в виде массива [{key1:value1}, {key2:value2}]
    keyModel: {
      type: Array,
      required: false,
    },
    loading: {
      type: Boolean,
      required: false,
      default: false,
    },
    // запретить действия по умолчанию для сохранения изменений
    disableDefaultSubmit: {
      type: Boolean,
      required: false,
      default: false,
    },
    // сообщение об ожидании загрузки формы
    waitMessage: {
      type: String,
      required: false,
      default: "Ожидается загрузка формы и наполнение начальными значениями",
    },
    // с крестиком для закрытия
    closable: {
      type: Boolean,
      required: false,
      default: true,
    },
    // только основные поля
    miniForm: {
      type: Boolean,
      required: false,
      default: false,
    },
    // можно изменять размер miniForm->FullForm
    canSwitchMini: {
      type: Boolean,
      required: false,
      default: false,
    },
    // каждое поле занимает всю строку
    singleFieldRow: {
      type: Boolean,
      required: false,
      default: false,
    },
    // форма в модальном окне
    inDialog: {
      type: Boolean,
      required: false,
      default: false,
    },
    // форма только для чтения
    readonly: {
      type: Boolean,
      required: false,
      default: false,
    },
    // форма с табличной частью
    withSubTable: {
      type: Boolean,
      required: false,
      default: true,
    },
    // с кнопкой Закрыть внизу формы
    withCloseButton: {
      type: Boolean,
      required: false,
      default: true,
    },
    // форма не активна
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      // модель полей формы
      // formModel: [],
      // поля
      // fields: null,
      // расширения таблицы
      // formExtensions: {},
      // необходимость отображения спинера этого плагина
      thisLoading: false,
      // значения формы
      // formValues: {items:[]},
      // форма правильно заполнена
      formValid: false,
      // таблица провалидирована
      tableValid: false,
      // активный таб
      activeTab: 0,
      //   // табличная часть документа, если документ конечно
      //   subTable: null,
      // всего селектов в форме
      selects: [],
      // загруженных селектов в форме
      selectsLoaded: 0,
      // все селекты проверены
      selectsChecked: false,
      // // табличная часть для нового документа
      // newSubTableItems: []
      // модель загружена
      // modelLoaded: false,
      // данные загружены
      dataLoaded: false,
    };
  },
  created() {
    this.startInit();
  },
  beforeRouteUpdate(to, from, next) {
    if (from.name == to.name) {
      this.startInit();
    }
    next();
  },
  computed: {
    ...mapGetters(["prevRoute", "serviceFieldNames"]),
    // форма неактивна
    formDisabled() {
      return this.disabled;
    },
    formValues: {
      get() {
        return this.modelValue;
      },
      set(newVal) {
        // console.log(`setting abpform data ${JSON.stringify(newVal)}`)
        this.$emit("input", newVal);
      },
    },
    formLoading: {
      get() {
        return this.loading || this.thisLoading || false;
      },
      set(newVal) {
        this.$emit(newVal ? "startLoading" : "endLoading");
      },
    },
    // модель
    formModel() {
      if (this.$store.state.table.model[this.table])
        return this.$store.state.table.model[this.table].fields;
      else return null;
    },
    // расширения модели
    formExtensions() {
      if (this.$store.state.table.model[this.table])
        return this.$store.state.table.model[this.table].extensions;
      else return null;
    },
    // все селекты загружены
    allSelectsLoaded() {
      if (this.fields && this.selectsLoaded == this.selects.length) return true;
      return false;
    },
    // показывать перед загрузкой таблицы
    showWaitingMessage() {
      return !this.tableReady;
    },
    // таблица готова к отображению
    tableReady() {
      return (
        this.formModel &&
        this.dataLoaded &&
        this.fields &&
        this.allSelectsLoaded &&
        this.tableType
      );
    },
    // тип таблицы
    tableType() {
      if (this.formExtensions) return this.formExtensions.props.table_type;
      else return null;
    },
    isDocument() {
      if (this.tableType) {
        return this.tableType == "document";
      }
      return false;
    },
    isActive() {
      return this.isDocument && this.formValues.is_active == 1;
    },
    hasSubTables() {
      return (
        this.formModel && this.formExtensions.sub_tables && this.withSubTable
      );
    },
    showSubTable() {
      return this.subTable !== null;
    },
    // табличная часть документа, если документ конечно
    subTable() {
      if (this.hasSubTables) {
        if (this.formExtensions.sub_tables) {
          for (let table in this.formExtensions.sub_tables) {
            let sub = this.formExtensions.sub_tables[table];
            if (this.$store.state.table.model[sub.table]) {
              sub.model = this.$store.state.table.model[sub.table];
              let subTableFields = this.$store.state.table.model[sub.table]
                .fields;
              let stockBalanceField = subTableFields.find((field) => {
                return field.type == "stock_balance" && !!field.sklad_id;
              });
              if (stockBalanceField) {
                sub.skladId = stockBalanceField.sklad_id;
              }
            }
            if (sub.method == "items") return sub;
          }
        }
      }
      return null;
    },
    subTableItems() {
      if (this.formValues.items === undefined) {
        Vue.use(this.formValues, "items", []);
      }
      return this.formValues.items;
    },
    // модель подчиненной таблицы
    subTableModel() {
      return this.showSubTable
        ? this.$store.state.table.model[this.subTable.table]
        : {};
    },
    // серийные номера в табличной части - списание серийников
    withSeries() {
      if (this.subTableModel.extensions)
        return this.subTableModel.extensions.has_sub_series;
      else return false;
    },
    // серийные номера в табличной части - добавление бд серийников
    withSeriesEditor() {
      if (this.subTableModel.extensions)
        return this.subTableModel.extensions.has_series;
      else return false;
    },
    showImages() {
      if (this.formExtensions)
        return this.formExtensions.has_images && this.id && this.table;
      else return false;
    },
    showGroups() {
      if (this.formExtensions)
        return this.formExtensions.has_groups && this.id && this.table;
      else return false;
    },
    showDocuments() {
      if (this.formExtensions)
        return this.formExtensions.has_files && this.id && this.table;
      else return false;
    },
    showFileList() {
      if (this.formExtensions)
        return this.formExtensions.has_file_list && this.id && this.table;
      else return false;
    },
    showFilesTab() {
      return this.showImages || this.showDocuments || this.showFileList;
    },
    showTabs() {
      return (
        this.miniForm === false &&
        this.modType == "edit" &&
        (this.showImages ||
          this.showGroups ||
          this.showDocuments ||
          this.showFileList)
      );
    },
    filesPanelItems() {
      let res = [];
      if (this.showImages) res.push({ title: "Изображения", name: "image" });
      if (this.showDocuments) res.push({ title: "Файлы", name: "document" });
      if (this.showFileList) res.push({ title: "Каталоги", name: "list" });
      return res;
    },
    filesPanel: {
      get() {
        return this.filesPanelItems.map((item, i) => {
          return i;
        });
      },
      set() {},
    },
    subTables() {
      if (this.formExtensions && this.formExtensions.sub_tables) {
        return this.formExtensions.sub_tables;
      }
      return null;
    },
    subTableTabs() {
      if (this.subTables) {
        let res = [];
        for (let table in this.subTables) {
          let sub = this.subTables[table];
          if (sub.keys) {
            let keyModel = {};
            keyModel[sub.keys.foreign] = this.id;
            res.push({
              title: sub.title,
              icon: sub.icon ? sub.icon : "mdi-table",
              name: `sub_table_${sub.table}`,
              type: "sub_table",
              disabled: !this.showSubTables,
              keys: sub.keys,
              keyModel: [keyModel],
            });
          }
        }
        return res;
      }
      return [];
    },
    showSubTables() {
      return this.subTables && this.modType == "edit" && this.id;
    },
    subTableKeyModel() {
      // TODO
      // дописать алгоритм генерации коректного keyModel
      return [];
    },
    tabs() {
      if (this.showTabs) {
        let tabs = [];
        tabs.push({
          title: "Поля ввода",
          icon: "mdi-view-list",
          name: "form",
          disabled: false,
        });
        if (this.showFilesTab)
          tabs.push({
            title: "Файлы и изображения",
            icon: "mdi-paperclip",
            name: "all-files",
            disabled: false,
          });
        // if (this.showImages) tabs.push({'title':'Изображения', 'icon':'mdi-image', 'name':'image', 'disabled':false})
        // if (this.showDocuments) tabs.push({'title':'Файлы', 'icon':'mdi-paperclip', 'name':'files', 'disabled':false})
        // if (this.showFileList) tabs.push({'title':'Каталоги', 'icon':'mdi-file-tree', 'name':'file-list', 'disabled':false})
        // if (this.showGroups) tabs.push({'title':'Группы', 'icon':'mdi-pound', 'name':'groups', 'disabled':false})

        // проверим подчиненные таблицы
        if (this.subTables) tabs = [...tabs, ...this.subTableTabs];

        return tabs;
      } else {
        return null;
      }
    },
    formSlot() {
      if (this.showTabs) return "form";
      else return "before";
    },
    miniFormTitle() {
      if (this.miniForm) {
        return "все поля";
      } else {
        return "меньше полей";
      }
    },
    fullValid() {
      return (
        this.hasPermissions &&
        this.formValid &&
        (!this.isDocument ||
          (this.isDocument &&
            this.tableValid &&
            this.subTableItems &&
            this.subTableItems.length > 0))
      );
    },
    // устанавливать фокус на первое поле?
    setFocus() {
      let focusModTypes = ["add"];
      return focusModTypes.indexOf(this.modType) !== -1;
    },
    // все разрешения
    permissions() {
      let perm = {};
      if (this.formValues) {
        if (this.formValues.permissions)
          perm = { ...this.formValues.permissions };
      }
      if (this.formExtensions) {
        if (this.formExtensions.permissions)
          perm = { ...perm, ...this.formExtensions.permissions };
      }
      return perm;
    },
    // есть разрешения на изменения
    hasPermissions() {
      if (this.permissions) {
        return (
          !!this.permissions[this.modType] &&
          this.permissions[this.modType] == 1
        );
      }
      return false;
    },
    // видимые поля
    visibleFields() {
      // в мини-форме оставим только обязательные поля
      if (this.miniForm) {
        return this.fields.map((field) => {
          if (field.require) {
            return field;
          } else {
            return { ...field, ...{ hidden: true } };
          }
        });
      } else {
        return this.fields;
      }
    },
    // поля формы
    fields() {
      if (this.formModel) {
        let storeModel = [...this.formModel];
        let modelProps = {
          require: false,
          show_in_form: true,
          readonly: false,
        };
        let model = storeModel.map((field) => {
          let resField = { ...field };
          for (let prop in modelProps) {
            resField[prop] = this.checkFieldProp(field, prop, modelProps[prop]);
          }
          return resField;
        });
        // скроем служебные поля в форме
        model = model.filter((field) => {
          return (
            this.serviceFieldNames.indexOf(field.name) === -1 && !field.virtual
          );
        });
        // скроем поля отмеченные в моделе, как скрытые
        model = model.filter((field) => {
          return field.show_in_form;
        });
        // преобразователи модели, если переданы
        if (this.modelMixin && model) {
          let resModel = [];
          for (let i = 0; i < model.length; i++) {
            let dbField = model[i];
            let isFind = false;
            for (let j = 0; j < this.modelMixin.length; j++) {
              let paramField = this.modelMixin[j];
              if (
                paramField.name &&
                dbField.name &&
                dbField.name == paramField.name
              ) {
                isFind = true;
                resModel.push({ ...dbField, ...paramField });
                break;
              }
            }
            if (!isFind) {
              resModel.push(dbField);
            }
          }
          model = resModel;
        }
        return model;
      }
      return null;
    },
    // поле с выбором ндс в подчиненной таблице
    withNds() {
      if (
        this.subTable &&
        this.subTable.table &&
        this.$store.state.table.model[this.subTable.table].fields
      ) {
        return (
          this.$store.state.table.model[this.subTable.table].fields.findIndex(
            (field) => {
              return field.type == "select" && field.table == "nds";
            }
          ) !== -1
        );
      }
      return false;
    },
  },
  methods: {
    ...mapActions([
      "getTableModel",
      "saveTableRow",
      "setLoading",
      "getFormData",
      "getSelectData",
      "setInformation",
      "saveAndPost",
    ]),
    // начальная инициализация
    startInit() {
      this.getTableModel(this.table).then(() => {
        this.loadStoreData().then(() => {
          this.loadValues();
        });
      });
    },
    // загрузим при необходиомсти данные из БД
    loadStoreData() {
      return new Promise((resolve, reject) => {
        if (this.modType != "add" && !!this.id) {
          if (this.id) {
            if (
              this.$store.state.table.formData[this.table] &&
              this.$store.state.table.formData[this.table][this.id]
            ) {
              // значения берем из стейта
              this.formValues = this.$store.state.table.formData[this.table][
                this.id
              ];
              this.storeDataLoded = true;
              resolve();
            } else {
              // грузим значения в стейт
              this.getFormData({ tableName: this.table, id: this.id }).then(
                () => {
                  this.storeDataLoded = true;
                  this.formValues = this.$store.state.table.formData[
                    this.table
                  ][this.id];
                  resolve();
                }
              );
            }
          } else {
            reject("не передан id");
            console.error("не передан id записи");
          }
          // console.log(`formData loaded from Created hook`)
        } else {
          if (this.modelValue && Object.keys(this.modelValue).length > 0) {
            this.storeDataLoded = true;
            // this.formValues = this.modelValue
          }
          resolve();
        }
      });
    },
    // заполняем реактивными данными
    loadValues() {
      if (this.fields) {
        // если значения не переданы в v-model - заполним дефолтными
        if (
          (this.formValues &&
            ((this.isDocument && Object.keys(this.formValues).length > 1) ||
              (!this.isDocument &&
                Object.keys(this.formValues).length > 0))) === false
        ) {
          if (this.modType != "edit") {
            // console.log(`set defaults | this.modType=='edit'=${this.modType=='edit'}  this.modType=${this.modType} this.formValues=${JSON.stringify(this.formValues)} && !!this.formValues=${!!this.formValues} && Object.keys(this.inputValue).length=${Object.keys(this.inputValue).length}`)
            // заполним дефолтными значениями
            this.fields.forEach((field) => {
              let fieldValue = null;
              if (field.default) {
                fieldValue = field.default;
              }
              Vue.set(this.formValues, field.name, fieldValue);
            });
          }
        }
        this.fields.forEach((field) => {
          let fieldValue = null;
          // определенный формат для специфичных полей
          switch (field.type) {
            case "morph":
              {
                // console.log(`morph field ${field.name} executed`)
                //                                     if (this.formValues[field.name]) {
                // console.log(`morph values exists ${JSON.stringify(this.formValues[field.name])}`)
                //                                     } else {
                fieldValue = {};
                fieldValue[field.name + "_id"] =
                  this.formValues &&
                  this.formValues[field.name + "_id"] !== undefined
                    ? this.formValues[field.name + "_id"]
                    : 1;
                fieldValue[field.name + "_type"] =
                  this.formValues &&
                  this.formValues[field.name + "_type"] !== undefined
                    ? this.formValues[field.name + "_type"]
                    : null;
                if (this.formValues[field.name]) {
                  this.modelValue[field.name] = { ...fieldValue };
                } else {
                  Vue.set(this.modelValue, field.name, fieldValue);
                }
                // console.log(`morph value ${JSON.stringify(fieldValue)} set ${JSON.stringify(this.formValues[field.name])}`)
                // }
              }
              break;
          }
        });

        // если переданы связи таблиц - заменим значения из keyModel
        if (this.keyModel) {
          for (let keyField of this.keyModel) {
            this.formValues = { ...this.formValues, ...keyField };
          }
        }

        this.dataLoaded = true;
        // наполним селектами форму
        this.fields.forEach((field) => {
          if (field.type == "select") {
            if (this.selects.indexOf(field.table) === -1) {
              this.selects.push(field.table);
              if (this.$store.state.table.selectData[field.table]) {
                this.selectsLoaded++;
              } else {
                this.getSelectData(field.table).then(() => {
                  this.selectsLoaded++;
                });
              }
            }
          }
        });
        this.selectsChecked = true;
      }
    },
    // проверяем булев признак поля, например require, show_in_form и т.п.
    checkFieldProp(field, prop, defaultVal = false) {
      let fieldProp = defaultVal;
      if (typeof field[prop] == "boolean") {
        fieldProp = field[prop];
      } else {
        if (Array.isArray(field[prop])) {
          fieldProp = field[prop].indexOf(this.modType) !== -1;
          // console.log(`for field ${JSON.stringify(field)}, prop=${prop} and modType=${this.modType} res=${fieldProp}`)
        }
      }
      return fieldProp;
    },
    startLoading() {
      // this.thisLoading = true
      // this.setLoading(true)
      this.$emit("startLoading");
    },
    endLoading() {
      // this.thisLoading = false
      // this.setLoading(false)
      this.$emit("endLoading");
    },
    makeActiveAndSubmit(close = false) {
      this.onSubmit(close, { is_active: 1 });
    },
    makeUnactiveAndSubmit(close = false) {
      this.onSubmit(close, { is_active: 0 });
    },

    onSubmit(close = false, withPost = null) {
      if (this.hasPermissions) {
        // console.log(`submit with modtype=${this.modType}, close=${close}`)
        this.$emit("submit");
        if (!this.disableDefaultSubmit) {
          // console.log(`submitting`)
          let saveVals = { ...this.formValues };
          this.startLoading();
          let payload = {
            table: this.table,
            modType: this.modType,
            model: this.formModel,
            values: saveVals,
          };
          if (withPost) {
            for (let i in withPost) {
              if (withPost[i] == 0) {
                payload.message = "Документ распроведен";
              } else {
                payload.message = "Документ проведен";
              }
            }
            payload = { ...payload, ...{ postValues: withPost } };
          }
          // this.saveTableRow(payload)
          this.saveAndPost(payload)
            .then((response) => {
              let newInfo = response;
              this.$emit("submitSuccess", newInfo);
              // если нажали закрыть
              if (close) {
                // закрытие в зависимости от типа отображения (модальное окно/маршрут)
                this.closeAction();
              } else {
                this.formValues = newInfo;
                this.loadValues();
                // переходим к предыдущему роуту
                if (!this.inDialog) {
                  // if (this.modType!='edit') this.$router.replace({ name: 'edit', params: { table: this.table, id: newInfo.id} })
                  if (this.modType != "edit") {
                    this.$router.replace({
                      path: `/form/${this.table}/edit/${newInfo.id}`,
                    });
                  }
                }
              }
            })
            .catch((error) => {
              let errInfo = error.response || null;
              this.$emit("submitError", errInfo);
            })
            .finally(() => {
              this.endLoading();
              this.$emit("submitEnd");
            });
        }
      } else {
        this.setInformation({
          color: "warning",
          text: "Недостаточно прав доступа для выполения операции",
        });
        this.closeAction();
      }
    },
    onButtonClick(event) {
      this.$emit(event);
    },
    clickClose() {
      this.$emit("clickClose");
    },
    toggleMiniForm() {
      this.$emit("toggleMiniForm");
    },
    formValidated(valid) {
      this.formValid = valid;
      this.$emit("validated", valid);
    },
    tableValidated(valid) {
      this.tableValid = valid;
    },
    // закрытие формы
    closeAction() {
      // console.log(`close action`)
      // если диалоговое окно
      if (this.inDialog) {
        this.$emit("closeForm");
      } else {
        // если роут
        // this.$router.push(this.prevRoute)
        this.$router.go(-1);
      }
    },
  },
  watch: {
    tableReady(isReady) {
      if (isReady) this.$emit("loaded");
    },
    //     formValues(newValue) {
    //         console.log(`emiited new data from abp-form ${JSON.stringify(newValue)}`)
    //         this.$emit('input', newValue)
    //     },
  },
};
</script>

<style lang="scss" scoped></style>
