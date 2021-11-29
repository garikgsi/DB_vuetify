<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6">
        <abp-simple-form
          :model="model"
          v-model="values"
          :title="title"
          :buttons="buttons"
          @submit="runAuth"
          :loading="loading"
          :singleFieldRow="true"
        >
          <template v-slot:[`buttons-right`]>
            <v-btn to="/login" color="primary">
              авторизация
            </v-btn>
            <v-btn to="/register" color="primary">
              Регистрация
            </v-btn>
          </template>
        </abp-simple-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import ABPSimpleForm from "../Forms/ABPSimpleForm.vue";
import { mapGetters, mapActions } from "vuex";

export default {
  name: "abp-app-login",
  components: {
    "abp-simple-form": ABPSimpleForm,
  },
  data() {
    return {
      model: [
        {
          name: "email",
          title: "Логин",
          type: "email",
          require: true,
          icon: "mdi-account",
          showAction: false,
        },
      ],
      values: {
        email: "",
        password: "",
        remember: false,
      },
      title: "Авторизация",
      buttons: [{ type: "submit", title: "OK", color: "success", dark: true }],
      loading: false,
    };
  },
  created() {
    this.setTitle("Восстановление пароля");
  },
  computed: {
    ...mapGetters(["isAuth"]),
    showInfo() {
      if (this.info) return true;
      else return false;
    },
    infoData() {
      if (this.info) {
        return { text: this.info, timeout: this.timeout, color: this.color };
      } else {
        return {};
      }
    },
  },
  methods: {
    ...mapActions(["setUser", "login", "setTitle"]),
    runAuth() {
      this.loading = true;
      this.login(this.values)
        .then(() => {
          if (this.isAuth) this.$router.push({ name: "home" });
          else console.log("not auth");
        })
        .catch(() => {
          console.log(`auth error!`);
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
