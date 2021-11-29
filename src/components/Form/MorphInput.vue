<template>
  <div>
    <component
      :is="typeInputComponent"
      class="morph-radio-input"
      :title="title"
      :items="typeItems"
      :require="required"
      :readonly="readonly"
      v-model="table"
      dense
      @input="tableChanged($event)"
    ></component>
    <abp-select-input
      v-if="table"
      class="morph-select-input"
      :table="table"
      :required="required"
      :readonly="readonly"
      :clearable="false"
      v-model="id"
      :options="selectOptions"
    ></abp-select-input>
  </div>
</template>

<script>
import ABPSelectInput from "./ABPSelectInput.vue";
import RadioInput from "./RadioInput.vue";

export default {
  name: "morph-input",
  components: {
    "abp-select-input": ABPSelectInput,
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
  },
  data() {
    return {
      loading: false,
      tablesLoaded: 0,
    };
  },
  computed: {
    // опции выборки данных
    selectOptions() {
      return {
        page: 1,
      };
    },
    dataLoaded() {
      return this.tablesLoaded == this.typeItems.length;
    },
    id: {
      get() {
        if (this.inputValue[`${this.name}_id`])
          return this.inputValue[`${this.name}_id`];
        else return 1;
      },
      set(newValue) {
        let res = { ...this.inputValue };
        // this.tables.forEach(table => {
        //     if (table.table == this.table) {
        //         morphType = table.type
        //     }
        // })
        // if (morphType) res[`${this.name}_type`] = morphType
        res[`${this.name}_id`] = newValue;
        this.$emit("input", res);
      },
    },
    table: {
      get() {
        if (
          this.inputValue &&
          this.inputValue[`${this.name}_type`] !== undefined
        ) {
          let res = null;
          this.tables.forEach((table) => {
            if (table.type == this.inputValue[`${this.name}_type`]) {
              res = table.table;
            }
          });
          return res;
        }
        return null;
      },
      set(newTable) {
        // console.log(`computed new table ${newTable}`)
        let morphType = null;
        this.tables.forEach((table) => {
          if (table.table == newTable) {
            morphType = table.type;
          }
        });
        let res = { ...this.inputValue };
        // console.log(`res is ${morphType}`)
        if (morphType) {
          res[`${this.name}_id`] = 1;
          res[`${this.name}_type`] = morphType;
          this.$emit("input", res);
        }
      },
    },
    typeItems() {
      return this.tables.map((table) => {
        return {
          text: table.title,
          id: table.table,
        };
      });
    },
    typeInputComponent() {
      if (this.typeItems.length > 3) {
        return ABPSelectInput;
      } else {
        return RadioInput;
      }
    },
  },
  methods: {
    tableChanged(/*newTable*/) {
      //   console.log(`radio-input changed to ${newTable}`);
    },
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
