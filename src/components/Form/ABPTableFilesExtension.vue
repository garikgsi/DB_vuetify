<template>
  <div>
    <abp-dialog v-model="openAddFileForm" :width="500">
      <abp-files-form
        v-if="drivers"
        :table="table"
        :id="id"
        :key="key"
        :model="fields"
        v-model="values"
        @submit="save"
      ></abp-files-form>
    </abp-dialog>
    <div v-if="files">
      <v-btn
        fab
        dark
        small
        absolute
        top
        right
        class="my-8 mx-10"
        :color="btnColor"
        @click="addFile"
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>
      <component
        :is="componentName"
        :files="files"
        :loading="loading"
        :deleteIcon="type == 'list' ? 'mdi-close' : 'mdi-delete'"
        :confirmDelete="type !== 'list'"
        :disabled="disabled"
        :color="btnColor"
        @makeMain="makeMain($event)"
        @editFile="editTheFile($event)"
        @removeFile="removeFile($event)"
        @addFile="addFile"
      >
        <template v-slot:top v-if="showFileSelector">
          <v-autocomplete
            multiple
            v-model="fileSelector"
            item-text="text"
            item-value="id"
            :items="fileListData"
            :loading="!fileListData"
            :hide-selected="true"
            hint="Выберите файл из списка"
            label="Выбор файла"
            @blur="syncFileList"
            @change="changed = true"
          >
            <template v-slot:selection="{ item, index }">
              <v-chip v-if="index === 0">
                <span>{{ item.text }}</span>
              </v-chip>
              <span v-if="index === 1" class="grey--text caption">
                (+ еще {{ fileSelector.length - 1 }})
              </span>
            </template>
          </v-autocomplete>
        </template>
      </component>
    </div>
    <abp-waiting-message v-else>
      {{ waitMessage }}
    </abp-waiting-message>
  </div>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import ABPFilesForm from "../Forms/ABPFilesForm.vue";
import ABPDialog from "../Dialogs/ABPDialog.vue";
import ABPWaitingMessage from "../Info/ABPWaitingMessage.vue";
import ImageList from "../ImageList.vue";
import FileList from "../FileList.vue";

