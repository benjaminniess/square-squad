describe('homepage form', () => {
  beforeEach(() => {
    cy.visit('http://192.168.1.21:5173')
  })

  it('displays homepage form', () => {

    cy.get('input#playerName').should('have.length', 1).debug()
    cy.get('input#playerName').should('have.text', '')
    cy.get('input#playerColor').should('have.length', 1)
    cy.get('#playerName')
      .click()
      .type('Benjamin')
      .should('have.value', 'Benjamin')

    cy.contains("Let's play").click()
    cy.url().should('include', '/rooms')
  })

  it('triggers an error if player name is empty', () => {
    cy.get('#playerName')
      .should('have.value', '')


    cy.contains("Let's play").click()
    cy.get('input:invalid').should('have.length', 1)
  })
})
