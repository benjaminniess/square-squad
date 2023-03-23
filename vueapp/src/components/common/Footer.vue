<template>
  <footer class="footer">
    <p class="text-center">
      <span>
        <a href="https://github.com/benjaminniess/square-squad" target="_blank"
        >Version {{ version }}</a
        >
        | <button @click="goToAbout">About us</button>
      </span>
      <a href="https://discord.gg/zGZ2TVw6e4" target="_blank">
        <img :src="'/assets/images/discord.png'" width="32px"/>
      </a>
    </p>
  </footer>
</template>

<script>


export default {
  data() {
    return {
      version: this.version,
    }
  },
  name: 'Footer',
  methods: {
    goToAbout() {
      this.$router.push('/about-us')
    }
  }
}
</script>
