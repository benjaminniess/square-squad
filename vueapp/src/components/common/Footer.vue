<template>
  <footer class="footer">
    <p class="text-center">
      Version {{ version
      }}<a href="https://discord.gg/zGZ2TVw6e4" target="_blank"
        ><img :src="'/static/assets/images/discord.png'" width="32px"
      /></a>
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
