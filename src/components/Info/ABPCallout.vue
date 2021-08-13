<template>
    <div>
        <v-alert
        text
        dense
        :color="color"
        :icon="icon"
        >
            <h3 class="headline">
                {{title}}
            </h3>
            <v-row>
                <v-col cols="12">
                    <v-progress-linear
                        height="2"
                        indeterminate
                        :color="color"
                    ></v-progress-linear>
                </v-col>
            </v-row>

            <slot></slot>
        </v-alert>
    </div>
</template>

<script>
    export default {
        props: {
            title: {
                type: String,
                required: false,
                default: 'Подождите немного'
            },
            icon: {
                type: String,
                required: false,
                default: 'mdi-clock-fast'
            },
            color: {
                type: String,
                required: false,
                default: 'info'
            }
        }
    }
</script>

<style lang="scss" scoped>

</style>
