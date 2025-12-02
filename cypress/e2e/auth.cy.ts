describe("user login", () => {
  it("User can login with valid credentials", () => {
    cy.login("m+1@etalas.com");
  });

  it("User can not login with invalid credentials", () => {
    cy.login("invalid@example.com", {
      expectSuccess: false,
      expectError: "User not found",
    });
  });
});

describe("user logout", () => {
  it("User can logout", () => {
    cy.login("m+1@etalas.com");
    cy.visit("http://localhost:3000/dashboard");
    cy.get('[data-slot="dropdown-menu-trigger"]').click();
    cy.contains("Log out").click();
    cy.url().should("include", "http://localhost:3000/auth");
  });
});
