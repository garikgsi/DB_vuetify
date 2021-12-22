<template>
  <div>
    <!-- dataCompleteLoaded={{ dataCompleteLoaded }} , loadedCount =
    {{ loadedCount }} , totalCount = {{ totalCount }} -->
    <!-- , val={{ val }}, inputValue={{ inputValue }}, selectedObjects={{
      selectedObjects
    }} -->
    <!-- inputValue={{ inputValue }} -->
    <!-- options={{ options }} optionsChanged={{ optionsChanged }} -->

    <v-select
      v-model="val"
      :items="items"
      :chips="withChips"
      :label="title"
      :dense="dense"
      :rules="rules"
      :multiple="multiple"
      :return-object="true"
      :disabled="disabled"
      :readonly="readonly"
      :hint="hint"
      :autofocus="autofocus"
      persistent-hint
      items-text="itemText"
      item-value="itemValue"
      :loading="isLoading"
      :value-comparator="valuesComparator"
    >
      <!-- формат выбранной записи -->
      <template v-slot:selection="data">
        <template v-if="withChips">
          <v-chip
            v-if="data.index < maxChips || maxChips === 0"
            :close="clearable"
            close-icon="mdi-close"
            @click:close="doUnset(data.item[itemValue])"
          >
            <span style="max-width: 70px;" class="d-inline-block text-truncate">
              {{ data.item[itemText] }}
            </span>
          </v-chip>
          <span
            v-if="data.index === maxChips && maxChips !== 0"
            class="grey--text text-caption"
          >
            (+{{ val.length - maxChips }})
          </span>
        </template>
        <template v-else>
          <span style="max-width: 100%;" class="d-inline-block text-truncate">
            {{ data.item[itemText] }}
          </span>
        </template>
      </template>
      <!-- поиск и добавление -->
      <template v-slot:prepend-item>
        <abp-select-search
          v-model="filterLine"
          :editable="editable && !!table"
          :loading="isLoading"
          :complete-loaded="dataCompleteLoaded"
          :disable-params="disableParams || !table"
          :disable-add="!table"
          @addClick="addClick"
          @paramsClick="paramsClick"
          @blur="searchBlur"
        ></abp-select-search>
      </template>
      <!-- формат строки -->
      <template v-slot:item="{ item, on, attrs }">
        <v-list-item v-bind="attrs" v-on="on" :input-value="item.selected">
          <slot name="item" v-bind:data="{ item, on, attrs }">
            <template v-if="useImages">
              <v-list-item-avatar tile v-if="item[itemImage]">
                <v-img :src="item[itemImage]"></v-img>
              </v-list-item-avatar>
              <v-list-item-icon v-else>
                <v-icon color="grey lighten-1">mdi-image-remove</v-icon>
              </v-list-item-icon>
            </template>
            <v-list-item-content>
              <v-list-item-title
                :class="{ 'text-decoration-line-through': item.deleted }"
                v-text="item[itemText]"
              >
                <!-- <v-icon v-if="data.item.selected">mdi-check</v-icon> -->
              </v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <abp-icon-button
                v-if="editable"
                icon="mdi-pencil"
                tip="Редактировать выбранное"
                :disabled="disabled"
                @click="doEdit(item[itemValue])"
              ></abp-icon-button>
            </v-list-item-action>
          </slot>
        </v-list-item>
      </template>
      <!-- кнопка очистить -->
      <template v-slot:append>
        <slot name="append"></slot>
        <abp-icon-button
          :disabled="!clearable"
          icon="mdi-close"
          tip="Очистить"
          :disable-tab="true"
          @click="clearInput"
        ></abp-icon-button>
      </template>
    </v-select>

    <!-- подбор по параметрам -->
    <abp-dialog
      title="Подбор по параметрам"
      v-model="showParamsForm"
      v-if="table"
    >
      <!-- {{ tableSelector }} -->
      <abp-select-params-table
        v-if="showParamsForm"
        v-model="tableSelector"
        :selected="inputValue"
        :table="table"
        :tableParams="tableParams"
        :multi-select="multiple"
        :options="options"
        :item-value="itemValue"
        @selected="selectFromTable"
      ></abp-select-params-table>
    </abp-dialog>
    <!-- добавление / редактирование выбранной записи -->
    <abp-dialog
      :title="formTitle"
      v-model="showForm"
      v-if="table"
      :width="formWidth"
    >
      <abp-form
        v-if="showForm"
        v-model="formSelector"
        :table="table"
        :id="inputId"
        :modType="modType"
        :miniForm="miniForm"
        :canSwitchMini="true"
        :singleFieldRow="miniForm"
        :disableDefaultSubmit="false"
        :inDialog="true"
        :showFilters="true"
        :closable="false"
        @closeForm="showForm = false"
        @submitSuccess="submitted($event)"
        @toggleMiniForm="toggleMiniForm"
      >
      </abp-form>
    </abp-dialog>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import ABPDialogVue from "../Dialogs/ABPDialog.vue";
