<template>
  <div>
    <abp-tabs
      v-model="activeTab"
      :tabs="tabs"
      v-if="hasUserInfo"
      :disabled="tabsDisabled"
    >
      <template v-slot:main>
        <abp-form
          :table="tableName"
          v-model="val"
          :disabled="tabsDisabled"
          :modelMixin="modelMixin"
          :modType="modType"
          :keyModel="keyModel"
          :loading="formLoading"
          :disableDefaultSubmit="true"
          waitMessage="Подождите пока мы обновляем данные"
          @submit="submitSuccess"
          @startLoading="startLoading"
          @endLoading="endLoading"
          @loaded="loaded"
        ></abp-form>
      </template>
      <template v-slot:permissions>
        <permissions-roles :user-id="userId"></permissions-roles>
      </template>
    </abp-tabs>
    <abp-waiting-message v-else :loading="true">
      Идет начальная инициализация. Это не должно занять много времени...
    </abp-waiting-message>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

import ABPForm from "./ABPForm.vue";
import PermissionsRoles from "../Form/PermissionsRoles.vue";
import ABPTabsVue from "../Misc/ABPTabs.vue";
import ABPWaitingMessageVue from "../Info/ABPWaitingMessage.vue";

export default {
  name: "abp-user-profile-form",
  components: {
    "abp-form": ABPForm,
    "permissions-roles": PermissionsRoles,
    "abp-tabs": ABPTabsVue,
    "abp-waiting-message": ABPWaitingMessageVue,
  },
  props: {
    userId: {
      type: [Number, String],
      required: true,
    },
  },
  data() {
    return {
      modelMixin: [
        { name: "name", title: "Ваше имя" },
        { name: "comment", hidden: true, show_in_form: false },
        { name: "phone", showAction: false, show_in_form: true, type: "phone" },
        { name: "userable", size: 4 },
      ],
      tableName: "user_info",
      activeTab: 0,
      val: {},
      formLoading: false,
      formLoaded: false,
      loading: false,
    };
  },
  created() {
    if (!this.hasUserInfo) {
      this.loading = true;
      this.getUserInfo(this.userId).then(() => {
        if (this.$store.state.user.adm_user_info[this.userId]) {
          this.val = {
            ...this.userInfo,
          };
          this.loading = false;
        }
      });
    } else {
      this.val = { ...this.userInfo };
    }
  },
  methods: {
    ...mapActions(["getUserInfo", "setUserInfo"]),
    submitSuccess() {
      let upData = {
        ...this.val,
        userable_id: this.val.userable.userable_id,
        userable_type: this.val.userable.userable_type,
      };
      // console.log(`updating... ${JSON.stringify(upData)}`);
      this.setUserInfo(upData).then(() => {
        this.val = { ...this.userInfo };
      });
    },
    startLoading() {
      this.formLoading = true;
    },
    endLoading() {
      this.formLoading = false;
    },
    loaded() {
      this.formLoaded = true;
    },
  },
  computed: {
    ...mapGetters(["isLoading"]),
    tabsDisabled() {
      return this.isLoading || this.loading || this.formLoading;
    },
    // isLoading() {
    //   return !this.formLoaded && this.formLoading;
    // },
    keyModel() {
      return [{ user_id: this.user }];
    },
    user() {
      return this.userId;
    },
    userInfo() {
      try {
        let uinfo = this.$store.state.user.adm_user_info[this.userId];
        return {
          ...uinfo,
          ...{
            userable: {
              userable_id: uinfo.userable_id,
              userable_type: uinfo.userable_type,
              userable_title: uinfo.userable_title,
            },
          },
        };
      } catch (e) {
        return null;
      }
    },
    hasUserInfo() {
      return !!this.userInfo;
    },
    modType() {
      return this.hasUserInfo && this.userInfo.id ? "edit" : "add";
    },
    // formLoading() {
    //     return false && !this.hasUserInfo
    // },
    tabs() {
      return [
        {
          title: "Общая информация",
          icon: "mdi-account",
          name: "main",
          disabled: this.isLoading,
        },
        {
          title: "Права доступа",
          icon: "mdi-key",
          name: "permissions",
          disabled: false,
        },
      ];
    },
    values: {
      get() {
        let v = {};
        for (let field in this.userInfo) {
          // if (field=='avatar_preview') {
          //     v.avatar = this.userInfo[field]
          // } else {
          //     v[field] = this.userInfo[field]
          // }
          if (field == "avatar") {
            v.avatar = this.userInfo.avatar_preview;
          } else {
            v[field] = this.userInfo[field];
          }
        }
        // пользователь
        v.user_id = this.userId;
        return v;
      },
      set(newVal) {
        this.$emit("input", newVal);
        // this.setUserInfo(newVal)
      },
    },
  },
  watch: {
    user(newUser) {
      // console.log(`changed user to ${newUser}`);
      this.getUserInfo(newUser).then(() => {
        if (this.$store.state.user.adm_user_info[this.userId]) {
          this.val = this.$store.state.user.adm_user_info[this.userId];
        }
      });
    },
  },
};
</script>

<style lang="scss" scoped></style>
