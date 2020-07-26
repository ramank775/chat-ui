<template>
    <div id="chats">
        <ul>
            <li v-for="chat in chats" :key="chat.chatId">
                <chat 
                    v-bind:status="chat.status" 
                    v-bind:profile_img="[chat.profile_img|| default_profile_img]" 
                    v-bind:name="chat.name" 
                    v-bind:preview="chat.preview"
                    v-on:click="$emit('select', chat)">
                </chat>
            </li>
        </ul>
    </div>
</template>

<script>
    import Chat from './Chat.vue'
    export default {
        name: 'chats',
        props:['chats', 'default_profile_img'],
        components: {
            chat: Chat
        },
        methods: {
            created: () => {
                console.log(this.chats)
            }
        }
    }
</script>

<style scoped>
    
    #chats.expanded {
        height: calc(100% - 334px);
    }

    #chats::-webkit-scrollbar {
        width: 8px;
        background: #2c3e50;
    }

    #chats::-webkit-scrollbar-thumb {
        background-color: #243140;
    }

    #chats ul li.chat {
        position: relative;
        padding: 10px 0 15px 0;
        font-size: 0.9em;
        cursor: pointer;
    }

    @media screen and (max-width: 735px) {
        #chats ul li.chat {
            padding: 6px 0 46px 8px;
        }
    }

    #chats ul li.chat:hover {
        background: #32465a;
    }

    #chats ul li.chat.active {
        background: #32465a;
        border-right: 5px solid #435f7a;
    }

</style>