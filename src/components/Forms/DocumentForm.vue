<template>
  <div>
    <!-- form values = {{values}} -->
    <!-- {{subTableItems}} -->
    <abp-form
      v-model="values"
      :table="table"
      :id="142"
      modType="edit"
      :closable="false"
    ></abp-form>
  </div>
</template>

<script>
import ABPForm from "./ABPForm";

export default {
  name: "document-form",
  components: {
    "abp-form": ABPForm,
  },
  props: {
    id: {
      type: Number,
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
      values: {},
      table: "sklad_receives",
    };
  },
  computed: {
    // headers() {
    //     let headers = this.subTableModel.filter(field=>{
    //         return field.show_in_table
    //     }).map(field=>{
    //         return {text: field.title, value: field.name, sortable: false, type:field.type, table:field.table ? field.table : null}
    //     })
    //     headers.unshift({text:'№ п/п', value:'n',sortable:false})
    //     headers.push({text:'', value:'actions',sortable:false})
    //     return headers
    // },
  },
  methods: {},
};
</script>

<style lang="scss" scoped></style>
