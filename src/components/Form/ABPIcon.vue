<template>
    <div>
        <v-tooltip
            v-model="show"
            top
        >
            <template v-slot:activator="{ on, attrs }">
                <v-icon
                    v-bind="attrs"
                    v-on="on"
                    :color="color"
                >
                    {{icon}}
                </v-icon>
            </template>
            <span
                v-if="tip"
            >
                {{tip}}
            </span>
        </v-tooltip>
    </div>
</template>

<script>
    export default {
        name: 'abp-icon',
        props: {
            // значок
            icon: {
                type : String,
                required: true,
            },
            // подсказка
            tip: {
                type : String,
                required: false,
            },
            color: {
                type : String,
                required: false,
                default: null
            }
        },
        data() {
            return {
                show: false
            }
        },
    }
</script>

<style lang="scss" scoped>
    
</style>
