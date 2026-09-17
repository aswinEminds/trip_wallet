import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { format } from "date-fns";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 20,
    borderBottom: "2px solid #000",
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  subtitle: {
    fontSize: 12,
    marginTop: 5,
    color: "#555",
  },
  section: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "uppercase",
    backgroundColor: "#000",
    color: "#fff",
    padding: "4px 8px",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottom: "1px dashed #ccc",
  },
  rowLabel: {
    fontSize: 12,
    textTransform: "uppercase",
  },
  rowValue: {
    fontSize: 12,
    fontWeight: "bold",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    marginTop: 4,
    borderTop: "2px solid #000",
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  totalValue: {
    fontSize: 14,
    fontWeight: "bold",
  },
});

interface Props {
  data: any;
  people: any[];
}

export function SettlementPDF({ data, people }: Props) {
  const { trip, collection, budget, cash, categoryOverview } = data;
  const fmt = (n: number) => `${trip.currency} ${n.toLocaleString("en-IN")}`;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>TRIP SETTLEMENT REPORT</Text>
          <Text style={styles.subtitle}>
            {trip.name.toUpperCase()} • {format(new Date(trip.startDate), "dd MMM yyyy")} to {format(new Date(trip.endDate), "dd MMM yyyy")}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financial Summary</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Total Budget</Text>
            <Text style={styles.rowValue}>{fmt(budget.totalBudget)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Total Spent</Text>
            <Text style={styles.rowValue}>{fmt(budget.totalExpenses)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Remaining Budget</Text>
            <Text style={styles.totalValue}>{fmt(budget.remainingBudget)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Collection Status</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Total Expected</Text>
            <Text style={styles.rowValue}>{fmt(collection.totalExpected)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Total Collected</Text>
            <Text style={styles.rowValue}>{fmt(collection.totalCollected)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Pending Collection</Text>
            <Text style={styles.totalValue}>{fmt(collection.totalPending)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cash Position</Text>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Cash in Hand</Text>
            <Text style={styles.totalValue}>{fmt(cash.cashInHand)}</Text>
          </View>
        </View>

        {people && people.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Person-wise Breakdown</Text>
            {people.map((p: any) => (
              <View style={styles.row} key={p._id}>
                <Text style={styles.rowLabel}>{p.name.toUpperCase()}</Text>
                <Text style={styles.rowValue}>Paid: {fmt(p.totalPaid)} / Due: {fmt(p.dueAmount)}</Text>
              </View>
            ))}
          </View>
        )}

        {categoryOverview && categoryOverview.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Category-wise Breakdown</Text>
            {categoryOverview.map((cat: any) => (
              <View style={styles.row} key={cat._id}>
                <Text style={styles.rowLabel}>{cat.name.toUpperCase()}</Text>
                <Text style={styles.rowValue}>Spent: {fmt(cat.totalSpent)} / Budget: {fmt(cat.currentBudget)}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
