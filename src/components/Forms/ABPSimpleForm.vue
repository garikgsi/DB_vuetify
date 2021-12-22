<template>
  <div>
    <!-- {{model}} -->
    <!-- simple-form-values={{inputValue}} -->
    <!-- {{loadedFields}} || {{formLoaded}} -->
    <!-- {{ lazyField }} -->
    <!-- inputValue={{ inputValue }} -->
    <v-form
      v-model="formValid"
      :ref="formId"
      @submit.prevent="formSubmit"
      :id="formId"
      :dense="dense"
    >
      <v-card :disabled="formLoading || formDisabled">
        <v-card-title v-if="title || closable">
          <v-toolbar flat>
            <v-toolbar-title>{{ title }}</v-toolbar-title>
            <v-spacer></v-spacer>
            <slot name="after-title"></slot>
            <v-spacer></v-spacer>
            <abp-icon-button
              v-if="closable"
              icon="mdi-close"
              tip="Закрыть"
              @click="clickClose"
            ></abp-icon-button>
          </v-toolbar>
        </v-card-title>

        <v-card-text>
          <slot name="before-fields"></slot>
          <slot name="fields">
            <v-row dense>
              <template v-for="(field, index) in formModel">
                <v-col
                  cols="12"
                  :sm="fieldWidth(field, 'sm')"
                  :md="fieldWidth(field, 'md')"
                  :lg="fieldWidth(field, 'lg')"
                  :xl="fieldWidth(field, 'xl')"
                  :key="'field_' + field.name + '_' + index"
                  v-show="!isHidden(field)"
                >
                  <v-lazy v-model="lazyField[index]">
                    <abp-field
                      v-if="field"
                      :class="{ hidden: isHidden(field) }"
                      :id="`form_${formId}_field_${index}`"
                      v-model="values[field.name]"
                      :settings="field"
                      @startLoading="startLoading"
                      @endLoading="endLoading"
                      @loaded="fieldLoaded(field.name)"
                      @input="fieldInput(field.name, $event)"
                    ></abp-field>
                  </v-lazy>
                </v-col>
              </template>
            </v-row>
          </slot>
          <slot name="after-fields"></slot>
        </v-card-text>

        <div>
          <v-divider></v-divider>
          <v-card-actions class="my-2">
            <div v-if="buttons">
              <div
                v-for="(button, index) in buttons"
                :key="`forn_btn_${index}`"
              >
                <v-btn
                  v-if="button.type !== undefined && button.type == 'submit'"
                  type="submit"
                  :disabled="!formValid || disabledSubmitButton"
                  :dark="button.dark || false"
                  :color="button.color || 'primary'"
                  :loading="formLoading"
                  class="ma-2"
                >
                  {{ button.title }}
                </v-btn>
                <v-btn
                  v-else
                  :type="button.type !== undefined ? button.type : 'button'"
                  :dark="button.dark || false"
                  :color="button.color || 'primary'"
                  @click="emitClick(button.action || null)"
                  :disabled="formLoading"
                  class="ma-2"
                >
                  {{ button.title }}
                </v-btn>
              </div>
            </div>
            <slot name="buttons-left"></slot>
            <v-spacer></v-spacer>
            <slot name="buttons-right"></slot>
          </v-card-actions>
        </div>
      </v-card>
    </v-form>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import ABPIconButton from "../Form/ABPIconButton";

