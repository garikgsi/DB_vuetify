<template>
  <div>
    <v-menu
      v-model="showCal"
      :close-on-content-click="false"
      transition="scale-transition"
      offset-y
      max-width="290px"
      min-width="290px"
    >
      <template v-slot:activator="{ on }">
        <v-text-field
          :value="formatDate"
          :rules="rules"
          :label="title"
          :hint="hint"
          persistent-hint
          :prepend-icon="icon"
          :readonly="readonly"
          autocomplete="off"
          v-on="on"
          :dense="dense"
          @change="changeTextInput($event)"
        >
          <template v-slot:append>
            <abp-icon-button
              :disabled="!isClearable"
              icon="mdi-close"
              tip="Очистить"
              :disable-tab="true"
              @click="changeInput(null)"
            ></abp-icon-button>
          </template>
        </v-text-field>
      </template>
      <v-date-picker
        v-if="!readonly"
        :value="inputValue"
        locale="ru"
        :show-current="today"
        @input="changeInput($event)"
      >
        <v-btn text color="primary" @click="setToday">Сегодня</v-btn>
        <v-spacer></v-spacer>
        <v-btn text color="primary" @click="showCal = false">ОК</v-btn>
      </v-date-picker>
    </v-menu>
  </div>
</template>

<script>
import ABPIconButtonVue from "./ABPIconButton.vue";
export default {
  name: "dateinput",
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
    icon: {
      type: String,
      required: false,
      default: null,
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
    clearable: {
      type: Boolean,
      required: false,
      default: true,
    },
    // без отступов - сжатый по высоте режим
    dense: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      showCal: false,
    };
  },
  mounted() {
    this.$emit("loaded");
  },
  methods: {
    changeInput(newValue) {
      this.showCal = false;
      this.$emit("input", newValue);
      // console.log(`date-input = ${this.inputValue}, newValue=${newValue}`)
    },
    changeTextInput(newValue) {
      let newDate = this.$moment(newValue, "DD.MM.YYYY");
      if (newDate.isValid()) {
        this.changeInput(newDate.format("YYYY-MM-DD"));
      }
    },
    clearInput() {
      this.changeInput(null);
    },
    setToday() {
      return this.changeInput(this.$moment().format("YYYY-MM-DD"));
    },
  },
  computed: {
    rules() {
      let res = [
        (v) =>
          (!!v && this.$moment(v, "DD.MM.YYYY").isValid()) ||
          !v ||
          `Выберите дату или заполните в формате ДД.ММ.ГГГГ`,
      ];
      if (!this.readonly && this.required) {
        res.unshift((v) => !!v || `Заполните ${this.settings.title}`);
      }
      return res;
    },
    formatDate() {
      if (this.inputValue)
        return this.$moment(this.inputValue).format("DD.MM.YYYY");
      else return "";
    },
    today() {
      return this.$moment().format("YYYY-MM-DD");
    },
    required() {
      return this.require || false;
    },
    isClearable() {
      return this.clearable !== false && !this.readonly && !!this.inputValue;
    },
  },
};
</script>
