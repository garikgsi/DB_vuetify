<template>
  <div>
    <!-- {{ val }} -->
    <abp-simple-form
      v-if="stateLoaded"
      v-model="val"
      :title="title"
      :closable="false"
      :model="formModel"
      @submit="submit"
      @clickClose="close"
    >
    </abp-simple-form>
    <!-- виджет ожидания загрузки -->
    <abp-waiting-message v-else :loading="true">
      Идет начальная инициализация. Это не должно занять много времени...
    </abp-waiting-message>

    <!-- диалог подтверждения замены -->
    <abp-confirm
      v-model="showDialog"
      title="Такой компонент уже существует"
      :text="confirmText"
      width="auto"
      @confirmPress="withReplace"
    ></abp-confirm>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import ConfirmVue from "../Dialogs/Confirm.vue";
import ABPWaitingMessageVue from "../Info/ABPWaitingMessage.vue";
import ABPSimpleFormVue from "./ABPSimpleForm.vue";

export default {
  name: "production-component-form",
  components: {
    "abp-simple-form": ABPSimpleFormVue,
    "abp-waiting-message": ABPWaitingMessageVue,
    "abp-confirm": ConfirmVue,
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
    // тайтл
    title: {
      type: String,
      required: false,
    },
    // существующая номенклатура
    existedNomenklatura: {
      type: Array,
      required: false,
      default() {
        return [];
      },
    },
    // исключить из списка номенклатуры
    exceptItems: {
      type: Array,
      required: false,
    },
    // тип изменения данных
    modType: {
      type: String,
      required: false,
      default: "add",
    },
  },
  data() {
    return {
      // состояние таблицы номенклатур загружено
      stateLoaded: false,
      // отображение диалога подтверждения замены
      showDialog: false,
    };
  },
  created() {
    if (this.$store.state.table.selectData.nomenklatura) {
      this.$emit("loaded");
      this.stateLoaded = true;
    } else {
      this.getSelectData({ table: "nomenklatura" }).then(() => {
        this.$emit("loaded");
        this.stateLoaded = true;
      });
    }
  },
  computed: {
    val: {
      get() {
        return this.inputValue;
      },
      set(newValue) {
        this.$emit("input", newValue);
      },
    },
    // номенклатура
    nomenklaturaData() {
      return this.$store.state.table.selectData.nomenklatura || [];
    },
    // модель (поля ввода)
    formModel() {
      let fields = [
        {
          name: "nomenklatura_id",
          type: "select",
          table: "nomenklatura",
          title: "Компонент",
          require: true,
          exceptItems: this.exceptItems,
        },
        { name: "kolvo", type: "kolvo", title: "Количество", require: true },
      ];
      if (this.val.production_item_id == undefined) {
        fields.push({
          name: "kolvo_per_one",
          type: "boolean",
          title: "Указано количество на 1 единицу выпускаемого продукта",
        });
      }
      return fields;
    },
    // текст в конфирме
    confirmText() {
      if (this.val.production_item_id) {
        return "Хотите заменить компонент переданными данными?";
      } else {
        return "Хотите заменить компонент во всех изделиях этого производства переданными данными?";
      }
    },
  },
  methods: {
    ...mapActions(["getSelectData", "searchInSelect"]),
    // сабмит формы
    submit() {
      // если редактирование - не надо подтверждать замену существующей номенклатуры
      if (this.modType == "edit") {
        this.val.with_replace = true;
      }
      // если номенклатура новая или замена существующей подтверждена
      if (
        this.val.with_replace ||
        this.existedNomenklatura.indexOf(this.val.nomenklatura_id) === -1
      ) {
        // получим наименование номенклатуры
        this.searchInSelect({
          table: "nomenklatura",
          id: this.val.nomenklatura_id,
        }).then((nomenklaturaFromCache) => {
          // console.log(
          //   `found nomenklaturaFromCache=${JSON.stringify(
          //     nomenklaturaFromCache
          //   )}`
          // );
          // изменяем значение
          this.$emit("input", {
            ...this.val,
            ...{
              // nomenklatura:this.findNomenklatura(this.val.nomenklatura_id)
              nomenklatura: nomenklaturaFromCache.select_list_title,
            },
          });
          this.$emit("submit");
        });
        // .catch((e) => {
        //   console.log(`e=${JSON.stringify(e)}`);
        // });
      } else {
        // вызываем диалог подтверждения замены
        this.showDialog = true;
      }
    },
    close() {
      this.$emit("close");
    },
    // сохраняем с заменой
    withReplace() {
      this.val.with_replace = true;
      this.showDialog = false;
      this.submit();
    },
    // поищем номенклатуру по id
    findNomenklatura(id) {
      let findRes = this.nomenklaturaData.find((item) => {
        return item.id === id;
      });
      return findRes ? findRes.select_list_title : null;
    },
  },
};
</script>

<style lang="scss" scoped></style>
