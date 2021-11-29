// редактор формы
<template>
  <div>
    formValues={{ formValues }}, fullModelFields={{ fullModelFields }}, isUL={{
      isUL
    }}
    <abp-simple-form
      v-if="formModel"
      v-model="formValues"
      :model="formModel"
      :buttons="null"
      :title="formTitle"
    >
    </abp-simple-form>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "kontragent-form",
  components: {
    "abp-simple-form": () => import("./ABPSimpleForm.vue"),
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
  },
  data() {
    return {
      // таблица с которой взаимодействуем
      table: "kontragents",
      // начальные значения типа юрлица
      defaultUL: false,
    };
  },
  created() {
    this.getTableModel(this.table);
  },
  computed: {
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
      return [
        "kpp",
        "okpo",
        "rs_id",
        "ogrn",
        "svid_num",
        "svid_date",
        "reg_date",
      ];
    },
    // поля для физ.лица
    fieldsFL() {
      return ["okpo", "passport", "rs_id", "ogrn", "svid_num", "svid_date"];
    },
    // общие для всех типов юрлиц поля
    commonFields() {
      return ["name", "full_name", "inn", "comment", "type"];
    },
    // список полей в зависимости от типа юр.лица
    fieldList() {
      let currentFields = this.isUL ? this.fieldsUL : this.fieldsFL;
      return [...this.commonFields, ...currentFields];
    },
    // модель в зависимости от типа  юр.лица
    formModel() {
      //
      if (this.fullModelFields)
        return this.fullModelFields.filter((field) => {
          return this.fieldList.indexOf(field.name) !== -1;
        });
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
        return this.modelValue;
      },
      set(newValue) {
        this.$emit("input", newValue);
      },
    },
    // юридическое лицо
    isUL() {
      try {
        if (this.formValues.type)
          return this.formValues.type == "ЮридическоеЛицо";
      } catch (error) {
        // nothig to return
      }
      return this.defaultUL;
    },
  },
  methods: {
    ...mapActions(["saveTableRow", "getTableModel", "pushError", "setLoading"]),
  },
};
</script>

<style lang="scss" scoped></style>
