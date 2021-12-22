<template>
  <div>
    <!-- hasRealSubTables={{ hasRealSubTables }} -->
    <!-- subTables={{ subTables }}, showTabs={{ showTabs }} -->
    <!-- {{formValid}} -->
    <!-- {{formExtensions}} -->
    <!-- items length ={{ subTableItems.length }}, fullValid= {{ fullValid }}, -->
    <!-- formValues= {{ formValues }} -->
    <!-- <br />
    <br /> -->
    <!-- {{fields}} -->
    <!-- {{allSelectsLoaded}} || {{selectsLoaded}} || {{selects}} || {{selects.length}} -->
    <!-- {{tableType}} -->
    <!-- {{isActive}} -->
    <!-- {{formModel}} -->
    <!-- {{permissions}} -->
    <!-- {{hasPermissions}} -->
    <!-- {{ lazyData }} -->
    <!-- =>{{ itemsTotal }} -->
    <!-- keyModel={{ keyModel }} -->
    <!-- stateValues={{ stateValues }},
    <br />
    <br />
    <br />
    <br />
    morphFields={{ morphFields }},
    <br />
    <br />
-->
    <!-- keyModelInit={{ keyModelInit }} -->
    <!-- inputDataValues={{ inputDataValues }}, -->
    <!-- keyModelValues={{ keyModelValues }}, -->

    <div v-if="tableReady">
      <keep-alive>
        <abp-tabs
          v-model="activeTab"
          :tabs="tabs"
          :disabled="formDisabled"
          :stateName="stateName"
          :saveState="saveState"
        >
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
                <v-lazy v-model="lazyData.groups">
                  <abp-groups
                    v-if="showGroups && !miniForm"
                    :table="table"
                    :id="id"
                  ></abp-groups>
                </v-lazy>
                <!-- табличная часть документа -->
                <v-lazy v-model="lazyData.itemsTable">
                  <div v-if="showSubTable">
                    <v-divider></v-divider>
                    <abp-document-table
                      :table="subTable.table"
                      :title="subTable.title"
                      :sklad-id="
                        formValues[subTable.skladId]
                          ? formValues[subTable.skladId]
                          : null
                      "
                      :no-nds="!withNds"
                      color="primary"
                      v-model="subTableItems"
                      :readonly="readonly"
                      :disabled="!formValid"
                      :with-series="withSeries"
                      :with-series-editor="withSeriesEditor"
                      :total="itemsTotal"
                      @validated="tableValidated($event)"
                    ></abp-document-table>
                  </div>
                </v-lazy>
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
                        Провести
                      </v-btn>
                      <v-btn
                        v-if="isActive"
                        :disabled="!fullValid"
                        color="secondary"
                        @click.stop="makeUnactiveAndSubmit(true)"
                      >
                        Распровести
                      </v-btn>
                      <v-btn
                        v-if="printable && formValues.id"
                        @click="printForm"
                      >
                        Печать
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
          <!-- подчиненные таблицы -->
          <template v-for="tab in subTableTabs" v-slot:[tab.name]>
            <abp-form-sub-table
              :key="`st_${tab.keys.foreign_table}_${id}`"
              :table="tab.keys.foreign_table"
              :keyModel="tab.keyModel"
            ></abp-form-sub-table>
          </template>
          <!-- Все файлы в 1 вкладке -->
          <template v-slot:all-files v-if="showFilesTab">
            <v-expansion-panels flat multiple v-model="filesPanel">
              <template v-for="(panel, i) in filesPanelItems">
                <v-expansion-panel :key="`panel_${i}`">
                  <v-expansion-panel-header>
                    {{ panel.title }}
                  </v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <v-lazy v-model="lazyData[panel.name]">
                      <abp-table-files-extension
                        :table="table"
                        :id="id"
                        :type="panel.name"
                      >
                      </abp-table-files-extension>
                    </v-lazy>
                  </v-expansion-panel-content>
                  <v-divider></v-divider>
                </v-expansion-panel>
              </template>
            </v-expansion-panels>
          </template>
          <!-- кнопка закрыть -->
          <template v-slot:after>
            <slot name="after">
              <v-row>
                <v-col
                  v-if="!miniForm && tableReady && withCloseButton"
                  class="d-flex align-end flex-column"
                >
                  <v-btn text class="ma-4" @click.stop="closeAction">
                    Закрыть
                  </v-btn>
                </v-col>
              </v-row>
            </slot>
          </template>
        </abp-tabs>
      </keep-alive>
    </div>
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
    // опции копирования
    copyOptions: {
      type: Object,
      required: false,
    },
  },
  data() {
    return {
      // необходимость отображения спинера этого плагина
      thisLoading: false,
      // форма правильно заполнена
      formValid: false,
      // таблица провалидирована
      tableValid: false,
      // активный таб
      activeTab: null,
      // всего селектов в форме
      selects: [],
      // загруженных селектов в форме
      selectsLoaded: 0,
      // все селекты проверены
      selectsChecked: false,
      // данные загружены
      dataLoaded: false,
      // подгружаемые в процессе скролинга компоненты
      lazyData: {
        groups: false,
        files: false,
        list: false,
        image: false,
        itemsTable: false,
      },
      // keyModel инициирован
      keyModelInit: false,
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
    // запоминать открытую вкладку
    saveState() {
      // только для таблиц с идентифицированными id
      return (
        this.table !== undefined &&
        this.id !== undefined &&
        this.modType == "edit"
      );
    },
    // идентификатор таба для сохранения состояния открытой вкладки
    stateName() {
      try {
        return `${this.table}Form_${this.id}`;
      } catch (error) {
        // default return below
      }
      return "abpForm";
    },
    // кол-во записей в тааблице items
    itemsTotal() {
      try {
        return this.$store.state.table.tableItemsDataCount[this.table][this.id][
          this.subTable.method
        ];
      } catch (error) {
        return undefined;
      }
    },
    // форма неактивна
    formDisabled() {
      return this.disabled;
    },
    // полиморфные поля
    morphFields() {
      if (this.fields) {
        return this.fields.filter((field) => {
          return field.type == "morph";
        });
      }
      return null;
    },
    // значения из стейта
    stateValues() {
      // заменять полиморфные поля в объект
      // let replaceMorph = ["edit", "copy"].includes(this.modType);
      let replaceMorph = true;
      // значения modType, при которых берем значения из стейта
      let stateTypes = ["copy", "edit"];
      // пытвемся получить значения из стейта
      try {
        if (stateTypes.includes(this.modType))
          return this.transformMorph2Form(
            this.$store.state.table.formData[this.table][this.id],
            replaceMorph
          );
      } catch (error) {
        // default return below
      }
      return {};
    },
    // значения из инпута
    inputDataValues() {
      // заменять полиморфные поля в объект
      // let replaceMorph = ["edit", "copy"].includes(this.modType);
      let replaceMorph = true;
      // console.log(`replaceMorph=${replaceMorph}`);
      try {
        return this.setDefaultValues(
          this.transformMorph2Form(this.modelValue),
          replaceMorph
        );
      } catch (error) {
        // default return below
      }
      return {};
    },
    // значения из keyModel
    keyModelValues() {
      if (this.keyModel) {
        // console.log(`keyModel=${JSON.stringify(this.keyModel)}`);
        let res = {};
        for (let keyField of this.keyModel) {
          if (typeof keyField == "object") res = { ...res, ...keyField };
        }
        return res;
      }
      return {};
    },

    // значения формы
    formValues: {
      get() {
        let res = {
          ...this.stateValues,
          ...this.inputDataValues,
        };
        // если keyModel еще не был инициирован - заменим этими значениями инпуты
        if (!this.keyModelInit) {
          res = { ...res, ...this.keyModelValues };
        }
        // items
        try {
          if (
            this.hasSubTables &&
            this.subTable &&
            this.stateValues[this.subTable.method]
          ) {
            res[this.subTable.method] = this.stateValues[this.subTable.method];
          }
        } catch (error) {
          // no subTable
        }
        return res;
        // //
        // let sourceValues = {};
        // try {
        //   if (this.id)
        //     sourceValues = this.$store.state.table.formData[this.table][
        //       this.id
        //     ];
        // } catch (error) {
        //   // modelValue returned
        // }
        // sourceValues = this.modelValue;
        // // преобразуем morph-поля
        // if (this.fields) {
        //   this.fields.forEach((field) => {
        //     // определенный формат для специфичных полей
        //     let morphValue = {};
        //     switch (field.type) {
        //       case "morph": {
        //         if (
        //           sourceValues[`${field.name}_id`] &&
        //           sourceValues[`${field.name}_type`]
        //         ) {
        //           morphValue = {
        //             [`${field.name}_id`]: sourceValues[`${field.name}_id`],
        //             [`${field.name}_type`]: sourceValues[`${field.name}_type`],
        //           };
        //         } else {
        //           morphValue = {
        //             [`${field.name}_id`]: 1,
        //             [`${field.name}_type`]: null,
        //           };
        //         }
        //         if (sourceValues[field.name] !== undefined) {
        //           sourceValues[field.name] = morphValue;
        //         } else {
        //           Vue.set(sourceValues, field.name, morphValue);
        //         }
        //       }
        //     }
        //   });
        // }
        // return sourceValues;
      },
      set(newVal) {
        // начальная инициализация keyModel - только до первого обновления инпутов
        this.keyModelInit = true;
        // изменяем полиморфные поля в зависимости от переданного компонентом объекта
        let transVal = this.transformMorphFromForm(newVal);
        // console.log(
        //   `new form Values=${JSON.stringify(newVal)}, transVal=${JSON.stringify(
        //     transVal
        //   )}`
        // );
        // console.log(`setting abpform data ${JSON.stringify(newVal)}`);
        this.$emit("input", transVal);
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
        !!this.formModel &&
        !!this.dataLoaded &&
        !!this.fields &&
        this.allSelectsLoaded &&
        !!this.tableType
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
      try {
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
      } catch (error) {
        // do nothing
      }
      return null;
    },
    // поля подчиненной таблицы
    subTableFields() {
      try {
        return this.subTable.model.fields;
      } catch (error) {
        // return below
      }
      return null;
    },
    // items-ы
    subTableItems() {
      if (this.formValues.items === undefined) {
        Vue.use(this.formValues, "items", this.storeSubTableItems);
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
      try {
        return this.subTableModel.extensions.has_sub_series;
      } catch (error) {
        // return below
      }
      return false;
    },
    // серийные номера в табличной части - добавление бд серийников
    withSeriesEditor() {
      try {
        return this.subTableModel.extensions.has_series;
      } catch (error) {
        // return below
      }
      return false;
    },
    showImages() {
      if (this.formExtensions)
        return this.formExtensions.has_images && this.id && this.table;
      else return false;
    },
    showGroups() {
      if (this.formExtensions)
        return (
          this.formExtensions.has_groups &&
          this.id &&
          this.table &&
          this.modType == "edit"
        );
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
          this.showFileList ||
          this.hasRealSubTables)
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
    // есть подчиненные таблицы, кроме items
    hasRealSubTables() {
      let count = 0;
      if (this.hasSubTables) {
        for (let table in this.subTables) {
          let sub = this.subTables[table];
          try {
            if (sub.method !== undefined && sub.method != "items") count++;
          } catch (error) {
            // do nothing
          }
        }
      }
      return count > 0;
    },
    subTableTabs() {
      if (this.subTables) {
        let res = [];
        for (let table in this.subTables) {
          let sub = this.subTables[table];
          if (sub.method != "items") {
            if (sub.keys) {
              let keyModel = {};
              // для простых связей
              if (sub.keys.foreign !== undefined) {
                keyModel[sub.keys.foreign] = this.id;
              } else if (sub.keys.morph !== undefined) {
                // для полиморфных связей
                keyModel[`${sub.keys.morph}_id`] = this.id;
                keyModel[
                  `${sub.keys.morph}_type`
                ] = this.formExtensions.props.app_model;
              }
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
        // if (this.showImages) tabs.push({'title':'Изображения', 'icon':'mdi-image', 'name':'image', 'disabled':false})
        // if (this.showDocuments) tabs.push({'title':'Файлы', 'icon':'mdi-paperclip', 'name':'files', 'disabled':false})
        // if (this.showFileList) tabs.push({'title':'Каталоги', 'icon':'mdi-file-tree', 'name':'file-list', 'disabled':false})
        // if (this.showGroups) tabs.push({'title':'Группы', 'icon':'mdi-pound', 'name':'groups', 'disabled':false})

        // проверим подчиненные таблицы
        if (this.subTables) tabs = [...tabs, ...this.subTableTabs];
        // файлы
        if (this.showFilesTab)
          tabs.push({
            title: "Файлы и изображения",
            icon: "mdi-paperclip",
            name: "all-files",
            disabled: false,
          });

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
      if (this.fields) {
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
      }
      return [];
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
        // замены свойств поля из модели
        model = model.map((field) => {
          if (field.props) {
            if (typeof field.props === "object") {
              // все доступные modType
              let modTypes = ["add", "edit", "copy"];
              let hasModType = false;
              // свойства, которые заменим в поле
              let props = null;
              // проанализируем ключи props
              for (let propKey in field.props) {
                // console.log(
                //   `propKey=${propKey}, props=${JSON.stringify(
                //     field.props[propKey]
                //   )}`
                // );
                if (modTypes.includes(propKey)) hasModType = true;
                if (propKey == this.modType) {
                  props = field.props[this.modType];
                }
              }

              // если в ключах не найдены modTypes - выдаем все параметры
              if (!hasModType) {
                props = field.props;
              }
              // если свойства найдены - заменим их
              if (props) {
                field.props = props;
              } else {
                field.props = null;
              }
              // console.log(`props=${JSON.stringify(props)}`);
            }
          }
          return field;
        });
        return model;
      }
      return null;
    },
    // поле с выбором ндс в подчиненной таблице
    withNds() {
      if (this.subTable && this.subTable.table && this.subTableFields) {
        return (
          this.subTableFields.findIndex((field) => {
            return field.type == "select" && field.table == "nds";
          }) !== -1
        );
      }
      return false;
    },
    // есть печатная форма
    printable() {
      try {
        if (this.formExtensions) {
          return this.formExtensions.props.printable;
        }
      } catch (e) {
        // default return below
      }
      return false;
    },
  },
  methods: {
    ...mapActions([
      "getTableModel",
      "setLoading",
      "getFormData",
      "setInformation",
      "saveAndPost",
      "getPrintForm",
    ]),
    // печатная форма
    printForm() {
      if (this.table && this.formValues.id) {
        this.getPrintForm({ table: this.table, id: this.formValues.id }).then(
          (response) => {
            // console.log(`form=${JSON.stringify(response)}`);
            window.open(
              response,
              "_blank",
              `form_${this.table}_${this.formValues.id}_download`
            );
          }
        );
      }
    },
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
            // if (
            //   this.$store.state.table.formData[this.table] &&
            //   this.$store.state.table.formData[this.table][this.id]
            // ) {
            //   // значения берем из стейта
            //   this.formValues = this.$store.state.table.formData[this.table][
            //     this.id
            //   ];
            //   this.storeDataLoded = true;
            //   resolve();
            // } else {
            // грузим значения в стейт
            this.getFormData({ tableName: this.table, id: this.id }).then(
              () => {
                this.storeDataLoded = true;
                // console.log(
                //   `store formData = ${JSON.stringify(
                //     this.$store.state.table.formData[this.table]
                //   )}`
                // );
                // this.formValues = this.$store.state.table.formData[this.table][
                //   this.id
                // ];
                // console.log(`formValues=${JSON.stringify(this.formValues)}`);
                resolve();
              }
            );
            // }
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
      this.dataLoaded = true;
      this.selectsChecked = true;
    },
    //   loadValues() {
    //     if (this.fields) {
    //       // если значения не переданы в v-model - заполним дефолтными
    //       // if (
    //       //   (this.formValues &&
    //       //     ((this.isDocument && Object.keys(this.formValues).length > 1) ||
    //       //       (!this.isDocument &&
    //       //         Object.keys(this.formValues).length > 0))) === false
    //       // ) {
    //       //   if (this.modType != "edit") {
    //       //     // console.log(`set defaults | this.modType=='edit'=${this.modType=='edit'}  this.modType=${this.modType} this.formValues=${JSON.stringify(this.formValues)} && !!this.formValues=${!!this.formValues} && Object.keys(this.inputValue).length=${Object.keys(this.inputValue).length}`)
    //       //     // заполним дефолтными значениями
    //       //     this.fields.forEach((field) => {
    //       //       let fieldValue = null;
    //       //       if (field.default) {
    //       //         fieldValue = field.default;
    //       //       } else {
    //       //         let selectFields = ["select", "foreign_select"];
    //       //         if (selectFields.indexOf(field.type) !== -1) {
    //       //           fieldValue = 1;
    //       //         }
    //       //       }
    //       //       Vue.set(this.formValues, field.name, fieldValue);
    //       //     });
    //       //   }
    //       // }
    //       // this.fields.forEach((field) => {
    //       //   let fieldValue = null;
    //       //   // определенный формат для специфичных полей
    //       //   switch (field.type) {
    //       //     case "morph":
    //       //       {
    //       //         // console.log(`morph field ${field.name} executed`);
    //       //         // if (this.formValues[`${field.name}`]) {
    //       //         //   console.log(
    //       //         //     `morph values exists ${JSON.stringify(
    //       //         //       this.formValues[field.name]
    //       //         //     )}`
    //       //         //   );
    //       //         // }
    //       //         fieldValue = {};
    //       //         fieldValue[field.name + "_id"] =
    //       //           this.formValues &&
    //       //           this.formValues[field.name + "_id"] !== undefined
    //       //             ? this.formValues[field.name + "_id"]
    //       //             : 1;
    //       //         fieldValue[field.name + "_type"] =
    //       //           this.formValues &&
    //       //           this.formValues[field.name + "_type"] !== undefined
    //       //             ? this.formValues[field.name + "_type"]
    //       //             : null;
    //       //         // console.log(`${field.name}=${JSON.stringify(fieldValue)}`);
    //       //         if (this.formValues[field.name]) {
    //       //           console.log(
    //       //             `set existed ${field.name} form ${JSON.stringify(
    //       //               this.formValues[field.name]
    //       //             )} to ${JSON.stringify(fieldValue)}`
    //       //           );
    //       //           this.modelValue[field.name] = { ...fieldValue };
    //       //         } else {
    //       //           console.log(
    //       //             `set new ${field.name} to ${JSON.stringify(fieldValue)}`
    //       //           );
    //       //           Vue.set(this.modelValue, field.name, fieldValue);
    //       //         }
    //       //         // console.log(`res=${JSON.stringify(this.modelValue)}`);
    //       //         // console.log(`morph value ${JSON.stringify(fieldValue)} set ${JSON.stringify(this.formValues[field.name])}`)
    //       //         // }
    //       //       }
    //       //       break;
    //       //   }
    //       // });

    //       // если переданы связи таблиц - заменим значения из keyModel
    //       // if (this.keyModel) {
    //       //   // console.log(`keyModel=${JSON.stringify(this.keyModel)}`);
    //       //   let modelReplaces = {};
    //       //   for (let keyField of this.keyModel) {
    //       //     modelReplaces = { ...modelReplaces, ...keyField };
    //       //     // найдем ключ (field) и значение keyField[field]
    //       //     for (let field in keyField) {
    //       //       if (this.formValues[field]) {
    //       //         console.log(
    //       //           `formValues[${field}]=${JSON.stringify(
    //       //             this.formValues[field]
    //       //           )}`
    //       //         );
    //       //         this.formValues[field] = keyField[field];
    //       //       } else {
    //       //         console.log(`no formValues[${field}]`);
    //       //         Vue.set(this.formValues, field, keyField[field]);
    //       //       }
    //       //       console.log(
    //       //         `mod formValues[${field}]=${JSON.stringify(
    //       //           this.formValues[field]
    //       //         )}`
    //       //       );
    //       //     }
    //       //   }
    //       // console.log(`modelReplaces=${JSON.stringify(modelReplaces)}`);

    //       // this.formValues = {
    //       //   ...this.formValues,
    //       //   ...modelReplaces,
    //       // };
    //       // console.log(`formValues=${JSON.stringify(this.formValues)}`);
    //     }

    //     this.dataLoaded = true;
    //     // наполним селектами форму
    //     // this.fields.forEach((field) => {
    //     //   if (field.type == "select") {
    //     //     if (this.selects.indexOf(field.table) === -1) {
    //     //       this.selects.push(field.table);
    //     //       if (this.$store.state.table.selectData[field.table]) {
    //     //         this.selectsLoaded++;
    //     //       } else {
    //     //         this.getSelectData(field.table).then(() => {
    //     //           this.selectsLoaded++;
    //     //         });
    //     //       }
    //     //     }
    //     //   }
    //     // });
    //     this.selectsChecked = true;
    //   },
    // },
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
        this.$emit("submit");
        if (!this.disableDefaultSubmit) {
          // console.log(`submitting`)
          let saveVals = { ...this.formValues };
          // console.log(
          //   `submit with modtype=${
          //     this.modType
          //   }, close=${close}, formValues=${JSON.stringify(this.formValues)}`
          // );
          this.startLoading();
          let payload = {
            table: this.table,
            modType: this.modType,
            model: this.formModel,
            values: saveVals,
            copyOptions: this.copyOptions,
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
                this.formValues = { ...newInfo };
                // console.log(`new_info=${JSON.stringify(newInfo)}`);
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
            });
        } else {
          // console.log(`submitted`);
          this.$emit("submit");
          if (close) {
            // закрытие в зависимости от типа отображения (модальное окно/маршрут)
            this.closeAction();
          }
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
    // // подтверждение в форме выбора опций
    // copyOptionsFormSubmit() {
    //   this.copyOptionsIsSet = true
    // }
    // преобразование модели полиморфных полей в модель SimpleForm
    transformMorph2Form(fields, withReplace = true) {
      if (this.morphFields && this.morphFields.length > 0) {
        // добавить реактивное св-во для полиморфа
        let addReact = false;
        // let morphFields = {};
        this.morphFields.forEach((morphField) => {
          let mfName = morphField.name;
          if (
            fields[`${mfName}_id`] !== undefined ||
            fields[`${mfName}_type`] !== undefined
          ) {
            let replace = false;
            if (fields[mfName] === undefined) {
              replace = true;
              addReact = true;
            } else {
              if (withReplace) {
                replace = true;
              }
            }
            if (replace) {
              let morphVal = {
                [`${mfName}_type`]: null,
                [`${mfName}_id`]: null,
              };
              morphVal[`${mfName}_id`] =
                fields[`${mfName}_id`] !== undefined
                  ? fields[`${mfName}_id`]
                  : null;
              morphVal[`${mfName}_type`] =
                fields[`${mfName}_type`] !== undefined
                  ? fields[`${mfName}_type`]
                  : null;
              if (addReact) {
                Vue.set(fields, mfName, morphVal);
              } else {
                fields[mfName] = { ...morphVal };
              }
            }
            // if (fields[mfName] === undefined) {
            //   console.log(`no reactive ${mfName} field`);
            //   Vue.set(fields, mfName, morphFields[mfName]);
            // }
          }
        });
        return fields;
      }
      return fields;
    },
    // преобразование полиморфов из модели SimpleForm обратно
    transformMorphFromForm(fields) {
      if (this.morphFields && this.morphFields.length > 0) {
        let morphFields = {};
        this.morphFields.forEach((morphField) => {
          let mfName = morphField.name;
          if (fields[mfName] && typeof fields[mfName] == "object") {
            let mValues = fields[mfName];
            if (mValues[`${mfName}_id`])
              morphFields[`${mfName}_id`] = mValues[`${mfName}_id`];
            if (mValues[`${mfName}_type`])
              morphFields[`${mfName}_type`] = mValues[`${mfName}_type`];
          }
        });
        return { ...fields, ...morphFields };
      }
      return fields;
    },
    // для всех запросов, кроме редактирования - заполним дефолтные значения
    setDefaultValues(fields) {
      if (
        this.fields &&
        this.modType != "edit" &&
        ((this.isDocument && Object.keys(fields).length > 1) ||
          (!this.isDocument && Object.keys(fields).length > 0))
      ) {
        // console.log(`set defaults | this.modType=='edit'=${this.modType=='edit'}  this.modType=${this.modType} this.formValues=${JSON.stringify(this.formValues)} && !!this.formValues=${!!this.formValues} && Object.keys(this.inputValue).length=${Object.keys(this.inputValue).length}`)
        // заполним дефолтными значениями
        this.fields.forEach((f) => {
          let fieldValue = null;
          if (fields[f.name]) {
            // val exists
          } else {
            if (f.default) {
              fieldValue = f.default;
            } else {
              switch (f.type) {
                case "select":
                case "foreign_select":
                  {
                    fieldValue = 1;
                  }
                  break;
                case "multiselect": {
                  fieldValue = [];
                }
              }
              fields[f.name] = fieldValue;
            }
          }
        });
      }
      return fields;
    },
  },
  //
  watch: {
    // готовность формы
    tableReady(isReady) {
      if (isReady) this.$emit("loaded");
    },
    // изменение таба
    tab(newTab) {
      this.$emit("tabChange", newTab);
    },
    //     formValues(newValue) {
    //         console.log(`emiited new data from abp-form ${JSON.stringify(newValue)}`)
    //         this.$emit('input', newValue)
    //     },
  },
};
</script>

<style lang="scss" scoped></style>
