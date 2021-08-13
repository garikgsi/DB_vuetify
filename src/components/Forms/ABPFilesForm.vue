<template>
  <div>
    <abp-simple-form
      v-model="values"
      :model="model"
      :values="values"
      :singleFieldRow="true"
      @submit="submit"
      @input="changeInput($event)"
    ></abp-simple-form>
  </div>
</template>

<script>
import ABPSimpleForm from "./ABPSimpleForm.vue";

import { mapGetters, mapActions } from "vuex";

export default {
  name: "abp-files-form",
  components: {
    "abp-simple-form": ABPSimpleForm,
  },
  model: {
    prop: "inputValue",
    event: "input",
  },
  props: {
    inputValue: {
      type: Object,
      required: true,
      default() {
        return {};
      },
    },
    model: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {};
  },
  created() {},
  computed: {
    ...mapGetters([]),
    values: {
      get() {
        return this.inputValue;
      },
      set() {},
    },
  },
  methods: {
    ...mapActions([]),
    submit() {
      this.$emit("submit");
    },
    getBaseName(fileName) {
      let name = fileName;
      let pos = fileName.lastIndexOf(".");
      if (pos > 0) {
        name = name.substring(0, pos);
      }
      return name;
    },
  },
  watch: {
    values(newVal) {
      if ((!!newVal.name && newVal.name.length > 0) === false) {
        if (
          !!newVal.filename &&
          newVal.filename.length > 0 &&
          newVal.filename[0]
        ) {
          newVal.name = this.getBaseName(newVal.filename[0].name);
        }
      }
      this.$emit("input", newVal);
    },
  },
};
</script>

<style lang="scss" scoped></style>
