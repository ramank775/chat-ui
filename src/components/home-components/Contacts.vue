<template>
    <div id="contacts">
        <ul>
            <li v-bind:class="['contact', contact.active? 'active': '']" v-for="contact in contacts" :key="contact.username">
                <contact 
                    v-bind:status="contact.status" 
                    v-bind:profile_img="[contact.profile_img|| default_profile_img]" 
                    v-bind:name="contact.name" 
                    v-bind:preview="contact.preview"
                    v-on:click="$emit('select', contact)">
                </contact>
            </li>
        </ul>
    </div>
</template>

<script>
    import Contact from './Contact.vue'
    export default {
        name: 'Contacts',
        props:['contacts', 'default_profile_img'],
        components: {
            contact: Contact
        },
        methods: {
            created: () => {
                console.log(this.contacts)
            }
        }
    }
</script>

<style scoped>
    #contacts {
        height: calc(100% - 177px);
        overflow-y: scroll;
        overflow-x: hidden;
    }

    @media screen and (max-width: 735px) {
        #contacts {
            height: calc(100% - 149px);
            overflow-y: scroll;
            overflow-x: hidden;
        }

        #contacts::-webkit-scrollbar {
            display: none;
        }
    }

    #contacts.expanded {
        height: calc(100% - 334px);
    }

    #contacts::-webkit-scrollbar {
        width: 8px;
        background: #2c3e50;
    }

    #contacts::-webkit-scrollbar-thumb {
        background-color: #243140;
    }

    #contacts ul li.contact {
        position: relative;
        padding: 10px 0 15px 0;
        font-size: 0.9em;
        cursor: pointer;
    }

    @media screen and (max-width: 735px) {
        #contacts ul li.contact {
            padding: 6px 0 46px 8px;
        }
    }

    #contacts ul li.contact:hover {
        background: #32465a;
    }

    #contacts ul li.contact.active {
        background: #32465a;
        border-right: 5px solid #435f7a;
    }

</style>