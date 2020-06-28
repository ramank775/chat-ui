<template>

    <div id="search">
        <label for=""><i class="fa fa-search" aria-hidden="true"></i></label>
        <input type="text" placeholder="Search contacts..." v-on:input="$emit('change', $event.target.value)" v-bind:value="value"/>
    </div>
</template>


<script>

export default {
    name: 'Search',
    model : {
        prop: 'value',
        event: 'change'
    },
    props:['value']
}

</script>

<style scoped>
    #search {
        border-top: 1px solid #32465a;
        border-bottom: 1px solid #32465a;
        font-weight: 300;
    }

    @media screen and (max-width: 735px) {
        #search {
            display: none;
        }
    }

    #search label {
        position: absolute;
        margin: 10px 0 0 20px;
    }

    #search input {
        font-family: "proxima-nova", "Source Sans Pro", sans-serif;
        padding: 10px 0 10px 46px;
        width: calc(100% - 25px);
        border: none;
        background: #32465a;
        color: #f5f5f5;
    }

    #search input:focus {
        outline: none;
        background: #435f7a;
    }

    #search input::-webkit-input-placeholder {
        color: #f5f5f5;
    }

    #search input::-moz-placeholder {
        color: #f5f5f5;
    }

    #search input:-ms-input-placeholder {
        color: #f5f5f5;
    }

    #search input:-moz-placeholder {
        color: #f5f5f5;
    }
</style>