import ABPFormVue from "../Forms/ABPForm.vue";
import ABPSelectParamsTableVue from "../Tables/ABPSelectParamsTable.vue";
import ABPIconButtonVue from "./ABPIconButton.vue";
import ABPSelectSearchVue from "./ABPSelectSearch.vue";

export default {
  name: "abp-select",
  components: {
    "abp-select-search": ABPSelectSearchVue,
    "abp-icon-button": ABPIconButtonVue,
    "abp-dialog": ABPDialogVue,
    "abp-select-params-table": ABPSelectParamsTableVue,
    "abp-form": ABPFormVue,
  },
  model: {
    prop: "inputValue",
    event: "input",
  },
  props: {
    // входная переменная
    inputValue: {
      required: true,
    },
    // таблица - источник данных
    table: {
      type: String,
      required: false,
    },
    // внешняя индикация загрузки
    loading: {
      type: Boolean,
      required: false,
      default: false,
    },
    // наименование поля с идентификатором в объекте
    itemValue: {
      type: String,
      required: false,
      default: "id",
    },
    // наименование поля с описанием в объекте
    itemText: {
      type: String,
      required: false,
      default: "select_list_title",
    },
    // наименование поля с картинкой в объекте
    itemImage: {
      type: String,
      required: false,
      default: "main_image",
    },
    // признак удаленного значения
    itemDeleted: {
      type: String,
      required: false,
      default: "deleted_at",
    },
    // множественный выбор
    multiple: {
      type: Boolean,
      required: false,
      default: false,
    },
    // только чтение
    readonly: {
      type: Boolean,
      required: false,
      default: false,
    },
    // обязательное поле
    required: {
      type: Boolean,
      required: false,
      default: false,
    },
    // отключен функционал инпута полностью
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    // заголовок поля ввода
    title: {
      type: String,
      required: false,
      default: "",
    },
    // подсказка в нижней части поля
    hint: {
      type: String,
      required: false,
      default: "",
    },
    // чипсы вместо наименования
    withChips: {
      type: Boolean,
      required: false,
      default: false,
    },
    // автоматически устанавливать фокус на поле
    autofocus: {
      type: Boolean,
      required: false,
      default: false,
    },
    // без отступов - сжатый по высоте режим
    dense: {
      type: Boolean,
      required: false,
      default: false,
    },
    // добавлять кнопки "добавить" и "редактировать"
    editable: {
      type: Boolean,
      required: false,
      default: true,
    },
    // только указанные значения будут доступны для выбора
    validItems: {
      type: Array,
      required: false,
    },
    // исключить значения из списка - будут доступны все, кроме переданных в массиве
    // имеет --меньший-- приоритет перед validItems, т.е. сначала обрабатывается этот
    // массив, потом validItems
    exceptItems: {
      type: Array,
      required: false,
    },
    // миксин опций загрузки данных
    options: {
      type: Object,
      required: false,
      default() {
        return {};
      },
    },
    // миксин параметров таблицы подбора по параметрам
    tableParamsMixin: {
      type: Object,
      required: false,
      default() {
        return {};
      },
    },
    // данные из внешнего источника
    dataArray: {
      type: Array,
      required: false,
      default() {
        return null;
      },
    },
    // общее кол-во данных, которое будет передано из внешнего источника
    dataCount: {
      type: Number || String,
      required: false,
      default: 0,
    },
    // максимально возможное кол-во чипсов отображаемое в поле выбора селекта
    maxChips: {
      type: Number || String,
      required: false,
      default: 2,
    },
    // выбирать единственную запись
    chooseEqual: {
      type: Boolean,
      required: false,
      default: true,
    },
    // отключить подбор по параметрам
    disableParams: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data() {
    return {
      // индикация загрузки данных
      dataLoading: false,
      //   кол-во записей удовлетворяющих критериям поиска
      searchDataCount: null,
      //   строка фильтрации
      filterLine: "",
      // показать форму подбора по параметрам
      showParamsForm: false,
      // выборка из таблицы подбора по параметрам
      tableSelector: [],
      // объекты соответствующие id выбранной записи
      selectedObjects: [],
      // действие в диалоге формы добавления/изменения записи в селект
      modType: "add",
      // показывать диалог формы добавления/изменения записи в селект
      showForm: false,
      // показывать форму добавления/изменения записи в селект в минимальном режиме (только обязательные поля)
      miniForm: true,
      // значения формы добавления/изменения записи в селект
      formSelector: {},
      // id записи для редактирования
      inputId: 1,
      // изменены опции загрузки данных
      optionsChanged: false,
    };
  },
  async created() {
    // подгружаем данные из внешнего источника
    if (!this.useDataArray) {
      // загружаем модель (с ней же и общее кол-во данных в таблице)
      await this.getTableModel(this.table);
      // если передан id - получим его в первую очередь, чтобы селект имел приличный вид
      if (!this.dataCompleteLoaded && this.inputValue) {
        if (
          this.multiple &&
          Array.isArray(this.inputValue) &&
          this.inputValue.length > 0
        ) {
          for (let i = 0; i < this.inputValue.length; i++) {
            await this.searchInSelect({
              table: this.table,
              id: this.inputValue[i],
            }).then((data) => {
              this.selectedObjects.push(data);
            });
          }
        } else {
          if (["string", "number"].includes(typeof this.inputValue)) {
            await this.searchInSelect({
              table: this.table,
              id: this.inputValue,
            }).then((data) => {
              this.selectedObjects.push(data);
            });
          }
        }
      }
      // загружаем данные в стейт
      this.getData();
    }
    this.$emit("created");
  },
  methods: {
    ...mapActions([
      "cacheSelectData",
      "searchInSelect",
      "getTableModel",
      "clearCacheSelectData",
    ]),
    // получение актуальных данных
    getData() {
      if (
        !this.sourceData ||
        this.sourceData.length == 0 ||
        this.optionsChanged
      ) {
        let selectDataOptions = {
          table: this.table,
        };
        if (this.options) selectDataOptions.options = this.options;
        // включаем индикацию загрузки данных
        this.dataLoading = true;
        // грузим данные в стейт
        this.cacheSelectData(selectDataOptions).finally(() => {
          // console.log(`data loaded`);

          // выключаем индикацию загрузки данных
          this.dataLoading = false;
          // опции загрузки данных вернем в начальное состояние
          this.optionsChanged = false;
        });
      } else {
        this.setEqualValue();
      }
    },
    // добавление записи
    addClick() {
      this.modType = "add";
      this.formSelector = {};
      this.showForm = true;
    },
    // редактирование записи
    doEdit(id) {
      if (id > 1) {
        // добавить опцию на открытие формы по переданному id
        this.inputId = id;
        this.modType = "edit";
        this.showForm = true;
      }
    },
    // очистка
    clearInput() {
      this.val = null;
      // console.log(`clear`);
    },
    // подбор по параметрам
    paramsClick() {
      this.tableSelector = [];
      this.showParamsForm = true;
    },
    // действия на закрытие формы с таблицей подбора по параметрам
    selectFromTable() {
      // console.log(`tableSelector=${JSON.stringify(this.tableSelector)}`);
      // добавляем значения в массив
      this.tableSelector.forEach((item) => {
        if (
          !this.selectedObjects.find((sItem) => {
            sItem[this.itemValue] == item[this.itemValue];
          })
        )
          this.selectedObjects.push(item);
      });
      // устанавливаем значение из таблицы подбора по параметрам
      if (this.multiple) {
        this.val = this.tableSelector;
      } else {
        this.val = this.tableSelector[0];
      }
      // закрываем форму с таблицей
      this.showParamsForm = false;
    },
    // удаляем элемент из чипсов
    doUnset(id) {
      if (this.multiple) {
        if (Array.isArray(this.val)) {
          this.val = this.val.filter((item) => {
            return item[this.itemValue] != id;
          });
          return;
        }
      }
      this.val = null;
    },
    // функция сравнения значений и соответствия в массиве items
    valuesComparator(a, b) {
      // console.log(`a=${JSON.stringify(a)}, b=${JSON.stringify(b)}`);
      if (a && b) {
        if (typeof a === "object" && typeof b === "object") {
          if (Array.isArray(a)) {
            if (Array.isArray(b)) {
              return (
                a.length == b.length &&
                a.every((el, i) => {
                  return el == b[i];
                })
              );
            }
          } else {
            // console.log(
            //   `a=${a[this.itemValue]}, b=${b[this.itemValue]}, res=${a[
            //     this.itemValue
            //   ] === b[this.itemValue]}`
            // );
            if (!Array.isArray(b))
              return a[this.itemValue] === b[this.itemValue];
          }
        } else {
          return a === b;
        }
      }
      return false;
    },
    // переключатель режимов формы редактирования/добавления записи в селект
    toggleMiniForm() {
      this.miniForm = !this.miniForm;
    },
    // сабмит формы редактирования/добавления записи в селект
    submitted(data) {
      // выберем созданную запись
      if (data.id) {
        this.val = data;
      }
      // закрываем форму, если миниформа
      if (this.miniForm) {
        this.showForm = false;
      } else {
        this.modType = "edit";
      }
    },
    // убран фокус с поля поиска
    searchBlur() {
      if (this.inputValue) {
        if (this.multiple) {
          if (
            this.items.filter((item) => {
              return this.inputValue.includes(item[this.itemValue]);
            }).length != this.inputValue.length
          )
            this.filterLine = null;
        } else {
          if (
            !this.items.find((item) => {
              return this.inputValue == item[this.itemValue];
            })
          )
            this.filterLine = null;
        }
      }
    },
    // выбрать единственное значение в списке
    setEqualValue() {
      if (
        this.chooseEqual &&
        this.dataCompleteLoaded &&
        (!this.inputValue || this.inputValue == 1)
      ) {
        if (this.sourceData.length == 1) this.val = this.sourceData[0];
      }
    },
  },
  computed: {
    // значение селекта
    val: {
      get() {
        try {
          if (this.inputValue) {
            // если все данные загружены - ищем в стейте
            // иначе ищем в загруженных объектах, соответствующих выбранным записям
            let searchArray = this.dataCompleteLoaded
              ? this.sourceData
              : this.selectedObjects;
            if (searchArray) {
              if (this.multiple) {
                return searchArray.filter((item) => {
                  return this.inputValue.includes(item[this.itemValue]);
                });
              } else {
                // если все данные загружены - ищем в стейте
                return searchArray.find((item) => {
                  try {
                    return item[this.itemValue] == this.inputValue;
                  } catch (error) {
                    // return nothing
                  }
                });
              }
            }
          }
        } catch (error) {
          // return default value below
        }
        return null;
        // return this.inputValue;
      },
      set(newValue) {
        // console.log(`newValue=${JSON.stringify(newValue)}`);
        if (newValue) {
          if (this.multiple) {
            if (!Array.isArray(newValue)) newValue = [newValue];
            // console.log(`newValue=${JSON.stringify(newValue)}`);
            this.$emit(
              "input",
              newValue.map((item) => {
                return item[this.itemValue];
              })
            );
          } else {
            try {
              this.$emit(
                "input",
                newValue ? newValue[this.itemValue] : newValue
              );
            } catch (error) {
              // do nothing
            }
          }
          // this.$emit("input", newValue);
        } else {
          this.$emit("input", null);
        }
      },
    },
    // сырые данные
    sourceData() {
      // начальные установки данных
      let resultData = [];
      // если внешние данные
      if (this.useDataArray) {
        resultData = [...resultData, ...this.dataArray];
      } else {
        // если данные из БД
        try {
          resultData = [
            ...resultData,
            ...this.$store.state.table.selectData[this.table],
          ];
        } catch (error) {
          // default return resultData
        }
      }
      return resultData;
    },
    // применены фильтры (поисковая фраза)
    useFilter() {
      return !!this.filterLine;
    },
    // фильтруем данные в заивисмости от примененных фильтров
    items() {
      let itogItems = [];
      // если весь стейт загружен - игнорируем полученные ранее объекты, соответствующие id
      // иначе - добавляем их
      if (this.dataCompleteLoaded) {
        itogItems = this.sourceData;
      } else {
        if (this.selectedObjects) {
          itogItems = [...this.selectedObjects, ...this.sourceData];
        }
      }
      // применяем фильтр
      if (this.useFilter && itogItems) {
        itogItems = itogItems.filter((item) => {
          return (
            !item[this.itemDeleted] &&
            item[this.itemText]
              .toLowerCase()
              .includes(this.filterLine.toLowerCase())
          );
        });
      }
      // исключения из списка
      // все значения, кроме исключенных
      if (this.exceptItems && itogItems) {
        itogItems = itogItems.map((item) => {
          return {
            ...item,
            ...{
              disabled: this.exceptItems.includes(item[this.itemValue])
                ? true
                : false,
            },
          };
        });
      }
      // только указанные значения будут доступны
      if (this.validItems && itogItems) {
        itogItems = itogItems.map((item) => {
          return {
            ...item,
            ...{
              disabled: this.validItems.includes(item[this.itemValue])
                ? false
                : true,
            },
          };
        });
      }
      // удаленные значения и выбранные
      if (itogItems)
        itogItems = itogItems.map((item) => {
          let isSelected = false;
          if (item && this.inputValue) {
            // console.log(
            //   `this.inputValue=${this.inputValue} , item[this.itemValue]=${
            //     item[this.itemValue]
            //   }`
            // );
            if (this.multiple && Array.isArray(this.inputValue)) {
              isSelected = this.inputValue.includes(item[this.itemValue]);
            } else {
              isSelected = this.inputValue == item[this.itemValue];
            }
          }
          // измененный объект
          return {
            ...item,
            ...{
              disabled:
                item && (item[this.itemDeleted] || item.disabled)
                  ? true
                  : false,
              deleted: item && item[this.itemDeleted] ? true : false,
              selected: isSelected,
            },
          };
        });

      // console.log(`itogItems after filters = ${JSON.stringify(itogItems)}`);
      return itogItems;
    },
    // всего записей в селекте
    totalCount() {
      if (this.useDataArray) {
        return this.dataCount;
      } else {
        return this.$store.state.table.totalCount[this.table];
      }
    },
    // загружено в селект
    loadedCount() {
      let resultCount = 0;
      if (this.sourceData)
        resultCount = this.sourceData.filter((item) => !item[this.itemDeleted])
          .length;
      // if (this.selectedObjects) resultCount -= this.selectedObjects.length;
      return resultCount;
    },
    // все данные загружены в стейт
    dataCompleteLoaded() {
      return this.loadedCount >= this.totalCount;
    },
    // модель таблицы
    model() {
      try {
        return this.$store.state.table.model[this.table];
      } catch (error) {
        return null;
      }
    },
    // в таблице используются картинки
    useImages() {
      try {
        return this.model.extensions.has_images;
      } catch (error) {
        return false;
      }
    },
    // индикация загрузки данных
    isLoading() {
      return (
        this.loading ||
        (!this.options && !this.useFilter && !this.dataCompleteLoaded) ||
        (this.options && this.optionsChanged)
      );
    },
    // параметры таблицы подбора по
    tableParams() {
      let res = {};
      // только указанные значения будут доступны для выбора
      if (this.validItems) res.validItems = this.validItems;
      // исключить значения из списка - будут доступны только переданные в массиве
      if (this.exceptItems) res.exceptItems = this.exceptItems;
      // если переданы дополнительные параметры - укажем их с перезаписью значений
      if (this.tableParamsMixin) res = { ...res, ...this.tableParamsMixin };
      return res;
    },
    // правила заполнения поля
    rules() {
      if (this.required && !this.readonly) {
        if (this.multiple) {
          return [
            (v) => {
              return (
                (!!v &&
                  Array.isArray(v) &&
                  v.length > 0 &&
                  v.filter((item) => item[this.itemValue] > 1).length > 0) ||
                this.requireMsg
              );
            },
          ];
        } else {
          return [
            (v) => {
              return (!!v && v[this.itemValue] > 1) || this.requireMsg;
            },
          ];
        }
      } else {
        return [true];
      }
    },
    // сообщение о необходимости заполнить поле при ошибках проверки
    requireMsg() {
      if (this.multiple) {
        return `Выберите 1 или несколько значений из спиcка`;
      } else {
        return `Выберите значение из спиcка`;
      }
    },
    // возможно очищать поле и удалять значение через чипсы
    clearable() {
      return !this.readonly;
    },
    // используются данные из внешнего источника (не привязанные к БД)
    useDataArray() {
      return !!this.dataArray;
    },
    // заголовок формы в зависимости от действия
    formTitle() {
      switch (this.modType) {
        case "add": {
          return `добавление записи`;
        }
        case "edit": {
          return `редактирование записи`;
        }
        default: {
          return "";
        }
      }
    },
    // ширина формы диалога добавления/изменения записи
    formWidth() {
      if (this.miniForm) return 300;
      else return "auto";
    },
  },
  watch: {
    // при полной загрузке данных, если не выбрано значение и элементов в массиве еднственный - выберем его
    sourceData() {
      // console.log(
      //   `dataCompleteLoaded=${this.dataCompleteLoaded}, !this.inputValue=${!this
      //     .inputValue}, inputValue=${this.inputValue}, this.sourceData.length=${
      //     this.sourceData.length
      //   }, chooseEqual=${this.chooseEqual}
      //     table=${this.table}`
      // );
      if (this.chooseEqual) this.setEqualValue();
    },
    table() {
      this.filterLine = null;
      this.getData();
    },
    // изменение опций
    options() {
      this.filterLine = null;
      this.optionsChanged = true;
      this.clearCacheSelectData({ table: this.table }).then(() => {
        this.getData();
      });
    },
  },
};
</script>

<style lang="scss" scoped></style>
