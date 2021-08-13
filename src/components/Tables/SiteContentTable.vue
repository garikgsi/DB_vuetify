<template>
  <div>
    <v-card>
      <v-app-bar dark :class="colors.content_editor">
        <v-toolbar-title>Действия с элементами таблицы</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon>
          <v-icon @click.stop="addContentItem">{{ icons.add }}</v-icon>
        </v-btn>

        <v-dialog v-model="openForm" persistent :retain-focus="false">
          <v-card>
            <v-toolbar dark :class="colors.content_editor">
              <v-toolbar-title>Контент раздела</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-btn icon @click="openForm = false">
                <v-icon>{{ icons.close }}</v-icon>
              </v-btn>
            </v-toolbar>
            <v-card-text>
              <content-menu-point-form
                @form-saved="saveForm"
              ></content-menu-point-form>
            </v-card-text>
          </v-card>
        </v-dialog>
      </v-app-bar>
      <v-container>
        <v-data-table
          :loading="isContentTableLoading"
          :loading-text="tableLoadingText"
          :headers="tableHeaders"
          :items="contentTableData"
          :options.sync="options"
          :server-items-length="contentTableDataTotal"
          items-per-page-text="записей на странице"
          class="elevation-1"
          :footer-props="{
            'show-current-page': true,
            'show-first-last-page': true,
          }"
        >
          <template v-slot:item.actions="{ item }">
            <v-icon small class="mr-2" @click="editContentItem(item.id)">
              {{ icons.edit }}
            </v-icon>

            <confirm
              title="Действительно удалить?"
              text="Удаление будет произведено безвозвратно со всеми файлами и дополнительной информацией"
              @confirmPress="deleteContentItem(item.id)"
            >
              <v-icon small>{{ icons.delete }}</v-icon>
            </confirm>
          </template>
          <v-data-footer
            :items-per-page-text="tableItemsPerPageText"
          ></v-data-footer>
        </v-data-table>
      </v-container>
    </v-card>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import ContentMenuPointForm from "../Forms/ContentMenuPointForm.vue";
import Confirm from "../Dialogs/Confirm.vue";

export default {
  components: {
    "content-menu-point-form": ContentMenuPointForm,
    confirm: Confirm,
  },
  created() {
    this.$store
      .dispatch("fetchContent", this.menuPointId, this.options)
      .then(() => {
        this._contentTableData = this.contentTableData;
      });
  },
  data() {
    return {
      openForm: false,
      removeConfirmed: false,
      buttons: [
        { title: "Да", action: "confirmPress", color: "error" },
        { title: "Нет", action: "close", color: "success" },
      ],
    };
  },

  computed: {
    ...mapState(["contentTableDataTotal"]),
    ...mapGetters([
      "menuPointId",
      "parentMenuPointId",
      "isError",
      "error",
      "icons",
      "colors",
      "isLoading",
      "treeNodeSelected",
      "contentTableHeaders",
      "isContentTableLoading",
      "tableLoadingText",
      "tableNoDataText",
      "tableItemsPerPageText",
      "contentTableOptions",
    ]),
    isMenuPointSelected() {
      return this.curMenuPoint.id > 0;
    },
    tableHeaders() {
      return [
        ...this.contentTableHeaders,
        { text: "Действия", value: "actions", sortable: false },
      ];
    },
    options: {
      get() {
        return this.contentTableOptions;
      },
      set(v) {
        this.$store.dispatch("setContentTableOptions", v);
        this.$store.dispatch("fetchContent", this.menuPointId);
      },
    },
    contentTableData() {
      return this.$store.getters.contentTableData;
    },
  },
  methods: {
    addContentItem() {
      this.$store.dispatch("setDefaultContentForm");
      this.openForm = true;
    },
    editContentItem(id) {
      this.openForm = true;
      this.$store.dispatch("setContentForm", id);
    },
    deleteContentItem(id) {
      this.$store.dispatch("deleteContent", id).then(() => {
        this.$store.dispatch("fetchContent", this.menuPointId);
      });
    },
    saveForm() {
      this.openForm = false;
      this.$store.dispatch("fetchContent", this.menuPointId);
    },
  },
};
</script>

<style lang="scss" scoped></style>
