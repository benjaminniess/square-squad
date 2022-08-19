describe('Rooms list', () => {
  beforeEach(() => {
    cy.visit(Cypress.env("baseUrl"))
    cy.get('#playerColor')
      .invoke('val', Cypress.env("playerColor"))
      .trigger('input')
    cy.get('#playerName')
      .click()
      .type(Cypress.env("playerName"))
    cy.contains("Let's play").click()
    cy.url().should('be.equal', `${Cypress.env("baseUrl")}rooms`)
  })

  it('displays player name and color page', () => {
    cy.get('a#playerNameLabel').should('include.text', Cypress.env("playerName"))
    cy.get('a#playerNameLabel').should('have.css', 'color', 'rgb(255, 0, 0)')
  })

  it('shows a default text because rooms are empty', () => {
    cy.get('#rooms-holder').should('include.text', "No rooms yet")
  })

  it('triggers an error if room name is empty', () => {
    cy.url().should('be.equal', `${Cypress.env("baseUrl")}rooms`)
    cy.contains("Create room").click()
    cy.url().should('be.equal', `${Cypress.env("baseUrl")}rooms`)
    cy.get('input#newRoom').should('be.focused')
  })

  it('redirects to a new room if everything is correct', () => {
    cy.get('#newRoom')
      .click()
      .type(Cypress.env("roomName"))

    cy.contains("Create room").click()
    cy.url().should('be.equal', `${Cypress.env("baseUrl")}rooms/${Cypress.env("roomSlug")}`)
  })
})
