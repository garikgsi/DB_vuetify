<template>
  <div>
    <abp-simple-table
      :model="typeModel"
      :items="typeData"
      :title="typeTitle"
      :show-filters-button="false"
      :expanded="true"
      :default-actions="false"
      :add-actions="true"
      :expand-icon="expandIcon"
      :show-column-setup="false"
      @rowClick="rowClick($event)"
    >
      <!-- кнопка перед тайтлом таблицы -->
      <template v-slot:column-setup>
        <abp-icon-button
          :icon="typeIcon"
          :tip="typeHint"
          @click="changeType"
        ></abp-icon-button>
      </template>
      <!-- экспандер - разблюдовка изделий по компонентам -->
      <template v-slot:expander="{ item }">
        <!-- список компонентов изделия -->
        <abp-items-table
          v-if="treeType"
          :disable-npp="false"
          :headers="componentTableHeaders"
          :items="item.components"
          height="auto"
          :actions="true"
          @rowClick="productComponentEdit($event)"
        >
          <!-- действия в строке компонентов изделия -->
          <template v-slot:[`actions`]="{ item }">
            <div
              v-if="isMobile"
            >
              <v-btn
                text
                color="primary"
                @click="componentReplace(item)"
              >
                Замены
              </v-btn>
            </div>
            <div
              v-else
            >
              <abp-icon-button
                :icon="replaceIcon"
                tip="Заменить компонент изделия"
                @click="componentReplace(item)"
              ></abp-icon-button>
            </div>
              <!-- удаление -->
              <abp-delete-button
                title="Подтвердите удаление"
                :icon="!isMobile"
                color="primary"
                text="Сейчас будет удален компонент из выбранного изделия. Продолжаем?"
                tip="Удалить компонент"
                btn-text="Удалить"
                @click="deleteItemComponent(item)"
              ></abp-delete-button>
          </template>
        </abp-items-table>
        <abp-items-table
          v-else
          :disable-npp="true"
          :headers="replacementsTableHeaders"
          :items="item.replacements"
          height="auto"
        ></abp-items-table>
      </template>
      <!-- действия в шапке таблицы -->
      <template v-slot:append-top-actions>
        <div
          v-if="isMobile"
        >
          <v-btn
            :disabled="treeType"
            text
            @click="addComponent()"
          >
            Добавить
          </v-btn>
          <v-btn
            :disabled="undeletedReplacements.length <= 0"
            text
            @click="productionReplaceTable()"
          >
            Замены
          </v-btn>
        </div>
        <div
          v-else
        >
          <abp-icon-button
            :disabled="treeType"
            :icon="addIcon"
            tip="Добавить компонент в партию продукции (для каждого изделия)"
            @click="addComponent()"
          ></abp-icon-button>
          <abp-icon-button
            :disabled="undeletedReplacements.length <= 0"
            :icon="replaceIcon"
            :tip="productionTableHint"
            @click="productionReplaceTable()"
          ></abp-icon-button>
        </div>
      </template>
      <!-- действия в большой таблице -->
      <template v-slot:[`item.actions`]="{ item }">
        <!-- действия в режиме дерева -->
        <div v-if="treeType">
          <!-- добавление компонентов в режиме tree -->
          <v-btn
            v-if="isMobile"
            text
            color="primary"
            @click="addComponent(item)"
          >
            Добавить компонент
          </v-btn>
          <abp-icon-button
            v-else
            :icon="addIcon"
            tip="Добавить компонент в изделие"
            @click="addComponent(item)"
          ></abp-icon-button>
        </div>
        <!-- действия в режиме списка компонентов -->
        <div v-else>
          <!-- замены -->
          <v-btn
            v-if="isMobile"
            color="primary"
            text
            @click="productionReplace(item)"
          >
            Замены
          </v-btn>
          <abp-icon-button
            v-else
            :icon="replaceIcon"
            tip="Заменить компонент изделия"
            @click="productionReplace(item)"
          ></abp-icon-button>
          <!-- удаление -->
          <abp-delete-button
            title="Подтвердите удаление"
            :icon="!isMobile"
            text="Сейчас будет удален компонент из всего производства. Продолжаем?"
            tip="Удалить компонент"
            btn-text="Удалить"
            @click="deleteComponent(item)"
          ></abp-delete-button>
        </div>
      </template>
      <!-- блок отображения замен -->
      <template v-slot:append-top>
        <div v-if="showReplacesTable">
          <v-row dense>
            <v-col cols="12" md="6">
              <v-list>
                <v-subheader>Замены на уровне всего производства</v-subheader>
                <v-list-item-group color="primary">
                  <template v-for="(r, i) in globalReplacements">
                    <div :key="`gr_${i}`">
                      <v-list-item @click="replaceEdit(r)">
                        <v-list-item-icon v-if="!isMobile">
                          <v-chip
                            :color="r.save_to_recipe ? 'primary' : 'secondary'"
                            small
                          >
                            {{ r.kolvo_from }}:{{ r.kolvo_to }}
                          </v-chip>
                        </v-list-item-icon>
                        <v-list-item-content>
                          <template
                            v-if="isMobile"
                          >
                            <v-list-item-subtitle>{{ r.nomenklatura_from }}</v-list-item-subtitle>
                            <v-list-item-subtitle>
                              <v-chip
                                :color="r.save_to_recipe ? 'primary' : 'secondary'"
                                small
                              >
                                {{ r.kolvo_from }}:{{ r.kolvo_to }}
                              </v-chip>
                              <v-icon>
                                mdi-swap-vertical
                              </v-icon>
                            </v-list-item-subtitle>
                            <v-list-item-subtitle>{{ r.nomenklatura_to }}</v-list-item-subtitle>
                          </template>
                          <v-list-item-title
                            v-else
                          >
                            {{ r.nomenklatura_from }}
                            <v-icon>mdi-swap-horizontal</v-icon>
                            {{ r.nomenklatura_to }}
                          </v-list-item-title>
                        </v-list-item-content>
                        <v-list-item-icon>
                          <abp-delete-button
                            title="Подтвердите удаление"
                            text="Замена будет удалена и восстановить ее будет невозможно. Продолжаем?"
                            tip="Удалить замену"
                            @click="replaceDelete(r)"
                          ></abp-delete-button>
                        </v-list-item-icon>
                      </v-list-item>
                      <v-divider
                        v-if="i < globalReplacements.length - 1"
                      ></v-divider>
                    </div>
                  </template>
                </v-list-item-group>
              </v-list>
            </v-col>
            <v-col cols="12" md="6">
              <v-list>
                <v-subheader>Замены на уровне изделий</v-subheader>
                <template v-for="(p, i) in componentReplacements">
                  <div :key="`cr_${i}`">
                    <v-list-group dense>
                      <template v-slot:activator>
                        <v-list-item-content>
                          <v-list-item-title>
                            Изделие SN {{ p.serial }}
                          </v-list-item-title>
                        </v-list-item-content>
                      </template>
                      <template v-for="(r, j) in p.components">
                        <div :key="`crc_${j}`">
                          <v-list-item @click="replaceEdit(r)">
                            <v-list-item-icon
                              v-if="!isMobile"
                            >
                              <v-chip
                                :color="
                                  r.save_to_recipe ? 'primary' : 'secondary'
                                "
                                small
                              >
                                {{ r.kolvo_from }}:{{ r.kolvo_to }}
                              </v-chip>
                            </v-list-item-icon>
                            <v-list-item-content>
                              <template
                                v-if="isMobile"
                              >
                                <v-list-item-subtitle>{{ r.nomenklatura_from }}</v-list-item-subtitle>
                                <v-list-item-subtitle>
                                  <v-chip
                                    :color="r.save_to_recipe ? 'primary' : 'secondary'"
                                    small
                                  >
                                    {{ r.kolvo_from }}:{{ r.kolvo_to }}
                                  </v-chip>
                                  <v-icon>
                                    mdi-swap-vertical
                                  </v-icon>
                                </v-list-item-subtitle>
                                <v-list-item-subtitle>{{ r.nomenklatura_to }}</v-list-item-subtitle>
                              </template>

                              <v-list-item-title
                                v-else
                              >
                                {{ r.nomenklatura_from }}
                                <v-icon>mdi-swap-horizontal</v-icon>
                                {{ r.nomenklatura_to }}
                              </v-list-item-title>
                            </v-list-item-content>
                            <v-list-item-icon>
                              <abp-delete-button
                                title="Подтвердите удаление"
                                :icon="isMobile"
                                text="Замена будет удалена и восстановить ее будет невозможно. Продолжаем?"
                                tip="Удалить замену"
                                @click="replaceDelete(r)"
                              ></abp-delete-button>
                            </v-list-item-icon>
                          </v-list-item>
                          <v-divider
                            v-if="j < p.components.length - 1"
                          ></v-divider>
                        </div>
                      </template>
                    </v-list-group>
                    <v-divider
                      v-if="i < componentReplacements.length - 1"
                    ></v-divider>
                  </div>
                </template>
              </v-list>
            </v-col>
          </v-row>
          <v-divider></v-divider>
        </div>
      </template>
    </abp-simple-table>

    <!-- диалог добавления/изменения замен -->
    <abp-dialog v-model="showReplacementsForm">
      <production-replace-form
        v-model="replacement"
        :title="replacementFormTitle"
        @close="closeReplacementForm"
        @submit="submitReplacementForm"
      ></production-replace-form>
    </abp-dialog>

    <!-- диалог добавления/изменения компонентов -->
    <abp-dialog v-model="showComponentForm">
      <production-component-form
        v-model="component"
        :title="componentFormTitle"
        :existed-nomenklatura="existedComponents"
        :except-items="productIds"
        :modType="componentModType"
        @close="closeComponentForm"
        @submit="submitComponentForm"
      ></production-component-form>
    </abp-dialog>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import Vue from "vue";
