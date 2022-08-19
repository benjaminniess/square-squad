describe('Lobby section', () => {
  beforeEach(() => {
    cy.visit(Cypress.env("baseUrl"))
    cy.get('#playerColor')
      .invoke('val', '#ff0000')
      .trigger('input')
    cy.get('#playerName')
      .click()
      .type(Cypress.env("playerName"))
    cy.contains("Let's play").click()
    cy.url().should('be.equal', `${Cypress.env("baseUrl")}rooms`)
    cy.get('#newRoom')
      .click()
      .type(Cypress.env("roomName"))

    cy.contains("Create room").click()
  })

  it('displays the room and player name as admin', () => {
    cy.get('h3.rooms-list__title').should('include.text', Cypress.env("roomName"))
    cy.get('ul.players-list li').first().should('include.text', '[Admin]')
    cy.get('ul.players-list li').first().should('include.text', '[You]')
    cy.get('ul.players-list li').first().should('include.text', Cypress.env("playerName"))
  })
})
