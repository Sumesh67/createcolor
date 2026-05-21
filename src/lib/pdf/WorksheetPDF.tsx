import React from "react";
import { Document, Page, Image, View, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    paddingBottom: 70,
    backgroundColor: "white",
    flexDirection: "column",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#cccccc",
    borderBottomStyle: "solid",
  },
  headerField: {
    fontSize: 12,
    fontFamily: "Helvetica",
    color: "#222222",
  },
  headerLine: {
    fontSize: 12,
    fontFamily: "Helvetica",
    color: "#222222",
    borderBottomWidth: 1,
    borderBottomColor: "#333333",
    borderBottomStyle: "solid",
    minWidth: 180,
    paddingBottom: 2,
  },
  worksheetImage: {
    flex: 1,
    objectFit: "contain",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#1a1a2e",
    paddingVertical: 12,
    paddingHorizontal: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  footerText: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  footerUrl: {
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#a0aec0",
    textAlign: "center",
    marginTop: 2,
  },
});

interface WorksheetPDFProps {
  imageUrl: string;
  teacherName: string;
  topic: string;
  gradeLevel: string;
}

function getLastName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  return parts[parts.length - 1] || fullName;
}

export function WorksheetPDF({ imageUrl, teacherName, topic, gradeLevel }: WorksheetPDFProps) {
  const lastName = getLastName(teacherName);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Name / Date header */}
        <View style={styles.header}>
          <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 6 }}>
            <Text style={styles.headerField}>Name:</Text>
            <Text style={styles.headerLine}>{"                              "}</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 6 }}>
            <Text style={styles.headerField}>Date:</Text>
            <Text style={styles.headerLine}>{"                 "}</Text>
          </View>
        </View>

        {/* Worksheet image */}
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image src={imageUrl} style={styles.worksheetImage} />

        {/* Viral footer — printed on every physical worksheet */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {`✨ Magic Coloring Worksheet generated specifically for ${lastName}'s class by CreateColor.com`}
          </Text>
          <Text style={styles.footerUrl}>Free worksheets for teachers at CreateColor.com</Text>
        </View>
      </Page>
    </Document>
  );
}
