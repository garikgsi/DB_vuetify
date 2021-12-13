// редактор формы контрагентов
<template>
  <div>
    <!-- modelValue={{ modelValue }}, formValues={{ formValues }} isUL={{ isUL }}, -->
    <!-- formModel={{ formModel }} -->
    <abp-tabs
      v-model="activeTab"
      :tabs="tabs"
      :disabled="disabled"
      :saveState="saveState"
      :stateName="stateName"
    >
      <!-- базовая форма -->
      <template v-slot:form>
        <abp-simple-form
          v-if="formModel && formDataReady"
          v-model="formValues"
          :model="formModel"
          :title="formTitle"
          @submit="submit(true)"
        >
          <template v-slot:after-title>
            <search-in-egrul
              @input="fromEgrul($event)"
              :isUL="isEdit ? (isUL ? true : false) : null"
            ></search-in-egrul>
          </template>
          <template v-slot:after-fields>
            <abp-groups
              v-if="showGroups && !miniForm"
              :table="table"
              :id="id"
            ></abp-groups>
          </template>
        </abp-simple-form>
      </template>
      <!-- таблица сотрудников -->
      <template v-slot:employees>
        <abp-form-sub-table
          :key="`st_employees_${id}`"
          table="sotrudniks"
          :keyModel="[
            {
              employeable: {
                employeable_type: 'App\\Kontragent',
                employeable_id: id,
              },
            },
          ]"
        ></abp-form-sub-table>
      </template>
      <!-- таблица расчетных счетов -->
      <template v-slot:rs>
        <abp-form-sub-table
          :key="`st_rs_${id}`"
          table="rs"
          :keyModel="[
            {
              rs_table: {
                rs_table_type: 'App\\Kontragent',
                rs_table_id: id,
              },
            },
          ]"
        ></abp-form-sub-table>
      </template>
      <!-- таблица договоров -->
      <template v-slot:contracts>
        <abp-form-sub-table
          :key="`contracts_${id}`"
          table="contracts"
          :keyModel="[
            {
              contractable: {
                contractable_type: 'App\\Kontragent',
                contractable_id: id,
              },
            },
          ]"
        ></abp-form-sub-table>
      </template>
      <!-- кнопка закрыть -->
      <template v-slot:after>
        <slot name="after">
          <v-row>
            <v-col v-if="!miniForm" class="d-flex align-end flex-column">
              <v-btn text class="ma-4" @click.stop="closeAction">
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
import { mapActions } from "vuex";
import ABPTabsVue from "../Misc/ABPTabs.vue";
import ABPFormSubTableVue from "../Tables/ABPFormSubTable.vue";
import SearchInEGRULVue from "../Views/SearchInEGRUL.vue";

