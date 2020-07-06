<template>
    <div v-bind:class="[message.self?'sent': 'reply']">
        <img v-bind:src="[user.profile_img || default_profile_img]" alt="" />
        <p>{{message.text}}</p>
    </div>
</template>


<script>
    export default {
        name: 'message',
        props:['message', 'default_profile_img', 'user']
    }
</script>

<style scoped>

    .reply img {
        margin: 6px 8px 0 0;
    }

    .reply p {
        background: #435f7a;
        color: #f5f5f5;
    }

    .sent img {
        float: right;
        margin: 6px 0 0 8px;
    }

    .sent p {
        background: #f5f5f5;
        float: right;
    }

    img {
        width: 22px;
        border-radius: 50%;
        float: left;
    }

    p {
        display: inline-block;
        padding: 10px 15px;
        border-radius: 20px;
        max-width: 205px;
        line-height: 130%;
    }

    @media screen and (min-width: 735px) {
        p {
            max-width: 300px;
        }
    }

</style>