<template>
    <div>
        <site-content-table v-if="menuPointListable"></site-content-table>
        <content-menu-point-form v-else></content-menu-point-form>
    </div>
</template>

<script>
    import { mapState, mapGetters } from 'vuex'

    import SiteContentTable from './Tables/SiteContentTable.vue'
    import ContentMenuPointForm from './Forms/ContentMenuPointForm.vue'


    export default {
        components: {
            'site-content-table' : SiteContentTable,
            'content-menu-point-form' : ContentMenuPointForm
        },
        computed: {
            ...mapState([]),
            ...mapGetters(['menuPointListable','isError','error']),
        }
    }
</script>

<style lang="scss" scoped>

</style>
