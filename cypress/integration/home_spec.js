describe('Scryline Homepage Test', () => {
  it('Visits Home', () => {
    cy.on('window:confirm', () => true);
    cy.visit('http://localhost:3000/about')
    cy.contains('login_test').click();
    cy.visit('http://localhost:3000/about')
    cy.get('#new_line').click();
    cy.get("#adder").type('https://www.theguardian.com/football/2020/aug/01/aubameyang-arsenal-chelsea-fa-cup-final-match-report');
    cy.get("#lineTitleInput").type('TestLine' + Date.now());
    cy.get("#saveLine").click();
    cy.get("#saveLine").should('be.disabled');
    cy.contains('Aubameyang');
    cy.get("#deleteLine").click();
  })
})
