const homeUrl = 'http://127.0.0.1:5173/';
describe('Rooms', () => {
  beforeEach(() => {

  })

  it('redirects to home page access directly', () => {
    cy.visit(homeUrl + 'rooms')
    cy.url().should('eq', homeUrl)
  })

  it('shows the rooms page if logged', () => {
    cy.get('#playerName')
      .click()
      .type('Benjamin')

    cy.contains("Let's play").click()
    cy.url().should('eq', homeUrl + 'rooms')

    cy.get('#playerNameLabel span')
      .should('contain', 'Benjamin')
  })
})
