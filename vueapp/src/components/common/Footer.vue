<template>
  <footer class="footer">
    <p class="text-center">
      <span>
        <a href="https://github.com/benjaminniess/square-squad" target="_blank"
          >Version {{ version }}</a
        >
        | <a href="/about-us">About us</a>
      </span>
      <a href="https://discord.gg/zGZ2TVw6e4" target="_blank">
        <img :src="'/static/assets/images/discord.png'" width="32px" />
      </a>
    </p>
  </footer>
</template>

<script>
export default {
  name: 'Footer',
  computed: {
    version() {
      return this.$store.state.version
    }
  }
}
</script>
