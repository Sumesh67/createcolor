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
  worksheetImageWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  worksheetImage: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 68,
    backgroundColor: "#1a1a2e",
    paddingVertical: 8,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
  },
  footerLeft: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
  },
  footerText: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    letterSpacing: 0.2,
  },
  footerUrl: {
    fontSize: 8,
    fontFamily: "Helvetica",
    color: "#a0aec0",
    marginTop: 4,
  },
  footerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  scanCaption: {
    fontSize: 8,
    fontFamily: "Helvetica",
    color: "#F97316",
    textAlign: "right",
    marginRight: 8,
  },
  qrWrapper: {
    backgroundColor: "#ffffff",
    padding: 2,
  },
  qrImage: {
    width: 46,
    height: 46,
  },
});

interface WorksheetPDFProps {
  imageUrl: string;
  teacherName: string;
  topic: string;
  gradeLevel: string;
  qrCodeDataUrl?: string;
}

function getLastName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  return parts[parts.length - 1] || fullName;
}

export function WorksheetPDF({ imageUrl, teacherName, topic, gradeLevel, qrCodeDataUrl }: WorksheetPDFProps) {
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
        <View style={styles.worksheetImageWrapper}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={imageUrl} style={styles.worksheetImage} />
        </View>

        {/* Viral footer — printed on every physical worksheet */}
        {qrCodeDataUrl ? (
          <View style={styles.footer}>
            <View style={styles.footerLeft}>
              <Text style={styles.footerText}>
                {`Magic Worksheet for ${lastName}'s class · CreateColor.com`}
              </Text>
              <Text style={styles.footerUrl}>Turn imagination into coloring pages for free!</Text>
            </View>
            <View style={styles.footerRight}>
              <Text style={styles.scanCaption}>{'Scan to\nmake your own!'}</Text>
              <View style={styles.qrWrapper}>
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <Image src={qrCodeDataUrl} style={styles.qrImage} />
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.footer}>
            <View style={styles.footerLeft}>
              <Text style={styles.footerText}>
                {`Magic Coloring Worksheet for ${lastName}'s class · CreateColor.com`}
              </Text>
              <Text style={styles.footerUrl}>Free worksheets for teachers at CreateColor.com</Text>
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
}
