<template>
  <div>
    <v-autocomplete
      v-if="isLoadComplete"
      :value="stepValue"
      :label="title"
      :hint="stepTitle"
      :disabled="isDisabled"
      persistent-hint
      :items="stepData"
      :item-value="itemValue"
      :item-text="itemText"
      :loading="isLoading"
      :search-input.sync="search"
      :placeholder="stepPlaceholder"
      :rules="rules"
      :readonly="readonly"
      @input="change($event)"
      @focusout="clearSearch"
      @focus="checkData"
    >
      <template v-slot:selection v-if="!isDataLoaded">
        <span>
          Загружаются данные...
        </span>
      </template>

      <!-- <template v-slot:prepend>
                <slot name="prepend">
                    <v-icon
                        v-if="isLoadComplete && stepsComplete && stepValue>1"
                        :color="progressColor"
                    >mdi-check-all</v-icon>
                    <v-progress-circular
                        v-else
                        :value="curPercent"
                        :color="progressColor"
                        :radius="15"
                    ></v-progress-circular>
                </slot>
            </template> -->

      <template v-slot:prepend-item>
        <v-list-item>
          <v-list-item-icon>
            <abp-icon-button
              :disabled="step == 0"
              icon="mdi-chevron-left"
              :tip="changeParentTitle"
              :disable-tab="true"
              @click="subStep"
            ></abp-icon-button>
          </v-list-item-icon>
          <v-list-item-content>
            <template v-if="step > 0">
              {{ changeParentTitle }}
            </template>
            <template v-else>
              {{ stepTitle }}
            </template>
          </v-list-item-content>
          <!-- <v-list-item-icon>
                        <v-btn :disabled="step!=stepsCount" icon><v-icon>mdi-plus-circle-outline</v-icon></v-btn>
                    </v-list-item-icon> -->
        </v-list-item>
        <v-divider></v-divider>
      </template>

      <template v-slot:append>
        <slot name="append">
          <abp-icon-button
            v-if="clearable"
            :disabled="!isClearable"
            icon="mdi-close"
            tip="Очистить"
            :disable-tab="true"
            @click="clear()"
          ></abp-icon-button>
        </slot>
      </template>
    </v-autocomplete>
    <v-text-field
      v-else
      :label="title"
      placeholder="Идет начальная загрузка данных..."
      :loading="true"
      :disable="true"
      hint="подождите пока загрузятся данные"
      :persistent-hint="true"
    >
      <template v-slot:append>
        <slot name="append">
          <abp-icon-button
            v-if="clearable"
            :disabled="true"
            icon="mdi-close"
            tip="Очистить"
            :disable-tab="true"
          ></abp-icon-button>
        </slot>
      </template>
    </v-text-field>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import ABPIconButtonVue from "./ABPIconButton.vue";
