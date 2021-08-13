// панель меню в печатной форме
<template>
        <v-app-bar
            app
        >
            <v-spacer></v-spacer>
                <v-btn
                    icon
                    @click="click"
                >
                    <v-icon>mdi-printer</v-icon>
                </v-btn>
            <v-spacer></v-spacer>
        </v-app-bar>
</template>

<script>
    export default {
        methods: {
            click() {
                window.print()
            }

        }
    }
</script>

<style lang="scss" scoped>

</style>
