<template>
  <div>
    <!-- vals={{ vals }}, filters={{ filters }} -->
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
        let res = {};
        if (this.filters) {
          this.filters.forEach((filter) => {
            if (this.inputValue[filter.name]) {
              if (this.inputValue[filter.name].val) {
                res[filter.name] = this.inputValue[filter.name].val;
              } else {
                res[filter.name] = this.inputValue[filter.name];
              }
            } else {
              res[filter.name] = null;
            }
          });
        }
        return res;
        // return this.inputValue;
      },
      set(/*newVal*/) {
        // let res = {};
        // if (this.filters) {
        //   this.filters.forEach((filter) => {
        //     if (newVal[filter.name]) {
        //       res[filter.name] = {
        //         type: filter.type,
        //         val: newVal[filter.name],
        //       };
        //     }
        //   });
        // }
        // this.$emit("input", res);
        // this.$emit("input", newVal);
      },
    },
  },
  methods: {
    ...mapActions(["getTableFilters"]),
    changeInput(newVal) {
      let res = {};
      if (this.filters) {
        this.filters.forEach((filter) => {
          if (
            newVal[filter.name] !== undefined &&
            newVal[filter.name] !== null
          ) {
            res[filter.name] = {
              type: filter.type,
              val: newVal[filter.name],
            };
          }
        });
      }
      this.$emit("input", res);

      // this.$emit("input", newVal);
    },
  },
};
</script>

<style lang="scss" scoped></style>
