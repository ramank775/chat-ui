<template>
    <div class="message-input">
        <div class="wrap">
            <input type="text" v-model="msg.text" placeholder="Write your message..." v-on:keyup.enter="submit(msg)" />
            <!-- <i class="fa fa-paperclip attachment" aria-hidden="true"></i> -->
            <button class="submit" v-on:click="submit(msg)"><i class="fa fa-paper-plane" aria-hidden="true" :disabled="inputDisable"></i></button>
        </div>
    </div>
</template>


<script>
    export default {
        name: 'message-input',
        props: ['value','inputDisable'],
        data: function() {
            return {
                msg: {...this.value}
            }
        },
        methods: {
            submit: function(msg) {
                if(this.inputDisable) return;
                if(!msg.text) return;
                this.$emit('submit', msg);
                this.msg = {text: ''}
            }
        }
    }
</script>


<style scoped>
    .message-input {
        position: absolute;
        bottom: 0;
        width: 100%;
        z-index: 99;
    }

    .message-input .wrap {
        position: relative;
    }

    .message-input .wrap input {
        font-family: "proxima-nova", "Source Sans Pro", sans-serif;
        float: left;
        border: none;
        width: calc(100% - 90px);
        padding: 11px 32px 10px 8px;
        font-size: 0.8em;
        color: #32465a;
    }

    @media screen and (max-width: 735px) {
        .message-input .wrap input {
            padding: 15px 32px 16px 8px;
        }
    }

    .message-input .wrap input:focus {
        outline: none;
    }

    .message-input .wrap .attachment {
        position: absolute;
        right: 60px;
        z-index: 4;
        margin-top: 10px;
        font-size: 1.1em;
        color: #435f7a;
        opacity: .5;
        cursor: pointer;
    }

    @media screen and (max-width: 735px) {
        .message-input .wrap .attachment {
            margin-top: 17px;
            right: 65px;
        }
    }

    .message-input .wrap .attachment:hover {
        opacity: 1;
    }

    .message-input .wrap button {
        float: right;
        border: none;
        width: 50px;
        padding: 12px 0;
        cursor: pointer;
        background: #32465a;
        color: #f5f5f5;
    }

    @media screen and (max-width: 735px) {
        .message-input .wrap button {
            padding: 16px 0;
        }
    }

    .message-input .wrap button:hover {
        background: #435f7a;
    }

    .message-input .wrap button:focus {
        outline: none;
    }
</style>