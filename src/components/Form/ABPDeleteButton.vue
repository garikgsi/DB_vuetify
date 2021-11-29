<template>
  <confirm
    v-model="showConfirmForm"
    :title="title"
    :text="text"
    :disabled="disabled"
    @confirmPress="click"
  >
    <template v-slot:activator="{ on, attrs }">
      <abp-icon-button
        v-if="withIcon"
        :icon="iconName"
        :tip="tip"
        :clickStop="true"
        :disabled="disabled"
        v-on="on"
        v-bind="attrs"
        @click="showConfirmForm = !showConfirmForm"
      ></abp-icon-button>
      <v-btn
        v-else
        text
        @click="showConfirmForm = !showConfirmForm"
        :disabled="disabled"
        v-bind="{ ...btnProps, ...attrs }"
        v-on="on"
      >
        {{ btnText }}
      </v-btn>
    </template>
  </confirm>
</template>

<script>
import ConfirmVue from "../Dialogs/Confirm.vue";
import ABPIconButtonVue from "./ABPIconButton.vue";
export default {
  name: "abp-delete-button",
  components: {
    "abp-icon-button": ABPIconButtonVue,
    confirm: ConfirmVue,
  },
  props: {
    // Заголовок формы
    title: {
      type: String,
      required: false,
      default: "",
    },
    // Текст формы
    text: {
      type: String,
      required: false,
      default: "",
    },
    // текст кнопки, если icon == null
    btnText: {
      type: String,
      required: false,
    },
    // свойства кнопки, если это не стандартный icon-button
    btnProps: {
      type: Object,
      required: false,
    },
    // подсказка
    tip: {
      type: String,
      required: false,
      default: "удалить",
    },
    // иконка
    icon: {
      type: [String, Boolean],
      required: false,
      default: true,
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    color: {
      type: String,
      required: false,
      default: null,
    },
    // игнорировать таб при переходе
    disableTab: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      showConfirmForm: false,
      defaultIcon: "mdi-delete",
    };
  },
  methods: {
    click(event) {
      if (event && this.clickStop) {
        event.stopPropagation();
      }
      this.$emit("click");
    },
  },
  computed: {
    tabIndex() {
      return this.disableTab ? -1 : null;
    },
    // наименование значка
    iconName() {
      if (typeof this.icon === "string") {
        return this.icon;
      }
      return this.defaultIcon;
    },
    // с иконкой?
    withIcon() {
      return this.icon !== false || this.icon === undefined;
    },
  },
};
</script>

<style lang="scss" scoped></style>
