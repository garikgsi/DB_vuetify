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
import { mapActions, mapGetters } from "vuex";

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
    // сохранять состояние таба
    saveState: {
      type: Boolean,
      required: false,
      default: true,
    },
    // имя для сохранения состояния
    stateName: {
      type: String,
      required: false,
      default: undefined,
    },
  },
  data() {
    return {};
  },
  computed: {
    ...mapGetters(["isMobile"]),
    // значение активного таба
    val: {
      get() {
        let res = 0;
        if (this.value) {
          res = this.value;
        } else {
          if (this.isSaveState) {
            try {
              res = this.$store.state.app.tabState[this.stateName];
            } catch (error) {
              // default return below
            }
          }
        }
        return res;
      },
      set(newValue) {
        if (this.isSaveState) {
          // console.log(`save tab state ${this.stateName}=${newValue}`);
          this.setTabState({ name: this.stateName, val: newValue });
        }
        this.$emit("change", newValue);
      },
    },
    // сохранять состояние в стейте
    isSaveState() {
      return this.saveState && !!this.stateName;
    },
    // табы не активны
    tabsDisabled() {
      return this.disabled;
    },
  },
  methods: {
    ...mapActions(["setTabState"]),
  },
};
</script>

<style lang="scss" scoped></style>
