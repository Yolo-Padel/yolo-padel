/// <reference types="cypress" />

// Custom command untuk login menggunakan bypass auth
Cypress.Commands.add(
  "login",
  (
    email: string,
    options?: { expectSuccess?: boolean; expectError?: string }
  ) => {
    const { expectSuccess = true, expectError } = options || {};

    cy.visit("http://localhost:3000/auth");
    cy.get('[id="email"]').type(email);
    cy.get('[data-cy="bypass-auth-button"]').click();
  

    if (expectSuccess) {
      cy.contains("Login successful", { timeout: 10000 }).should("be.visible");
    } else if (expectError) {
      cy.contains(expectError, { timeout: 10000 }).should("be.visible");
    }
  }
);

declare namespace Cypress {
  interface Chainable {
    login(
      email: string,
      options?: { expectSuccess?: boolean; expectError?: string }
    ): Chainable<void>;
  }
}
