describe('homepage form', () => {
  beforeEach(() => {
    cy.visit(Cypress.env("baseUrl"))
  })

  it('displays homepage form', () => {
    cy.get('input#playerName').should('have.length', 1)
    cy.get('input#playerName').should('have.text', '')
    cy.get('input#playerColor').should('have.length', 1)
    cy.get('#playerName')
      .click()
      .type(Cypress.env("playerName"))
      .should('have.value', Cypress.env("playerName"))

    cy.contains("Let's play").click()
    cy.url().should('be.equal', `${Cypress.env("baseUrl")}rooms`)
  })

  it('triggers an error if player name is empty', () => {
    cy.get('input#playerName').should('have.length', 1)
    cy.get('input#playerName').should('have.text', '')
    cy.get('input#playerColor').should('have.attr', 'required')
    cy.get('input#playerColor').should('have.length', 1)
    cy.get('input#playerColor').should('have.attr', 'required')
    cy.get('#playerName').should('be.empty')

    cy.contains("Let's play").click()
    cy.url().should('be.equal', Cypress.env("baseUrl"))
    cy.get('input#playerName').should('be.focused')
  })

  it('remembers player name and color when visiting the home again', () => {
    cy.get('#playerName')
      .click()
      .type(Cypress.env("playerName"))
      .should('have.value', Cypress.env("playerName"))

    cy.get('#playerColor')
      .invoke('val', Cypress.env("playerColor"))
      .trigger('input')

    cy.contains("Let's play").click()

    cy.get('a#playerNameLabel')
      .click()

    cy.url().should('be.equal', Cypress.env("baseUrl"))
    cy.get('#playerName').should('have.value', Cypress.env("playerName"))
    cy.get('#playerColor').should('have.value', Cypress.env("playerColor"))
  })
})
