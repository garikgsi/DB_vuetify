<template>
  <div>
    <v-navigation-drawer app dark v-model="sideBar" expand-on-hover>
      <div v-if="isAuth">
        <v-list v-if="hasUserInfo">
          <v-list-item class="px-2">
            <v-list-item-avatar>
              <v-img v-if="avatar" :src="avatar"></v-img>
              <v-icon v-else>mdi-account-circle</v-icon>
            </v-list-item-avatar>
          </v-list-item>

          <v-list-item link>
            <v-list-item-content>
              <v-list-item-title class="title">
                {{ userName }}
              </v-list-item-title>
              <v-list-item-subtitle>{{ userSubtitle }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>

        <v-divider></v-divider>
        <v-list nav dense>
          <v-list-item
            link
            v-for="(link, index) in ui"
            :key="`nav_link_${index}`"
            :to="link.route"
          >
            <v-list-item-icon v-if="link.icon">
              <v-icon>{{ link.icon }}</v-icon>
            </v-list-item-icon>
            <v-list-item-title>{{ link.title }}</v-list-item-title>
          </v-list-item>
          <!-- НАСТРОЙКИ -->
          <v-list-item link :to="{ name: 'profile' }">
            <v-list-item-icon>
              <v-icon>mdi-account</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Профиль</v-list-item-title>
          </v-list-item>
          <!-- ВЫХОД -->
          <abp-confirm
            v-model="showDialog"
            title="Выйти из системы?"
            text="Сейчас будет завершен сеанс и все несохраненные операции в базе данных будут утеряны"
            @confirmPress="sendLogout"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-list-item link v-on="on" v-bind="attrs">
                <v-list-item-icon>
                  <v-icon>mdi-logout-variant</v-icon>
                </v-list-item-icon>
                <v-list-item-title>Выйти</v-list-item-title>
              </v-list-item>
            </template>
          </abp-confirm>
        </v-list>
      </div>
    </v-navigation-drawer>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from "vuex";
import ABPConfirm from "./Dialogs/Confirm.vue";

export default {
  components: {
    "abp-confirm": ABPConfirm,
  },
  data() {
    return {
      showDialog: false,
    };
  },
  computed: {
    ...mapState([]),
    ...mapGetters([
      "isAuth",
      "showSidebar",
      "isError",
      "error",
      "icons",
      "colors",
      "isLoading",
      "userUI",
      "setUI",
      "hasUserInfo",
      "userInfo",
      "user",
    ]),
    sideBarInterface() {
      if (this.setUI) {
        return this.userUI.sideBar;
      }
      return [];
    },
    ui() {
      let mainBlock = [
        {
          title: "Главная",
          icon: "mdi-view-dashboard",
          route: "/home",
        },
      ];
      return [...mainBlock, ...this.sideBarInterface];
    },
    sideBar: {
      get() {
        return this.showSidebar;
      },
      set(val) {
        this.setSidebarShow(val);
      },
    },
    avatar() {
      if (this.hasUserInfo && this.userInfo.avatar_preview) {
        return this.userInfo.avatar_preview;
      } else {
        return null;
      }
    },
    userName() {
      if (this.hasUserInfo && this.userInfo.name) {
        return this.userInfo.name;
      } else {
        return null;
      }
    },
    userSubtitle() {
      if (this.user) {
        return this.user.email;
      } else {
        return null;
      }
    },
  },
  methods: {
    ...mapActions(["logout", "setSidebarShow"]),
    sendLogout() {
      this.logout();
      // this.$router.push('/login')
      this.$router.replace({ name: "login" });
    },
  },
};
</script>

<style lang="scss" scoped></style>
