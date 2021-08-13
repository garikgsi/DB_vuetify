<template>
    <div>
        <div
            v-if="dataLoaded"
        >
            <v-card
            >
                <v-card-text>
                    <v-row
                        justify="start"
                    >
                        <v-autocomplete
                            chips
                            clearable
                            deletable-chips
                            multiple
                            :loading="false"
                            v-model="rolesValues"
                            :disabled="!isSuperAdmin || isLoading"
                            :items="roles"
                            filled
                            label="Роли"
                            item-text="name"
                            item-value="id"
                            :hide-selected="true"
                            placeholder="Роли не выбраны"
                            prepend-inner-icon="mdi-account-tie"
                        >
                            <template v-slot:item="data">
                                <v-list-item-content>
                                    <v-list-item-title v-html="data.item.name"></v-list-item-title>
                                    <v-list-item-subtitle v-html="data.item.comment"></v-list-item-subtitle>
                                </v-list-item-content>
                            </template>

                        </v-autocomplete>
                        <!-- <v-autocomplete
                            :loading="false"
                            v-model="rolesValues"
                            :disabled="!isSuperAdmin"
                            :items="roles"
                            filled
                            chips
                            label="Роли"
                            item-text="name"
                            item-value="id"
                            multiple
                            :hide-selected="true"
                            placeholder="Роли не выбраны"
                            prepend-inner-icon="mdi-account-tie"
                        >
                            <template v-slot:selection="data">
                                <v-chip
                                    v-bind="data.attrs"
                                    :input-value="data.selected"
                                    close
                                    @click:close="removeRole(data.item)"
                                    outlined
                                    color="primary"
                                    dark
                                >
                                {{ data.item.name }}
                                </v-chip>
                            </template>
                            <template v-slot:item="data">
                                <template>
                                    <v-list-item-content>
                                        <v-list-item-title v-html="data.item.name"></v-list-item-title>
                                        <v-list-item-subtitle v-html="data.item.comment"></v-list-item-subtitle>
                                    </v-list-item-content>
                                </template>
                            </template>

                        </v-autocomplete> -->
                    </v-row>
                    <!-- <v-row
                        justify="start"
                    >
                        <v-autocomplete
                            :loading="false"
                            v-model="selectValues"
                            :disabled="!isSuperAdmin"
                            :items="roles"
                            filled
                            chips
                            label="Разрешения"
                            item-text="name"
                            item-value="id"
                            multiple
                            :hide-selected="true"
                            placeholder="Разрешения не выбраны"
                            prepend-inner-icon="mdi-cloud-lock"
                        >
                            <template v-slot:selection="data">
                                <v-chip
                                    v-bind="data.attrs"
                                    :input-value="data.selected"
                                    close
                                    @click:close="remove(data.item)"
                                    outlined
                                    color="primary"
                                    dark
                                >
                                {{ data.item.name }}
                                </v-chip>
                            </template>
                            <template v-slot:item="data">
                                <template>
                                    <v-list-item-content>
                                        <v-list-item-title v-html="data.item.name"></v-list-item-title>
                                        <v-list-item-subtitle v-html="data.item.comment"></v-list-item-subtitle>
                                    </v-list-item-content>
                                </template>
                            </template>
                        </v-autocomplete>
                    </v-row> -->

                    <!-- <v-row
                        justify="start"
                    >
                        <v-autocomplete
                            :loading="false"
                            v-model="selectValues"
                            :disabled="!isSuperAdmin"
                            :items="roles"
                            filled
                            chips
                            label="Интерфейсы"
                            item-text="name"
                            item-value="id"
                            multiple
                            :hide-selected="true"
                            placeholder="Интерфейсы не выбраны"
                            prepend-inner-icon="mdi-axis-arrow-lock"
                        >
                            <template v-slot:selection="data">
                                <v-chip
                                    v-bind="data.attrs"
                                    :input-value="data.selected"
                                    close
                                    @click:close="remove(data.item)"
                                    outlined
                                    color="primary"
                                    dark
                                >
                                {{ data.item.name }}
                                </v-chip>
                            </template>
                            <template v-slot:item="data">
                                <template>
                                    <v-list-item-content>
                                        <v-list-item-title v-html="data.item.name"></v-list-item-title>
                                        <v-list-item-subtitle v-html="data.item.comment"></v-list-item-subtitle>
                                    </v-list-item-content>
                                </template>
                            </template>
                        </v-autocomplete>
                    </v-row> -->
                </v-card-text>

                <v-divider></v-divider>
                <v-card-actions>
                    <v-btn
                        v-if="isSuperAdmin"
                        color="primary"
                        @click="savePermissions"
                        :disabled="isLoading"
                        :loading="isLoading"
                    >
                        ОК
                    </v-btn>
                </v-card-actions>
            </v-card>
        </div>


        <abp-waiting-message
            v-else
        >
            Подождите, мы загружаем начальные данные. Это не займет много времени.
        </abp-waiting-message>
    </div>
</template>

<script>
    import { mapGetters, mapActions } from 'vuex'
    import ABPWaitingMessage from '../Info/ABPWaitingMessage.vue'

    export default {
        name: 'permissions-roles',
        props: {
            userId: {
                type : Number,
                required: false,
                default: null
            },
        },

        components: {
            'abp-waiting-message' : ABPWaitingMessage,
        },
        created() {
            if (!this.rolesLoaded) {
                this.getRoles()
            }
            // перечитаем права пользователя в store
            this.getUserRoles(this.userId)
        },
        data () {
            return {
            }
        },
        computed: {
            ...mapGetters(['rolesLoaded','roles','userRoles','hasUserRoles','isLoading','thisUserRoles','isSuperAdmin']),
            rolesValues: {
                get() {
                    return this.userRoles
                },
                set(newVal) {
                    this.setUserRoles(newVal)
                }
            },
            dataLoaded() {
                return this.rolesLoaded && this.hasUserRoles || false
            }
        },

        methods: {
            ...mapActions(['getRoles','getUserRoles','saveUserPermissions','setUserRoles']),
            savePermissions() {
                this.saveUserPermissions(this.userId)
            }
        },
        watch: {
            userId(newValue) {
                this.getUserRoles(newValue)
            },
            dataLoaded(newValue) {
                if (newValue) this.$emit('loaded')
            }
        }
    }
</script>

<style lang="scss" scoped>

</style>
