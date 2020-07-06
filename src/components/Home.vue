<template>
  <div id="frame">
    <div id="sidepanel">
        <profile 
            v-bind:profile_img="[user.profile_img||default_profile_img]" 
            v-bind:username="user.name" 
            v-bind:default_profile_img="default_profile_img" 
        />
        <search v-on:change="onSearch" v-model="searchText"></search>
        <chats
            v-bind:chats="chats"
            v-bind:default_profile_img="default_profile_img"
            v-on:select="onChatSelect" 
        />
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
        <div v-if="selectedChat">
            <chat-room 
                v-bind:chat="selectedChat"
                v-bind:default_profile_img="default_profile_img"
                v-on:sendMessage="sendMessage"
            />
        </div>
        <div v-else>
            <h2>Welcome</h2>
        </div>
    </div>
  </div>
</template>

<script>
    import Chats from './home-components/Chats.vue';
    import Profile from './home-components/Profile.vue';
    import Search from './home-components/Search.vue';
    import ChatRoom from './home-components/ChatRoom.vue';
    import defaultProfileImg from '@/assets/default-user.png';
    import { ChatViewModel, ChatType } from '../model';
   
    export default {
        name: 'Home',
        components: {
            'profile': Profile,
            'chats': Chats,
            'search': Search,
            'chat-room': ChatRoom
        },
        props: ['store'],
        data : () => ({
            user: {},
            chats: [],
            chatMapping : new Map(),
            default_profile_img: defaultProfileImg,
            searchText: '',
            selectedChat: null,
            filteredChatMapping: new Map()
        }),
        methods: {
            sendMessage: function(message) {
                this.selectedChat.messages.push({...message, from: this.user.username,  self: true});
                this.store.sendMessage({...message, to: this.selectedChat.id});
            },
            onChatSelect: function(chat) {
                const chats = [...this.chats]
                const activeChat = chats.find(x=> x.active);
                if(activeChat) {
                    activeChat.active = false;
                }
                const newActiveChat = chats.find(x => x.id === chat.id);
                newActiveChat.active = true;
                this.chats = chats;
                if(this.selectedChat?.id !== chat.id) {
                    this.selectedChat = chat;
                    //this.loadChat();
                }
            },
            onSearch: async function() {
                const localSearchPromise = this.store.getContacts(this.searchText);
                let serverSearchPromise = null;
                if(this.searchText.length > 4) {
                    serverSearchPromise = this.store.searchUsers(this.searchText)
                }
                const localContacts = await localSearchPromise;
                const serverContacts = (await serverSearchPromise)||[];
                const localUsernames = localContacts.map(x=>x.username);
                const uniqueServerContacts = serverContacts
                        .filter(x=> localUsernames.indexOf(x.username) == -1);
                let contacts = [...localContacts, ...uniqueServerContacts];
                const chatMapping = new Map()
                contacts.forEach(contact => {
                    let chat = this.chatMapping.get(contact.username)
                    if(!chat) {
                        chat = new ChatViewModel({
                            type: ChatType.PERSONAL,
                            id: contact.username,
                            users: [this.user.username, contact.username],
                            name: contact.name
                        });
                        chat.messages =[];
                        chat.usersProfile.set(contact.username, contact);
                        chat.usersProfile.set(this.user.username, this.user);
                    }
                    chatMapping.set(chat.id, chat);
                });
                this.filteredChatMapping = chatMapping;
                this.updateChatList();
            },
            loadChat: async function() {
                if(!this.selectedChat) return;
                const messages = await this.store.getMessages(this.selectedChat.chatId);
                const contacts = await this.store.getContacts();
                contacts.push(this.user);
                this.messages = messages;
                console.log(messages);
            },
            updateChatList: function() {
                this.chats = Array.from(this.filteredChatMapping.values()).sort((x,y) => {
                    return x[0]?.ts - y[0]?.ts;
                });
            }
        },
        created: async function() {
            await this.store.connect();
            this.store.newMessageEvent.subscribe(async (msg) => {
                let chat = this.chatMapping.get(msg.chatId)
                if(this.chatMapping.has(msg.chatId)) {
                    chat.messages.push(msg);
                } else {
                    this.chats = await this.store.getChats();
                }
                this.updateChatList();
                
            });
            console.log('store connected')
            this.user = await this.store.getUser();
            this.chatMapping = await this.store.getChats();
            this.filteredChatMapping = this.chatMapping;
            this.updateChatList();

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