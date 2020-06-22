<template>
    <div class="contact">
        <span class="contact-status"></span>
        <img v-bind:src="profile_img" v-bind:alt="default_profile_img" />
        <div class="meta">
            <p class="name">{{name}}</p>
            <p class="preview">{{preview}}</p>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'Contact',
        props: ['status', 'profile_img', 'default_profile_img', 'name', 'preview']
    }
</script>

<style scoped>
    .contact {
        width: 88%;
        margin: 0 auto;
        position: relative;
    }

    @media screen and (max-width: 735px) {
        .contact {
            width: 100%;
        }
    }

    .contact span {
        position: absolute;
        left: 0;
        margin: -2px 0 0 -2px;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        border: 2px solid #2c3e50;
        background: #95a5a6;
    }

    .contact span.online {
        background: #2ecc71;
    }

    .contact span.away {
        background: #f1c40f;
    }

    .contact span.busy {
        background: #e74c3c;
    }

    .contact img {
        width: 40px;
        border-radius: 50%;
        float: left;
        margin-right: 10px;
    }

    @media screen and (max-width: 735px) {
        .contact img {
            margin-right: 0px;
        }
    }

    .contact .meta {
        padding: 5px 0 0 0;
    }

    @media screen and (max-width: 735px) {
        .contact .meta {
            display: none;
        }
    }

    .contact .meta .name {
        font-weight: 600;
    }

    .contact .meta .preview {
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

    .contact .meta .preview span {
        position: initial;
        border-radius: initial;
        background: none;
        border: none;
        padding: 0 2px 0 0;
        margin: 0 0 0 1px;
        opacity: .5;
    }
</style>