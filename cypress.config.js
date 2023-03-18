const {defineConfig} = require('cypress')

module.exports = defineConfig({
  projectId: 'kymbtm',
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}"
  },
});
