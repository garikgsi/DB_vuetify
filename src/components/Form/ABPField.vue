<template>
  <div>
    <!-- {{ settings }} -->
    <!-- {{ componentProps }} -->
    <!-- {{ settings.props }} -->
    <component
      :is="component"
      :settings="settings"
      :class="{ 'require-field': required }"
      v-if="component"
      v-bind="componentProps"
      :required="required"
      :inputValue="inputValue"
      @input="changeInput($event)"
      @loaded="fieldLoaded"
    />
  </div>
</template>

<script>
export default {
  name: "abp-field",
  props: {
    settings: {
      type: Object,
      required: false,
    },
    inputValue: {
      required: true,
    },
  },
  model: {
    prop: "inputValue",
    event: "input",
  },
  data() {
    return {
      component: null,
    };
  },
  computed: {
    // замены свойств компонента
    componentProps() {
      let res = {};
      if (this.settings) res = { ...res, ...this.settings };
      if (this.settings.props) res = { ...res, ...this.settings.props };
      return res;
    },
    // загрузчик
    loader() {
      return () => import(`./${this.componentName}.vue`);
    },
    // имя файла компонента
    componentName() {
      let componentName;
      switch (this.settings.type) {
        case "string":
          {
            componentName = "TextInput";
          }
          break;
        case "boolean":
          {
            componentName = "Switch";
          }
          break;
        case "text":
          {
            componentName = "RTFInput";
          }
          break;
        case "select":
          {
            if (this.items) {
              componentName = "SelectInput";
            } else {
              componentName = "ABPSelect";
            }
          }
          break;
        case "integer":
          {
            componentName = "TextInput";
          }
          break;
        case "phone":
          {
            componentName = "PhoneInput";
          }
          break;
        case "password":
          {
            componentName = "PasswordInput";
          }
          break;
        case "email":
          {
            componentName = "EmailInput";
          }
          break;
        case "date":
          {
            componentName = "DateInput";
          }
          break;
        case "datetime":
          {
            componentName = "DateTimeInput";
          }
          break;
        case "ip":
          {
            componentName = "IPInput";
          }
          break;
        case "textarea":
          {
            componentName = "LongTextInput";
          }
          break;
        case "month":
          {
            componentName = "MonthInput";
          }
          break;
        case "period":
          {
            componentName = "PeriodInput";
          }
          break;
        case "pricequantityamount":
          {
            componentName = "PriceQuantityAmount";
          }
          break;
        case "radio":
          {
            componentName = "RadioInput";
          }
          break;
        case "image":
          {
            componentName = "ImageInput";
          }
          break;
        case "document":
          {
            componentName = "FileInput";
          }
          break;
        case "morph":
          {
            componentName = "MorphInput";
          }
          break;
        case "stock_balance":
          {
            componentName = "StockBalanceInput";
          }
          break;
        case "foreign_select":
          {
            componentName = "ABPForeignInput";
          }
          break;
        case "nomenklatura":
          {
            componentName = "NomenklaturaInput";
          }
          break;
        case "enum":
          {
            componentName = "EnumInput";
          }
          break;
        default: {
          componentName = "TextInput";
        }
      }

      if (!this.settings.type) {
        // console.log(`not set type=${this.settings.type}`);
        return null;
      } else {
        // console.log(
        //   `for type=${this.settings.type} componentName=${componentName}`
        // );
      }

      return componentName;
    },
    required() {
      if (this.settings.require) {
        return this.settings.require;
      }
      if (this.settings.required) {
        return this.settings.required;
      }
      return false;
    },
  },
  mounted() {
    this.loader()
      .then(() => {
        this.component = () => this.loader();
      })
      .catch((e) => {
        console.error(
          `component [${this.settings.title}] loader error=${JSON.stringify(e)}`
        );
        // this.component = () => import("./TextInput.vue");
        this.component = () => import(`./${this.componentName}.vue`);
      });
  },
  methods: {
    changeInput(newValue) {
      // console.log(`input changed to ${JSON.stringify(newValue)}`);
      this.$emit("input", newValue);
    },
    fieldLoaded() {
      this.$emit("loaded");
    },
  },
};
</script>

<style lang="scss" scoped>
::v-deep .require-field {
  legend:first-child,
  label:first-child {
    color: #3f51b5;
    &::before {
      content: "* ";
    }
  }
}
</style>
