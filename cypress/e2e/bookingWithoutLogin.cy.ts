describe("booking without login", () => {
  it("User can book court without login", () => {
    cy.visit("http://localhost:3000/");
    cy.contains("Book Your Padel Court Anytime, Anywhere").should("be.visible");
    cy.contains("West Court", { timeout: 10000 }).should("be.visible").click();
    cy.get("[data-day='12/18/2025']").click();
    // cy.wait(1500); // Tunggu date change effect
    // Pilih time slot
    cy.contains("20.00–21.00").click();
    // input email
    cy.get('[id="guest-email"]').type("m+1user@etalas.com");
    // input full name
    cy.get('[id="guest-name"]').type("John Doe");

    cy.contains("Total Payment").parent().should("not.contain.text", "Rp0"); // Pastikan bukan Rp0

    cy.contains("button", "Book").click();
    cy.contains("Order Summary", { timeout: 10000 }).should("be.visible");
    cy.contains("button", "Book Now").click();
    cy.wait(10000);

    // Tunggu redirect ke Xendit
    cy.url().should("include", "checkout-staging.xendit.co");

    // Gunakan cy.origin untuk domain eksternal
    cy.origin("https://checkout-staging.xendit.co", () => {
      // Pastikan halaman Xendit memang tampil
      cy.contains("QR Payments", { timeout: 10000 }).should("be.visible");

      // Klik metode QR
      cy.contains("QR Payments").click();

      // Klik tombol simulasinya
      cy.contains("Click here to simulate your payment with QRIS").click();
    });
  });
});
