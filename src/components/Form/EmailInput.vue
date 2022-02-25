<template>
  <div>
    <v-text-field
      :prepend-inner-icon="prependIcon"
      :value="inputValue"
      :label="settings.title"
      :rules="rules"
      :readonly="isReadonly"
      :hint="settings.hint"
      :prepend-icon="settings.icon"
      @click:prepend-inner="sendEmail"
      @input="changeInput($event)"
      @change="emailChange($event)"
    >
      <template v-slot:append>
        <abp-icon-button
          :disabled="!isClearable"
          icon="mdi-close"
          tip="Очистить"
          :disable-tab="true"
          @click="doClear"
        ></abp-icon-button>
      </template>
    </v-text-field>
  </div>
</template>

<script>
import ABPIconButtonVue from "./ABPIconButton.vue";
export default {
  name: "email-input",
  components: {
    "abp-icon-button": ABPIconButtonVue,
  },
  model: {
    prop: "inputValue",
    event: "input",
  },
  props: {
    inputValue: {
      required: true,
    },
    settings: {
      type: Object,
      required: false,
    },
    clearable: {
      type: Boolean,
      required: false,
      default: true,
    },
    readonly: {
      type: Boolean,
      required: false,
      default: false,
    },
    require: {
      type: Boolean,
      required: false,
      default: false,
    },
    title: {
      type: String,
      required: false,
      default: null,
    },
    hint: {
      type: String,
      required: false,
      default: null,
    },
  },
  data() {
    return {
      email: this.inputValue,
    };
  },
  created() {},
  mounted() {
    this.$emit("loaded");
  },
  methods: {
    changeInput(newValue) {
      this.$emit("input", newValue);
    },
    emailChange(newValue) {
      this.email = newValue;
    },
    sendEmail() {
      if (this.prependIcon) {
        alert(`Отправляем на ${this.email}`);
      }
    },
    doClear() {
      this.$emit("clear");
      this.changeInput(null);
    },
  },
  computed: {
    rules() {
      let res = [];

      if (!this.readonly && this.required) {
        res.push((v) => !!v || `Заполните ${this.settings.title}`);
      }
      res.push(
        (v) =>
          (!!v && /.+@.+\..+/.test(v)) ||
          !v ||
          "Введите правильный адрес электронной почты"
      );
      return res;
    },
    isEmailValid() {
      let emailExpr = /.+@.+\../;
      if (this.email && emailExpr.test(this.email)) {
        return true;
      } else {
        return false;
      }
    },
    isReadonly() {
      return this.settings.readonly || this.readonly || false;
    },
    required() {
      return this.settings.require || false;
    },
    prependIcon() {
      if (!!this.settings.showAction && this.isEmailValid) {
        return "mdi-email-send";
      } else {
        return null;
      }
    },
    isClearable() {
      return this.clearable !== false && !this.readonly && !!this.inputValue;
    },
  },
};
</script>
