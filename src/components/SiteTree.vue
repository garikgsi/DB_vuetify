<template>
    <div>
        <v-treeview
            :active.sync="active"
            :items="siteTree"
            activatable
            transition
            item-text="name"
            @update:active="clickTreeNode"
            :open-all="true"
            dense
        >
            <template v-slot:prepend="{ item, open }">
                <v-icon v-if="item.children">{{ open ? 'mdi-folder-open' : 'mdi-folder' }}</v-icon>
                <v-icon v-else>{{ icons[item.module] }}</v-icon>
            </template>
        </v-treeview>
    </div>
</template>

<script>
    import { mapState, mapGetters } from 'vuex'

    export default {

        data() {
            return {
                active: [],
            }
        },
        created() {
            this.$store.dispatch('fetchSiteTree')
        },
        methods: {
            clickTreeNode() {
                if (this.active.length) {
                    let selectedId = this.active[0]
                    this.$store.dispatch('getMenuPointById',selectedId)
                    this.$store.dispatch('setActiveTreeNode',selectedId)
                } else {
                    this.$store.dispatch('setDefaultMenuPoint')
                    this.$store.dispatch('setActiveTreeNode',0)
                }
                this.$store.dispatch('setDefaultActiveTab')
                this.$store.dispatch('setDefaultContent')
            },
        },
        computed: {
            ...mapState(['curMenuPoint']),
            ...mapGetters(['menuPointId','parentMenuPointId','siteTree','isError','error','icons',
                'isLoading'
            ]),
        },
    }
</script>

