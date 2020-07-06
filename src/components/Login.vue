<template>
    <div class="animate center">
        <div class="imgcontainer">
                <img src="@/assets/logo.png" alt="Avatar" class="avatar">
        </div>
        <div class="tab">
            <button class="green" v-on:click="tab='login'">Login</button><button class="red" v-on:click="tab='signup'">Signup</button>
        </div>
        <div v-if="tab == 'login'">
            <form @submit.prevent="handleLogin(login)">
                <div class="container">
                    <label for="uname"><b>Username</b></label>
                    <input type="text" placeholder="Enter Username" name="uname" required v-model="login.username">

                    <label for="psw"><b>Password</b></label>
                    <input type="password" placeholder="Enter Password" name="psw" required v-model="login.psw">

                    <button type="submit" class="green">Login</button>
                   
                </div>
            </form>
        </div>
        <div v-else>
            <form @submit.prevent="handleSignup(signup)">
                <div class="container">
                    <input type="text" placeholder="Enter Username" name="username" required v-model="signup.username" v-on:input="validateUsername($event.target.value)">
                    <input type="text" placeholder="Enter your name" name="name" required v-model="signup.name">
                    <input type="password" placeholder="Enter Password" name="psw" required v-model="signup.psw">
                    <input type="password" placeholder="Repeat Password" name="psw-repeat" required v-model="signup.psw_repeat">

                    <p>By creating an account you agree to our <a href="#" style="color:dodgerblue">Terms & Privacy</a>.</p>

                    <div class="clearfix">
                        <button type="submit" class="red" :disabled="!isUsernameAvailable">Sign Up</button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'login',
        props:['isUsernameAvailable'],
        data: () => ({
            tab: 'login',
            login: {
                username: '',
                psw: ''
            },
            signup: {
                username: '',
                name: '',
                psw: '',
                psw_repeat: ''
            }
        }),
        methods: {
            handleLogin: function(login){
                this.$emit('login', login);
            },
            handleSignup: function(signup) {
                if(signup.psw !== signup.psw_repeat) {
                    alert('Password doesn\'t match');
                    return;
                }
                this.$emit('signup', signup)
            },
            validateUsername: function(username) {
                this.$emit('validateUsername', username);
            }
        }
    }
</script>

<style scoped>
.center {
  margin: 10vh auto auto auto;
  width: 35%;
  padding: 10px;
}
/* Bordered form */
form {
  border: 3px solid #f1f1f1;
}

/* Full-width inputs */
input[type=text], input[type=password] {
  width: 100%;
  padding: 12px 20px;
  margin: 8px 0;
  display: inline-block;
  border: 1px solid #ccc;
  box-sizing: border-box;
}

/* Set a style for all buttons */
button {
  background-color: #4CAF50;
  color: white;
  padding: 14px 20px;
  margin: 8px 0;
  border: none;
  cursor: pointer;
  width: 100%;
}
.green {
    background-color: #4CAF50 !important;
}
.red {
   background-color: #f44336 !important;
}

button[disabled] {
    background-color: grey !important;
}

/* Add a hover effect for buttons */
button:hover {
  opacity: 0.8;
}


.tab > button {
  width: 50%;
  padding: 10px 18px;
}

/* Center the avatar image inside this container */
.imgcontainer {
  text-align: center;
  margin: 24px 0 12px 0;
}

/* Avatar image */
img.avatar {
  height: 10vh;
  width: 10vw;
  border-radius: 50%;
}

/* Add padding to containers */
.container {
  padding: 16px;
}

/* The "Forgot password" text */
span.psw {
  float: right;
  padding-top: 16px;
}

/* Change styles for span and cancel button on extra small screens */
@media screen and (max-width: 735px) {
  span.psw {
    display: block;
    float: none;
  }
  .cancelbtn {
    width: 100%;
  }
  .center {
      margin: auto;
      width: 90%;
  }
}

/* Add Zoom Animation */
.animate {
  -webkit-animation: animatezoom 0.6s;
  animation: animatezoom 0.6s
}

@-webkit-keyframes animatezoom {
  from {-webkit-transform: scale(0)}
  to {-webkit-transform: scale(1)}
}

@keyframes animatezoom {
  from {transform: scale(0)}
  to {transform: scale(1)}
}

</style>
