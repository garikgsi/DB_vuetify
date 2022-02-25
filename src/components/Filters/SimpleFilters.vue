<template>
  <div>
    <!-- {{ vals }} -->
    <v-row v-if="filters && !!vals" dense>
      <v-col
        v-bind="colSize"
        class="px-2"
        v-for="(filter, i) in filters"
        :key="`filter_${i}`"
      >
        <abp-filter
          v-model="vals[filter.name]"
          :filter="filter"
          :disabled="disabled"
          @input="syncFilters()"
        />
      </v-col>
    </v-row>
    <v-row v-if="withButton">
      <v-col class="d-flex align-end flex-column px-2">
        <v-btn text color="primary" @click="btnClick" :disabled="disabled">
          {{ buttonTitle }}
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import ABPFilter from "./ABPFilter";

export default {
  name: "simple-filters",
  components: {
    "abp-filter": ABPFilter,
  },
  model: {
    prop: "inputValue",
    event: "input",
  },
  props: {
    // значения фильтров
    inputValue: {
      type: Object,
      required: true,
    },
    // фильтры
    filters: {
      required: true,
    },
    // фильтрация по нажатию кнопки
    withButton: {
      type: Boolean,
      required: false,
      default: false,
    },
    // тайтл кнопки применения фильтрации
    buttonTitle: {
      type: String,
      required: false,
      default: "Сформировать",
    },
    // функционал фильтров неактивен
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      colSize: {
        cols: 12,
        sm: 6,
        md: 4,
        lg: 3,
        xl: 2,
      },
    };
  },
  computed: {
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
    // синхронизация фильтров
    syncFilters() {
      this.$emit("input", this.vals);
    },
    // нажатие на кнопку сформировать
    btnClick() {
      this.$emit("submit", this.vals);
    },
  },
};
</script>

<style lang="scss" scoped></style>
