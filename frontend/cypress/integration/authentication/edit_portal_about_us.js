describe('Authentication', () => {
  it('Logins to //firstvoices-dev.apps.prod.nuxeo.io as SENCOTEN_ADMIN and updates the portal About Us on //0.0.0.0:3001', () => {
    // Image 404 will tank the test
    cy.on('uncaught:exception', (err, runnable) => {
      // return false to prevent the error from
      // failing this test
      return false
    })

    const options = {
      method: 'POST',
      url: 'https://firstvoices-dev.apps.prod.nuxeo.io/nuxeo/startup',
      form: true, // we are submitting a regular form body
      body: {
        user_name: 'SENCOTEN_ADMIN',
        user_password: 'SENCOTEN_ADMIN',
        language: 'en',
        requestedUrl: 'app',
        forceAnonymousLogin: true,
        form_submitted_marker: undefined,
        Submit: 'Log+In',
      },
    }
    cy.request(options)

    cy.visit(
      'http://0.0.0.0:3001/nuxeo/app/explore/FV/Workspaces/Data/SEN%C4%86O%C5%A6EN/SEN%C4%86O%C5%A6EN/SEN%C4%86O%C5%A6EN'
    )
    cy.get('#pageNavigation').contains('SENCOTEN_ADMIN')
    cy.get('[data-reactid=".0.0.2.0.1.0.0:2.0.1.1.0.1.0"] > .material-icons').click()
    const updateMessage = `Cypress Testing @${new Date()}`
    cy.get('#editablePortal_introduction').clear()
    cy.get('#editablePortal_introduction').type(updateMessage)
    cy.get('.btn').click()
    cy.get('[data-reactid=".0.0.2.0.1.0.0:2.0.1.1.0.0:$0"] > p').should('have.text', updateMessage)
  })
})
