<template>
  <div>
    <!-- {{data}} -->
    <abp-form
      v-model="data"
      :id="id"
      table="nomenklatura"
      :modType="modType"
      title="Nomenklatura"
    ></abp-form>
  </div>
</template>

<script>
import ABPForm from "./ABPForm.vue";

export default {
  components: {
    "abp-form": ABPForm,
  },
  props: {
    id: {
      type: Number,
      required: false,
    },
    modType: {
      type: String,
      required: false,
      default: "add",
    },
  },
  data() {
    return {
      data: {},
    };
  },
  computed: {
    name() {
      return this.data.name;
    },
    description() {
      return this.data.description;
    },
  },
  methods: {},
  watch: {
    name(newV, oldV) {
      if (this.modType == "add") {
        if ((!!this.description && this.description != oldV) === false) {
          this.data.description = newV;
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>