export default {
  name: "abp-simple-form",
  components: {
    "abp-field": () => import("../Form/ABPField.vue"),
    "abp-icon-button": ABPIconButton,
  },
  model: {
    prop: "inputValue",
    event: "input",
  },
  props: {
    inputValue: {
      type: Object,
      required: false,
    },
    title: {
      type: String,
      required: false,
    },
    // модель, как мы ее получаем из Laravel
    model: {
      type: Array,
      required: false,
    },
    buttons: {
      required: false,
      default() {
        return [{ type: "submit", title: "OK", color: "primary" }];
      },
    },
    loading: {
      type: Boolean,
      required: false,
      default: false,
    },
    id: {
      type: String,
      required: false,
    },
    closable: {
      type: Boolean,
      required: false,
      default: false,
    },
    // каждое поле занимает всю строку
    singleFieldRow: {
      type: Boolean,
      required: false,
      default: false,
    },
    // устанавливать фокус на первое поле
    setFocus: {
      type: Boolean,
      required: false,
      default: true,
    },
    // форма только для чтения
    readonly: {
      type: Boolean,
      required: false,
      default: false,
    },
    // без отступов
    dense: {
      type: Boolean,
      required: false,
      default: false,
    },
    // форма не активна
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    // кнопка сабмита не активна
    disabledSubmitButton: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      formValid: false,
      disableForm: false,
      currentRow: 0,
      lastFieldInRow: null,
      formId: null,
      loadedFields: [],

      lazyField: {},
    };
  },
  created() {
    // присвоим id форме
    if (this.id) {
      this.formId = this.id;
    } else {
      this.formId = `f${(~~(Math.random() * 1e8)).toString(16)}`;
    }
  },
  mounted() {
    if (this.formLoaded) {
      if (this.setFocus) this.focus();
      // установим тайтл
      this.setTitle(this.title);
    }
    // console.log('simple-form-mounted')
  },
  computed: {
    ...mapGetters(["isMobile"]),
    // форма неактивна
    formDisabled() {
      return this.disabled;
    },
    values: {
      get() {
        return this.inputValue;
      },
      set(val) {
        this.$emit("input", val);
      },
    },
    formModel() {
      if (this.model) {
        if (this.readonly) {
          return this.model.map((field) => {
            return { ...field, ...{ readonly: true } };
          });
        } else {
          return this.model;
        }
      }
      return null;
    },
    formLoading() {
      return this.disableForm || this.loading || false;
    },
    formLoaded() {
      try {
        return this.model.length == this.loadedFields.length;
      } catch (error) {
        return true;
      }
    },
  },
  methods: {
    ...mapActions(["setTitle"]),
    focus() {
      let input = document.querySelector(`#form_${this.formId}_field_0 input`);
      if (input) {
        input.focus();
      }
    },
    fieldLoaded(fieldName) {
      this.loadedFields.push(fieldName);
    },
    fieldInput(field, newVal) {
      this.values[field] = newVal;
      // console.log(
      //   `field=${JSON.stringify(
      //     field
      //   )} changed, fieldInput newVal=${JSON.stringify(
      //     newVal
      //   )}, values[field]=${JSON.stringify(this.values[field])}`
      // );
      // this.values = { ...this.values, ...{ [field]: newVal } };
      this.$emit("input", this.values);
    },
    emitClick(emitAction) {
      if (emitAction) {
        this.$emit("buttonClick", emitAction);
      }
    },
    clickClose() {
      this.$emit("clickClose");
    },
    formSubmit() {
      this.$emit("submit");
    },
    endLoading() {
      this.disableForm = false;
      this.$emit("endLoading");
    },
    startLoading() {
      this.disableForm = true;
      this.$emit("startLoading");
    },
    isHidden(field) {
      try {
        return (field.hidden && field.hidden == true) || field.type == "key";
      } catch (error) {
        return true;
      }
    },
    fieldWidth(field, size) {
      // коэффициент относительно xl
      let k = 1;
      // столбцов при экране xl - по умолчанию
      let xlSize = 2;
      // выходное количество столбцов
      let cols = null;
      // коэффициенты столбцов xl в зависимости от ширины экрана
      switch (size) {
        case "sm":
          {
            k = 3;
          }
          break;
        case "md":
          {
            k = 2;
          }
          break;
        case "lg":
          {
            k = 1.5;
          }
          break;
        case "xl":
          {
            k = 1;
          }
          break;
      }
      // если передано что каждое поле ввода в 1 строку - это имеет наивысший приоритет
      if (this.singleFieldRow) {
        cols = 12;
      } else {
        // если передано значение в field
        if (field.size) {
          switch (typeof field.size) {
            case "string":
            case "number":
              {
                xlSize = parseInt(field.size);
              }
              break;
            case "object":
              {
                // если передан размер для экрана
                if (field.size[size]) {
                  cols = field.size[size];
                }
                // если передан размер для xl
                else if (field.size.xl) {
                  xlSize = field.size.xl;
                }
              }
              break;
          }
        } else {
          // некоторые поля должны иметь свои размеры
          try {
            if (field.type) {
              switch (field.type) {
                case "morph":
                  {
                    cols = 12;
                  }
                  break;
                case "radio":
                  {
                    cols = 12;
                  }
                  break;
                case "textarea":
                  {
                    k *= 2;
                  }
                  break;
                case "pricequantityamount":
                  {
                    cols = 12;
                  }
                  break;
                case "text":
                  {
                    cols = 12;
                  }
                  break;
              }
            }
          } catch (error) {
            // defualy value return below
          }
        }
      }

      if (!cols) cols = Math.ceil(xlSize * k);

      return cols;
    },
  },
  watch: {
    formLoaded(newValue) {
      // после загрузки формы - фокус на 1-й инпут
      if (newValue) {
        if (!this.isMobile) this.focus();
        // let input = document.querySelector(`#form_${this.formId}_field_0 input`);
        // if (input) {
        //   input.focus();
        // } else {
        //   console.log(`couldn't find DOM element #form_${this.formId}_field_0 input`)
        // }
      }
    },
    formValid(valid) {
      this.$emit("validated", valid);
    },
    // values(newValue) {
    //     console.log(`watcher form triggered ${JSON.stringify(newValue)}`)
    //     this.$emit('input', newValue)
    // }
  },
};
</script>

<style lang="scss" scoped></style>
