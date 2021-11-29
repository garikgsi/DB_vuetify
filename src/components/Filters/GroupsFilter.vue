<template>
  <div>
    <abp-select
      :disabled="!groupsLoaded"
      :loading="!groupsLoaded"
      :inputValue="inputValue"
      :dataArray="groups"
      title="Фильтр по группам"
      item-text="tag"
      item-value="tag_id"
      :editable="false"
      :disable-params="true"
      multiple
      with-chips
      @input="changeInput($event)"
    ></abp-select>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import ABPSelectVue from "../Form/ABPSelect.vue";

export default {
  name: "groups-filter",
  components: {
    "abp-select": ABPSelectVue,
  },
  model: {
    prop: "inputValue",
    event: "input",
  },
  props: {
    inputValue: {
      required: true,
    },
    table: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      groupsLoaded: false,
    };
  },
  created() {
    // подгрузим список групп
    this.getGroups(this.table).then(() => {
      this.groupsLoaded = true;
    });
  },
  computed: {
    groups() {
      if (this.$store.state.groups.groups[this.table]) {
        return this.$store.state.groups.groups[this.table];
      } else {
        return [];
      }
    },
  },
  methods: {
    ...mapActions(["getGroups"]),
    changeInput(newValue) {
      this.$emit("input", newValue);
    },
  },
};
</script>

<style lang="scss" scoped></style>
