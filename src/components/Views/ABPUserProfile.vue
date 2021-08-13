<template>
    <div>
        <abp-user-profile-form
            v-if="userId"
            :user-id="userId"
        ></abp-user-profile-form>
        <abp-waiting-message
            v-else
        >
            Подождите немного, мы собираем информацию ...
        </abp-waiting-message>

    </div>
</template>

<script>
    import { mapGetters, mapActions } from 'vuex'
    import ABPUserProfileFormVue from '../Forms/ABPUserProfileForm.vue'
    import ABPWaitingMessageVue from '../Info/ABPWaitingMessage.vue'

    export default {
        name: 'abp-user-profile',
        components: {
            'abp-user-profile-form' : ABPUserProfileFormVue,
            'abp-waiting-message' : ABPWaitingMessageVue
        },
        created() {
            this.setTitle('Ваш профиль')
            if (!this.hasUserInfo) {
                this.getUserInfo()
                    .then(()=>{
                        if (this.userInfo) this.setTitle(`Ваш профиль, ${this.userInfo.name}`)
                    })
            } else {
                this.setTitle(`Ваш профиль, ${this.userInfo.name}`)
            }
        },
        methods: {
            ...mapActions(['setTitle','getUserInfo']),
        },
        computed: {
            ...mapGetters(['hasUserInfo','userInfo','userId']),
        }
    }
</script>

<style lang="scss" scoped>

</style>