import ABPDialogVue from "../Dialogs/ABPDialog.vue";
import ABPDeleteButtonVue from "../Form/ABPDeleteButton.vue";
import ABPIconButtonVue from "../Form/ABPIconButton.vue";
import ProductionComponentFormVue from "../Forms/ProductionComponentForm.vue";
import ProductionReplaceFormVue from "../Forms/ProductionReplaceForm.vue";
import ABPItemsTableVue from "./ABPItemsTable.vue";
import ABPSimpleTableVue from "./ABPSimpleTable.vue";

export default {
  name: "abp-production-items-table",
  components: {
    "abp-icon-button": ABPIconButtonVue,
    "abp-simple-table": ABPSimpleTableVue,
    "abp-items-table": ABPItemsTableVue,
    "abp-dialog": ABPDialogVue,
    "production-replace-form": ProductionReplaceFormVue,
    "abp-delete-button": ABPDeleteButtonVue,
    "production-component-form": ProductionComponentFormVue,
  },
  props: {
    data: {
      type: Object,
      required: false,
    },
  },
  data() {
    return {
      // тип отображения
      treeType: true,
      // иконка замены
      replaceIcon: "mdi-cached",
      // иконка добавления
      addIcon: "mdi-plus-circle",
      // остатки
      stockBalance: [],
      // показать форму замен
      showReplacementsForm: false,
      // текущая замена
      replacement: {},
      // id индекса редактируемого массива замен
      replacement_id: null,
      // показать форму компонентов
      showComponentForm: false,
      // текущий компонент
      component: {},
      // данные компонента по умолчанию
      componentDefault: {
        production_item_id: null,
        nomenklatura_id: 1,
        kolvo: 1,
        kolvo_per_one: true,
        has_replacements: false,
      },
      // тайтл формы компонента
      componentFormTitle: "",
      // тайтл формы замены
      replacementFormTitle: "",
      // данные замены по умолчанию
      replacementDefault: {
        production_id: this.data.id,
        component_id: 1,
        nomenklatura_from_id: 1,
        nomenklatura_from: null,
        nomenklatura_to_id: 1,
        nomenklatura_to: null,
        kolvo_from: 1,
        kolvo_to: 1,
        save_to_recipe: false,
      },
      // таблица замен
      showReplacesTable: false,
      // признак открытия диалога подтверждения замены существующего компонента
      openConfirmComponentReplace: false,
      // замена компонента подтверждена
      componentConfirmed: false,
      // id редактируемого продукта (изменение компонентов)
      productIdComponentsEditor: null,
      // признак изменения данных
      componentModType: "add",
      // кэш остатков
      ostatki: {},
    };
  },
  created() {},
  computed: {
    ...mapGetters(['isMobile']),
    // склад
    sklad_id() {
      return this.data ? this.data.sklad_id : null;
    },
    // замены
    replacements: {
      get() {
        if (!this.data.replaces) {
          Vue.set(this.data, "replaces", []);
        }
        return this.data.replaces.map((r, i) => {
          return { ...{ i: i, deleted: false }, ...r };
        });
      },
      set(newValue) {
        this.data.replaces = newValue;
      },
    },
    // неудаленные замены
    undeletedReplacements() {
      return this.replacements.filter((r) => {
        return !r.deleted;
      });
    },
    // количество изделий
    itemsCount() {
      return this.data.items.length;
    },
    // данные таблицы production_items
    items() {
      return this.data.items.map((item) => {
        let prod = {
          id: item.id,
          kolvo: item.kolvo,
          nomenklatura: item.nomenklatura,
          serial: item.serial,
          components: item.components.map((component) => {
            let stock_balance = this.getOstatok(component.nomenklatura_id);
            let kolvo = parseFloat(component.kolvo);
            let delta = kolvo > stock_balance ? stock_balance - kolvo : 0;

            let comp = {
              item_id: item.id,
              id: component.id,
              nomenklatura_id: component.nomenklatura_id,
              kolvo: kolvo,
              nomenklatura: component.nomenklatura,
              stock_balance: stock_balance,
              delta: delta,
              replacements: this.replacements.filter((r) => {
                return r.component_id == component.id && !r.deleted;
              }),
            };
            comp.has_replacements = comp.replacements.length > 0;
            return comp;
          }),
        };
        prod.has_replacements =
          prod.components.filter((comp) => {
            return comp.has_replacements;
          }).length > 0;
        return prod;
      });
    },
    // данные таблицы компонентов
    componentsData() {
      let res = {};
      this.componentByItemsData.forEach((item) => {
        item.components.forEach((component) => {
          if (res[component.nomenklatura_id] !== undefined) {
            res[component.nomenklatura_id].kolvo += parseFloat(component.kolvo);
          } else {
            res[component.nomenklatura_id] = {
              id: component.id,
              nomenklatura_id: component.nomenklatura_id,
              nomenklatura: component.nomenklatura,
              kolvo: component.kolvo,
              stock_balance: component.stock_balance,
            };
          }
        });
      });
      return res;
    },
    // массив id продуктов
    productIds() {
      return [this.data.nomenklatura_id];
    },
    // массив id компонентов
    componentsIds() {
      return this.componentsTableItems.map((c) => {
        return c.nomenklatura_id;
      });
    },
    // массив id компонентов по изделиям
    componentsIdsByItem() {
      let res = {};
      this.items.forEach((item) => {
        res[item.id] = item.components.map((component) => {
          return component.nomenklatura_id;
        });
      });
      return res;
    },
    // данные компонентов без группировки по изделиям
    componentsTableItems() {
      let res = [];
      for (let key in this.componentsData) {
        let row = this.componentsData[key];
        row.delta = row.stock_balance - row.kolvo;
        if (row.delta > 0) row.delta = 0;
        // замены
        row.replacements = this.replacements.filter((r) => {
          return (
            r.component_id == 1 &&
            r.nomenklatura_from_id == row.nomenklatura_id &&
            !r.deleted
          );
        });
        // если есть замены
        row.has_replacements = row.replacements.length > 0;
        // добавляем строки для мобильной таблицы
        row.lines = [
          `${row.nomenklatura}`,
          `Кол-во: ${row.kolvo}, остаток ${row.delta}`
        ]
        // добавляем строку
        res.push(row);
      }
      return res;
    },
    // модель замен компонентов без группировки по изделиям
    replacementsTableHeaders() {
      return [
        { text: "Компонент", value: "nomenklatura_from", type: "text" },
        {
          text: "Кол-во компонента",
          value: "kolvo_from",
          type: "kolvo",
          align: "end",
        },
        {
          text: "Кол-во замены",
          value: "kolvo_to",
          type: "kolvo",
          align: "end",
        },
        { text: "Замена", value: "nomenklatura_to", type: "text" },
        {
          text: "Сохранять в рецептуре",
          value: "save_to_recipe",
          type: "boolean",
        },
      ];
    },
    // модель таблицы компонентов изделий
    componentTableModel() {
      return [
        { title: "Есть замены", name: "has_replacements", type: "boolean" },
        { title: "Компонент", name: "nomenklatura", type: "text" },
        {
          title: "Номенклатура",
          name: "nomenklatura_id",
          type: "text",
          show_in_table: false,
        },
        { title: "Необходимое количество", name: "kolvo", type: "kolvo" },
        { title: "Остаток на складе", name: "stock_balance", type: "kolvo" },
        { title: "Не хватает", name: "delta", type: "kolvo" },
      ];
    },
    // заголовки таблицы в экспандере
    componentTableHeaders() {
      let endAlignTypes = ["kolvo", "money"];
      let res = this.componentTableModel
        .filter((field) => {
          return (
            field.show_in_table !== false || field.show_in_table == undefined
          );
        })
        .map((field) => {
          return {
            text: field.title,
            value: field.name,
            type: field.type,
            align: endAlignTypes.indexOf(field.type) === -1 ? "start" : "end",
          };
        });
      res.push({ text: "", value: "actions", align: "end", sortable: false });
      return res;
    },
    // данные в таблице разблюдовки изделий по компонентам
    componentByItemsData() {
      return this.items.map((item) => {
        let components = item.components.map((component) => {
          let res = {};
          // res.stock_balance = this.getOstatok(component.nomenklatura_id)
          // res.kolvo = parseFloat(component.kolvo)
          // res.delta = res.kolvo>res.stock_balance ? res.stock_balance-res.kolvo : 0
          res.has_replacements = this.replacements.find((replace) => {
            return (
              replace.component_id == item.id &&
              replace.nomenklatura_from_id == component.nomenklatura_id
            );
          });
          res.lines = [
            `${component.nomenklatura}`,
            `Кол-во: ${component.kolvo}`
          ]
          return { ...component, ...res};
        });
        let lines = [
          `${item.nomenklatura} SN ${item.serial}`
        ]
        return { ...item, ...{ components: components }, ...{lines:lines} };
      });
    },
    // модель для таблицы изделий
    itemsTableModel() {
      return [
        { title: "Есть замены", name: "has_replacements", type: "boolean" },
        { title: "Изделие", name: "nomenklatura", type: "text" },
        { title: "Серийный №", name: "serial", type: "text" },
      ];
    },
    // модель таблицы в зависимости от типа отображения
    typeModel() {
      return this.treeType ? this.itemsTableModel : this.componentTableModel;
    },
    // данные таблицы в зависимости от типа отображения
    typeData() {
      return this.treeType
        ? this.componentByItemsData
        : this.componentsTableItems;
    },
    // иконка смены типа отображения
    typeIcon() {
      return this.treeType
        ? "mdi-format-list-text"
        : "mdi-format-list-bulleted";
    },
    // подсказка кнопки смены типа отображения
    typeHint() {
      return `Переключиться в режим ${
        !this.treeType ? "с группировкой по изделиям" : "список"
      }`;
    },
    // заголовок таблицы в зависимости от типа отображения
    typeTitle() {
      return this.treeType
        ? "Изготавливаемая продукция"
        : "Компоненты на партию продукции";
    },
    // иконка экспандера
    expandIcon() {
      return this.treeType ? "$expand" : "mdi-swap-vertical";
    },
    // хинт на кнопке отображения таблицы замен
    productionTableHint() {
      return `${
        this.showReplacesTable ? "скрыть" : "показать"
      } сводную таблицу замен производства`;
    },
    // замены на уровне всего производства
    globalReplacements() {
      return this.replacements.filter((r) => {
        return r.component_id == 1 && !r.deleted;
      });
    },
    // замены на уровне изделий
    componentReplacements() {
      let replacementsByProductions = [];

      if (this.replacements) {
        let res = {};
        // замены компонент
        let compRepl = this.replacements.filter((r) => {
          return r.component_id != 1 && !r.deleted;
        });
        compRepl.forEach((cr) => {
          // найдем id изделия
          // let item = this.items.find(prod=>{
          //     return prod.components.find(comp=>{
          //         return comp.id==cr.component_id
          //     })
          // })
          let item = this.items.find((prod) => {
            return prod.id == cr.component_id;
          });
          if (item) {
            if (res[item.id] != undefined) {
              res[item.id].components.push(cr);
            } else {
              res[item.id] = { serial: item.serial, components: [cr] };
            }
          }
        });

        for (let i in res) {
          replacementsByProductions.push(res[i]);
        }
      }
      return replacementsByProductions;
    },
    // неактивность кнопки замен
    replacementsDisabled() {
      return (
        this.undeletedReplacements != undefined &&
        this.undeletedReplacements.length > 0
      );
    },
    // выдаем массив айдишников компонентов в зависимости от редактируемого продукта
    existedComponents() {
      return this.productIdComponentsEditor
        ? this.componentsIdsByItem[this.productIdComponentsEditor]
        : this.componentsIds;
    },
  },
  methods: {
    ...mapActions(["getSelectStockBalance"]),
    // поиск остатка по id номенклатуры
    getOstatok(id) {
      // если уже находили
      if (this.ostatki[id]) {
        return this.ostatki[id];
      } else {
        if (this.stockBalance) {
          let bal = this.stockBalance.find((b) => {
            return b.id == id;
          });
          if (bal) {
            let res = parseFloat(bal.stock_balance);
            this.ostatki[id] = res;
            return res;
          }
        }
      }
      return 0;
    },
    // тип вывода информации (с группировкой или списком)
    changeType() {
      this.treeType = !this.treeType;
    },
    // поиск изделия по id компонента
    findProductByComponentId(id) {
      let prod = this.items.find((prod) => {
        return prod.components.find((comp) => {
          return comp.id == id;
        });
      });
      return prod ? prod : null;
    },
    // замена на уровне компонента
    componentReplace(item) {
      // console.log(`item=${JSON.stringify(item)}`)
      // добавление замены
      this.replacement_id = null;
      // передаем значения
      this.replacement = {
        ...this.replacementDefault,
        ...{
          component_id: item.item_id,
          nomenklatura_from_id: item.nomenklatura_id,
          nomenklatura_from: item.nomenklatura,
        },
      };
      // найдем серийник изменяемого изделия
      let prod = this.findProductByComponentId(item.item_id);
      let serial = prod ? prod.serial : "";
      // меняем тайтл формы
      this.replacementFormTitle = `Добавить замену для ${item.nomenklatura} изделия с SN ${serial}`;
      // показываем форму замены
      this.showReplacementsForm = true;
    },
    // замены на уровне производства
    productionReplace(item) {
      // добавление замены
      this.replacement_id = null;
      // передаем значения
      this.replacement = {
        ...this.replacementDefault,
        ...{ nomenklatura_from_id: item.nomenklatura_id },
      };
      // меняем тайтл формы
      this.replacementFormTitle = `Добавить замену для ${item.nomenklatura}`;
      // показываем форму замены
      this.showReplacementsForm = true;
    },
    // закрываем форму добавления замены
    closeReplacementForm() {
      // добавление замены
      this.replacement_id = null;
      // обнулим замену
      this.replacement = { ...this.replacementDefault };
      this.replacementFormTitle = "";
      // закрываем форму
      this.showReplacementsForm = false;
    },
    // сабмит формы замены
    submitReplacementForm() {
      // создаем копию массива замен
      let newReplaces = [...this.replacements];
      // если вставляем новую запись в таблицу замен
      if (parseInt(this.replacement_id) >= 0) {
        newReplaces[this.replacement_id] = this.replacement;
      } else {
        // добавляем в массив замен
        newReplaces.push(this.replacement);
      }
      // переписываем массив замен новым массивом, чтобы обновились реактивные переменные
      this.replacements = newReplaces;
      // обнулим замену
      this.replacement_id = null;
      this.replacement = { ...this.replacementDefault };
      this.replacementFormTitle = "";
      // закрываем форму
      this.showReplacementsForm = false;
    },
    // открываем таблицу замен
    productionReplaceTable() {
      this.showReplacesTable = !this.showReplacesTable;
    },
    // добавляем компонент (for_item - конкретное изделие)
    addComponent(for_item = null) {
      this.component = { ...this.componentDefault };
      if (for_item) this.component.production_item_id = for_item.id;
      this.productIdComponentsEditor = this.component.production_item_id;
      this.componentModType = "add";
      this.showComponentForm = true;
    },
    // клик по строке большой таблицы
    rowClick(item) {
      if (!this.treeType) {
        this.component = {
          ...this.componentDefault,
          ...{
            nomenklatura_id: item.nomenklatura_id,
            kolvo: item.kolvo,
            kolvo_per_one: false,
          },
        };
        this.productIdComponentsEditor = this.component.production_item_id;
        this.componentModType = "edit";
        this.showComponentForm = true;
        // console.log(`clicked by component ${JSON.stringify(item)}`)
      }
    },
    // клик по компоненту
    productComponentEdit(item) {
      this.component = {
        ...this.componentDefault,
        ...{ nomenklatura_id: item.nomenklatura_id, kolvo: item.kolvo },
      };
      this.component.production_item_id = item.item_id;
      this.productIdComponentsEditor = this.component.production_item_id;
      this.componentModType = "edit";
      this.showComponentForm = true;
      // console.log(`row clicked ${JSON.stringify(item)}`)
    },
    // редактор замены в сводном списке замен
    replaceEdit(replace) {
      // редактирование замены
      this.replacement_id = replace.i;
      // передаем значения
      this.replacement = { ...this.replacements[replace.i] };
      // меняем тайтл формы
      this.replacementFormTitle = `Замена ${replace.nomenklatura_from}`;
      // если есть id компонента - найдем продукт
      if (replace.component_id > 1) {
        let prod = this.findProductByComponentId(replace.component_id);
        if (prod)
          this.replacementFormTitle += `для изделия с SN ${prod.serial}`;
      }
      // показываем форму замены
      this.showReplacementsForm = true;
    },
    // удаление замены
    replaceDelete(replace) {
      // создаем копию массива замен
      let newReplaces = [...this.replacements];
      // удаляем запись в массиве
      newReplaces[replace.i].deleted = true;
      // переписываем массив замен новым массивом, чтобы обновились реактивные переменные
      this.replacements = newReplaces;
    },
    // удаление компонента из изделия
    deleteItemComponent(item) {
      // удаляем из продукта
      let product = this.data.items.find((p) => {
        return p.id == item.item_id;
      });
      if (product) {
        product.components = product.components.filter((component) => {
          return component.nomenklatura_id != item.nomenklatura_id;
        });
      }
      // console.log(`delete item component ${JSON.stringify(item)}`)
    },
    // удаление компонента из всего производства
    deleteComponent(item) {
      this.data.items.forEach((p) => {
        p.components = p.components.filter((component) => {
          return component.nomenklatura_id != item.nomenklatura_id;
        });
      });
      // console.log(`delete component ${JSON.stringify(item)}`)
    },
    // закрываем форму редактирования компонента
    closeComponentForm() {
      // обнулим замену
      this.component = { ...this.componentDefault };
      this.componentFormTitle = "";
      this.componentModType = "add";
      this.productIdComponentsEditor = null;
      // закрываем форму
      this.showComponentForm = false;
    },
    // сабмит формы компонента
    submitComponentForm() {
      // console.log(`submitted component form with values ${JSON.stringify(this.component)}`)
      // значения формы
      let formData = this.component;
      // если добавляем в производство
      if (formData.production_item_id == undefined) {
        // поищем, есть ли компонент с такой номенклатурой
        let existedComponent = this.componentsTableItems.find((comp) => {
          return comp.nomenklatura_id == formData.nomenklatura_id;
        });
        // вычислим количество на 1 изделие
        let componentKolvo = formData.kolvo;
        // если количество указано на партию
        if (!formData.kolvo_per_one) {
          componentKolvo = formData.kolvo / this.itemsCount;
        }
        // если компонент найден
        if (existedComponent) {
          // если заменяем
          if (formData.with_replace) {
            // заменяем кол-во компонента во всех продуктах
            this.data.items.map((item) => {
              return item.components.map((component) => {
                if (component.nomenklatura_id == formData.nomenklatura_id) {
                  return (component.kolvo = componentKolvo);
                } else {
                  return component;
                }
              });
            });
            // закрываем форму
            this.closeComponentForm();
          }
        } else {
          // добавляем компонент
          this.data.items.forEach((item) => {
            item.components.push({
              nomenklatura_id: formData.nomenklatura_id,
              nomenklatura: formData.nomenklatura,
              kolvo: componentKolvo,
              production_item_id: item.id,
            });
          });
          // закрываем форму
          this.closeComponentForm();
        }
      } else {
        // если указано изделие
        // получим компоненты продукта
        let product = this.data.items.find((item) => {
          return item.id == formData.production_item_id;
        });
        let productComponents = product.components;
        // поищем компонент в списке компонентах продукта
        let existedComponent = productComponents.find((component) => {
          return component.nomenklatura_id == formData.nomenklatura_id;
        });
        // если найден компонент и согласны его переписать
        if (existedComponent) {
          if (formData.with_replace) {
            existedComponent.kolvo = formData.kolvo;
            // закрываем форму
            this.closeComponentForm();
          } else {
            // согласие пользователя на перезапись не получена
          }
        } else {
          // добавим новую запись в список
          productComponents.push({
            nomenklatura_id: formData.nomenklatura_id,
            nomenklatura: formData.nomenklatura,
            kolvo: formData.kolvo,
            production_item_id: formData.production_item_id,
          });
          // закрываем форму
          this.closeComponentForm();
        }
      }
    },
  },
  // наблюдатели
  watch: {
    // за складом
    sklad_id(newSkladId) {
      if (newSkladId) {
        // получим остатки по складу
        this.getSelectStockBalance(newSkladId).then((data) => {
          this.stockBalance = data;
        });
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>
