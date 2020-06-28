<template>
  <div id="frame">
    <div id="sidepanel">
        <profile 
            v-bind:profile_img="user.profile_img" 
            v-bind:username="user.name" 
            v-bind:default_profile_img="default_profile_img" 
        />
        <search v-on:change="onSearch" v-model="searchText"></search>
        <contacts
            v-bind:contacts="contacts"
            v-bind:default_profile_img="default_profile_img"
            v-on:select="onContactSelect"></contacts>
        <div id="bottom-bar">
            <button id="addcontact">
                <i class="fa fa-user-plus fa-fw" aria-hidden="true"></i> 
                <span>Add contact</span>
            </button>
			<button id="settings">
                <i class="fa fa-cog fa-fw" aria-hidden="true"></i> 
                <span>Settings</span>
            </button>
        </div>
    </div>
    <div class="content">
        <contact-profile
            v-bind:profile_img="user.profile_img"
            v-bind:name="user.name"
        />
        <messages v-bind:messages="messages"></messages>
        <message-input v-on:submit="newMessage"></message-input>
    </div>
  </div>
</template>

<script>
    import Contacts from './home-components/Contacts.vue';
    import Profile from './home-components/Profile.vue';
    import Search from './home-components/Search.vue';
    import ContactProfile from './home-components/ContactProfile.vue';
    import Messages from './home-components/Messages.vue';
    import MessageInput from './home-components/MessageInput.vue';
    
    const contacts = [{
        status: 'online',
        profile_img: 'http://emilcarlsson.se/assets/louislitt.png',
        username: 'Louis Litt',
        preview: 'You just got LITT up, Mike.',
        active: true
    },{
        status: 'online',
        profile_img: 'http://emilcarlsson.se/assets/louislitt.png',
        username: 'Louis',
        preview: 'You just got LITT up, Mike.'
    },{
        status: 'online',
        profile_img: 'http://emilcarlsson.se/assets/louislitt.png',
        username: 'Litt',
        preview: 'You just got LITT up, Mike.'
    },{
        status: 'online',
        profile_img: 'http://emilcarlsson.se/assets/louislitt.png',
        username: 'Litt Louis',
        preview: 'You just got LITT up, Mike.'
    },{
        status: 'online',
        profile_img: 'http://emilcarlsson.se/assets/louislitt.png',
        username: 'Louis Litt 1',
        preview: 'You just got LITT up, Mike.'
    }]

    const messages = [{
        text: 'Hello',
        user:  {
            profile_img: 'http://emilcarlsson.se/assets/louislitt.png',
            username: 'Louis Litt',
        },
        self: true
    }, {
        text: 'Hello',
        user:  {
             profile_img: 'http://emilcarlsson.se/assets/louislitt.png',
             username: 'Louis',
        },
        self: false
    }]

    const self = {
                name:"Raman",
                profile_img: 'http://emilcarlsson.se/assets/mikeross.png'
        }
    export default {
        name: 'Home',
        components: {
            'profile': Profile,
            'contacts': Contacts,
            'search': Search,
            'contact-profile': ContactProfile,
            'messages': Messages,
            'message-input': MessageInput
        },
        data : () => ({
            user: self,
            contacts: contacts,
            default_profile_img: 'http://emilcarlsson.se/assets/mikeross.png',
            messages: messages,
            searchText: ''
        }),
        methods: {
            newMessage: function(message) {
                this.messages.push({...message, user: this.user, self: true});
            },
            onContactSelect: function(contact) {
                const contacts = [...this.contacts]
                const activeContact = contacts.find(x=> x.active);
                if(activeContact) {
                    activeContact.active = false;
                }
                const newActiveContact = contacts.find(x => x.username === contact.username);
                newActiveContact.active = true;
                this.contacts = contacts;
            },
            onSearch: function() {
                console.log(this.searchText)
            }
        }
    }
</script>

<style scoped>
    #frame {
        width: 100%;
        min-width: 360px;
        height: 100vh;
        min-height: 300px;
        background: #E6EAEA;
    }

    @media screen and (max-width: 360px) {
        #frame {
            width: 100%;
            height: 100vh;
        }
    }

    #frame #sidepanel {
        float: left;
        min-width: 280px;
        max-width: 340px;
        width: 40%;
        height: 100%;
        background: #2c3e50;
        color: #f5f5f5;
        overflow: hidden;
        position: relative;
    }

    @media screen and (max-width: 735px) {
        #frame #sidepanel {
            width: 58px;
            min-width: 58px;
        }
    }
    #frame #sidepanel #bottom-bar {
        position: absolute;
        width: 100%;
        bottom: 0;
    }

    #frame #sidepanel #bottom-bar button {
        float: left;
        border: none;
        width: 50%;
        padding: 10px 0;
        background: #32465a;
        color: #f5f5f5;
        cursor: pointer;
        font-size: 0.85em;
        font-family: "proxima-nova", "Source Sans Pro", sans-serif;
    }

    @media screen and (max-width: 735px) {
        #frame #sidepanel #bottom-bar button {
            float: none;
            width: 100%;
            padding: 15px 0;
        }
    }

    #frame #sidepanel #bottom-bar button:focus {
        outline: none;
    }

    #frame #sidepanel #bottom-bar button:nth-child(1) {
        border-right: 1px solid #2c3e50;
    }

    @media screen and (max-width: 735px) {
        #frame #sidepanel #bottom-bar button:nth-child(1) {
            border-right: none;
            border-bottom: 1px solid #2c3e50;
        }
    }

    #frame #sidepanel #bottom-bar button:hover {
        background: #435f7a;
    }

    #frame #sidepanel #bottom-bar button i {
        margin-right: 3px;
        font-size: 1em;
    }

    @media screen and (max-width: 735px) {
        #frame #sidepanel #bottom-bar button i {
            font-size: 1.3em;
        }
    }

    @media screen and (max-width: 735px) {
        #frame #sidepanel #bottom-bar button span {
            display: none;
        }
    }
    #frame .content {
        float: right;
        width: 60%;
        height: 100%;
        overflow: hidden;
        position: relative;
    }

    @media screen and (max-width: 735px) {
        #frame .content {
            width: calc(100% - 58px);
            min-width: 300px !important;
        }
    }

    @media screen and (min-width: 900px) {
        #frame .content {
            width: calc(100% - 340px);
        }
    }
</style>