<template>
    <div>
        <v-footer
            app
            padless
            absolute
        >
            <v-card
                flat
                tile
                width="100%"
                class="grey darken-1 text-center"
                >
                <div
                    v-if="isAuth"
                    v-show="fullFooter"
                >
                    <v-card-text>
                        <v-row>
                            <v-col
                                v-for="(link,index) in userInterface" :key="`nav_link_${index}`"
                            >
                                <v-btn
                                    class="mx-4"
                                    icon
                                    :to="link.route"

                                >
                                    <v-icon large>
                                        {{ link.icon }}
                                    </v-icon>
                                </v-btn>
                                <div>{{link.title}}</div>
                            </v-col>
                        </v-row>
                    </v-card-text>

                    <v-divider></v-divider>
                </div>

                <v-card-text class="white--text" style="position: relative">
                    <v-fab-transition>
                        <v-btn
                            color="grey darken-3"
                            fab
                            dark
                            small
                            absolute
                            top
                            right
                            @click="fullFooter = !fullFooter"
                        >
                            <abp-icon
                                :icon="icon"
                                :tip="iconTip"
                            ></abp-icon>
                        </v-btn>
                    </v-fab-transition>
                    Разработано в 2020 году в Техно-Консалт
                </v-card-text>
            </v-card>
        </v-footer>
    </div>
</template>

<script>
    import { mapGetters, mapActions } from 'vuex'
    import ABPIconVue from './Form/ABPIcon.vue'

    export default {
        components: {
            'abp-icon' : ABPIconVue
        },
        data() {
            return {
                fullFooter : false
            }
        },
        created() {
            // this.fullFooter = !this.isMobile
        },
        computed: {
            ...mapGetters(['isAuth', 'userInterface','isMobile']),
            icon() {
                return this.fullFooter ? 'mdi-chevron-down' : 'mdi-chevron-up'
            },
            iconTip() {
                return `${this.fullFooter ? 'Скрыть' : 'Показать'} полное меню`
            },
        },
        methods: {
            ...mapActions([]),
        }

    }
</script>

<style lang="scss" scoped>

</style>
