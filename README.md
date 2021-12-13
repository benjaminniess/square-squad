# Square Squad

> Square Squad is a multiplayer in browser game based on socket.io communication between Vue.js and Node.js. You can play it on [square-squad.com](https://square-squad.com) and tell us about your experience here on in our [Discord channel](https://discord.com/invite/zGZ2TVw6e4)

## :building_construction: Local Setup

```bash
# install server dependencies and build files for both back-end and front-end
npm run build

# start the server side at localhost:8080 with hot reload. Use npm start for clasic load

npm run dev

# serve the front end site at localhost:1080

npm startvue

```

> You can now access the front-end app on localhost:1080

## :test_tube: Tests command

To test the back end

`npm test`

To test the front-end

`cd vueapp && npm test`

## :gear: .env file

You can copy the `.env_example` file at the root directory and name it `.env`. Then, you can adapt configuration as follow:

```
MATTER_DEBUG=true=false
ENABLE_NEW_RELIC_AGENT: (bool) Set to true if you need some New Relic performances feedbacks
NEW_RELIC_LICENSE_KEY: (string) A new relic licence key
NEW_RELIC_APP_NAME: (string) The New Relic app name
COUNTDOWN: (Int) A number of seconds for the game countdown. Set to 1 for a 1 second countdown
FORCE_HTTPS: (bool) Use SSL?
FORCE_DOMAIN: (String) If multiple domains linked to the app, you can define the main one (eg. my-env.com)
DISABLE_OBSTACLES: (bool) Your can disable all obstacles for test purpose
ADMIN_PASSWORD: The password to access the /admin view
```

## :rocket: Socket.io messages

| :arrow_up:           | :arrow_down:                |
| :------------------- | --------------------------- |
| `update-player-data` | `update-player-data-result` |
| `rooms-refresh`      | `rooms-refresh-result`      |
| `create-room`        | `create-room-result`        |
| `join-room`          | `join-room-result`          |
| X                    | `refresh-game-status`       |
| X                    | `refresh-players`           |
| `start-game`         | `start-game-result`         |
| X                    | `countdown-update`          |
| X                    | `refresh-canvas`            |
| X                    | `in-game-countdown-update`  |
| `keyPressed`         | X                           |
| `keyUp`              | X                           |

## :package: Changelog

### :package: 2.0.0 - 2022?

- :tada: Full refacto using Nest JS framework and TDD

### :package: 1.2.9 - 2021-08-16

- :recycle: First basic code conversion to TypeScript.
- :test_tube: Converted tests to TypeScript as well

### :package: 1.2.8 - 2021-08-13

- :sparkles: Score changer bonus are now declined into +3, +5, +10 and -3, -5, -10
- :recycle: Removed last global var using DI
- :test_tube: Added some more tests on bonus

### :package: 1.2.7 - 2021-08-11

- :lock: Security update of package depenencies
- :test_tube: Added some more tests on rooms and players actions
- :recycle: Code refacto to remove most of the global var usage in index.js

### :package: 1.2.6 - 2021-08-02

- :sparkles: Added tests to Vue components

### :package: 1.2.5 - 2021-07-21

- :sparkles: Joystick in mobile version
- :sparkles: Allowed room url sharing with auto join

### :package: 1.2.4 - 2021-07-18

- :sparkles: Added touch control + media query to make the game work on mobile
- :test_tube: Added unit tests on main socket actions

### :package: 1.2.3 - 2021-07-15

- :bug: Fixed simultanous collisions
- :bug: Fixed bodies not removed after death
- :bug: Fixed crash after socket is lost

### :package: 1.2.2 - 2021-07-14

- :sparkles: Google Analytics when env var is set
- :bug: Fixed multi domains + SSL redirection
- :bug: Fixed 404 page

### :package: 1.2.1 - 2021-07-11

- :bug: Fixed about us link
- :bug: Fixed version number in footer

### :package: 1.2.0 - 2021-07-11

- :recycle: Refactored the whole application to use Vue.js
