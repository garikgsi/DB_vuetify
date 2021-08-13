<template>
  <div>
    <v-form
      v-model="form_valid"
      lazy-validation
      ref="form"
      @submit.prevent="saveMenupoint"
    >
      <v-container>
        <v-row dense>
          <v-col cols="12" v-show="showId">
            <text-input
              type="int"
              v-model="curMenuPoint.id"
              label="id"
              :required="false"
            >
            </text-input>
          </v-col>
          <v-col cols="6">
            <text-input
              v-model="curMenuPoint.title"
              label="Название"
              :required="true"
            >
            </text-input>
          </v-col>
          <v-col cols="6">
            <select-input
              v-model="curMenuPoint.module_id"
              :items="moduleItems"
              :required="true"
            ></select-input>
          </v-col>
          <v-col cols="12">
            <rtf-input
              v-model="curMenuPoint.content"
              :label="menuPointListable ? 'Контент' : 'Контент начало'"
            >
            </rtf-input>
          </v-col>
          <v-col cols="12" v-if="!menuPointListable">
            <rtf-input v-model="curMenuPoint.content" label="Контент">
            </rtf-input>
          </v-col>
          <v-col cols="12">
            <text-input
              v-model="curMenuPoint.meta_title"
              label="Meta TITLE"
              placeholder="Значение мета-тега TITLE"
            >
            </text-input>
          </v-col>
          <v-col cols="12">
            <text-input
              v-model="curMenuPoint.meta_keywords"
              label="Meta KEYWORDS"
              placeholder="Значение мета-тега KEYWORDS"
            >
            </text-input>
          </v-col>
          <v-col cols="12">
            <text-input
              v-model="curMenuPoint.meta_description"
              label="Meta DESCRIPTION"
              placeholder="Значение мета-тега DESCRIPTION"
            >
            </text-input>
          </v-col>
          <v-col cols="12">
            <v-text-field
              v-model="curMenuPoint.surl"
              label="ЧПУ"
              placeholder="URL раздела"
              :rules="curMenuPoint.id == 2 ? startPageUrlRules : urlRules"
              hint="Кирилица будет транслитилирована"
              :required="curMenuPoint.id != 1"
              :disabled="curMenuPoint.id == 1"
              dense
            ></v-text-field>
          </v-col>
          <v-col cols="6">
            <text-input
              type="int"
              v-model="curMenuPoint.num_order"
              label="Порядок вывода"
            >
            </text-input>
          </v-col>
          <v-col cols="6">
            <switch-input
              v-model="curMenuPoint.is_popular"
              label="Показывать в популярных"
            ></switch-input>
          </v-col>
          <v-col cols="6">
            <switch-input
              v-model="curMenuPoint.is_show_in_menu"
              label="Отображать в меню"
            ></switch-input>
          </v-col>
        </v-row>
      </v-container>
      <v-btn type="submit" :disabled="!formSaveable">Сохранить</v-btn>
    </v-form>
  </div>
</template>

<script>
import TextInput from "../Form/TextInput.vue";
import RTFInput from "../Form/RTFInput.vue";
import SelectInput from "../Form/SelectInput.vue";
import Switch from "../Form/Switch.vue";
import { mapState, mapGetters } from "vuex";

export default {
  components: {
    "text-input": TextInput,
    "rtf-input": RTFInput,
    "select-input": SelectInput,
    "switch-input": Switch,
  },
  created() {
    this.$store.dispatch("fetchModuleItems");
  },
  data() {
    return {
      showId: false,
      form_valid: false,
      startPageUrlRules: [
        (v) => !!v || "Необходимо заполнить URL страницы",
        (v) => v == "/" || "Для корневого раздела допустим только символ /",
      ],
    };
  },
  computed: {
    ...mapState(["moduleItems"]),
    ...mapGetters([
      "menuPointListable",
      "menuPointId",
      "parentMenuPointId",
      "urlRules",
      "treeNodeSelected",
    ]),
    curMenuPoint: {
      get() {
        return this.$store.state.curMenuPoint;
      },
      set(v) {
        this.$store.dispatch("setCurMenuPoint", v);
      },
    },
    formSaveable() {
      return this.form_valid && this.treeNodeSelected;
    },
  },
  methods: {
    saveMenupoint() {
      if (this.$refs.form.validate()) {
        this.$store.dispatch("saveMenuPoint", this.curMenuPoint).then(() => {
          this.$emit("form-saved");
        });
      } else {
        // console.log('not validated')
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>
