import React from 'react';
import { View, Text, Image, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 68,
    backgroundColor: '#F9FAFB',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    borderTopStyle: 'solid',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  textBlock: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
  },
  primaryText: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#4B5563',
  },
  secondaryText: {
    fontSize: 8,
    fontFamily: 'Helvetica',
    color: '#9CA3AF',
    marginTop: 4,
  },
  qrBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scanCaption: {
    fontSize: 8,
    fontFamily: 'Helvetica',
    color: '#F97316',
    textAlign: 'right',
    marginRight: 8,
  },
  qrImage: {
    width: 46,
    height: 46,
  },
});

interface ViralFooterProps {
  qrCodeDataUrl: string;
  pageLabel?: string;
}

export function ViralFooter({ qrCodeDataUrl, pageLabel }: ViralFooterProps) {
  return (
    <View style={styles.footer}>
      <View style={styles.textBlock}>
        <Text style={styles.primaryText}>Created with Magic at CreateAndColor.com</Text>
        <Text style={styles.secondaryText}>
          {pageLabel ? `${pageLabel} · ` : ''}Turn imagination into coloring pages!
        </Text>
      </View>
      <View style={styles.qrBlock}>
        <Text style={styles.scanCaption}>{'Scan to\nmake your own!'}</Text>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image src={qrCodeDataUrl} style={styles.qrImage} />
      </View>
    </View>
  );
}
