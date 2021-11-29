<template>
  <div>
    <abp-simple-form
      v-if="stateLoaded"
      :title="title"
      :closable="false"
      @submit="submit"
      @clickClose="close"
    >
      <template v-slot:fields>
        <v-row dense>
          <v-col cols="12" md="3">
            <abp-select-input
              v-model="val.nomenklatura_from_id"
              title="Заменяемый компонент"
              table="nomenklatura"
              :required="true"
              :readonly="true"
            ></abp-select-input>
          </v-col>
          <v-col cols="12" md="2">
            <kolvo-input
              v-model="val.kolvo_from"
              title="Количество заменяемого"
              :required="true"
            ></kolvo-input>
          </v-col>
          <v-spacer class="d-none d-md"></v-spacer>
          <v-col v-if="isMobile" cols="12" class="text-center">
            <v-icon :color="color" large>
              mdi-swap-vertical
            </v-icon>
          </v-col>
          <v-icon v-else :color="color" large>
            mdi-swap-horizontal
          </v-icon>
          <v-spacer class="d-none d-md"></v-spacer>
          <v-col cols="12" md="2">
            <kolvo-input
              v-model="val.kolvo_to"
              title="Количество заменителя"
              :required="true"
            ></kolvo-input>
          </v-col>
          <v-col cols="12" md="3">
            <abp-select-input
              v-model="val.nomenklatura_to_id"
              title="Заменитель"
              table="nomenklatura"
              :required="true"
            ></abp-select-input>
          </v-col>
          <v-col cols="12">
            <switch-input
              v-model="val.save_to_recipe"
              title="Сохранить замену в рецептуре"
            ></switch-input>
          </v-col>
        </v-row>
      </template>
    </abp-simple-form>
    <abp-waiting-message v-else :loading="true">
      Идет начальная инициализация. Это не должно занять много времени...
    </abp-waiting-message>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";

import ABPSelectInputVue from "../Form/ABPSelectInput.vue";
import KolvoInputVue from "../Form/KolvoInput.vue";
import SwitchVue from "../Form/Switch.vue";
import ABPWaitingMessageVue from "../Info/ABPWaitingMessage.vue";
import ABPSimpleFormVue from "./ABPSimpleForm.vue";

export default {
  name: "production-replace-form",
  components: {
    "abp-simple-form": ABPSimpleFormVue,
    "abp-select-input": ABPSelectInputVue,
    "kolvo-input": KolvoInputVue,
    "switch-input": SwitchVue,
    "abp-waiting-message": ABPWaitingMessageVue,
  },
  model: {
    prop: "inputValue",
    event: "input",
  },
  props: {
    // входной параметр = данные
    inputValue: {
      type: Object,
      required: true,
    },
    // цвет формы
    color: {
      type: String,
      required: false,
      default: "primary",
    },
    // тайтл
    title: {
      type: String,
      required: false,
    },
  },
  created() {
    // if (this.$store.state.table.selectData.nomenklatura) {
    //   this.$emit("loaded");
    //   this.stateLoaded = true;
    // } else {
    //   this.getSelectData("nomenklatura").then(() => {
    //     this.$emit("loaded");
    //     this.stateLoaded = true;
    //   });
    // }
  },
  data() {
    return {
      // состояние таблицы номенклатур загружено
      stateLoaded: true,
    };
  },
  computed: {
    ...mapGetters(["isMobile"]),
    val() {
      return this.inputValue;
    },
    // nomenklaturaData() {
    //   return this.$store.state.table.selectData.nomenklatura || [];
    // },
  },
  methods: {
    ...mapActions(["searchInSelect"]),
    async submit() {
      let nomenklatura_from = await this.searchInSelect({
        table: "nomenklatura",
        id: this.val.nomenklatura_from_id,
      });
      let nomenklatura_to = await this.searchInSelect({
        table: "nomenklatura",
        id: this.val.nomenklatura_to_id,
      });
      this.$emit("input", {
        ...this.val,
        ...{
          nomenklatura_from: nomenklatura_from.select_list_title,
          nomenklatura_to: nomenklatura_to.select_list_title,
        },
      });
      this.$emit("submit");
    },
    close() {
      this.$emit("close");
    },
    // findNomenklatura(id) {
    //   let findRes = this.nomenklaturaData.find((item) => {
    //     return item.id === id;
    //   });
    //   return findRes ? findRes.select_list_title : null;
    // },
  },
};
</script>

<style lang="scss" scoped></style>