export default {
  name: "abp-table-files-extension",
  components: {
    "abp-files-form": ABPFilesForm,
    "abp-dialog": ABPDialog,
    "abp-waiting-message": ABPWaitingMessage,
    "image-list": ImageList,
    "file-list": FileList,
  },
  props: {
    table: {
      type: String,
      required: true,
    },
    id: {
      type: [Number, String],
      required: true,
    },
    type: {
      type: String,
      required: true,
      default: "image",
    },
  },
  data() {
    return {
      files: null,
      fileSelector: [],
      values: {
        file_driver_id: 1,
        file: null,
      },
      openAddFileForm: false,
      loading: false,
      modType: "add",
      // file_drivers: null,
      changed: false,
      key: this.genKey(),
      // file_drivers: null,
    };
  },
  created() {
    this.getData();
    this.getSelectData({ table: "file_drivers" });
    // подгрузим список драйверов
    // if (!this.$store.state.table.selectData["file_drivers"]) {
    //   //   if (!this.file_drivers)
    //   this.getSelectData({ table: "file_drivers" }).then(() => {
    //     this.file_drivers = this.$store.state.table.selectData["file_drivers"];
    //   });
    //   // .then(()=>{
    //   //     this.file_drivers = this.$store.state.table.selectData['file_drivers']
    //   // })
    // } else {
    //   this.file_drivers = this.$store.state.table.selectData["file_drivers"];
    // }
    // подгрузим список файлов, если тип=список
    if (this.type == "list") {
      if (!this.$store.state.table.fileList[this.table])
        this.getFileList(this.table);
    }
  },
  computed: {
    ...mapGetters(["tableFiles", "isLoading"]),
    // драйвера ФС
    file_drivers() {
      try {
        return this.$store.state.table.selectData["file_drivers"];
      } catch (e) {
        return null;
      }
    },
    disabled() {
      return this.isLoading;
    },
    fileListData() {
      if (this.$store.state.table.fileList[this.table]) {
        return this.$store.state.table.fileList[this.table].map((item) => {
          return {
            id: item.file_id,
            text: `${item.file.name} (${item.file.extension})`,
          };
        });
      } else {
        return null;
      }
    },
    showFileSelector() {
      return this.fileListData && this.type == "list";
    },
    drivers() {
      if (this.file_drivers) {
        return this.file_drivers.map((driver) => {
          return { id: driver.id, text: driver.select_list_title };
        });
      } else {
        return null;
      }
    },
    fields() {
      return [
        {
          name: "file_driver_id",
          type: "radio",
          items: this.drivers,
          title: "Место хранения файла",
          require: true,
          default: 3,
        },
        { name: "id", type: "integer", title: "id", hidden: true },
        {
          name: "file_type_id",
          type: "int",
          title: "Тип файла",
          default: 1,
          hidden: true,
        },
        { name: "name", type: "string", title: "Название", require: true },
        { name: "comment", type: "string", title: "Описание", require: false },
        {
          name: "filename",
          type: this.inputFileType,
          title: this.fieldTitle,
          require: true,
        },
      ];
    },
    waitMessage() {
      switch (this.type) {
        case "image": {
          return "Наберитесь терпения - я стараюсь найти подходящие изображения";
        }
        case "document":
        case "list": {
          return "Наберитесь терпения - я стараюсь найти подходящие файлы";
        }
        default: {
          return ``;
        }
      }
    },
    inputFileType() {
      switch (this.type) {
        case "image": {
          return "image";
        }
        case "document":
        case "list": {
          return "document";
        }
        default: {
          return ``;
        }
      }
    },
    btnColor() {
      switch (this.type) {
        case "image": {
          return "pink";
        }
        case "document": {
          return "purple";
        }
        case "list": {
          return "deep-purple";
        }
        default: {
          return `primary`;
        }
      }
    },
    fieldTitle() {
      switch (this.type) {
        case "image": {
          return "Изображение";
        }
        case "document":
        case "list": {
          return "Файл";
        }
        default: {
          return ``;
        }
      }
    },
    componentName() {
      switch (this.type) {
        case "image": {
          return "image-list";
        }
        case "document":
        case "list": {
          return "file-list";
        }
        default: {
          return "file-list";
        }
      }
    },
  },
  methods: {
    ...mapActions([
      "getFiles",
      "editFile",
      "saveFile",
      "getSelectData",
      "deleteFile",
      "getFileList",
      "syncFiles",
    ]),
    genKey() {
      return `m_${Math.floor(Math.random() * (10000 + 1))}`;
    },
    removeFile(id) {
      switch (this.type) {
        case "list":
          {
            let i = this.fileSelector.indexOf(id);
            if (i !== -1) {
              this.changed = true;
              this.fileSelector.splice(i, 1);
              this.syncFileList();
            }
          }
          break;
        default: {
          this.deleteFile({ table: this.table, id: this.id, file_id: id }).then(
            () => {
              this.getData();
            }
          );
        }
      }
    },
    addFile() {
      this.values = {
        file_driver_id: 1,
        file_type_id: this.type,
        file: null,
      };
      this.modType = "add";
      this.openAddFileForm = true;
    },
    makeMain(id) {
      this.editFile({
        table: this.table,
        id: this.id,
        file_id: id,
        values: { is_main: true },
      }).then(() => {
        this.getData();
      });
    },
    editTheFile(file) {
      this.modType = "edit";
      this.values = file;
      this.values.filename = file.preview;
      this.openAddFileForm = true;
    },
    getData() {
      this.loading = true;
      this.getFiles({ tableName: this.table, id: this.id, type: this.type })
        .then(() => {
          switch (this.type) {
            case "list":
              {
                let fileList = this.tableFiles[this.type];
                this.fileSelector = [];
                this.files = fileList.map((item) => {
                  this.fileSelector.push(item.file_id);
                  return item.file;
                });
              }
              break;
            default: {
              this.files = this.tableFiles[this.type];
            }
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    fileAdded() {
      this.openAddFileForm = false;
      this.getData();
    },
    fileSubmitError(e) {
      console.log(JSON.stringify(e));
    },
    save() {
      let payload = {
        table: this.table,
        model: { fields: this.fields },
        id: this.id,
        values: this.values,
      };
      // console.log(`payload to save file is ${JSON.stringify(payload)}`)
      switch (this.modType) {
        case "add":
          {
            this.saveFile(payload)
              .then(() => {
                this.getData();
                // подгрузим список файлов, если тип=список
                if (this.type == "list") {
                  this.getFileList(this.table);
                }
                // закрываем форму
                this.openAddFileForm = false;
                // регенерация формы
                this.key = this.genKey();
              })
              .catch(() => {
                // console.log(`error=${JSON.stringify(e)}`)
              })
              .finally(() => {});
          }
          break;
        case "edit":
          {
            payload.file_id = this.values.id;
            this.editFile(payload)
              .then(() => {
                this.getData();
                this.openAddFileForm = false;
              })
              .catch(() => {
                // console.log(`error=${JSON.stringify(e)}`)
              })
              .finally(() => {});
          }
          break;
      }
    },
    syncFileList() {
      if (this.changed) {
        this.syncFiles({
          table: this.table,
          id: this.id,
          data: this.fileSelector,
        }).then(() => {
          this.getData();
          this.changed = false;
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>
