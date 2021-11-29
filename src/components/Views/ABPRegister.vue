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
            <v-btn to="/forgot_password" text color="primary">
              Забыл пароль
            </v-btn>
            <v-btn to="/login" color="primary">
              Авторизация
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
          name: "name",
          title: "Ваше имя",
          type: "string",
          require: true,
        },
        {
          name: "email",
          title: "Логин",
          type: "email",
          require: true,
        },
        {
          name: "password",
          title: "Пароль",
          type: "password",
          withRetype: true,
          require: true,
        },
      ],
      values: {
        email: "",
        password: "",
      },
      title: "Регистрация",
      buttons: [{ type: "submit", title: "OK", color: "success", dark: true }],
      loading: false,
    };
  },
  created() {
    this.setTitle("Регистрация в программе");
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
    ...mapActions(["setTitle", "register"]),
    runAuth() {
      this.loading = true;
      this.register(this.values)
        .then((r) => {
          console.log(`res=${JSON.stringify(r)}`);
        })
        .catch(() => {
          console.log(`not registered`);
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
};
</script>

<style lang="scss" scoped></style>
