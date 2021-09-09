<template>
  <div>
    <v-app-bar app :fixed="isMobile">
      <v-app-bar-nav-icon
        v-if="isAuth"
        @click.stop="toggleSidebar"
        color="primary"
      ></v-app-bar-nav-icon>
      <v-toolbar-title class="primary--text">{{ title }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <span class="display-1 d-none d-sm-flex">{{ time }}</span>
      <div v-if="isAuth">
        <!-- <v-divider
                    vertical class="mx-4"
                ></v-divider> -->
        <v-badge
          :content="notesCount"
          color="red"
          left
          overlap
          offset-x="20"
          offset-y="20"
          :value="notesCount"
          class="ml-2"
        >
          <v-btn icon :disabled="notesCount < 1" :to="'/notes'">
            <v-icon large>mdi-bell</v-icon>
          </v-btn>
        </v-badge>
        <!-- <v-btn icon disabled>
                    <v-icon large>mdi-email</v-icon>
                </v-btn> -->
      </div>
      <v-progress-linear
        :active="isLoading"
        :indeterminate="isLoading"
        absolute
        bottom
        color="primary"
      ></v-progress-linear>
    </v-app-bar>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
export default {
  created() {
    this.getTime();
    this.getNotifications();
    setInterval(() => {
      this.getTime();
    }, 10000);
    setInterval(() => {
      this.getNotifications();
    }, 600000);
  },
  data() {
    return {
      time: null,
    };
  },
  computed: {
    ...mapGetters([
      "title",
      "isAuth",
      "showSidebar",
      "notifications",
      "activeNotifications",
      "isLoading",
      "isError",
      "error",
      "isMobile",
    ]),
    notesCount() {
      return this.activeNotifications.length;
    },
  },
  methods: {
    ...mapActions(["setSidebarShow", "getNotifications"]),
    getTime() {
      // формат времени по умолчанию
      let format = "dd DD MMMM YYYY, HH:mm";
      // формат в зависимости от экрана
      switch (this.$vuetify.breakpoint.name) {
        case "sm":
          {
            format = "HH:mm";
          }
          break;
        case "md":
          {
            format = "DD.MM HH:mm";
          }
          break;
        case "lg":
          {
            format = "DD.MM.YYYY, HH:mm";
          }
          break;
      }

      this.time = this.$moment().format(format);
    },
    toggleSidebar() {
      this.setSidebarShow(!this.showSidebar);
    },
  },
};
</script>

<style lang="scss" scoped></style>
