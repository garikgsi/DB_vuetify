<template>
  <div @click="val = false">
    <v-snackbar
      v-if="val"
      app
      v-model="val"
      :color="color"
      dark
      :multi-line="true"
      :timeout="timeout"
      :left="true"
    >
      <template v-slot:action>
        <v-btn icon @click="val = false">
          <v-icon>mdi-check</v-icon>
        </v-btn>
      </template>
      <div v-if="isArray">
        <ul class="notificator-list">
          <li v-for="(text, i) in outText" :key="`not_${i}`">
            {{ text }}
          </li>
        </ul>
      </div>
      <div v-else>
        {{ outText }}
      </div>
    </v-snackbar>
  </div>
</template>

<script>
export default {
  name: "abp-app-notificator",
  props: {
    value: {
      type: Boolean,
      required: true,
      default: false,
    },
    color: {
      type: String,
      required: false,
      default: "success",
    },
    timeout: {
      type: Number,
      required: false,
      default: 5000,
    },
    text: {
      type: String,
      required: false,
      default: "",
    },
  },
  computed: {
    val: {
      get() {
        return this.value;
      },
      set(newVal) {
        this.$emit("input", newVal);
      },
    },
    outText() {
      let getText = this.text;
      let outText = getText;
      try {
        let jsonData = JSON.parse(getText);
        if (Array.isArray(jsonData)) {
          outText = jsonData;
        }
      } catch (e) {
        // будет выведен outText
      }
      return outText;
    },
    isArray() {
      return Array.isArray(this.outText);
    },
  },
};
</script>

<style lang="scss" scoped>
.notificator-list {
  list-style-type: none;
}
</style>
