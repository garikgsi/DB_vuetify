// редактор формы
<template>
  <div>
    <!-- {{val}} -->
    <component
      :is="component"
      :table="table"
      :id="id"
      :modType="modType"
      :keyModel="keyModel"
      v-bind="params"
      v-model="val"
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
  },
  props: {
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
      val: { items: [] },
    };
  },
  created() {
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
        default: {
          return "abp-form";
        }
      }
    },
    fullModel() {
      return this.$store.state.table.model[this.table] || null;
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
  },
  methods: {
    ...mapActions(["setTitle", "getTableModel"]),
  },
};
</script>

<style lang="scss" scoped></style>
