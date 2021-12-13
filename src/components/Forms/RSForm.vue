<template>
  <div>
    <!-- {{ keyModel }} -->
    <abp-form
      v-if="simpleForm"
      v-model="values"
      table="rs"
      :keyModel="keyModel"
      :id="id"
      :modType="modType"
      :mini-form="miniForm"
      :in-dialog="inDialog"
      :closable="closable"
    ></abp-form>
  </div>
</template>

<script>
export default {
  name: "rs-form",
  components: {
    "abp-form": () => import("./ABPForm.vue"),
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
    // связки с таблицами
    keyModel: {
      type: Array,
      required: false,
    },
    // с крестиком для закрытия
    closable: {
      type: Boolean,
      required: false,
      default: true,
    },
  },

  data() {
    return {
      //   режим отображения - простой БИК и р/сч
      simpleForm: true,
    };
  },
  computed: {
    values: {
      get() {
        return this.modelValue;
      },
      set(newValue) {
        this.$emit("input", newValue);
      },
    },
  },
};
</script>

<style lang="scss" scoped></style>
