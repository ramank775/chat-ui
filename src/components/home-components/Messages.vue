<template>
    <div class="messages" ref='messages'>
        <ul>
            <li v-for="message in messages" :key="message.id">
                <message v-bind:message="message" 
                    v-bind:user="getUser(message)"
                    v-bind:default_profile_img="default_profile_img">
                </message>
            </li>
        </ul>
    </div>
</template>


<script>
    import Message from './Message.vue';
    export default {
        name: 'messages',
        props: ['messages', 'default_profile_img', 'users'],
        components: {
            message: Message
        },
        methods: {
            getUser: function(message) {
                return this.users.get(message.from);
            }
        },
        mounted: function() {
            const messageDisplay = this.$refs.messages;
            messageDisplay.scrollTop = messageDisplay.scrollHeight
        },
        updated: function() {
            const messageDisplay = this.$refs.messages;
            messageDisplay.scrollTop = messageDisplay.scrollHeight
        }
    }
</script>

<style scoped>
    
    .messages {
        height: auto;
        min-height: calc(100vh - 93px);
        max-height: calc(100vh - 93px);
        overflow-y: scroll;
        overflow-x: hidden;
    }

    @media screen and (max-width: 735px) {
        .messages {
            max-height: calc(100vh - 105px);
        }
    }

    .messages::-webkit-scrollbar {
        width: 8px;
        background: transparent;
    }

    .messages::-webkit-scrollbar-thumb {
        background-color: rgba(0, 0, 0, 0.3);
    }

    .messages ul li {
        display: inline-block;
        clear: both;
        float: left;
        margin: 15px 15px 5px 15px;
        width: calc(100% - 25px);
        font-size: 0.9em;
    }

    .messages ul li:nth-last-child(1) {
        margin-bottom: 20px;
    }

</style>