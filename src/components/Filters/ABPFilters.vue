<template>
  <div>
    <simple-filters
      :inputValue="vals"
      :filters="filters"
      @input="changeInput($event)"
    ></simple-filters>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import SimpleFiltersVue from "./SimpleFilters.vue";

export default {
  name: "abp-filters",
  components: {
    "simple-filters": SimpleFiltersVue,
  },
  model: {
    prop: "inputValue",
    event: "input",
  },
  props: {
    inputValue: {
      type: Object,
      required: true,
    },
    table: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      // vals: this.inputValue
    };
  },
  created() {
    // проверим фильтры в стейте
    if (!this.$store.state.table.filters[this.table]) {
      this.getTableFilters(this.table);
    }
  },
  computed: {
    filters() {
      try {
        return this.$store.state.table.filters[this.table].filter((filter) => {
          return filter.name !== "search";
        });
      } catch (e) {
        return null;
      }
    },
    vals: {
      get() {
        return this.inputValue;
      },
      set(newVal) {
        this.$emit("input", newVal);
      },
    },
  },
  methods: {
    ...mapActions(["getTableFilters"]),
    changeInput(newValue) {
      this.$emit("input", newValue);
    },
  },
};
</script>

<style lang="scss" scoped></style>
