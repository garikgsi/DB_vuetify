// компонент отображения табличной части документа

<template>
  <div>
    <abp-simple-table
      :items="data"
      :model="itemsModel"
      :col-headers="itemsHeaders"
      :show-column-setup="false"
      :show-footer="false"
      :show-header="false"
      :show-actions="actions"
      :show-active-decoration="false"
      :show-load-more="showLoadMore"
      @rowClick="rowClick($event)"
      @loadMore="loadMore"
    >
      <template v-slot:[`item.actions`]="{ item }" v-if="actions">
        <slot name="actions" :item="item"></slot>
      </template>
    </abp-simple-table>
  </div>
</template>

<script>
export default {
  name: "abp-items-table",
  components: {
    "abp-simple-table": () => import("./ABPSimpleTable.vue"),
  },
  props: {
    // данные в формате v-data-table
    items: {
      type: Array,
      required: true,
    },
    // заголовки в формате v-data-table
    headers: {
      type: Array,
      required: false,
      default() {
        return [];
      },
    },
    // модель таблицы
    model: {
      type: Array,
      required: false,
      default() {
        return [];
      },
    },
    // не показывать порядковый номер
    disableNpp: {
      type: [Boolean, String],
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
    // всего записей
    total: {
      type: Number,
      required: false,
      default: 0,
    },
  },
  computed: {
    // показывать кнопку дозагрузки контента
    showLoadMore() {
      return false && this.total !== this.data.length;
    },
    data() {
      return this.items.map((item, i) => {
        return { n: i + 1, ...item };
      });
    },
    itemsModel() {
      if (this.model.length > 0) {
        return [
          ...[
            {
              name: "n",
              type: "integer",
              title: "№ п/п",
              show_in_table: true,
            },
          ],
          ...this.model,
        ];
      }
      return null;
    },
    itemsHeaders() {
      if (this.headers.length > 0) {
        return [...this.headers];
      }
      return null;
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
    // подгрузить очередную порцию контента
    loadMore() {
      this.$emit("loadMore");
    },
  },
};
</script>

<style lang="scss" scoped></style>
