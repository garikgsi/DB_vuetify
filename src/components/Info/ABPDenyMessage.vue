<template>
    <div>
        <abp-callout
            title="Запрещенное действие"
            icon="mdi-close-octagon"
            color="error"
        >
            <v-row
                align="center"
                no-gutters
            >
                <v-col class="grow">
                    <slot></slot>
                </v-col>
                <v-spacer></v-spacer>
                <v-col class="shrink">
                <v-btn
                    text
                    color="error"
                    :to="toRoute"
                    :replace="true"
                >
                    Домой
                </v-btn>
                </v-col>
            </v-row>
        </abp-callout>
    </div>
</template>

<script>
    import ABPCallout from './ABPCallout.vue'
    export default {
        components: {
            'abp-callout' : ABPCallout,
        },
        computed: {
            toRoute() {
                return '/home'
                // return this.$router.currentRoute.path
            }
        },

    }
</script>

<style lang="scss" scoped>

</style>
