// редактор формы
<template>
  <div>
    <!-- {{ val }} -->
    <!-- если копирование и не выбраны опции копирования -->
    <!-- params={{ params }} -->
    <div v-if="showCopyOptionsForm">
      <abp-copy-form
        :table="table"
        :id="id"
        title="Выберите параметры копирования"
        @submit="copyOptionsFormSubmit"
      ></abp-copy-form>
    </div>
    <component
      v-else
      :is="component"
      :table="table"
      :id="id"
      :copy-options="copyOptions"
      :modType="modType"
      :keyModel="keyModel"
      v-bind="params"
      v-model="val"
      @closeForm="closeForm"
      @submitSuccess="submitSuccess($event)"
      @toggleMiniForm="toggleMiniForm"
      @input="changeValues($event)"
    ></component>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "abp-form-editor",
  components: {
    "abp-form": () => import("../Forms/ABPForm.vue"),
    "sklad-move-form": () => import("../Forms/SkladMoveForm.vue"),
    "production-form": () => import("../Forms/ProductionForm.vue"),
    "abp-simple-form": () => import("../Forms/ABPSimpleForm.vue"),
    "abp-copy-form": () => import("../Forms/ABPCopyForm.vue"),
    "kontragent-form": () => import("../Forms/KontragentForm.vue"),
    "rs-form": () => import("../Forms/RSForm.vue"),
    "act-invoice-form": () => import("../Forms/SimpleInvoiceForm.vue"),
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
      required: true,
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
    // связи таблицы в виде массива [{key1:value1}, {key2:value2}]
    keyModel: {
      type: Array,
      required: false,
    },
    // параметры для передачи в компонент
    params: {
      type: Object,
      required: false,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      // реактивные данные формы
      val: { ...this.modelValue, ...{ items: [] } },
      // опции копирования
      copyOptions: {},
      // опции копирования установлены
      copyOptionsIsSet: false,
    };
  },
  mounted() {
    this.getTableModel(this.table).then(() => {
      if (this.formTitle) this.setTitle(this.formTitle);
    });
  },
  computed: {
    component() {
      switch (this.table) {
        case "sklad_moves": {
          return "sklad-move-form";
        }
        case "productions": {
          return "production-form";
        }
        case "kontragents": {
          return "kontragent-form";
        }
        case "rs": {
          return "rs-form";
        }
        case "acts":
        case "invoices": {
          if (this.modType == "edit") {
            return "abp-form";
          } else {
            return "act-invoice-form";
          }
        }
        default: {
          return "abp-form";
        }
      }
    },
    fullModel() {
      return this.$store.state.table.model[this.table] || null;
    },
    formExtensions() {
      if (this.fullModel) {
        return this.fullModel.extensions;
      }
      return null;
    },
    formTitle() {
      if (this.fullModel) {
        return (
          this.fullModel.extensions.props.titles[this.modType] ||
          `Редактор ${this.fullModel.extensions.props.titles.table}`
        );
      }
      return null;
    },
    // отображать форму выбора опций копирования
    showCopyOptionsForm() {
      return (
        this.modType == "copy" &&
        !this.copyOptionsIsSet &&
        this.copyOptionsFormModel.length > 0
      );
    },
    // модель формы выбора опций копирования
    copyOptionsFormModel() {
      let res = [];
      if (this.formExtensions) {
        if (this.formExtensions.has_groups)
          res.push({
            name: "ext_groups",
            type: "boolean",
            title: "Группы",
            size: 2,
          });
        if (this.formExtensions.has_images)
          res.push({
            name: "ext_images",
            type: "boolean",
            title: "Изображения",
            size: 2,
          });
        if (this.formExtensions.has_files)
          res.push({
            name: "ext_documents",
            type: "boolean",
            title: "Файлы",
            size: 2,
          });
        if (this.formExtensions.has_file_list)
          res.push({
            name: "ext_file_list",
            type: "boolean",
            title: "Каталоги",
            size: 2,
          });
        if (this.formExtensions.sub_tables) {
          for (let subTable in this.formExtensions.sub_tables) {
            let subTableDescr = this.formExtensions.sub_tables[subTable];
            res.push({
              name: `sub_table_${subTable}`,
              type: "boolean",
              title: `${subTableDescr.title}`,
              size: 2,
            });
          }
        }
      }
      return res;
    },
  },
  methods: {
    ...mapActions(["setTitle", "getTableModel"]),
    // изменение данных формы
    changeValues(newValues) {
      this.$emit("input", newValues);
    },
    // подтверждение в форме выбора опций
    copyOptionsFormSubmit() {
      this.copyOptionsIsSet = true;
      //
    },
    // обработчики от abp-form
    closeForm() {
      this.$emit("closeForm");
    },
    toggleMiniForm() {
      this.$emit("toggleMiniForm");
    },
    submitSuccess(data) {
      this.$emit("submitSuccess", data);
    },
  },
};
</script>

<style lang="scss" scoped></style>
