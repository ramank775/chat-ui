<template>
  <div id="frame">
    <div id="sidepanel">
        <profile 
            v-bind:profile_img="[user.profile_img||default_profile_img]" 
            v-bind:username="user.name" 
            v-bind:default_profile_img="default_profile_img" 
        />
        <search v-on:change="onSearch" v-model="searchText"></search>
        <div id="chatspanel">
            <chats
                v-bind:chats="chats"
                v-bind:default_profile_img="default_profile_img"
                v-on:select="onChatSelect" 
            />
        </div>
        <div v-if="showGroup">
            <create-group 
                v-bind:getContact="(x) => store.searchUsers(x)" 
                v-bind:default_profile_img="default_profile_img"
                v-on:create="onGroupCreate"
                v-on:cancel="showGroup=false" />
        </div>
        <div id="bottom-bar">
            <button id="addcontact" v-on:click="showGroup = true">
                <i class="fa fa-group fa-fw" aria-hidden="true"></i> 
                <span>New Group</span>
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
                v-bind:inputDisable="isInputDisable"
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
    import CreateGroup from './home-components/CreateGroup.vue';
    import defaultProfileImg from '@/assets/default-user.png';
    import { ChatViewModel, ChatType } from '../model';
    import notificationSound from '@/assets/inbox.mp3';
   
    export default {
        name: 'Home',
        components: {
            'profile': Profile,
            'chats': Chats,
            'search': Search,
            'chat-room': ChatRoom,
            'create-group': CreateGroup
        },
        props: ['store'],
        data : () => ({
            user: {},
            chats: [],
            chatMapping : new Map(),
            default_profile_img: defaultProfileImg,
            searchText: '',
            selectedChat: null,
            filteredChatMapping: new Map(),
            showGroup: false,
            isInputDisable: false
        }),
        methods: {
            sendMessage: function(message) {
                this.selectedChat.messages.push({...message, from: this.user.username, self: true,ts: Date.now()});
                this.store.sendMessage({...message, to: this.selectedChat.id});
                if(this.chats.indexOf(this.selectedChat) != 0)
                    this.updateChatList();
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
                this.isInputDisable = this.selectedChat.users.indexOf(this.user.username) == -1;
            },
            onSearch: async function() {
                const contacts = await this.store.searchUsers(this.searchText)
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
                    return -(x.messages[x.messages.length -1]?.ts - y.messages[y.messages.length -1]?.ts);
                });
            },
            onGroupCreate: async function(payload) {
                const chat = await this.store.createGroup(payload);
                this.chatMapping = await this.store.getChats();
                this.filteredChatMapping = this.chatMapping;
                this.updateChatList();
                this.selectedChat = this.filteredChatMapping.get(chat.id);
                this.showGroup = false;
            }
        },
        created: async function() {
            try {
                await this.store.connect();
            } catch(err) {
                console.error(err);
            }
            const sound = new Audio(notificationSound);
            this.store.newMessageEvent.subscribe(async (msg) => {
                let chat = this.chatMapping.get(msg.chatId)
                if(this.chatMapping.has(msg.chatId)) {
                    chat.messages.push(msg);
                } else {
                    this.chatMapping = await this.store.getChats();
                    this.filteredChatMapping = this.chatMapping;
                }
                this.updateChatList();
                sound.play();
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

    #chatspanel {
        height: calc(100% - 177px);
        overflow-y: scroll;
        overflow-x: hidden;
    }

    @media screen and (max-width: 735px) {
        #chatspanel {
            height: calc(100% - 149px);
            overflow-y: scroll;
            overflow-x: hidden;
        }

        #chatspanel::-webkit-scrollbar {
            display: none;
        }
    }
    #chatspanel::-webkit-scrollbar {
        width: 8px;
        background: #2c3e50;
    }

    #chatspanel::-webkit-scrollbar-thumb {
        background-color: #243140;
    }

</style>