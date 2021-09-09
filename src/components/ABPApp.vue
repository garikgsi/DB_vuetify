<template>
  <v-app app>
    <abp-app-bar></abp-app-bar>
    <abp-app-sidebar v-if="isAuth"></abp-app-sidebar>

    <v-main>
      <v-container fluid class="pa-0 pt-2">
        <router-view :key="$route.fullPath"></router-view>
      </v-container>
      <abp-app-notificator
        v-if="hasInfo"
        v-model="showInfo"
        :color="information.color"
        :timeout="information.timeout"
        :text="information.text"
      ></abp-app-notificator>
    </v-main>

    <abp-app-footer></abp-app-footer>
  </v-app>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import ABPAppSideBar from "./ABPAppSideBar";
import ABPAppBar from "./ABPAppBar";
import ABPAppFooter from "./ABPAppFooter";
import ABPAppNotificatorVue from "./Info/ABPAppNotificator.vue";

export default {
  name: "abp-app",
  components: {
    "abp-app-sidebar": ABPAppSideBar,
    "abp-app-bar": ABPAppBar,
    "abp-app-footer": ABPAppFooter,
    "abp-app-notificator": ABPAppNotificatorVue,
  },
  computed: {
    ...mapGetters([
      "isAuth",
      "showSidebar",
      "hasInfo",
      "information",
      "icons",
      "colors",
      "isLoading",
    ]),
    showInfo: {
      get() {
        return this.hasInfo;
      },
      set() {
        this.setInformation(null);
      },
    },
    breakPoint() {
      return this.$vuetify.breakpoint.name;
    },
  },
  data() {
    return {};
  },
  created() {
    this.setBreakPoint(this.breakPoint);
    document.title = 'База данных ООО "Мойдодыр"';
  },
  methods: {
    ...mapActions(["setInformation", "setBreakPoint"]),
  },
  watch: {
    breakPoint(breakpoint) {
      this.setBreakPoint(breakpoint);
    },
  },
};
</script>

<style lang="scss" scoped></style>
