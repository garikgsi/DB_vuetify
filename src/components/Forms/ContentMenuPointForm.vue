<template>
  <div>
    <v-form
      v-model="form_valid"
      lazy-validation
      ref="content_form"
      @submit.prevent="saveMenuPointContent"
    >
      <v-container>
        <v-row dense>
          <v-col cols="12" v-show="showId">
            <text-input
              type="int"
              v-model="content.id"
              label="id"
              :v-show="!showId"
              :required="false"
            >
            </text-input>
          </v-col>
          <v-col cols="12">
            <rtf-input
              v-model="content.content"
              label="Контент"
              :readonly="false"
            >
            </rtf-input>
          </v-col>
          <v-col cols="12">
            <rtf-input v-model="content.preview" label="Превью"> </rtf-input>
          </v-col>
          <v-col cols="12">
            <rtf-input
              v-model="content.index_page_text"
              label="Текст на стартовой"
            >
            </rtf-input>
          </v-col>
          <v-col cols="12">
            <date-time-input
              v-model="content.start_from"
              label="Дата начала показа"
            ></date-time-input>
          </v-col>
          <v-col cols="12">
            <text-input
              v-model="content.meta_title"
              label="Meta TITLE"
              placeholder="Значение мета-тега TITLE"
            >
            </text-input>
          </v-col>
          <v-col cols="12">
            <text-input
              v-model="content.meta_keywords"
              label="Meta KEYWORDS"
              placeholder="Значение мета-тега KEYWORDS"
            >
            </text-input>
          </v-col>
          <v-col cols="12">
            <text-input
              v-model="content.meta_description"
              label="Meta DESCRIPTION"
              placeholder="Значение мета-тега DESCRIPTION"
            >
            </text-input>
          </v-col>
          <v-col cols="12">
            <v-text-field
              v-model="content.surl"
              label="ЧПУ"
              placeholder="URL раздела"
              :rules="urlRules"
              hint="Кирилица будет транслитилирована"
              :required="true"
              dense
            ></v-text-field>
          </v-col>
          <!-- <v-col cols="12" >
                        <v-file-input show-size counter label="Изображение" v-model="content.img"></v-file-input>
                    </v-col> -->
        </v-row>
      </v-container>
      <v-btn type="submit" :disabled="!form_valid">Сохранить</v-btn>
    </v-form>
  </div>
</template>

<script>
import TextInput from "../Form/TextInput.vue";
import RTFInput from "../Form/RTFInput.vue";
import DateTimeInput from "../Form/DateTimeInput.vue";
import { mapState, mapGetters } from "vuex";

export default {
  components: {
    "text-input": TextInput,
    "rtf-input": RTFInput,
    "date-time-input": DateTimeInput,
  },
  data() {
    return {
      showId: false,
      form_valid: false,
    };
  },
  computed: {
    ...mapState(["curMenuPoint", "moduleItems"]),
    ...mapGetters(["urlRules"]),
    content: {
      get() {
        return this.$store.state.content;
      },
      set(v) {
        this.$store.dispatch("setContent", v);
      },
    },
  },
  methods: {
    saveMenuPointContent() {
      if (this.$refs.content_form.validate()) {
        let thisComponent = this;
        this.$store
          .dispatch("saveContent", this.content)
          .then(() => thisComponent.$emit("form-saved"));
      } else {
        console.log("not validated");
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>
