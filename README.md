# Square Squad

> Square Squad is a multiplayer in browser game based on socket.is communication between Vue.js and Node.js. You can play it on https://square-squad.com and tell us about your experience here on in our Discord channel.

## Local Setup

```bash
# install server dependencies
npm install

# serve with hot reload at localhost:8080
npm start

# go to vueapp dir
cd vueapp

# install front dependencies
npm install

# serve front end app at localhost:1080
npm run dev

```

> You can now access the front-end app on localhost:1080

## Build Commands

```bash
# install server dependencies
npm install

# serve with hot reload at localhost:8080
npm start

# go to vueapp dir
cd vueapp

# install front dependencies
npm install

# build front end app at localhost:1080
npm run build

```

## .env file

You can copy the `.env_example` file at the root directory and name it `.env`. Then, you can adapt configuration as follow:

```
MATTER_DEBUG=true=false
ENABLE_NEW_RELIC_AGENT: (bool) Set to true if you need some New Relic performances feedbacks
NEW_RELIC_LICENSE_KEY: (string) A new relic licence key
NEW_RELIC_APP_NAME: (string) The New Relic app name
COUNTDOWN: (Int) A number of seconds for the game countdown. Set to 1 for a 1 second countdown
FORCE_HTTPS: (bool) Use SSL?
FORCE_DOMAIN: (String) If multiple domains linked to the app, you can define the main one (eg. my-env.com)
AUTO_CREATE_PLAYER: Not ready yet
AUTO_CREATE_ROOM: Not ready yet
DISABLE_OBSTACLES: Not ready yet
ADMIN_PASSWORD: Not ready yet
```

## Changelog

### 1.2.8 - 2021-08-13

- New: Score changer bonus are now declined into +3, +5, +10 and -3, -5, -10
- Removed last global var using DI
- Added some more tests on bonus

### 1.2.7 - 2021-08-11

- Security update of package depenencies
- Added some more tests on rooms and players actions
- Code refacto to remove most of the global var usage in index.js

### 1.2.6 - 2021-08-02

- New: Added tests to Vue components

### 1.2.5 - 2021-07-21

- New: Joystick in mobile version
- New: Allowed room url sharing with auto join

### 1.2.4 - 2021-07-18

- New: Added touch control + media query to make the game work on mobile
- New: Added unit tests on main socket actions

### 1.2.3 - 2021-07-15

- Fix: Fixed simultanous collisions
- Fix: Fixed bodies not removed after death
- Fix: Fixed crash after socket is lost

### 1.2.2 - 2021-07-14

- New: Google Analytics when env var is set
- Fix: Fixed multi domains + SSL redirection
- Fix: Fixed 404 page

### 1.2.1 - 2021-07-11

- Fix: Fixed about us link
- Fix: Fixed version number in footer

### 1.2.0 - 2021-07-11

- New: Refactored the whole application to use Vue.js
