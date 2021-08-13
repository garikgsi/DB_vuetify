<template>
  <div>
    <v-app>
      <v-snackbar v-model="errState">{{ error }}</v-snackbar>
      <!-- <abp-table
            table="banks"
            title="Справочник банков"
            :selectable=false
            @startLoading="startLoading"
            @endLoading="endLoading"
        ></abp-table> -->

      <div v-if="!user">Подождите, мы проверяем ваши данные...</div>
      <div v-else>
        <v-card>
          <v-toolbar color="red darken-4" dark>
            <v-toolbar-title class="headline">
              Структура сайта
            </v-toolbar-title>
            <v-spacer></v-spacer>

            <confirm
              :disabled="!isMenuPointRemovable"
              title="Действительно удалить раздел?"
              text="Удаление будет произведено безвозвратно со всеми подразделами и файлами"
              @confirmPress="removeMenuPoint"
            >
              <v-btn icon :disabled="!isMenuPointRemovable">
                <v-icon x-large>{{ icons.delete }}</v-icon>
              </v-btn>
            </confirm>

            <v-btn icon :disabled="!isMenuPointAddable && treeNodeSelected">
              <v-icon x-large @click="addNewMenuPoint">{{ icons.add }}</v-icon>
            </v-btn>
          </v-toolbar>
          <v-container>
            <v-row justify="space-between">
              <v-col cols="4">
                <site-tree></site-tree>
              </v-col>
              <v-divider vertical></v-divider>
              <v-col class="d-flex text-center">
                <menu-point-editor
                  @form-saved="contentSaved"
                ></menu-point-editor>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </div>
      <v-overlay :value="isLoading">
        <v-progress-circular indeterminate size="64"></v-progress-circular>
      </v-overlay>
    </v-app>
  </div>
</template>

<script>
import Services from "../siteAdminServices.js";
import { mapState, mapGetters } from "vuex";
import SiteTree from "./SiteTree.vue";
import MenuPointEditor from "./MenuPointEditor.vue";
import Confirm from "./Dialogs/Confirm.vue";

export default {
  components: {
    "site-tree": SiteTree,
    "menu-point-editor": MenuPointEditor,
    confirm: Confirm,
  },
  data() {
    return {
      removeConfirmed: false,
      createNewMenuPoint: false,
    };
  },
  created() {
    Services.init();
    this.$store.dispatch("setTitle", "Админка сайта");
  },
  methods: {
    showFiles() {
      if (this.file1.length > 0) {
        for (let file of this.file1) {
          console.log(JSON.stringify(file), file.name);
        }
      } else {
        console.log("no files");
      }
    },
    removeMenuPoint() {
      this.$store.dispatch("deleteMenuPoint", this.curMenuPoint.id).then(() => {
        this.$store.dispatch("fetchSiteTree");
      });
    },
    addNewMenuPoint() {
      this.$store.dispatch("setChildMenuPoint", this.curMenuPoint.id);
    },
    contentSaved() {
      this.$store.dispatch("fetchSiteTree");
    },
    startLoading() {
      this.$store.dispatch("setLoading", true);
    },
    endLoading() {
      this.$store.dispatch("setLoading", false);
    },
  },
  computed: {
    ...mapState(["curMenuPoint", "user"]),
    ...mapGetters([
      "menuPointId",
      "parentMenuPointId",
      "isError",
      "error",
      "icons",
      "colors",
      "isLoading",
      "treeNodeSelected",
      "axiosCfg",
    ]),
    isMenuPointRemovable() {
      return this.curMenuPoint.id > 2;
    },
    isMenuPointAddable() {
      let addableTypes = [2, 5];
      return addableTypes.indexOf(this.curMenuPoint.module_id) !== -1;
    },
    errState: {
      get() {
        return this.isError;
      },
      set(v) {
        this.$store.dispatch("setError", v);
      },
    },
  },
};
</script>
