<template>
  <div>
    <component
      :is="componentName"
      v-if="componentLoaded"
      v-bind="filter"
      :inputValue="inputValue"
      :disabled="disabled"
      @input="changeInput($event)"
      @selected="selected($event)"
    />
    <!-- <ul>
            <li>{{filter.name}}({{filter.type}})={{inputValue}}</li>
        </ul> -->
  </div>
</template>

<script>
import BooleanFilterVue from "./BooleanFilter.vue";
import DateFilterVue from "./DateFilter.vue";

export default {
  name: "abp-filter",
  components: {
    "groups-filter": () => import("./GroupsFilter.vue"),
    "select-filter": () => import("./SelectFilter.vue"),
    "boolean-filter": BooleanFilterVue,
    "date-filter": DateFilterVue,
    "radio-filter": () => import("./RadioFilter.vue"),
    "search-filter": () => import("./SearchFilter.vue"),
    "morph-filter": () => import("./MorphFilter.vue"),
  },
  model: {
    prop: "inputValue",
    event: "input",
  },
  props: {
    inputValue: {
      required: true,
    },
    filter: {
      type: Object,
      required: true,
    },
    // функционал фильтра неактивен
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  computed: {
    componentName() {
      let componentName = null;
      switch (this.filter.type) {
        case "string":
          {
            componentName = "search-filter";
          }
          break;
        case "groups":
          {
            componentName = "groups-filter";
          }
          break;
        case "select":
          {
            componentName = "select-filter";
          }
          break;
        case "boolean":
          {
            componentName = "boolean-filter";
          }
          break;
        case "radio":
          {
            componentName = "radio-filter";
          }
          break;
        case "date":
          {
            componentName = "date-filter";
          }
          break;
        case "morph":
          {
            componentName = "morph-filter";
          }
          break;
      }
      return componentName;
    },
    componentLoaded() {
      if (this.componentName) {
        switch (this.filter.type) {
          case "select": {
            return !!this.filter.table;
          }
          case "morph": {
            return !!this.filter.tables;
          }
          default: {
            return true;
          }
        }
      }
      return false;
    },
  },
  methods: {
    changeInput(newValue) {
      this.$emit("input", newValue);
    },
    changeMade(newValue) {
      this.$emit("change", newValue);
    },
    selected(value) {
      this.$emit("selected", value);
    },
  },
};
</script>

<style lang="scss" scoped></style>
