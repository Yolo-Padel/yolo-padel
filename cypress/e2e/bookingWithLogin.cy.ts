describe("booking with login", () => {
  it("User can book court after login", () => {
    cy.login("m+1@etalas.com");
    cy.visit("http://localhost:3000/dashboard/booking");
    cy.contains("Booking List");
    cy.wait(1500);
    cy.contains("button", "Book Court").click();
    cy.contains("Book your court").should("be.visible");

    // Tunggu sampai modal content benar-benar visible dan tidak ada loading
    cy.get('[data-slot="dialog-content"]', { timeout: 10000 }).should(
      "be.visible"
    );
    cy.wait(1000);

    // Pilih court
    cy.contains("West Court", { timeout: 10000 }).should("be.visible").click();

    // Tunggu API calls untuk court data dan blocking selesai
    cy.wait(2000);

    // Pilih tanggal
    cy.get("[data-day='12/18/2025']").click();
    cy.wait(1500); // Tunggu date change effect

    // Pilih time slot
    cy.contains("button", "11.00–12.00").click();

    // PENTING: Tunggu sampai booking ditambahkan ke form
    // Verifikasi dengan menunggu "Total Payment" muncul
    cy.contains("Total Payment", { timeout: 10000 }).should("be.visible");

    // Verifikasi bahwa ada angka/harga di samping "Total Payment"
    // Ini memastikan booking sudah ditambahkan dan total price sudah dihitung
    cy.get('[data-slot="dialog-content"]').within(() => {
      cy.contains("Total Payment").parent().should("not.contain.text", "Rp0"); // Pastikan bukan Rp0
    });

    cy.wait(500);
    // Pastikan button Book enabled (artinya bookings.length > 0)
    cy.contains("button", "Book")
      .scrollIntoView()
      .should("be.visible")
      .should("not.be.disabled");

    // Klik button Book (tanpa force, karena harus enabled)
    cy.contains("button", "Book").click({force: true});

    // Tunggu transisi step
    cy.wait(2000);

    // Verifikasi Order Summary muncul dengan text yang benar
    cy.get('[data-slot="dialog-content"]', { timeout: 15000 }).within(() => {
      // Cek apakah ada "Order Summary" atau "Book Now" button
      cy.contains(/Order Summary|Book Now/, {
        timeout: 15000,
      }).should("be.visible");
    });

    // Klik Book Now
    cy.contains("button", "Book Now", { timeout: 15000 })
      .scrollIntoView()
      .should("be.visible")
      .should("not.be.disabled")
      .click({ force: true });

    cy.contains("Order berhasil dibuat").click();

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

    // Setelah simulasi, Xendit akan redirect kembali ke merchant website
    cy.url().should("include", "/payment/success");
    cy.contains("Pembayaran berhasil").should("be.visible");
  });
});
