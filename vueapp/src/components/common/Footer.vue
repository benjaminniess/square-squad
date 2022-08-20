<template>
  <footer class="footer">
    <p class="text-center">
      <span>
        <a href="https://github.com/benjaminniess/square-squad" target="_blank"
        >Version {{ version }}</a
        >
        | <a href="#" @click="goToAbout">About us</a>
      </span>
      <a href="https://discord.gg/zGZ2TVw6e4" target="_blank">
        <img :src="'/assets/images/discord.png'" width="32"/>
      </a>
    </p>
  </footer>
</template>

<script>
export default {
  name: 'Footer',
  computed: {
    version() {
      return this.$globalEnv.version
    }
  },
  methods: {
    goToAbout() {
      this.$router.push('/about-us')
    }
  }
}
</script>
