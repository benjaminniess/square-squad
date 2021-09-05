<template>
  <div class="super-wrapper">
    <section class="wrapper">
      <Logo />

      <h1>{{ messageContent }}</h1>
    </section>
  </div>
</template>

<script>
import Logo from './common/Logo'

export default {
  name: 'SimpleMessage',
  components: {
    Logo
  },
  props: {
    messageContent: ''
  }
}
</script>
