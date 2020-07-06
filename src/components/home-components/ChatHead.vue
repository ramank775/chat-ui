<template>
    <div class="chat-head">
        <img v-bind:src="profile_img" alt="" />
        <p>{{name}}</p>
        <!-- <div class="social-media">
            <i class="fa fa-facebook" aria-hidden="true"></i>
            <i class="fa fa-twitter" aria-hidden="true"></i>
            <i class="fa fa-instagram" aria-hidden="true"></i>
        </div> -->
    </div>
</template>

<script>
    export default {
        name: 'chat-head',
        props: ['profile_img', 'name']
    }
</script>

<style scoped>

    .chat-head {
        width: 100%;
        height: 60px;
        line-height: 60px;
        background: #f5f5f5;
    }

    .chat-head img {
        width: 40px;
        border-radius: 50%;
        float: left;
        margin: 9px 12px 0 9px;
    }

    .chat-head p {
        float: left;
    }

    .chat-head .social-media {
        float: right;
    }

    .chat-head .social-media i {
        margin-left: 14px;
        cursor: pointer;
    }

    .chat-head .social-media i:nth-last-child(1) {
        margin-right: 20px;
    }

    .chat-head .social-media i:hover {
        color: #435f7a;
    }

</style>