<template>
  <div>
    <abp-simple-table
      :model="tableModel"
      :items="tableData"
      :title="title"
      :show-filters-button="false"
      :expanded="true"
      :default-actions="false"
      :show-column-setup="false"
      :show-actions="true"
      :options="{ itemsPerPage: -1 }"
    >
      <!-- заголвоок для мобильной таблицы -->
      <template v-slot:title v-if="isMobile">
        <v-toolbar-title>
          {{ title }}
        </v-toolbar-title>
      </template>
      <!-- действия с изделиями -->
      <template v-slot:[`item.actions`]="{ item }">
        <div v-if="isMobile">
          <v-btn
            color="primary"
            text
            :disabled="item.is_producted != 1"
            @click="setProducted(false, item)"
            >Разобрать</v-btn
          >
          <v-btn
            color="primary"
            text
            :disabled="item.is_producted == 1 && item.id != undefined"
            @click="setProducted(true, item)"
            >Оприходовать</v-btn
          >
        </div>
        <div v-else>
          <!-- разобрать изделие -->
          <abp-icon-button
            :disabled="item.is_producted != 1"
            icon="mdi-tools"
            tip="Разобрать изделие"
            @click="setProducted(false, item)"
          ></abp-icon-button>
          <!-- собрать изделие -->
          <abp-icon-button
            :disabled="item.is_producted == 1 && item.id != undefined"
            icon="mdi-check-circle-outline"
            tip="Пометить собранным"
            @click="setProducted(true, item)"
          ></abp-icon-button>
        </div>
      </template>
      <!-- экспандер - компоненты изделия -->
      <template v-slot:expander="{ item }">
        <!-- список компонентов изделия -->
        <abp-items-table
          :disable-npp="false"
          :headers="componentsTableHeaders"
          :items="item.components"
          :show-actions="true"
          :actions="true"
          height="auto"
        >
          <!-- действия в строке компонента изделия -->
          <template v-slot:actions="{ item }">
            <!-- ввести серийные номера -->
            <v-btn
              v-if="isMobile"
              text
              :color="color"
              :disabled="!item.id"
              @click="series(item)"
            >
              Серийные №
            </v-btn>
            <abp-icon-button
              v-else
              icon="mdi-music-accidental-sharp"
              :tip="`Серийные номера`"
              :color="color"
              :disabled="!item.id"
              @click="series(item)"
            ></abp-icon-button>
          </template>
        </abp-items-table>
      </template>
    </abp-simple-table>
    <!-- диалог выбора серийных номеров -->
    <abp-dialog v-model="openSerials">
      <abp-series
        v-if="currentItem"
        :id="currentItem.id"
        table="production_components"
        :kolvo="currentItem.kolvo"
        @close="closeSeries"
      ></abp-series>
    </abp-dialog>
  </div>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import ABPIconButtonVue from "../Form/ABPIconButton.vue";
import ABPItemsTableVue from "./ABPItemsTable.vue";
import ABPSimpleTableVue from "./ABPSimpleTable.vue";
import ABPDialogVue from "../Dialogs/ABPDialog.vue";
import ABPNomenklaturaSeriesVue from "../Form/ABPNomenklaturaSeries.vue";

export default {
  name: "production-result-table",
  components: {
    "abp-simple-table": ABPSimpleTableVue,
    "abp-icon-button": ABPIconButtonVue,
    "abp-items-table": ABPItemsTableVue,
    "abp-dialog": ABPDialogVue,
    "abp-series": ABPNomenklaturaSeriesVue,
  },
  props: {
    value: {
      required: true,
    },
    title: {
      type: String,
      required: false,
    },
    // цветовое оформление
    color: {
      type: String,
      required: false,
      default: "primary",
    },
  },
  data() {
    return {
      // открыть форму c серийниками
      openSerials: false,
      // обрабатываемая строка с серийником
      currentItem: null,
    };
  },
  computed: {
    ...mapGetters(["isMobile"]),
    // данные
    data: {
      get() {
        return this.value;
      },
      set(newValue) {
        this.$emit("input", newValue);
      },
    },
    // модель для таблицы изделий
    tableModel() {
      return [
        { title: "Изделие", name: "nomenklatura", type: "text" },
        { title: "Серийный №", name: "serial", type: "text" },
      ];
    },
    // данные таблицы изделий
    tableData() {
      return this.data.items
        ? this.data.items.map((item) => {
            let prod = {
              id: item.id,
              is_producted: item.is_producted,
              nomenklatura: item.nomenklatura,
              serial: item.serial,
              components: item.components
                ? item.components.map((component) => {
                    return {
                      item_id: item.id,
                      id: component.id,
                      nomenklatura_id: component.nomenklatura_id,
                      kolvo: component.kolvo,
                      nomenklatura: component.nomenklatura,
                      lines: [
                        `${component.nomenklatura}`,
                        `Кол-во: ${component.kolvo}`,
                      ],
                    };
                  })
                : [],
              lines: [`${item.nomenklatura} SN ${item.serial}`],
            };
            return prod;
          })
        : [];
    },
    // модель таблицы компонентов
    componentsTableHeaders() {
      return [
        {
          text: "Компонент",
          value: "nomenklatura",
          align: "start",
          sortable: true,
        },
        { text: "Количество", value: "kolvo", align: "end", sortable: true },
        { text: "", value: "actions", align: "end", sortable: false },
      ];
    },
  },
  methods: {
    ...mapActions(["saveTableRow"]),
    // разобрать или собрать изделие
    setProducted(is_producted, prod) {
      if (prod.id) {
        let payload = {
          table: "production_items",
          modType: "edit",
          values: { ...prod, ...{ is_producted: is_producted } },
        };
        this.saveTableRow(payload).then((response) => {
          if (response) {
            this.data.items = this.data.items.map((item) => {
              if (item.id == prod.id) {
                return response;
              } else {
                return item;
              }
            });
          }
        });
      }
    },
    // ввести серийные номера
    series(item) {
      this.currentItem = { ...item };
      this.openSerials = true;
    },
    // закрываем ввод серийников
    closeSeries() {
      this.openSerials = false;
    },
  },
  watch: {
    openSerials(newVal) {
      if (!newVal) {
        this.currentItem = null;
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>
