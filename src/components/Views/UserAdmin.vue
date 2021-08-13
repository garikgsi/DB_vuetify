<template>
  <div>
    <div v-if="isSuperAdmin">
      <div v-if="componentLoaded">
        <v-autocomplete
          :items="usersData"
          item-text="title"
          item-value="id"
          label="Выберите пользователя для изменения прав доступа"
          :loading="!usersLoaded"
          v-model="user"
          clearable
        ></v-autocomplete>
        <!-- <permissions-roles
                    v-if="user"
                    :userId="user"
                ></permissions-roles> -->
        <abp-user-profile-form
          v-if="user"
          :user-id="user"
        ></abp-user-profile-form>
      </div>
      <div v-else>
        <abp-waiting-message>
          Подождите, мы загружаем начальные данные. Это не займет много времени.
        </abp-waiting-message>
      </div>
    </div>
    <div v-else>
      <abp-deny-message>
        Вам запрещена данная операция
      </abp-deny-message>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

import ABPUserProfileFormVue from "../Forms/ABPUserProfileForm.vue";
import ABPDenyMessage from "../Info/ABPDenyMessage.vue";
import ABPWaitingMessage from "../Info/ABPWaitingMessage.vue";

export default {
  name: "user-admin",
  components: {
    "abp-deny-message": ABPDenyMessage,
    "abp-waiting-message": ABPWaitingMessage,
    "abp-user-profile-form": ABPUserProfileFormVue,
  },
  data() {
    return {
      user: null,
    };
  },
  created() {
    // получим список пользователей
    if (!this.usersLoaded) {
      this.getUsers();
    }
    // тайтл
    this.setTitle("Пользователи и права");
  },
  computed: {
    ...mapGetters(["isSuperAdmin", "usersLoaded", "users"]),
    usersData() {
      if (this.users) {
        return this.users.map((user) => {
          return { id: user.id, title: `${user.name}(${user.email})` };
        });
      } else {
        return [];
      }
    },
    componentLoaded() {
      return this.usersLoaded;
    },
  },
  methods: {
    ...mapActions(["getUsers", "setTitle"]),
  },
};
</script>

<style lang="scss" scoped></style>
