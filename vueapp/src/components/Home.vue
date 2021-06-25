<template>

  <div class="super-wrapper">
    <div class="particles-js" id="particles-js"></div>
    <section class="wrapper">
      <h1 class="sqsq-logo" title="Square Squad">
        <Logo />
      </h1>
      <form class="sq-form" id="pre-home-form" method="post" action="/">
        <div class="input-field">
          <label for="playerName">What's your name?</label
          ><input id="playerName" type="text" name="playerName" required />
        </div>
        <div class="input-field">
          <label for="playerColor">What's your favourite color?</label
          ><input
            id="playerColor"
            type="color"
            name="playerColor"
            required
            value="#742a55"
          />
        </div>
        <div class="input-field input-submit text-center">
          <button class="btn" type="submit">Let's play!</button>
        </div>
      </form>
    </section>
    <footer class="footer">
      <p class="text-center">
        Version 1.1.2<a
          href="https://discord.gg/zGZ2TVw6e4"
          target="_blank"
          ><img :src="'/static/assets/images/discord.png'" width="32px"
        /></a>
      </p>
    </footer>
  </div>
</template>

<script>
import Logo from './common/Logo'
export default {
  name: 'Home',
  components: {
    Logo
  },
  methods: {
    submit() {}
  }
}
</script>
