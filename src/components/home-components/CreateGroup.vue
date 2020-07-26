<template>
    <model>
        <div slot="header">
            New Group
        </div>
        <div slot="body">
            <div id="group_name">
                <input type="text" name="group"  v-model="name" placeholder="Group Name"/>
            </div>
            <div id="selected_contacts_div">
                <label>Selected Contacts ({{(selectedContacts||[]).length}})</label>
                <chats v-bind:chats="selectedContacts"
                    v-bind:default_profile_img="default_profile_img"
                    v-on:select="onSelectionRemove" />
            </div>
            <hr/>
            <div id="search_div">
                <search v-on:change="onSearch"></search>
            </div>
            <hr/>
            <div id="contacts_div">
                <label>Contacts ({{(contactSource||[]).length}})</label>
                <chats v-bind:chats="contactSource"
                    v-bind:default_profile_img="default_profile_img"
                    v-on:select="onSelect" />
            </div>
        </div>
        <div slot="footer">
            <button v-on:click="onCreateGroup">
                <i class="fa fa-group fa-fw" aria-hidden="true"></i> 
                <span>Create Group</span>
            </button>
            <button v-on:click="$emit('cancel')">
                <span>Cancel</span>
            </button>
        </div>
    </model>
</template>

<script>
    import Chats from './Chats.vue';
    import Search from './Search.vue';
    import Model from '../Model.vue';

    export default {
        name: 'CreateGroup',
        components: {
            model: Model,
            search: Search,
            chats: Chats
        },
        data: function() {
            return {
                name: '',
                selectedContacts: [],
                contactSource: [],
                contacts: []
            }
        },
        props: ['getContact', 'default_profile_img'],
        methods: {
            onSearch: async function(searchText) {
                this.contacts = await this.getContact(searchText);
                this.updateContactSource();
            },
            onSelect: function(contact) {
                this.selectedContacts.push(contact);
                this.updateContactSource();
            },
            onSelectionRemove: function(contact) {
                this.selectedContacts = this.selectedContacts.filter(x=> contact != x);
                this.updateContactSource();
            },
            onCreateGroup: function() {
                if(!this.selectedContacts.length) return;
                const members = this.selectedContacts.map(x=>x.username);
                this.$emit('create', {
                    name: this.name || members.join(' ,'),
                    members: this.selectedContacts.map(x=>x.username)
                });
            },
            updateContactSource: function() {
                this.contactSource = this.contacts.filter(x=> !this.selectedContacts.find(y=>y.username === x.username));
            }
        },
        created: async function() {
            try {
                this.contacts = await this.getContact('');
                this.updateContactSource(); 
            } catch(err) {
                console.log(err);
            }
            
        }
    }
</script>

<style>
    #group_name input {
        font-family: "proxima-nova", "Source Sans Pro", sans-serif;
        padding: 10px 0 10px 46px;
        width: 94%;
        border: none;
        background: #32465a;
        color: #f5f5f5;
    }

    #group_name input:focus {
        outline: none;
        background: #435f7a;
    }

    #group_name input::-webkit-input-placeholder {
        color: #f5f5f5;
    }

    #group_name input::-moz-placeholder {
        color: #f5f5f5;
    }

    #group_name input:-ms-input-placeholder {
        color: #f5f5f5;
    }

    #group_name input:-moz-placeholder {
        color: #f5f5f5;
    }

    button {
        border: none;
        width: 50%;
        padding: 10px 0;
        background: #32465a;
        color: #f5f5f5;
        cursor: pointer;
        font-size: 0.85em;
        font-family: "proxima-nova", "Source Sans Pro", sans-serif;
    }

    #selected_contacts_div {
        font-family: "proxima-nova", "Source Sans Pro", sans-serif;
        background: #32465a;
        overflow-y: auto;
        min-height: 100px;
        max-height: 200px;
    }
    #selected_contacts_div::-webkit-scrollbar {
        width: 8px;
        background: #2c3e50;
    }

    #selected_contacts_div::-webkit-scrollbar-thumb {
        background-color: #243140;
    }
    #selected_contacts_div label {
        padding: 10px 0 10px 46px;
    }
    #contacts_div {
        font-family: "proxima-nova", "Source Sans Pro", sans-serif;
        background: #32465a;
        overflow-y: auto;
        min-height: 100px;
        max-height: 200px;
    }
    #contacts_div::-webkit-scrollbar {
        width: 8px;
        background: #2c3e50;
    }

    #contacts_div::-webkit-scrollbar-thumb {
        background-color: #243140;
    }
    #contacts_div label {
        padding: 10px 0 10px 46px;
    }
    #search_div > * {
        width: 97.2%;
    }
</style>