export default {
  name: "abp-foreign-input",
  components: {
    "abp-icon-button": ABPIconButtonVue,
  },
  model: {
    prop: "inputValue",
    event: "input",
  },
  props: {
    // конечное значение
    inputValue: {
      type: [Number, String],
      required: true,
      default: 1,
    },
    // структура из модели поля
    // structure: [
    //     {table:'nomenklatura', title:'изделие'},
    //     {table:'recipes', title:'рецептуру',key:'nomenklatura_id'}
    // ],
    structure: {
      type: Array,
      required: true,
    },
    clearable: {
      type: Boolean,
      required: false,
      default: true,
    },
    readonly: {
      type: Boolean,
      required: false,
      default: false,
    },
    required: {
      type: Boolean,
      required: false,
      default: false,
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    title: {
      type: String,
      required: false,
      default: "",
    },
    hint: {
      type: String,
      required: false,
      default: "",
    },
    color: {
      type: String,
      required: false,
      default: "primary",
    },
    itemValue: {
      type: String,
      required: false,
      default: "id",
    },
    itemText: {
      type: String,
      required: false,
      default: "select_list_title",
    },
  },
  data() {
    return {
      // текущий шаг
      step: 0,
      // значение текущего шага
      stepValue: 1,
      // данные шага
      stepData: [],
      // опции получения даннах для шага
      stepDataOptions: {},
      // значения в структуре {0:552, 1:43, 2:1}
      val: {},
      // дата загружена
      isDataLoaded: false,
      // инпут загружен
      isLoadComplete: false,
      // поисковая фраза
      search: null,
      //   загрузка
      isSearchLoading: false,
      //   поиск на шаге
      stepsSearch: {},
    };
  },
  async created() {
    // значение последнего шага
    let lastStep = parseInt(this.stepsCount) - 1;
    // наполним значениями val и установим шаг
    if (parseInt(this.inputValue) > 1) {
      let keyVal = null;
      for (let step = lastStep; step >= 0; step--) {
        this.step = step;
        let stepTable = this.structure[step];
        // текущее значение шага
        let val = null;
        // если шаг = последний значение шага берем из значения поля ввода
        if (step === lastStep) {
          val = this.inputValue;
        } else {
          // если есть значение из предыдущего шага - используем его в качестве значения текущего
          if (keyVal) {
            val = keyVal;
          }
        }
        // параметры получения данных
        let dataOptions = {};
        // фильтры для получения данных (указываем id и ключевое поле, если есть)
        if (val) {
          dataOptions.fields = ["id", "select_list_title"];
          dataOptions.id = val;
          // дополнительные поля - если описано ключевое поле
          if (stepTable.key != undefined) {
            dataOptions.fields.push(stepTable.key);
          }
        }
        // получаем данные
        await this.getData(dataOptions).then((data) => {
          if (val && data[0] != undefined) {
            // получим всю строку
            let item = data[0];
            // установим значение шага в массиве val
            this.val[step] = { id: val, title: item.select_list_title };
            // обнулим предыдущие значения из подчиненной таблицы
            keyVal = null;
            // если указано ключевое поле в описании - укажем его как значение предыдущего шага
            if (
              stepTable.key != undefined &&
              item[stepTable.key] != undefined
            ) {
              keyVal = item[stepTable.key];
            }
          }
        });
      }
      // устанавливаем последний шаг
      this.step = lastStep;
      // загружаем данные для шага
      await this.getData();
      // устанавливаем значение шага
      this.stepValue = this.inputValue;
      // инпут загружен
      this.$emit("loaded");
      this.isLoadComplete = true;
    } else {
      // значение не установлено
      for (let step = 0; step < this.stepsCount; step++) {
        // устанавливаем значение для шага
        this.val[step] = { id: 1, title: null };
      }
      // устанавливаем шаг = 0
      this.step = 0;
      // получаем данные
      this.getData().then(() => {
        // инпут загружен
        this.$emit("loaded");
        this.isLoadComplete = true;
      });
    }
  },
  computed: {
    ...mapGetters(["selectDataLimit"]),
    // всего шагов
    stepsCount() {
      return this.structure.length;
    },
    // текущий процент заполнения
    curPercent() {
      let step = parseInt(this.step);
      if (step == 0) {
        return 0;
      } else {
        let count = parseInt(this.stepsCount);
        if (count == 0) {
          return 0;
        } else {
          return (step / count) * 100;
        }
      }
    },
    // цвет прогресс-спинера
    progressColor() {
      if (this.curPercent < 0.25) {
        return "red";
      } else if (this.curPercent < 0.5) {
        return "orange";
      } else if (this.curPercent < 0.75) {
        return "blue";
      } else {
        return "green";
      }
    },
    // все шаги пройдены
    stepsComplete() {
      return this.step + 1 == this.stepsCount;
    },
    // таблица шага
    stepTable() {
      return this.structure[this.step].table;
    },
    // заголовок шага
    stepTitle() {
      let title = "Выберите ";
      if (this.structure[this.step].title !== undefined) {
        title += `${this.structure[this.step].title} ${
          this.prevStepValText != "" ? `для ${this.prevStepValText}` : ``
        }`;
      } else {
        title += "одно из значений";
      }
      return title;
    },
    // тайтл изменения позиции родителя
    changeParentTitle() {
      return `Изменить ${this.prevStepTitle} ${this.prevStepValText}`;
    },
    // плейсхолдер теккущего шага
    stepPlaceholder() {
      if (this.isDataLoaded) {
        return this.stepTitle;
      } else {
        if (this.step > 0) {
          return `Подождите, загружаются данные для ${this.prevStepValText}`;
        } else {
          return `Подождите, загружаются данные`;
        }
      }
    },
    // тайтл таблицы предыдущего шага
    prevStepTitle() {
      if (this.step > 0) {
        let prevStep = parseInt(this.step) - 1;
        if (this.structure[prevStep].title !== undefined) {
          return this.structure[prevStep].title;
        }
      }
      return "";
    },
    // тайтл значения предыдущего шага
    prevStepValText() {
      if (this.step > 0) {
        let prevStep = parseInt(this.step) - 1;
        if (this.val[prevStep] !== undefined && this.val[prevStep].title) {
          return this.val[prevStep].title;
        }
      }
      return "";
    },
    // ключевое поле модели
    stepKeyField() {
      if (this.structure[this.step].key !== undefined) {
        return this.structure[this.step].key;
      }
      return null;
    },
    // опции извлечения данных
    stepOptions() {
      let prevStep = parseInt(this.step) - 1;
      if (
        this.stepKeyField &&
        this.step > 0 &&
        this.val[prevStep] != undefined
      ) {
        let keyModel = {};
        keyModel[this.stepKeyField] = this.val[prevStep].id;
        return { keyModel: [keyModel] };
      }
      return null;
    },
    // значение инпута выбрано
    isVal() {
      return this.stepsComplete && this.stepValue > 1;
    },
    // отображение загрузки
    isLoading() {
      return !this.isDataLoaded;
    },
    // активна кнопка очистить
    isClearable() {
      return this.isVal && this.clearable && !this.readonly;
    },
    // компонент неактивен
    isDisabled() {
      // return this.disabled;
      return this.disabled || !this.isDataLoaded || this.isSearchLoading;
    },
    // проверка заполнения поля
    rules() {
      if (this.required) {
        return [(v) => (!!v && this.isVal) || this.stepTitle];
      } else {
        return [true];
      }
    },
  },
  methods: {
    ...mapActions(["getForeignSelectData", "getSelectData"]),
    // проверяем данные при фокусе
    checkData() {
      // если в сохраненных опциях была поисковая фраза, а сейчас null - обновим данные
      try {
        if (this.stepDataOptions[this.step].search) {
          this.getData();
        }
      } catch (error) {
        // nothing to do
      }
    },
    // очищаем поиск
    clearSearch() {
      this.stepsSearch[this.step] = null;
      // console.log(`clear search for step=${this.step}`);
    },
    // получение данных шага
    async getData(getOptions = {}) {
      return new Promise((resolve, reject) => {
        // console.log(`options=${JSON.stringify(options)}`);
        // console.log(`structure=${JSON.stringify(this.structure)}`);
        // console.log(`step=${this.step}`);
        // console.log(`search=${this.search}`);

        this.stepData = [];
        let stepSet = this.structure[this.step];
        let { table } = stepSet;
        let options = {
          odata: "list",
          limit: this.selectDataLimit,
          extensions: ["select_list_title"],
          search: this.stepsSearch[this.step],
          ...this.stepOptions,
          ...getOptions,
        };
        // сохраним состояние опций получения данных для шага
        this.stepDataOptions[this.step] = { ...options };
        // получаем данные
        this.getForeignSelectData({ table, options })
          .then((data) => {
            this.stepData = data;
            this.isDataLoaded = true;
            // выберем единственную запись
            if (data.length == 1) {
              //   console.log(`id1=${data[0].id}`);

              this.stepData = data.map((item) => {
                return {
                  id: item.id,
                  select_list_title: item.select_list_title,
                };
              });
              this.change(data[0].id);
              //   this.stepValue = data[0].id;
            }

            resolve(data);
          })
          .catch((e) => {
            reject(e);
          })
          .finally(() => {
            this.search = null;
          });
      });

      //   return new Promise((resolve, reject) => {
      //     console.log(`step=${this.step}`);
      //     if (this.step == 0) {
      //       console.log(`select`);
      //       this.getSelectData(this.stepTable).then((data) => {
      //         this.stepData = data;
      //       });
      //     } else {
      //       console.log(`new data`);
      //       let newData = [];
      //       this.stepData = [];
      //       this.isDataLoaded = false;
      //       this.getForeignSelectData({
      //         table: this.stepTable,
      //         options: {
      //           ...this.stepOptions,
      //           ...options,
      //         },
      //       })
      //         .then((data) => {
      //           newData = data;
      //           if (data.length == 1) {
      //             this.change(data[0].id);
      //           }
      //           resolve(data);
      //         })
      //         .catch((e) => {
      //           reject(e);
      //         })
      //         .finally(() => {
      //           this.isDataLoaded = true;
      //           this.stepData = newData;
      //         });
      //     }
      //   });
    },
    // изменение значения текущего шага
    change(newValue) {
      //   очищаем поиск
      this.search = null;
      if (newValue) {
        // console.log(
        //   `this.stepsComplete=${this.stepsComplete}, step=${this.step}`
        // );
        // присвоим значение шага переменной шага
        this.stepValue = newValue;
        // изменим значение в переменной val
        this.val[this.step] = {
          id: newValue,
          title: this.getDataTitle(newValue),
        };
        // если шаг последний - отправим изменения в инпут
        if (this.stepsComplete) {
          this.$emit("input", newValue);
        } else {
          // если шаг не последний
          // вычислим следующий шаг
          let newStep = parseInt(this.step) + 1;
          // если такой шаг описан в структуре
          if (this.structure[newStep] !== undefined) {
            // меняем переменную шага на неопределенную
            this.stepValue = 1;
            // апдейтим следующий шаг
            this.step = newStep;
            // обновляем данные
            this.getData();
          }
        }
      }
    },
    // переход к предыдущему шагу
    subStep() {
      //   this.change(this.step--);
      // вычислим предыдущий шаг
      let prevStep = parseInt(this.step) - 1;
      // если такой шаг описан в структуре
      if (this.structure[prevStep] !== undefined) {
        // изменим значение в переменной val
        this.val[this.step] = { id: 1, title: null };
        // присвоим значение шага переменной предыдущего шага
        this.stepValue = 1;
        // апдейтим предыдущий шаг
        this.step = prevStep;
        // обновляем данные
        this.getData();
        // отправим изменения в инпут
        this.$emit("input", 1);
      }
    },
    // очистка значения
    clear() {
      //   this.step = 0;
      //   this.change(0);
      // значение последнего шага
      let lastStep = parseInt(this.stepsCount) - 1;
      for (let step = lastStep; step >= 0; step--) {
        // очистим значение шага
        this.val[step] = { id: 1, title: null };
      }
      // установим шаг = 0
      this.step = 0;
      // присвоим значение шага переменной =1
      this.stepValue = 1;
      //   очистим поиск
      this.stepsSearch = {};
      // получим данные
      this.getData();
      // отправим изменения в инпут
      this.$emit("input", 1);
    },
    // поиск строки по id
    getDataItem(id) {
      let item = this.stepData.find((item) => {
        return item.id == id;
      });
      return item;
    },
    // поиск тайтла выбранного итемса по айди
    getDataTitle(id) {
      let item = this.getDataItem(id);
      return item ? item[this.itemText] : null;
    },
  },
  watch: {
    search(val) {
      if (val) {
        if (val.length > 2) {
          setTimeout(() => {
            if (!this.isSearchLoading) {
              this.stepsSearch[this.step] = val;
              //   console.log(`run search with val=${val}`);
              this.isSearchLoading = true;
              this.getData().then(() => {
                this.isSearchLoading = false;
              });
            }
          }, 1500);
        }
      }
      return;
    },
  },
};
</script>

<style lang="scss" scoped></style>
