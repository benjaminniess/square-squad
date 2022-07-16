describe('homepage form', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:5173/')
  })

  it('displays homepage form', () => {
    cy.get('input#playerName').should('have.length', 1)
    cy.get('input#playerName').should('have.text', '')
    cy.get('input#playerColor').should('have.length', 1)
    cy.get('#playerName').click().type('Benjamin')
  })
})
