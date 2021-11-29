<template>
  <div>
    <slot name="before"></slot>
    <v-tabs v-model="val" v-if="tabs" :icons-and-text="!isMobile">
      <template v-for="(tab, i) in tabs">
        <v-tab :key="`tab-${i}`" :disabled="tab.disabled || tabsDisabled">
          <template v-if="!isMobile">{{ tab.title }} </template>
          <v-icon>{{ tab.icon }}</v-icon>
        </v-tab>
      </template>
      <template v-for="(tab, i) in tabs">
        <v-tab-item :key="`tab-item-${i}`">
          <slot :name="tab.name"> </slot>
        </v-tab-item>
      </template>
    </v-tabs>
    <slot name="after"></slot>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "abp-tabs",
  model: {
    prop: "value",
    event: "change",
  },
  props: {
    // значение - № таба, начиная с 0
    value: {
      required: false,
      default: 0,
    },
    // список табов - массив объектов
    // {
    //      'title' = Заголовок таба,
    //      'icon' = иконка,
    //      'name' = имя слота',
    //      'disabled' = true/false
    // }
    tabs: {
      type: Array,
      required: false,
    },
    // табы не активны
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {};
  },
  computed: {
    ...mapGetters(["isMobile"]),
    val: {
      get() {
        return this.value || 0;
      },
      set(newValue) {
        this.$emit("change", newValue);
      },
    },
    tabsDisabled() {
      return this.disabled;
    },
  },
};
</script>

<style lang="scss" scoped></style>
