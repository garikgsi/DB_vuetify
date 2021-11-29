<template>
  <div>
    <v-footer app></v-footer>
    <v-bottom-navigation app grow v-if="isAuth && userUI">
      <v-btn
        v-for="(link, index) in userUI.footer"
        :key="`btn_${index}`"
        :to="link.route"
        color="primary"
        text
      >
        <span v-if="!isMobile">{{ link.title }}</span>

        <v-icon large>{{ link.icon }}</v-icon>
      </v-btn>
    </v-bottom-navigation>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
// import ABPIconVue from "./Form/ABPIcon.vue";

export default {
  components: {
    // "abp-icon": ABPIconVue,
  },
  data() {
    return {
      fullFooter: false,
    };
  },
  created() {
    // this.fullFooter = !this.isMobile
  },
  computed: {
    ...mapGetters(["isAuth", "isMobile", "userUI"]),
    icon() {
      return this.fullFooter ? "mdi-chevron-down" : "mdi-chevron-up";
    },
    iconTip() {
      return `${this.fullFooter ? "Скрыть" : "Показать"} полное меню`;
    },
  },
  methods: {
    ...mapActions([]),
  },
};
</script>

<style lang="scss" scoped>
.btn-text {
  color: #1976d2;
}
</style>
