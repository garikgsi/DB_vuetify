<template>
  <div>
    <!-- {{ inputValue }} -->
    <!-- {{ items }} -->
    <abp-select
      v-if="isSelect"
      v-bind="basicProps"
      :dataArray="componentItems"
      v-model="componentInputValue"
      item-text="text"
    ></abp-select>
    <radio-input
      v-else
      v-bind="basicProps"
      :items="componentItems"
      v-model="componentInputValue"
    ></radio-input>
  </div>
</template>

<script>
import ABPSelectVue from "./ABPSelect.vue";
import RadioInputVue from "./RadioInput.vue";
export default {
  name: "enum-input",
  components: {
    "abp-select": ABPSelectVue,
    "radio-input": RadioInputVue,
  },
  model: {
    prop: "inputValue",
    event: "input",
  },
  props: {
    inputValue: {
      required: true,
    },
    items: {
      required: true,
    },
    // settings: {
    //     type: Object,
    //     required: false
    // },
    title: {
      type: String,
      required: false,
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
  },
  data() {
    return {
      defColor: "blue",
    };
  },
  mounted() {
    this.$emit("loaded");
  },
  methods: {
    changeInput(newValue) {
      // console.log(`radio-input changed to ${newValue}`)
      this.$emit("input", newValue);
    },
  },
  computed: {
    rules() {
      if (this.required && !this.readonly) {
        return [(v) => !!v || "Необходимо выбрать одно из значений"];
      } else {
        return [true];
      }
    },
    required() {
      return this.require || false;
    },
    // select в качестве компонента в взаисимости от кол-ва данных
    isSelect() {
      return this.items.length > 2;
    },
    // базовые свойства компонента
    basicProps() {
      return {
        title: this.title,
        readonly: this.readonly,
        require: this.require || this.required,
      };
    },
    // формализованный массив данных для компонента
    componentItems() {
      return this.items.map((item, i) => {
        // если передан массив объектов
        if (typeof item === "object") {
          return {
            id: item.id !== undefined ? item.id : i + 1,
            text: item.text !== undefined ? item.text : item,
            color: item.color !== undefined ? item.color : "primary",
          };
        } else {
          // если передан список примитивов
          return {
            id: i + 1,
            text: item,
          };
        }
      });
    },
    // значения компонентов
    componentInputValue: {
      get() {
        if (this.inputValue) {
          // если в итемсы передан массив объектов
          if (typeof this.items[0] === "object") {
            return this.inputValue;
          } else {
            // если в итемсы передан массив примитивов
            try {
              return this.componentItems.find((item) => {
                return item.text == this.inputValue;
              }).id;
            } catch (error) {
              // null return below
            }
          }
        }
        return null;
      },
      set(newValue) {
        let formalizeVal;
        // если в итемсы передан массив объектов
        if (typeof this.items[0] === "object") {
          formalizeVal = newValue;
        } else {
          formalizeVal = this.componentItems.find((item) => {
            return item.id == newValue;
          }).text;
        }
        this.$emit("input", formalizeVal);
      },
    },
  },
};
</script>
