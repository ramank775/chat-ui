<template>
    <div class="chat" v-on:click="$emit('click')">
        <span class="chat-status"></span>
        <img v-bind:src="profile_img" alt="Profile" />
        <div class="meta">
            <p class="name">{{name}}</p>
            <p class="preview">{{preview}}</p>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'chat',
        props: ['status', 'profile_img', 'name', 'preview']
    }
</script>

<style scoped>
    .chat {
        width: 88%;
        margin: 0 auto;
        position: relative;
    }

    @media screen and (max-width: 735px) {
        .chat {
            width: 100%;
        }
    }

    .chat span {
        position: absolute;
        left: 0;
        margin: -2px 0 0 -2px;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        border: 2px solid #2c3e50;
        background: #95a5a6;
    }

    .chat span.online {
        background: #2ecc71;
    }

    .chat span.away {
        background: #f1c40f;
    }

    .chat span.busy {
        background: #e74c3c;
    }

    .chat img {
        width: 40px;
        border-radius: 50%;
        float: left;
        margin-right: 10px;
    }

    @media screen and (max-width: 735px) {
        .chat img {
            margin-right: 0px;
        }
    }

    .chat .meta {
        padding: 5px 0 0 0;
    }

    @media screen and (max-width: 735px) {
        .chat .meta {
            display: none;
        }
    }

    .chat .meta .name {
        font-weight: 600;
    }

    .chat .meta .preview {
        margin: 5px 0 0 0;
        padding: 0 0 1px;
        font-weight: 400;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        -moz-transition: 1s all ease;
        -o-transition: 1s all ease;
        -webkit-transition: 1s all ease;
        transition: 1s all ease;
    }

    .chat .meta .preview span {
        position: initial;
        border-radius: initial;
        background: none;
        border: none;
        padding: 0 2px 0 0;
        margin: 0 0 0 1px;
        opacity: .5;
    }

    
    .chat-status {
        border: 2px solid #32465a !important;
    }
</style>