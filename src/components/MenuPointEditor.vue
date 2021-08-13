<template>
  <div>
    <v-tabs v-model="active_tab" v-if="treeNodeSelected">
      <v-tab>Раздел</v-tab>
      <v-tab :disabled="!menuPointListable">Контент</v-tab>
      <v-tab-item>
        <div v-if="treeNodeSelected">
          <!-- <menu-point-form></menu-point-form> -->
          <abp-form
            v-model="menuPoint"
            table="site_menu_points"
            :modType="modType"
            @submit="formSaved"
          ></abp-form>
        </div>
        <div v-else>
          Выберите раздел сайта для редактирования, создания или удаления
        </div>
      </v-tab-item>
      <v-tab-item :disabled="!menuPointListable">
        <!-- <site-content></site-content> -->
        <abp-table
          table="site_contents"
          title="Контент раздела"
          :modelMixin="tableModelMixin"
          :keyModel="keyModel"
        ></abp-table>
      </v-tab-item>
    </v-tabs>
    <!-- <menu-point-form v-else @form-saved="formSaved"></menu-point-form> -->
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import ABPForm from "./Forms/ABPForm.vue";
import ABPTable from "./Tables/ABPTable.vue";

export default {
  components: {
    "abp-form": ABPForm,
    "abp-table": ABPTable,
  },
  data() {
    return {
      removeConfirmed: false,
      createNewMenuPoint: false,
    };
  },
  created() {},
  methods: {
    formSaved() {
      this.$emit("form-saved");
    },
  },
  computed: {
    ...mapState(["curMenuPoint"]),
    ...mapGetters([
      "menuPointListable",
      "menuPointId",
      "parentMenuPointId",
      "isError",
      "error",
      "icons",
      "isLoading",
      "treeNodeSelected",
    ]),
    active_tab: {
      get() {
        return this.$store.state.activeTab;
      },
      set(v) {
        this.$store.dispatch("setActiveTab", v);
      },
    },
    isMenuPointSelected() {
      return this.curMenuPoint.id > 1;
    },
    menuPoint: {
      get() {
        return this.curMenuPoint;
      },
      set(v) {
        this.$store.dispatch("setCurMenuPoint", v);
      },
    },
    modType() {
      if (this.curMenuPoint.id > 0) {
        return "edit";
      } else {
        return "add";
      }
    },
    keyModel() {
      if (this.curMenuPoint.id > 0) {
        return [{ menu_point_id: this.curMenuPoint.id }];
      }
      return [{ menu_point_id: null }];
    },
    tableModelMixin() {
      return [
        { name: "name", title: "Раздел" },
        { name: "comment", show_in_table: false },
        { name: "content", show_in_table: false },
        { name: "preview", show_in_table: false },
        { name: "index_page_text", show_in_table: false },
        { name: "meta_title", show_in_table: false },
        { name: "meta_keywords", show_in_table: false },
        { name: "meta_description", show_in_table: false },
        {
          name: "menu_point_id",
          show_in_table: false,
          default: this.curMenuPoint.id,
        },
      ];
    },
  },
};
</script>
