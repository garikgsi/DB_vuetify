<template>
  <div v-if="inReactive">
    <!-- {{ inputValue }}, inputTable={{ inputTable }}, table={{ table }}, id={{
      id
    }} -->
    <!-- tableAppModel={{ tableAppModel }}, tables={{ tables }} -->
    <!-- inputValue = {{ inputValue }}, outputValue={{ outputValue }}, inReactive={{
      inReactive
    }} -->
    <!-- inReactive={{ inReactive }} typeInputComponent={{ typeInputComponent }}, -->
    <!-- typeItems={{ typeItems }} -->
    <component
      v-if="typeInputComponent"
      :is="typeInputComponent"
      class="morph-radio-input"
      :title="title"
      :items="typeItems"
      :require="required"
      :readonly="readonly || tableSelectorReadonly"
      v-model="inReactive[`${name}_type`]"
      dense
      @input="changeTable"
    ></component>
    <abp-select
      :title="typeInputComponent ? null : title"
      v-if="inReactive[`${name}_type`]"
      class="morph-select-input"
      :table="inReactive[`${name}_type`]"
      :required="required"
      :readonly="readonly"
      :clearable="false"
      v-model="inReactive[`${name}_id`]"
      :options="selectOptions"
      :choose-equal="false"
      :multiple="multiple"
      :with-chips="multiple"
      @input="changeVal"
    ></abp-select>
  </div>
</template>

<script>
import ABPSelect from "./ABPSelect.vue";
import RadioInput from "./RadioInput.vue";

export default {
  name: "morph-input",
  components: {
    "abp-select": ABPSelect,
    "radio-input": RadioInput,
  },
  model: {
    prop: "inputValue",
    event: "input",
  },
  props: {
    inputValue: {
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    tables: {
      type: Array,
      required: true,
    },
    title: {
      type: String,
      required: false,
      default: null,
    },
    hint: {
      type: String,
      required: false,
      default: null,
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
    clearable: {
      type: Boolean,
      required: false,
      default: true,
    },
    // без отступов - сжатый по высоте режим
    dense: {
      type: Boolean,
      required: false,
      default: false,
    },
    // выбор таблицы - только для чтения
    tableSelectorReadonly: {
      type: Boolean,
      required: false,
      default: false,
    },
    // множественный выбор
    multiple: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      loading: false,
      tablesLoaded: 0,
      table: this.inputTable,
      // текущая таблица (индикатор переключения пользователем)
      currentTable: this.inputTable,
      // id:
      //   this.inputValue[`${this.name}_id`] !== undefined
      //     ? this.inputValue[`${this.name}_id`]
      //     : 1,
    };
  },
  computed: {
    // опции выборки данных
    selectOptions() {
      return {
        page: 1,
      };
    },
    // значения передаваемые в переменную
    outputValue() {
      let res = {
        ...this.inputValue,
        ...{
          [`${this.name}_type`]: this.findModelbyTable(
            this.inReactive[`${this.name}_type`]
          ),
          [`${this.name}_id`]: this.inReactive[`${this.name}_id`]
            ? this.inReactive[`${this.name}_id`]
            : 1,
        },
      };
      return res;
    },
    inReactive: {
      get() {
        let res = {};
        if (this.inputValue) {
          try {
            if (this.inputValue[`${this.name}_type`])
              res[`${this.name}_type`] = this.findTableByModel(
                this.inputValue[`${this.name}_type`]
              );
          } catch (error) {
            // default table set
          }
          try {
            if (this.inputValue[`${this.name}_id`] !== undefined)
              res[`${this.name}_id`] = this.inputValue[`${this.name}_id`];
          } catch (error) {
            res[`${this.name}_id`] = null;
          }
          return res;
        } else {
          res[`${this.name}_id`] = null;
          res[`${this.name}_type`] = this.tables[0].table;
        }
        return res;
      },
      set(newVal) {
        // console.log(`new inReactive=${JSON.stringify(newVal)}`);
        let res = {};
        res[`${this.name}_type`] = this.findModelbyTable(
          newVal[[`${this.name}_type`]]
        );
        res[`${this.name}_id`] = newVal[`${this.name}_id`]
          ? newVal[`${this.name}_id`]
          : 1;
        // if (newVal[`${this.name}_type`] != this.inReactive[`${this.name}_type`])
        //   res[`${this.name}_id`] = 1;
        this.$emit("input", res);
      },
    },
    // таблица из переданных параметров или умолчальная для выборки из селекта (sotrudniks, kontragents, ...)
    inputTable() {
      try {
        return this.tables.find((table) => {
          // console.log(
          //   `this.name_type=${`${this.name}_type`}, type=${
          //     this.inputValue[`${this.name}_type`]
          //   }, table=${JSON.stringify(table)}`
          // );
          return table.type == this.inputValue[`${this.name}_type`];
        }).table;
      } catch (error) {
        // return default below
      }
      // return this.tables[0].table;
      return null;
    },
    // items-ы для компонента выбора таблицы
    typeItems() {
      return this.tables.map((table) => {
        return {
          text: table.title,
          id: table.table,
        };
      });
    },
    // компонент выбора таблицы
    typeInputComponent() {
      if (this.typeItems.length > 3) {
        // return ABPSelectInput;
        return ABPSelect;
      } else if (this.typeItems.length >= 1) {
        return RadioInput;
      }
      return null;
    },
  },
  methods: {
    // найдем Laravel-модель таблицы
    findModelbyTable(table) {
      try {
        return this.tables.find((t) => {
          return t.table == table;
        }).type;
      } catch (error) {
        // return default below
      }
      return null;
    },
    // найдем Laravel-модель таблицы
    findTableByModel(model) {
      try {
        return this.tables.find((t) => {
          return t.type == model;
        }).table;
      } catch (error) {
        // return default below
      }
      return null;
    },
    changeVal(newValue) {
      let res = {
        ...this.inputValue,
        ...{
          [`${this.name}_id`]: newValue,
        },
      };

      if (this.inReactive[`${this.name}_type`])
        res[`${this.name}_type`] = this.findModelbyTable(
          this.inReactive[`${this.name}_type`]
        );
      // console.log(`changed id to ${newValue}`);
      // console.log(`change val=${JSON.stringify(res)}`);

      this.$emit("input", res);
    },
    changeTable(newValue) {
      if (this.currentTable != newValue) {
        let res = {
          ...this.inputValue,
          ...{
            [`${this.name}_type`]: this.findModelbyTable(newValue),
            [`${this.name}_id`]: this.multiple ? [] : 1,
          },
        };

        // console.log(`changed table to ${newValue}`);
        // console.log(`change table=${JSON.stringify(res)}`);
        this.currentTable = newValue;
        this.$emit("input", res);
      } else {
        // console.log(`changed table from ${this.currentTable} to ${newValue}`);
      }
    },
  },
  watch: {
    // при изменении источника - выберем 1
    // table() {
    //   this.id = 1;
    // },
  },
  //["name"=>"transitable", "title"=>"Через кого", "type"=>"morph", "tables"=>[["table"=>"sotrudniks", "title"=>"Сотрудника", "type"=>"App\\Sotrudnik"],["table"=>"shipping_companies", "title"=>"Транспортную компанию", "type"=>"App\\ShippingCompany"]],"require"=>true],
};
</script>

<style lang="scss" scoped>
::v-deep {
  .morph-radio-input {
    .v-messages {
      display: none;
    }
  }
  .morph-select-input {
    .v-text-field {
      margin-top: 0;
    }
  }
}
</style>
