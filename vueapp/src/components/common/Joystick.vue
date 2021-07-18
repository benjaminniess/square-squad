<style>
.vue-joystick {
  display: inline-block;
  background: white;
  height: 256px;
  width: 256px;
  border-radius: 50%;
  position: relative;
  border: solid 4px var(--color);
}
.vue-joystick::before,
.vue-joystick::after {
  content: "";
  position: absolute;
}
.vue-joystick::before {
  left: 0;
  right: 0;
  margin: -32px;
  background: var(--color);
  height: 64px;
  width: 64px;
  border-radius: 50%;
  transform: translateX(var(--x)) translateY(var(--y));
}
.vue-joystick::after {
  left: 126px;
  bottom: 128px;
  border-radius: 10px;
  width: 4px;
  background: var(--color);
  transform: rotate(var(--angle));
  transform-origin: bottom center;
  height: var(--speed);
}
</style>
<template>
  <div
    class="vue-joystick"
    :style="style"
    @touchmove="handleTouch"
    @mousemove="handleMove"
    @mousedown="handleStart"
    @mouseup="handleRelease"
    @touchend="handleRelease"
  ></div>
</template>
<script>
export default {
  props: {
    color: {
      type: String,
      default: "#000"
    }
  },
  data() {
    return {
      x: 0,
      y: 0,
      angle: 0,
      speed: 0,
      isMouseDown: false
    };
  },
  computed: {
    style() {
      return {
        "--x": `${this.x + 128}px`,
        "--y": `${this.y + 128}px`,
        "--speed": `${this.speed}px`,
        "--angle": `${this.angle}deg`,
        "--color": `${this.color}`
      };
    }
  },
  methods: {
    handleStart() {
      this.isMouseDown = true;
    },
    handleTouch({ touches: [touch] }) {
      const { clientX, clientY } = touch;
      const { offsetLeft, offsetTop } = this.$el;
      const x = Math.round(clientX - offsetLeft - 128);
      const y = Math.round(clientY - offsetTop - 128);
      this.updatePosition(x, y);
    },
    handleMove({ clientX, clientY }) {
      if (!this.isMouseDown) {
        return;
      }
      const { offsetLeft, offsetTop } = this.$el;
      const x = Math.round(clientX - offsetLeft - 128);
      const y = Math.round(clientY - offsetTop - 128);
      this.updatePosition(x, y);
    },
    handleRelease() {
      this.emitAll("release");
      this.isMouseDown = false;
      this.updatePosition(0, 0);
    },
    updatePosition(x, y) {
      const offset = 128 - 32;
      const radians = Math.atan2(y, x);
      const angle = Math.round((radians * 180) / Math.PI, 4);
      this.angle = angle + (angle > 90 ? -270 : 90);
      this.speed = Math.min(
        Math.round(Math.sqrt(Math.pow(y, 2) + Math.pow(x, 2))),
        128
      );
      this.x = this.speed > offset ? Math.cos(radians) * offset : x;
      this.y = this.speed >= offset ? Math.sin(radians) * offset : y;
      this.emitAll();
    },
    emitAll(name = "change") {
      this.$emit(name, {
        x: this.x,
        y: this.y,
        speed: this.speed,
        angle: this.angle
      });
    }
  },
  mounted() {
    this.emitAll();
  }
};
</script>
