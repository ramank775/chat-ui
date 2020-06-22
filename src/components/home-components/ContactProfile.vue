<template>
    <div class="contact-profile">
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
        name: 'contact-profile',
        props: ['profile_img', 'name']
    }
</script>

<style scoped>

    .contact-profile {
        width: 100%;
        height: 60px;
        line-height: 60px;
        background: #f5f5f5;
    }

    .contact-profile img {
        width: 40px;
        border-radius: 50%;
        float: left;
        margin: 9px 12px 0 9px;
    }

    .contact-profile p {
        float: left;
    }

    .contact-profile .social-media {
        float: right;
    }

    .contact-profile .social-media i {
        margin-left: 14px;
        cursor: pointer;
    }

    .contact-profile .social-media i:nth-last-child(1) {
        margin-right: 20px;
    }

    .contact-profile .social-media i:hover {
        color: #435f7a;
    }

</style>