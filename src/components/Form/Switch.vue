<template>
  <div>
    <v-container fluid row>
      <v-switch
        dense
        :value="val"
        :input-value="val"
        :label="title"
        :hint="hint"
        :disabled="readonly"
        :color="color"
        @change="changeInput($event)"
      ></v-switch>
    </v-container>
  </div>
</template>

<script>
export default {
  name: "switch-input",
  model: {
    prop: "inputValue",
    event: "input",
  },
  props: {
    inputValue: {
      required: true,
    },
    readonly: {
      type: Boolean,
      required: false,
      default: false,
    },
    color: {
      type: String,
      required: false,
      default: "primary",
    },
    hint: {
      type: String,
      required: false,
    },
    title: {
      type: String,
      required: false,
    },
  },
  mounted() {
    this.$emit("loaded");
  },
  methods: {
    changeInput(newValue) {
      let nv;
      if (newValue) nv = true;
      else nv = false;
      this.$emit("input", nv);
    },
  },
  computed: {
    val: {
      get() {
        if (
          this.inputValue == 1 ||
          this.inputValue == "1" ||
          this.inputValue == "true" ||
          this.inputValue == true
        )
          return true;
        else return false;
      },
      set() {},
    },
  },
};
</script>
