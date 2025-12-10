import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { Order } from "@/hooks/use-order";
import { formatInTimeZone } from "date-fns-tz";
import { stringUtils } from "@/lib/format/string";

const TIMEZONE = "Asia/Jakarta";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 48,
    fontFamily: "Helvetica",
    position: "relative",
  },
  // Watermark
  watermark: {
    position: "absolute",
    // A4 page size: 595 x 842 points
    // Center calculation: (page_size - image_size) / 2
    top: 321, // (842 - 200) / 2
    left: 197.5, // (595 - 200) / 2
    opacity: 0.5,
    zIndex: 0,
  },
  watermarkLogo: {
    width: 200,
    height: 200,
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 48,
    position: "relative",
    zIndex: 10,
  },
  logoSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#C3D223",
    justifyContent: "center",
    alignItems: "center",
  },
  logoDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
  },
  brandSection: {
    flexDirection: "column",
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0F172A",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  brandSubtitle: {
    fontSize: 9,
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginTop: 4,
  },
  receiptIdSection: {
    alignItems: "flex-end",
  },
  receiptIdLabel: {
    fontSize: 11,
    fontWeight: "medium",
    color: "#C3D223",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  receiptIdValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0F172A",
  },
  // Info Grid
  infoGrid: {
    flexDirection: "row",
    marginBottom: 48,
    gap: 48,
  },
  infoColumn: {
    flex: 1,
  },
  infoColumnRight: {
    alignItems: "flex-end",
  },
  infoLabel: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 16,
  },
  customerName: {
    fontSize: 18,
    fontWeight: "semibold",
    color: "#0F172A",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 11,
    color: "#0F172A",
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
    marginBottom: 8,
  },
  infoRowLabel: {
    fontSize: 11,
    color: "#64748B",
  },
  infoRowValue: {
    fontSize: 11,
    fontWeight: "semibold",
    color: "#0F172A",
  },
  paymentStatusBadge: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#000000",
    backgroundColor: "#C3D223",
    padding: "2 8",
    borderRadius: 4,
    textTransform: "uppercase",
  },
  // Table
  table: {
    border: "1 solid #E2E8F0",
    borderRadius: 8,
    marginBottom: 32,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F8FAFC",
    borderBottom: "1 solid #E2E8F0",
  },
  tableHeaderCell: {
    flex: 1,
    padding: 12,
    fontSize: 9,
    fontWeight: "medium",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  tableHeaderCellRight: {
    textAlign: "right",
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1 solid #F1F5F9",
  },
  tableCell: {
    flex: 1,
    padding: 16,
    fontSize: 11,
    color: "#0F172A",
  },
  tableCellRight: {
    textAlign: "right",
    fontWeight: "medium",
  },
  bookingType: {
    fontWeight: "semibold",
    color: "#0F172A",
    marginBottom: 4,
  },
  bookingSubtext: {
    fontSize: 9,
    color: "#64748B",
    marginTop: 4,
  },
  courtBadge: {
    padding: "4 8",
    borderRadius: 6,
    backgroundColor: "#F1F5F9",
    color: "#475569",
    fontSize: 9,
    fontWeight: "medium",
  },
  // Totals
  totalsSection: {
    alignItems: "flex-end",
    marginBottom: 48,
  },
  totalsContainer: {
    width: 256,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    fontSize: 11,
  },
  totalRowLabel: {
    color: "#64748B",
  },
  totalRowValue: {
    fontWeight: "medium",
    color: "#0F172A",
  },
  totalDivider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 8,
  },
  totalFinal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalFinalLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#0F172A",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  totalFinalValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#C3D223",
  },
  // Footer
  footer: {
    marginTop: "auto",
    paddingTop: 32,
    borderTop: "1 solid #E2E8F0",
    textAlign: "center",
  },
  footerTitle: {
    fontSize: 12,
    fontWeight: "semibold",
    color: "#0F172A",
    marginBottom: 8,
  },
  footerText: {
    fontSize: 9,
    color: "#64748B",
    marginBottom: 4,
  },
  footerLink: {
    color: "#C3D223",
    fontWeight: "medium",
  },
  footerAddress: {
    fontSize: 9,
    color: "#94A3B8",
    marginTop: 4,
  },
});

interface ReceiptPDFProps {
  order: Order;
}

const getImageUrl = (imageName: string) => {
  return `${process.env.NEXT_PUBLIC_APP_URL}/${imageName}`;
};

