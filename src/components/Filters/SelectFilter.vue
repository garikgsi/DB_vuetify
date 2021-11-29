<template>
  <div>
    <abp-select
      :inputValue="inputValue"
      :title="title"
      :table="table"
      :multiple="true"
      :chooseEqual="false"
      :editable="false"
      :clearable="true"
      :showParams="0"
      :withChips="true"
      @input="changeInput($event)"
    ></abp-select>
  </div>
</template>

<script>
import ABPSelectVue from "../Form/ABPSelect.vue";
// import ABPSelectInput from '../Form/ABPSelectInput'

export default {
  name: "select-filter",
  components: {
    // 'abp-select-input' : ABPSelectInput
    "abp-select": ABPSelectVue,
  },
  model: {
    prop: "inputValue",
    event: "input",
  },
  props: {
    inputValue: {
      required: true,
    },
    title: {
      type: String,
      required: false,
    },
    table: {
      type: String,
      required: true,
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
