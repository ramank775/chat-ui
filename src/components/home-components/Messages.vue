<template>
    <div class="messages">
        <ul>
            <li v-for="message in messages" :key="message.id">
                <message v-bind:msg="message">
                </message>
            </li>
        </ul>
    </div>
</template>


<script>
    import Message from './Message.vue';
    export default {
        name: 'messages',
        props: ['messages'],
        components: {
            message: Message
        }
    }
</script>

<style scoped>
    
    .messages {
        height: auto;
        min-height: calc(100% - 93px);
        max-height: calc(100% - 93px);
        overflow-y: scroll;
        overflow-x: hidden;
    }

    @media screen and (max-width: 735px) {
        .messages {
            max-height: calc(100% - 105px);
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