export function ReceiptPDF({ order }: ReceiptPDFProps) {
  const orderDate = order.createdAt
    ? formatInTimeZone(new Date(order.createdAt), TIMEZONE, "d MMM yyyy, HH:mm")
    : "N/A";

  const paymentDate = order.payment?.paymentDate
    ? formatInTimeZone(new Date(order.payment.paymentDate), TIMEZONE, "d MMM yyyy, HH:mm")
    : null;

  const customerName = order.user?.profile?.fullName || "Customer";
  const customerEmail = order.user?.email || "N/A";

  const paymentStatus = order.payment?.status || "UNPAID";
  const isPaid = paymentStatus === "PAID";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Watermark */}
        <View style={styles.watermark}>
          <Image
            src={getImageUrl("yolo-yellow-transparent.png")}
            style={styles.watermarkLogo}
          />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <View style={styles.brandSection}>
              <Text style={styles.brandTitle}>YOLO PADEL</Text>
            </View>
          </View>
          <View style={styles.receiptIdSection}>
            <Text style={styles.receiptIdLabel}>Receipt ID</Text>
            <Text style={styles.receiptIdValue}>{order.orderCode}</Text>
          </View>
        </View>

        {/* Info Grid */}
        <View style={styles.infoGrid}>
          <View style={styles.infoColumn}>
            <Text style={styles.infoLabel}>Billed To</Text>
            <Text style={styles.customerName}>{customerName}</Text>
            <Text style={styles.infoText}>{customerEmail}</Text>
          </View>
          <View style={[styles.infoColumn, styles.infoColumnRight]}>
            <Text style={styles.infoLabel}>Details</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoRowLabel}>Date Issued:</Text>
              <Text style={styles.infoRowValue}>{orderDate}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoRowLabel}>Payment Status:</Text>
              {isPaid ? (
                <Text style={styles.paymentStatusBadge}>Paid</Text>
              ) : (
                <Text style={styles.infoRowValue}>
                  {paymentStatus.toUpperCase()}
                </Text>
              )}
            </View>
            {paymentDate && (
              <View style={styles.infoRow}>
                <Text style={styles.infoRowLabel}>Payment Date:</Text>
                <Text style={styles.infoRowValue}>{paymentDate}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Table */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderCell}>Description</Text>
            <Text style={styles.tableHeaderCell}>Date & Time</Text>
            <Text style={styles.tableHeaderCell}>Facility</Text>
            <Text style={[styles.tableHeaderCell, styles.tableHeaderCellRight]}>
              Amount
            </Text>
          </View>

          {/* Table Rows */}
          {order.bookings?.map((booking, index) => {
            const bookingDate = formatInTimeZone(
              new Date(booking.bookingDate),
              TIMEZONE,
              "d MMM yyyy",
            );

            const timeSlots = booking.timeSlots
              .map((slot) => `${slot.openHour}-${slot.closeHour}`)
              .join(", ");

            return (
              <View key={booking.id} style={styles.tableRow}>
                <View style={styles.tableCell}>
                  <Text style={styles.bookingType}>Court Booking</Text>
                  <Text style={styles.bookingSubtext}>
                    {booking.duration} hour{booking.duration !== 1 ? "s" : ""}
                  </Text>
                </View>
                <View style={styles.tableCell}>
                  <Text>{bookingDate}</Text>
                  <Text style={styles.bookingSubtext}>{timeSlots}</Text>
                </View>
                <View style={styles.tableCell}>
                  <Text style={styles.courtBadge}>
                    {booking.court.venue.name} • {booking.court.name}
                  </Text>
                </View>
                <View style={[styles.tableCell, styles.tableCellRight]}>
                  <Text>{stringUtils.formatRupiah(booking.totalPrice)}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Totals */}
        <View style={styles.totalsSection}>
          <View style={styles.totalsContainer}>
            {/* Court Fees (base amount) */}
            <View style={styles.totalRow}>
              <Text style={styles.totalRowLabel}>Subtotal</Text>
              <Text style={styles.totalRowValue}>
                {stringUtils.formatRupiah(order.payment?.amount ?? order.totalAmount)}
              </Text>
            </View>
            {/* Tax Amount */}
            {order.payment?.taxAmount && order.payment.taxAmount > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalRowLabel}>Tax</Text>
                <Text style={styles.totalRowValue}>
                  {stringUtils.formatRupiah(order.payment.taxAmount)}
                </Text>
              </View>
            )}
            {/* Booking Fee */}
            {order.payment?.bookingFee && order.payment.bookingFee > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalRowLabel}>Booking Fee</Text>
                <Text style={styles.totalRowValue}>
                  {stringUtils.formatRupiah(order.payment.bookingFee)}
                </Text>
              </View>
            )}
            <View style={styles.totalDivider} />
            <View style={styles.totalFinal}>
              <Text style={styles.totalFinalLabel}>Total Paid</Text>
              <Text style={styles.totalFinalValue}>
                {stringUtils.formatRupiah(order.totalAmount)}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>
            Thank you for playing at YOLO PADEL!
          </Text>
          <Text style={styles.footerText}>
            If you have any questions about this receipt, please contact{" "}
            <Text style={styles.footerLink}>support@yolopadel.com</Text>
          </Text>
          <Text style={styles.footerAddress}>
            Generated on{" "}
            {formatInTimeZone(new Date(), TIMEZONE, "d MMM yyyy, HH:mm")}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
