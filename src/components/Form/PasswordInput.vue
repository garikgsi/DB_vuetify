<template>
  <div>
    <v-text-field
      :type="showPwd ? 'text' : 'password'"
      :append-icon="showPwd ? 'mdi-eye' : 'mdi-eye-off'"
      :value="password"
      :label="title"
      :rules="rules"
      :readonly="isReadonly"
      :hint="hint || `Не менее ${minChars} символов`"
      :prepend-icon="icon"
      counter
      :required="required"
      autocomplete="off"
      @input="changeInput($event)"
      @click:append="showPwd = !showPwd"
    ></v-text-field>
    <v-text-field
      v-if="showRetype"
      :type="showPwdRetype ? 'text' : 'password'"
      :append-icon="showPwdRetype ? 'mdi-eye' : 'mdi-eye-off'"
      v-model="passwordRetype"
      :label="`Повторите ${this.title.toLowerCase()}`"
      :rules="rulesRetype"
      :readonly="isReadonly"
      :required="required && withRetype"
      :hint="hint || `Не менее ${minChars} символов`"
      counter
      autocomplete="off"
      @input="changeInput(null)"
      @click:append="showPwdRetype = !showPwdRetype"
    ></v-text-field>
  </div>
</template>

<script>
export default {
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
    // с подтверждением
    withRetype: {
      type: Boolean,
      required: false,
      default: false,
    },
    // только чтение
    readonly: {
      type: Boolean,
      required: false,
      default: false,
    },
    // обязательное
    require: {
      type: Boolean,
      required: false,
      default: false,
    },
    // подсказка
    hint: {
      type: String,
      required: false,
      default: null,
    },
    // тайтл
    title: {
      type: String,
      required: false,
      default: null,
    },
    // иконка
    icon: {
      type: String,
      required: false,
      default: null,
    },
    // минимальное кол-во символов
    min: {
      type: Number,
      required: false,
      default: 8,
    },
  },
  data() {
    return {
      showPwd: false,
      showPwdRetype: false,
      passwordRetype: "",
      password: this.inputValue,
    };
  },
  mounted() {
    this.$emit("loaded");
  },
  methods: {
    changeInput(newValue) {
      if (newValue !== null) this.password = newValue;
      if (this.withRetype) {
        if (this.passwordMatched) {
          this.$emit("input", this.password);
        } else {
          this.$emit("input", null);
        }
      } else {
        this.$emit("input", newValue);
      }
    },
  },
  computed: {
    // правила заполненности поля ввода
    basicRules() {
      return [(v) => !!v || `Заполните ${this.title}`];
    },
    // правила длины пароля
    lengthRules() {
      return [
        (v) =>
          v.length >= this.minChars ||
          `Длина пароля не может быть меньше ${this.minChars} символов`,
      ];
    },
    // правила совпадения пароля и подтверждения
    matchRules() {
      if (!this.passwordMatched) {
        return [
          () => this.passwordMatched || `Пароль и подтверждение не совпадают`,
        ];
      } else {
        return [];
      }
    },
    // массив правил для поля ввода пароля
    rules() {
      let resRules = [...this.lengthRules];
      if (this.required && !this.isReadonly && !this.withRetype) {
        resRules = [...resRules, ...this.basicRules];
      }
      return resRules;
    },
    // проверка того, что пароли совпадают
    passwordMatched() {
      return this.password === this.passwordRetype;
    },
    // массив правил для поля подтверждения пароля
    rulesRetype() {
      let resRules = [...this.lengthRules];
      if (this.required && !this.isReadonly && !this.withRetype) {
        resRules = [...resRules, ...this.basicRules];
      }
      resRules = [...resRules, ...this.matchRules];
      return resRules;
    },
    // минимальное кол-во символов пароля
    minChars() {
      return this.min || 8;
    },
    // показывать поле повторения пароля
    showRetype() {
      return this.settings.withRetype || this.withRetype || false;
    },
    // только для чтения
    isReadonly() {
      return this.settings.readonly || this.readonly || false;
    },
    // обязательное поле
    required() {
      return this.settings.require || this.require || false;
    },
  },
};
</script>
