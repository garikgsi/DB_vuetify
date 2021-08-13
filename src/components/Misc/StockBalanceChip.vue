<template>
  <div>
    <v-tooltip v-if="val" bottom>
      <template v-slot:activator="{ on, attrs }">
        <v-chip :color="color" v-bind="attrs" v-on="on">
          {{ formatBalance(val) }}
        </v-chip>
      </template>
      <span>{{ val }}</span>
    </v-tooltip>
    <v-chip v-else :color="color">
      <slot> </slot>
    </v-chip>
  </div>
</template>

<script>
export default {
  name: "stock-balance-chip",
  props: {
    // значение
    val: {
      type: [Number, String],
      required: false,
    },
    // цвет
    color: {
      type: String,
      required: false,
      default: "success",
    },
    // максимальное значение, после которого показывает +
    maxBalance: {
      type: Number,
      required: false,
      default: 99,
    },
  },
  methods: {
    formatBalance() {
      var x = parseFloat(this.val);
      if (x > this.maxBalance) {
        return `${this.maxBalance}+`;
      } else if (x < 1) {
        return `<1`;
      } else {
        let intPart = Math.trunc(x);
        let floatPart = Number((x - intPart).toFixed(3));
        if (floatPart == 0) {
          return this.formatInt(intPart);
        } else {
          return `>${this.formatInt(intPart)}`;
        }
      }
    },
    formatFloat(val) {
      let formatter = new Intl.NumberFormat("ru", {
        style: "decimal",
        minimumFractionDigits: 3,
      });
      return formatter.format(val);
    },
    formatInt(val) {
      let formatter = new Intl.NumberFormat("ru", {
        style: "decimal",
        minimumFractionDigits: 0,
      });
      return formatter.format(val);
    },
  },
};
</script>

<style lang="scss" scoped></style>
