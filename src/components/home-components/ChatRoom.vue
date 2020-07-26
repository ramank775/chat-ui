<template>
    <div>
        <chat-head
                v-bind:profile_img="[chat.profile_img||default_profile_img]"
                v-bind:name="chat.name"
        />
        <messages v-bind:messages="chat.messages" 
            v-bind:default_profile_img="default_profile_img" 
            v-bind:users="chat.usersProfile"></messages>
        <message-input v-on:submit="sendMessage" v-bind:inputDisable="inputDisable"></message-input>
    </div>
</template>

<script>
    import ChatHead from './ChatHead.vue';
    import Messages from './Messages.vue';
    import MessageInput from './MessageInput.vue';
    
    export default {
        name: 'ChatRoom',
        props: ['chat', 'default_profile_img', 'inputDisable'],
        methods: {
            sendMessage: function(msg) {
                this.$emit('sendMessage', msg);
            }
        },
        components: {
            'chat-head': ChatHead,
            'messages': Messages,
            'message-input': MessageInput
        }
    }
</script>