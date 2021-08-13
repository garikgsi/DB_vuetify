<template>
  <div>
    <div v-if="notesCount > 0">
      <v-alert
        v-for="(note, index) in activeNotifications"
        :key="`note_${index}`"
        :color="note.color || 'primary'"
        border="left"
        elevation="2"
        colored-border
        dismissible
        close-icon="mdi-check"
        @input="markNote(note.id)"
      >
        <h4>{{ note.name }}</h4>
        {{ note.text }}
        <template v-slot:prepend>
          <abp-icon-button
            :color="note.color"
            tip="Открыть документ"
            icon="mdi-link"
            :to="
              note.link ? `/form/${note.link.table}/edit/${note.link.id}` : null
            "
          ></abp-icon-button>
        </template>
      </v-alert>
    </div>
    <div v-else>
      <h1>У Вас нет уведомлений</h1>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from "vuex";
import ABPIconButtonVue from "../Form/ABPIconButton.vue";
export default {
  name: "abp-notes",
  components: {
    "abp-icon-button": ABPIconButtonVue,
  },
  created() {
    this.setTitle("Ваши уведомления");
  },
  computed: {
    ...mapState(["user"]),
    ...mapGetters(["isAuth", "notifications", "activeNotifications"]),
    notesCount() {
      return this.activeNotifications.length;
    },
  },
  methods: {
    ...mapActions(["markNote", "setTitle"]),
  },
};
</script>

<style lang="scss" scoped></style>
