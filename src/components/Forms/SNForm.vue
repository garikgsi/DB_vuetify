<template>
  <div>
    <abp-simple-form
      v-model="inputValue"
      :dense="true"
      :title="`Редактируем SN ${inputValue.number}`"
      :model="model"
      :closable="false"
      :singleFieldRow="true"
      @submit="submit"
      @clickClose="close"
    >
      <template v-slot:buttons-right>
        <div>
          <v-btn color="secondary" text @click="close">
            Закрыть
          </v-btn>
        </div>
      </template>
    </abp-simple-form>
  </div>
</template>

<script>
import ABPSimpleFormVue from "./ABPSimpleForm.vue";

export default {
  name: "sn-form",
  components: {
    "abp-simple-form": ABPSimpleFormVue,
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
    // максимальное кол-во серийников
    kolvo: {
      type: [Number, String],
      required: false,
      default: 1,
    },
  },
  data() {
    return {
      oldData: this.inputValue,
    };
  },
  computed: {
    val() {
      return this.inputValue;
    },
    model() {
      let fields = [
        { name: "number", type: "string", title: "Серийный №", require: true },
        { name: "end_guarantee", type: "date", title: "Гарантия до" },
      ];
      if (this.kolvo > 1) {
        fields.push({
          name: "replace_guarantee",
          type: "boolean",
          title: "Заменить сроки гарантии у всех товаров поставки",
          default: true,
        });
      }
      return fields;
    },
  },
  methods: {
    close() {
      this.$emit("close");
    },
    submit() {
      this.$emit("submit", this.inputValue);
    },
  },
};
</script>

<style lang="scss" scoped></style>