export default {
  name: "kontragent-form",
  components: {
    "abp-simple-form": () => import("./ABPSimpleForm.vue"),
    "search-in-egrul": SearchInEGRULVue,
    "abp-groups": () => import("../ABPGroups.vue"),
    "abp-tabs": ABPTabsVue,
    "abp-form-sub-table": ABPFormSubTableVue,
  },
  model: {
    prop: "modelValue",
    event: "input",
  },
  props: {
    // значения формы
    modelValue: {
      type: Object,
      required: false,
      default() {
        return {};
      },
    },
    // вид редактора
    modType: {
      type: String,
      required: false,
      default: "add",
    },
    // id записи
    id: {
      type: [Number, String],
      required: false, // if add
    },
    // опции копирования
    copyOptions: {
      type: Object,
      required: false,
    },
    // форма в модальном окне
    inDialog: {
      type: Boolean,
      required: false,
      default: false,
    },
    // только основные поля
    miniForm: {
      type: Boolean,
      required: false,
      default: false,
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
      // таблица с которой взаимодействуем
      table: "kontragents",
      // начальные значения типа юрлица
      defaultUL: "ЮридическоеЛицо",
      // такущая вкладка
      activeTab: null,
    };
  },
  created() {
    this.getTableModel(this.table);
    if (this.id && this.modType == "edit") {
      this.getFormData({ tableName: this.table, id: this.id });
    }
  },
  computed: {
    // запоминать открытую вкладку
    saveState() {
      // только для таблиц с идентифицированными id
      return this.id !== undefined && this.modType == "edit";
    },
    // идентификатор таба для сохранения состояния открытой вкладки
    stateName() {
      try {
        return `kontragentForm_${this.id}`;
      } catch (error) {
        // default return below
      }
      return "kontragentForm";
    },
    // модель таблицы
    fullModel() {
      try {
        return this.$store.state.table.model[this.table];
      } catch (error) {
        return null;
      }
    },
    // поля ввода из полной модели
    fullModelFields() {
      return this.fullModel ? this.fullModel.fields : null;
    },
    // поля для юр.лица
    fieldsUL() {
      return ["kpp", "okpo", "rs_id", "ogrn"];
    },
    // поля для физ.лица
    fieldsFL() {
      return ["okpo", "rs_id", "ogrn"];
    },
    // общие для всех типов юрлиц поля
    commonFields() {
      return [
        "name",
        "full_name",
        "inn",
        "comment",
        "type",
        "address",
        "phone",
        "email",
        "www",
      ];
    },
    // список полей в зависимости от типа юр.лица
    fieldList() {
      let currentFields = this.isUL ? this.fieldsUL : this.fieldsFL;
      return [...this.commonFields, ...currentFields];
    },
    // модель в зависимости от типа  юр.лица
    formModel() {
      //
      if (this.fullModelFields) {
        let fields = [...this.fullModelFields];
        fields = fields
          .map((field) => {
            // console.log(
            //   `!!field=${!!field}, name=${field.name}, ==type=${field.name ==
            //     "type"}, this.isEdit=${this.isEdit} res=${!!field &&
            //     field.name == "type" &&
            //     this.isEdit}`
            // );
            if (!!field && field.name == "type" && this.isEdit) {
              return { ...field, ...{ readonly: true } };
            } else if (!!field && field.name == "rs_id" && !this.isEdit) {
              return { ...field, ...{ readonly: true } };
            } else {
              return field;
            }
          })
          .filter((field) => {
            return !!field && this.fieldList.indexOf(field.name) !== -1;
          });
        return fields;
      }
      return null;
    },
    // заголовок формы
    formTitle() {
      switch (this.modType) {
        case "add": {
          return this.isUL ? `Новое юр.лицо` : `Новый ИП`;
        }
        case "edit": {
          return this.modelValue.select_list_title
            ? `Редактируем ${this.modelValue.select_list_title}`
            : this.isUL
            ? `Редактируем юр.лицо`
            : `Редактируем ИП`;
        }
        case "copy": {
          return this.modelValue.select_list_title
            ? `Копируем ${this.modelValue.select_list_title}`
            : this.isUL
            ? `Копируем юр.лицо`
            : `Копируем ИП`;
        }
      }
      return "Контрагент";
    },
    // значение формы
    formValues: {
      get() {
        let res = {};
        try {
          if (
            this.id &&
            this.table &&
            this.$store.state.table.formData[this.table][this.id]
          )
            res = this.$store.state.table.formData[this.table][this.id];
        } catch (error) {
          // modelValue return
        }
        res = { ...this.modelValue, ...res };
        if (res.type === undefined) res.type = this.defaultUL;
        return res;
      },
      set(newValue) {
        this.$emit("input", newValue);
      },
    },
    // данные для формы подготовлены
    formDataReady() {
      try {
        return this.formValues.type !== undefined;
      } catch (error) {
        // return default below
      }
      return false;
    },
    // юридическое лицо
    isUL() {
      try {
        if (this.formValues) return this.formValues.type == "ЮридическоеЛицо";
      } catch (error) {
        // nothig to return
      }
      return this.defaultUL == "ЮридическоеЛицо";
    },
    // редактирование записи
    isEdit() {
      return this.modType == "edit" && this.formValues && this.formValues.id;
    },
    // расширения модели
    formExtensions() {
      try {
        return this.fullModel.extensions;
      } catch (error) {
        return null;
      }
    },
    // показывать группы
    showGroups() {
      if (this.formExtensions)
        return (
          this.formExtensions.has_groups && this.id && this.modType == "edit"
        );
      else return false;
    },
    // табы
    tabs() {
      return [
        {
          title: "Поля ввода",
          icon: "mdi-view-list",
          name: "form",
          disabled: false,
        },
        {
          title: "Сотрудники",
          icon: "mdi-account",
          name: "employees",
          disabled: !this.isEdit,
        },
        {
          title: "Расчетные счета",
          icon: "mdi-bank",
          name: "rs",
          disabled: !this.isEdit,
        },
        {
          title: "Договоры",
          icon: "mdi-file-sign",
          name: "contracts",
          disabled: !this.isEdit,
        },
      ];
    },
  },
  methods: {
    ...mapActions([
      "saveTableRow",
      "getTableModel",
      "getFormData",
      "setLoading",
    ]),
    // обрабатываем переданные данные из ЕГРЮЛ
    fromEgrul(data) {
      let currentValues = { ...this.formValues };
      // let rd = new Date(data.data.state.registration_date);
      // let reg_date = `${rd.getDate()}.${rd.getMonth() + 1}.${rd.getFullYear()}`;
      let fio = data.data.management.name.split(" ");
      if (this.isUL) {
        currentValues = {
          ...currentValues,
          ...{
            inn: data.data.inn,
            okpo: data.data.okpo,
            kpp: data.data.kpp,
            ogrn: data.data.ogrn,
            // reg_date,
            name: data.value,
            full_name: data.data.name.full_with_opf,
            address: data.data.address.data.source,
            employees: [
              {
                name: fio[0],
                sure_name: fio[0],
                first_name: fio[1],
                patronymic: fio[2],
                firm_position_text: data.data.management.post,
              },
            ],
          },
        };
      } else {
        currentValues = {
          ...currentValues,
          ...{
            inn: data.data.inn,
            okpo: data.data.okpo,
            ogrn: data.data.ogrn,
            // reg_date,
            name: data.value,
            full_name: data.data.name.full_with_opf,
            address: data.data.address.data.source,
            employees: [
              {
                name: data.data.fio.surname,
                sure_name: data.data.fio.surname,
                first_name: data.data.fio.name,
                patronymic: data.data.fio.patronymic,
              },
            ],
          },
        };
      }
      this.formValues = { ...currentValues };
    },
    // submit формы
    submit(close) {
      this.setLoading(true);
      let saveVals = { ...this.formValues };
      let payload = {
        table: this.table,
        modType: this.modType,
        values: saveVals,
        copyOptions: this.copyOptions,
      };
      this.saveTableRow(payload)
        .then((data) => {
          if (close) {
            // закрытие в зависимости от типа отображения (модальное окно/маршрут)
            this.closeAction();
          } else {
            this.formValues = { ...data };
            // переходим к предыдущему роуту
            if (!this.inDialog) {
              // if (this.modType!='edit') this.$router.replace({ name: 'edit', params: { table: this.table, id: newInfo.id} })
              if (this.modType != "edit") {
                this.$router.replace({
                  path: `/form/${this.table}/edit/${data.id}`,
                });
              }
            }
          }
        })
        .finally(() => {
          this.setLoading(false);
        });
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
};
</script>

<style lang="scss" scoped></style>
