<template>
  <div>
    <!-- ->{{val}} -->
    <!-- {{modelValue}} -->
    <v-stepper v-model="curStep">
      <!-- шапка -->
      <v-stepper-header>
        <div v-for="(step, i) in steps" :key="`step_header_${i}`">
          <v-stepper-step
            :editable="availableSteps.indexOf(i + 1) !== -1 && !stepperDisabled"
            :step="i + 1"
            :complete="step > i"
          >
            {{ step.title }}
          </v-stepper-step>
          <v-divider></v-divider>
        </div>
      </v-stepper-header>
      <!-- основная форма производства (кол-во, наименование, склад и т.д.) -->
      <v-stepper-items>
        <v-stepper-content :step="1">
          <abp-form
            v-model="val"
            :table="table"
            :mod-type="modType"
            :id="id"
            :with-sub-table="false"
            :with-close-button="false"
            :closable="false"
            :disabled="stepperDisabled"
            class="py-2"
            @validated="formValidated($event)"
            @loaded="ste1FormLoaded = true"
          >
            <template v-slot:buttons-left>
              <v-btn
                :disabled="!ste1FormLoaded || !formValid"
                color="primary"
                class="my-2"
                @click="save"
              >
                Далее
              </v-btn>
            </template>
          </abp-form>
        </v-stepper-content>
        <!-- проверки -->
        <v-stepper-content :step="2">
          <v-card :disabled="stepperDisabled">
            <v-card-text class="px-0">
              <abp-production-items-table
                :data="val"
              ></abp-production-items-table>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
              <v-btn @click="back">
                Назад
              </v-btn>
              <v-btn @click="save(true)">
                Сохранить и закрыть
              </v-btn>
              <v-btn @click="savePost" color="primary">
                Далее
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-stepper-content>
        <!-- результат -->
        <v-stepper-content :step="3">
          <v-card :disabled="stepperDisabled">
            <v-card-text>
              <production-result-table
                title="Результат производства"
                v-model="val"
              ></production-result-table>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
              <!-- кнопки -->
              <v-btn @click="back">
                Назад
              </v-btn>
              <!-- печать -->
              <v-menu top :close-on-click="true">
                <template v-slot:activator="{ on, attrs }">
                  <v-btn v-bind="attrs" v-on="on" class="menu-btn" primary>
                    печатная форма
                  </v-btn>
                </template>
                <v-list dense>
                  <v-list-item @click="openPdf">
                    <v-list-item-icon>
                      <v-icon>mdi-file-pdf</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      Открыть в PDF
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item @click="sendEmail">
                    <v-list-item-icon>
                      <v-icon>mdi-email-send</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      Отправить на email
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-card-actions>
          </v-card>
        </v-stepper-content>
      </v-stepper-items>
    </v-stepper>
    <v-row>
      <v-col class="d-flex align-end flex-column ma-4">
        <v-btn text @click.stop="closeAction">
          Закрыть
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import ABPProductionItemsTableVue from "../Tables/ABPProductionItemsTable.vue";
import ProductionResultTableVue from "../Tables/ProductionResultTable.vue";
import ABPFormVue from "./ABPForm.vue";

export default {
  name: "production-form",
  components: {
    "abp-form": ABPFormVue,
    "abp-production-items-table": ABPProductionItemsTableVue,
    "production-result-table": ProductionResultTableVue,
  },
  model: {
    prop: "modelValue",
    event: "input",
  },
  props: {
    modelValue: {
      type: Object,
      required: false,
    },
    id: {
      type: [Number, String],
      required: false, // if add
    },
    modType: {
      type: String,
      required: false,
      default: "add" /* copy, edit */,
    },
    title: {
      type: String,
      required: false,
    },
    // форма в модальном окне
    inDialog: {
      type: Boolean,
      required: false,
      default: false,
    },
    // открыть указанный шаг
    step: {
      type: [Number, String],
      required: false,
      default: 1,
    },
  },
  data() {
    return {
      // таблица
      table: "productions",
      // шаги производства
      steps: [
        { title: "Основные сведения" },
        { title: "Проверка остатков и замены" },
        { title: "Результат" },
      ],
      // первый шаг
      firstStep: 1,
      // текущий шаг
      curStep: this.step,
      // форма провалидирована
      formValid: false,
      // форма на 1-м шаге загружена
      ste1FormLoaded: false,
    };
  },
  computed: {
    ...mapGetters(["isLoading"]),
    // степпер недоступен
    stepperDisabled() {
      return this.isLoading;
    },
    // данные формы
    val: {
      get() {
        return this.modelValue;
      },
      set(newValue) {
        this.$emit("input", newValue);
      },
    },
    // количество шагов
    stepsCount() {
      return this.steps.length;
    },
    // последний шаг
    lastStep() {
      return this.stepsCount;
    },
    // это первый шаг?
    isFirstStep() {
      return this.curStep === this.firstStep;
    },
    // это последний шаг?
    isLastStep() {
      return this.curStep === this.lastStep;
    },
    // доступные шаги для перехода
    availableSteps() {
      let steps = [1];
      if (this.val.is_active == 1) {
        steps = [...steps, ...[2, 3]];
      }
      return steps;
    },
  },
  methods: {
    ...mapActions(["saveTableRow", "saveAndPost", "getPrintForm"]),
    // открыть печатную форму
    openPdf() {
      this.getPrintForm({ table: this.table, id: this.val.id }).then(
        (response) => {
          window.open(
            response,
            "_blank",
            `form_${this.table}_${this.val.id}_download`
          );
        }
      );
      // window.open(`/forms/${this.table}/${this.val.id}/pdf`,`form_${this.table}_${this.val.id}_download`)
    },
    // отправка на мыло
    sendEmail() {
      console.log("sending email...");
    },
    // переход к шагу
    gotoStep(step) {
      this.curStep = parseInt(step) + 1;
    },
    // переход к следующему шагу
    next() {
      if (!this.isLastStep) this.curStep = parseInt(this.curStep) + 1;
    },
    // переход к предыдущему шагу
    back() {
      if (!this.isFirstStep) this.curStep = parseInt(this.curStep) - 1;
    },
    // изменение валидации формы
    formValidated(isValid) {
      this.formValid = isValid;
    },
    // закрытие формы
    closeAction() {
      // если диалоговое окно
      if (this.inDialog) {
        this.$emit("closeForm");
      } else {
        // если роут
        // this.$router.push(this.prevRoute)
        this.$router.go(-1);
      }
    },
    // сохранение
    save(close = false) {
      let payload = {
        table: this.table,
        modType: this.modType,
        values: this.val,
      };
      // console.log(`payload is ${JSON.stringify(payload)}`)
      this.saveTableRow(payload).then((response) => {
        // let newInfo = response.data.data
        if (close === true) {
          this.closeAction();
        } else {
          if (this.modType == "edit") {
            this.next();
          } else {
            this.$router.replace({
              name: "form",
              params: {
                table: this.table,
                modType: "edit",
                id: response.id,
                params: {
                  step: this.isLastStep
                    ? this.step
                    : parseInt(this.curStep) + 1,
                },
              },
            });
          }
        }
      });
    },
    // сохраняем и проводим
    savePost() {
      let payload = {
        ...{ table: this.table, modType: this.modType, values: this.val },
        ...{ postValues: { is_active: 1 } },
      };
      this.saveAndPost(payload).then((response) => {
        // console.log(`ok`)
        this.val = response;
        this.next();
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.clickable-step {
  cursor: pointer;
}
.menu-btn {
  margin-left: 0.5rem;
}
.v-stepper__content {
  padding: 0 !important;
}
</style>
