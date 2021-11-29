<template>
  <v-btn
    icon
    @click="click"
    :disabled="disabled"
    :tabindex="tabIndex"
    :to="to"
    :large="large"
    :small="small"
    :loading="loading"
  >
    <abp-icon :icon="icon" :tip="tip" :color="color"></abp-icon>
  </v-btn>
</template>

<script>
import ABPIcon from "./ABPIcon";
export default {
  name: "abp-icon-button",
  components: {
    "abp-icon": ABPIcon,
  },
  props: {
    // значок
    icon: {
      type: [String, Boolean],
      required: true,
    },
    // подсказка
    tip: {
      type: String,
      required: false,
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    color: {
      type: String,
      required: false,
      default: null,
    },
    // Остановить дальнейшую обработку событий stopPropagation
    clickStop: {
      type: Boolean,
      required: false,
      default: true,
    },
    // игнорировать таб при переходе
    disableTab: {
      type: Boolean,
      required: false,
      default: false,
    },
    // ссылка перехода
    to: {
      type: [String, Object],
      required: false,
    },
    // индикация загрузки
    loading: {
      type: Boolean,
      required: false,
      default: false,
    },
    // большая кнопка
    large: {
      type: Boolean,
      required: false,
      default: false,
    },
    // маленькая кнопка
    small: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      show: false,
    };
  },
  methods: {
    click(event) {
      if (event && this.clickStop) {
        event.stopPropagation();
      }
      this.$emit("click");
    },
  },
  computed: {
    tabIndex() {
      return this.disableTab ? -1 : null;
    },
  },
};
</script>

<style lang="scss" scoped></style>
