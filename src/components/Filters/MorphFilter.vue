<template>
  <div>
    <morph-input
      :inputValue="inputValue"
      :title="title"
      :tables="tables"
      :name="name"
      :multiple="true"
      :chooseEqual="false"
      :editable="false"
      :clearable="true"
      :showParams="0"
      :withChips="true"
      :disabled="disabled"
      @input="changeInput($event)"
    ></morph-input>
  </div>
</template>

<script>
import MorphInputVue from "../Form/MorphInput.vue";
// import ABPSelectInput from '../Form/ABPSelectInput'

export default {
  name: "morph-filter",
  components: {
    "morph-input": MorphInputVue,
  },
  model: {
    prop: "inputValue",
    event: "input",
  },
  props: {
    inputValue: {
      required: true,
    },
    // имя morph-поля в моделе
    name: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: false,
    },
    tables: {
      type: Array,
      required: true,
    },
    // функционал фильтра неактивен
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  methods: {
    changeInput(newValue) {
      this.$emit("input", newValue);
    },
  },
};
</script>

<style lang="scss" scoped></style>
