import React from "react";
import {
  Document,
  Page,
  Image,
  View,
  Text,
  StyleSheet,
} from "@react-pdf/renderer";
import { ViralFooter } from "./ViralFooter";

const FOOTER_H = 68;

const styles = StyleSheet.create({
  page: {
    padding: 30,
    paddingBottom: FOOTER_H + 8,
    backgroundColor: "white",
  },
  coverPage: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: 50,
  },
  coverTitle: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  coverSubtitle: {
    fontSize: 18,
    color: "#666",
    marginBottom: 10,
  },
  coverName: {
    fontSize: 24,
    marginTop: 30,
    color: "#FF6B6B",
  },
  singleImage: {
    width: "100%",
    height: "90%",
    objectFit: "contain",
  },
  doubleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    height: "90%",
  },
  doubleImage: {
    width: "48%",
    height: "100%",
    objectFit: "contain",
  },
  quadContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignContent: "space-between",
    height: "90%",
  },
  quadImage: {
    width: "48%",
    height: "48%",
    objectFit: "contain",
    marginBottom: 10,
  },
  miniContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    alignContent: "space-between",
    height: "90%",
  },
  miniImage: {
    width: "32%",
    height: "48%",
    objectFit: "contain",
    marginBottom: 5,
  },
});

interface ColoringPagePDFProps {
  imageUrls: string[];
  layout: "single" | "double" | "quad" | "mini";
  childName?: string;
  includeСover?: boolean;
  qrCodeDataUrl?: string;
}

export function ColoringPagePDF({
  imageUrls,
  layout,
  childName,
  includeСover = true,
  qrCodeDataUrl,
}: ColoringPagePDFProps) {
  const imagesPerPage = {
    single: 1,
    double: 2,
    quad: 4,
    mini: 6,
  };

  const perPage = imagesPerPage[layout];
  const pages: string[][] = [];

  for (let i = 0; i < imageUrls.length; i += perPage) {
    pages.push(imageUrls.slice(i, i + perPage));
  }

  const renderImages = (images: string[], pageLayout: string) => {
    switch (pageLayout) {
      case "single":
        return (
          // eslint-disable-next-line jsx-a11y/alt-text
          <Image src={images[0]} style={styles.singleImage} />
        );
      case "double":
        return (
          <View style={styles.doubleContainer}>
            {images.map((url, i) => (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image key={i} src={url} style={styles.doubleImage} />
            ))}
          </View>
        );
      case "quad":
        return (
          <View style={styles.quadContainer}>
            {images.map((url, i) => (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image key={i} src={url} style={styles.quadImage} />
            ))}
          </View>
        );
      case "mini":
        return (
          <View style={styles.miniContainer}>
            {images.map((url, i) => (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image key={i} src={url} style={styles.miniImage} />
            ))}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <Document>
      {/* Cover Page */}
      {includeСover && (
        <Page size="A4" style={styles.coverPage}>
          <Text style={styles.coverTitle}>My Coloring Book</Text>
          <Text style={styles.coverSubtitle}>
            Created with Create and Color
          </Text>
          {childName && (
            <Text style={styles.coverName}>For {childName}</Text>
          )}
          <Text style={{ ...styles.coverSubtitle, marginTop: 20 }}>
            {new Date().toLocaleDateString()}
          </Text>
        </Page>
      )}

      {/* Content Pages */}
      {pages.map((pageImages, pageIndex) => (
        <Page key={pageIndex} size="A4" style={styles.page}>
          {renderImages(pageImages, layout)}
          {qrCodeDataUrl ? (
            <ViralFooter
              qrCodeDataUrl={qrCodeDataUrl}
              pageLabel={`Page ${pageIndex + 1} of ${pages.length}`}
            />
          ) : (
            <View style={{ position: "absolute", bottom: 15, left: 30, right: 30, flexDirection: "row", justifyContent: "space-between", fontSize: 8, color: "#999" }}>
              <Text>Made with Create and Color</Text>
              <Text>Page {pageIndex + 1} of {pages.length}</Text>
            </View>
          )}
        </Page>
      ))}
    </Document>
  );
}
