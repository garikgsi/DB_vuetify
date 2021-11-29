<template>
  <div>
    <!-- skladKeeper={{skladKeeper}} -->
    <!-- modelValue={{ modelValue }} -->
    <!-- buttons={{buttons}} -->
    <abp-form
      :model-value="modelValue"
      table="sklad_moves"
      :modType="modType"
      :id="id"
      :readonly="readonly"
      :modelMixin="modelMixin"
      :closable="false"
      @input="changeFormData($event)"
      @validated="formValidated($event)"
    >
      <template v-slot:buttons-left>
        <template v-if="buttons.length > 0">
          <v-btn
            v-for="(button, i) in buttons"
            :key="`button_${i}`"
            :disabled="!formValid"
            :color="button.color"
            class="mr-2"
            @click.stop="makeAction(button.action)"
          >
            {{ button.title }}
          </v-btn>
        </template>
        <template v-else>
          <v-btn :disabled="true" color="primary" class="mr-2">
            OK
          </v-btn>
        </template>
      </template>
    </abp-form>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import Vue from "vue";
import ABPFormVue from "./ABPForm.vue";

export default {
  name: "sklad-move-form",
  components: {
    "abp-form": ABPFormVue,
  },
  model: {
    prop: "modelValue",
    event: "input",
  },
  props: {
    modelValue: {
      type: Object,
      required: false,
      default() {
        return { items: [] };
      },
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
  },
  data() {
    return {
      validated: false,
      table: "sklad_moves",
      // значения формы
      // formValues: {...this.modelValue}
    };
  },
  computed: {
    ...mapGetters(["isKeeper", "skladKeeper", "isAdmin", "prevRoute"]),
    formValues: {
      get() {
        return this.modelValue;
      },
      set(newVal) {
        // return newVal
        this.$emit("input", newVal);
      },
    },
    formValid() {
      let valid = true;
      if (this.formValues.sklad_out_id == this.formValues.sklad_in_id) {
        valid = false;
      }
      return valid && this.validated;
    },
    modelMixin() {
      if (this.formValues) {
        let fields = {};
        fields.sklad_out_id = { name: "sklad_out_id" };
        fields.sklad_in_id = { name: "sklad_in_id" };

        // if (!this.isAdmin) {
        if (this.formValues.is_out || this.formValues.is_in) {
          fields.sklad_out_id = {
            ...fields.sklad_out_id,
            ...{ readonly: true },
          };
          fields.sklad_in_id = {
            ...fields.sklad_out_id,
            ...{ readonly: true },
          };
          // return [
          //     {name:'sklad_out_id', readonly:true},
          //     {name:'sklad_in_id', readonly:true},
          // ]
        } else {
          if (!this.isAdmin) {
            if (this.skladKeeper) {
              // уберем все склады из отправки, кроме тех, где он кладовщик
              fields.sklad_out_id = {
                ...fields.sklad_out_id,
                ...{ validItems: this.skladKeeper },
              };
              // уберем все склады из отправки, кроме тех, где он кладовщик
              fields.sklad_in_id = {
                ...fields.sklad_in_id,
                ...{ validItems: this.skladKeeper },
              };
            }
          }
        }
        // }
        let res = [];
        for (let field in fields) {
          res.push(fields[field]);
        }
      }
      return null;
    },
    readonly() {
      let res = true;
      if (this.formValues) {
        if (this.isAdmin) {
          res = false;
        } else {
          if (
            !this.formValues.is_in &&
            !this.formValues.is_out &&
            !this.formValues.is_active
          )
            res = false;
          if (
            !this.formValues.is_active &&
            !this.formValues.is_in &&
            this.skladKeeper.indexOf(parseInt(this.formValues.sklad_out_id)) !==
              -1
          )
            res = false;
        }
      }
      return res;
    },
    buttons() {
      if (this.formValues && Object.keys(this.formValues).length > 1) {
        let buttons = {
          saveButton: [
            { title: "ОК", color: "primary", action: "actionOK" },
            { title: "Сохранить", color: "primary", action: "actionSave" },
          ],
          unactiveButton: [
            {
              title: "Распровести и закрыть",
              color: "secondary",
              action: "actionMakeUnActive",
            },
          ],
          activeButton: [
            {
              title: "Провести и закрыть",
              color: "success",
              action: "actionMakeActive",
            },
          ],
          unoutButton: [
            {
              title: "Отменить отправку и закрыть",
              color: "secondary",
              action: "actionMakeUnOut",
            },
          ],
          outButton: [
            {
              title: "Отправить и закрыть",
              color: "success",
              action: "actionMakeOut",
            },
          ],
          uninButton: [
            {
              title: "Отменить получение и закрыть",
              color: "secondary",
              action: "actionMakeUnIn",
            },
          ],
          inButton: [
            {
              title: "Принять и закрыть",
              color: "success",
              action: "actionMakeIn",
            },
          ],
        };
        let btns = [];
        if (
          !this.formValues.is_out &&
          !this.formValues.is_out &&
          !this.formValues.is_active
        ) {
          if (btns.indexOf("saveButton") === -1) btns.push("saveButton");
        }
        if (this.formValues && (this.skladKeeper || this.isAdmin)) {
          if (this.isKeeper) {
            // в числе кладовщиков склада отправления
            if (
              this.skladKeeper.indexOf(
                parseInt(this.formValues.sklad_out_id)
              ) !== -1
            ) {
              if (this.formValues.is_in) {
                // уже принято на складе получения
              } else {
                // сохранять можно
                if (btns.indexOf("saveButton") === -1) btns.push("saveButton");
                // если отгружено
                if (this.formValues.is_out) {
                  // можно распровести
                  if (btns.indexOf("unoutButton") === -1)
                    btns.push("unoutButton");
                } else {
                  // можно провести
                  if (btns.indexOf("outButton") === -1) btns.push("outButton");
                }
              }
            }
            // в числе кладовщиков склада получения
            if (
              this.skladKeeper.indexOf(
                parseInt(this.formValues.sklad_in_id)
              ) !== -1
            ) {
              // уже отгружено
              if (this.formValues.is_out) {
                // если отгружено
                if (this.formValues.is_in) {
                  // можно распровести
                  if (btns.indexOf("uninButton") === -1)
                    btns.push("uninButton");
                } else {
                  // можно провести
                  if (btns.indexOf("inButton") === -1) btns.push("inButton");
                }
              } else {
                // еще не отгружено
              }
            }
          }
          if (this.isAdmin) {
            if (btns.indexOf("saveButton") === -1) btns.push("saveButton");
            if (this.formValues.is_active) {
              if (btns.indexOf("unactiveButton") === -1)
                btns.push("unactiveButton");
            } else {
              if (btns.indexOf("activeButton") === -1)
                btns.push("activeButton");
            }
          }
        }
        let res = [];
        btns.forEach((button) => {
          res = [...res, ...buttons[button]];
        });

        return res;
      }
      return [];
    },
    skladOut() {
      return this.formValues.sklad_out_id;
    },
    skladIn() {
      return this.formValues.sklad_in_id;
    },
  },
  methods: {
    ...mapActions(["setInformation", "setPost", "saveTableRow", "saveAndPost"]),
    changeFormData(newValue) {
      // console.log(`changed data in moveform = ${JSON.stringify(newValue)}`)
      // this.formValues = newValue
      let fieldValue = {};
      fieldValue.transitable_id = newValue.transitable_id
        ? newValue.transitable_id
        : 1;
      fieldValue.transitable_type = newValue.transitable_type
        ? newValue.transitable_type
        : null;
      if (this.modelValue.transitable) {
        newValue.transitable = fieldValue;
      } else {
        Vue.set(this.modelValue, "transitable", fieldValue);
      }
      this.$emit("input", newValue);
    },
    formValidated(isValid) {
      this.validated = isValid;
    },
    checkData() {
      if (this.skladOut == this.skladIn && this.skladOut > 1) {
        this.setInformation({
          color: "error",
          timeout: 5000,
          text: "Склад отправления и склад назначения идентичны",
        });
      }
    },
    makeAction(method) {
      switch (method) {
        case "actionOK":
          {
            this.save(true);
          }
          break;
        case "actionSave":
          {
            this.save();
          }
          break;
        case "actionMakeUnActive":
          {
            this.post({ is_active: 0 }, true, "Документ распроведен");
          }
          break;
        case "actionMakeActive":
          {
            this.post({ is_active: 1 });
          }
          break;
        case "actionMakeUnOut":
          {
            this.post({ is_out: 0 }, true, "Документ распроведен");
          }
          break;
        case "actionMakeOut":
          {
            this.post({ is_out: 1 });
          }
          break;
        case "actionMakeUnIn":
          {
            this.post({ is_in: 0 }, true, "Документ распроведен");
          }
          break;
        case "actionMakeIn":
          {
            this.post({ is_in: 1 });
          }
          break;
        default: {
          console.warn(`unknown method ${method}`);
        }
      }
    },
    save(close = false) {
      let data = { ...this.formValues };
      this.saveTableRow({
        table: this.table,
        modType: this.modType,
        values: data,
      }).then((response) => {
        if (close) {
          this.close();
        } else {
          if (response) {
            let newData = response;
            // console.log(`newData = ${JSON.stringify(newData)}`)
            this.changeFormData(newData);
            if (this.modType != "edit") {
              this.$router.replace({
                path: `/form/sklad_moves/edit/${newData.id}`,
              });
            }
          }
        }
      });
    },
    close() {
      // this.$router.push(this.prevRoute)
      this.$router.go(-1);
    },
    post(data, close = true, message = null) {
      if (this.readonly) {
        this.setPost({
          table: this.table,
          id: this.id,
          values: data,
          message: message,
        }).then((response) => {
          if (response.data.data) {
            let newData = response.data.data;
            this.changeFormData(newData);
            if (close) {
              this.close();
            }
          }
        });
      } else {
        this.saveTableRow({
          table: this.table,
          modType: this.modType,
          values: this.formValues,
        }).then((saveResponse) => {
          if (saveResponse) {
            let newId = saveResponse.id;
            this.setPost({
              table: this.table,
              id: newId,
              values: data,
              message: message,
            })
              .then((response) => {
                if (response) {
                  let newData = response.data.data;
                  this.changeFormData(response);
                  if (close) {
                    this.close();
                  } else {
                    if (this.modType != "edit")
                      this.$router.replace({
                        path: `/form/sklad_moves/edit/${newData.id}`,
                      });
                  }
                }
              })
              .catch(() => {
                if (saveResponse && this.modType != "edit") {
                  let newData = saveResponse;
                  this.changeFormData(newData);
                  if (this.modType != "edit")
                    this.$router.replace({
                      path: `/form/sklad_moves/edit/${newData.id}`,
                    });
                }
              });
          }
        });
      }
    },
  },
  watch: {
    skladOut() {
      this.checkData();
    },
    skladIn() {
      this.checkData();
    },
  },
};
</script>

<style lang="scss" scoped></style>
