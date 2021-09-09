// редактор формы
<template>
  <div>
    <abp-simple-form
      v-if="copyOptionsFormModel"
      v-model="copyOptions"
      :model="copyOptionsFormModel"
      :buttons="null"
      title="Выберите параметры копирования"
    >
      <template v-slot:buttons-left>
          <v-btn
            color="primary"
            @click="copyAction"
          >
            Скопировать
          </v-btn>
          <v-btn
            text
            color="primary"
            @click="closeAction"
          >
            Отменить
          </v-btn>
      </template>
    </abp-simple-form>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "abp-copy-form",
  components: {
    'abp-simple-form': () => import("./ABPSimpleForm.vue"),
  },
  props: {
    // таблица
    table: {
      type: String,
      required: true,
    },
    // id
    id: {
      type: [Number, String],
      required: false, // if add
    },
  },
  data() {
    return {
      copyOptions: {}
    };
  },
  created() {
    this.getTableModel(this.table)
  },
  computed: {
    fullModel() {
      return this.$store.state.table.model[this.table] || null;
    },
    formExtensions() {
      if (this.fullModel) {
        return this.fullModel.extensions
      }
      return null
    },
    // модель формы выбора опций копирования
    copyOptionsFormModel() {
      let res = []
      if (this.formExtensions) {
        if (this.formExtensions.has_groups) res.push(
          {name:'ext_groups', type:'boolean',title:'Группы', size: 2}
        )
        if (this.formExtensions.has_images) res.push(
          {name:'ext_images', type:'boolean',title:'Изображения', size: 2}
        )
        if (this.formExtensions.has_files) res.push(
          {name:'ext_documents', type:'boolean',title:'Файлы', size: 2}
        )
        if (this.formExtensions.has_file_list) res.push(
          {name:'ext_file_list', type:'boolean',title:'Каталоги', size: 2}
        )
        if (this.formExtensions.sub_tables) {
          for (let subTable in this.formExtensions.sub_tables) {
            let subTableDescr = this.formExtensions.sub_tables[subTable]
            res.push(
              {name:`sub_table_${subTable}`, type:'boolean',title:`${subTableDescr.title}`, size: 2}
            )
          }
        }
      }
      return res
    },
    // модель
    formModel() {
      if (this.$store.state.table.model[this.table])
        return this.$store.state.table.model[this.table].fields;
      else return null;
    },

  },
  methods: {
    ...mapActions(["saveTableRow", "getTableModel", "pushError", "setLoading"]),
    // действие отмены
    closeAction() {
      this.$router.go(-1) 
    },
    // действие копирования
    copyAction() {
          this.setLoading(true)
          let payload = {
            table: this.table,
            modType: 'copy',
            values: {id:this.id},
            copyOptions: this.copyOptions
          };
          this.saveTableRow(payload)
            .then((response) => {
              let newInfo = response;
                this.formValues = newInfo;
                // переходим к редактированию вставленной записи
                this.$router.replace({
                  path: `/form/${this.table}/edit/${newInfo.id}`,
                });
            })
            .catch((error) => {
              try {
                this.pushError(error.response.data.error[0])
              }
              catch(e) {
                this.pushError('Копирование записи завершилось неизвестной ошибкой')
              }
            })
            .finally(() => {
              this.setLoading(false)
            });
          }
  },
};
</script>

<style lang="scss" scoped></style>
