describe('Scryline Homepage Test', () => {
  it('Visits Home', () => {
    cy.visit('http://localhost:3000/about')
    cy.contains('login_test').click();
  })
})
