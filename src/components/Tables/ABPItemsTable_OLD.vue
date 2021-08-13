// компонент отображения табличной части документа

<template>
  <div>
    <v-data-table
      :items="data"
      :headers="cols"
      dense
      :height="height"
      :items-per-page="-1"
      :page="1"
      :hide-default-footer="true"
      locale="ru"
      @click:row="rowClick($event)"
    >
      <!-- форматирование значений в ячейках таблицы в соответствии с типом -->
      <template
        v-slot:[`item.${field.value}`]="{ item }"
        v-for="field in headers"
      >
        <slot :name="`item.${field.value}`" :item="item">
          <div :key="`item.${field.value}`">
            <!-- остатки и номенклатура -->
            <div
              v-if="
                ['stock_balance', 'nomenklatura'].indexOf(field.type) !== -1
              "
            >
              {{ item["nomenklatura"] }}
            </div>
            <!-- чекбоксы -->
            <div v-else-if="field.type == 'boolean'">
              <v-simple-checkbox
                :key="`item.${field.name}`"
                :value="Boolean(item[field.value])"
                disabled
              ></v-simple-checkbox>
            </div>
            <!-- деньги и кол-во -->
            <div
              v-else-if="['money', 'kolvo'].indexOf(field.type) !== -1"
              class="text-right"
              :class="{ 'error--text': parseFloat(item[field.value]) < 0 }"
            >
              {{ formatVal(item[field.value], field.type) }}
            </div>
            <!-- даты -->
            <div v-else-if="field.type == 'date'">
              {{ formatDate(item[field.value]) }}
            </div>
            <!-- все остальные -->
            <div v-else>
              {{ item[field.value] }}
            </div>
          </div>
        </slot>
      </template>
      <template v-slot:[`item.actions`]="{ item }" v-if="actions">
        <slot name="actions" v-bind:item="item"></slot>
      </template>
    </v-data-table>
  </div>
</template>

<script>
export default {
  name: "abp-items-table",
  props: {
    // данные в формате v-data-table
    items: {
      type: Array,
      required: true,
    },
    // заголовки в формате v-data-table
    headers: {
      type: Array,
      required: true,
    },
    // не показывать порядковый номер
    disableNpp: {
      type: Boolean,
      required: false,
      default: false,
    },
    // высота блока
    height: {
      type: String,
      required: false,
      default: "200",
    },
    // добавть действия (и слот actions)
    actions: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  computed: {
    data() {
      return this.items.map((item, i) => {
        return { n: i + 1, ...item };
      });
    },
    cols() {
      let res = [...this.headers];
      if (!this.disableNpp) {
        res.unshift({
          text: "№ п/п",
          value: "n",
          sortable: false,
          type: "number",
        });
      }
      if (this.actions) {
        res.push({
          text: "",
          value: "actions",
          sortable: false,
          type: "actions",
        });
      }
      return res;
    },
  },
  methods: {
    formatVal(val, type) {
      let dig = 2;
      switch (type) {
        case "kolvo": {
          dig = 3;
        }
      }
      let formatter = new Intl.NumberFormat("ru", {
        style: "decimal",
        minimumFractionDigits: dig,
      });
      return formatter.format(val);
    },
    // клик по строке таблицы
    rowClick(item) {
      this.$emit("rowClick", item);
    },
  },
};
</script>

<style lang="scss" scoped></style>
