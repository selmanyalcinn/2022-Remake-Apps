import React, { useState } from "react";
import { View, StyleSheet, Text, useWindowDimensions } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";

const SCAN_AREA_RATIO = 0.7;
const BOTTOM_OVERFLOW = 100;

export default function CodeScanner() {
  const [overlayHeight, setOverlayHeight] = useState(0);
  const { width, height } = useWindowDimensions();
  const headerHeight = useHeaderHeight();
  const scanAreaSize = width * SCAN_AREA_RATIO;
  const cameraAreaHeight = Math.max(0, height - headerHeight);
  const measuredAreaHeight = overlayHeight || cameraAreaHeight;
  const scanTop = Math.max(0, (measuredAreaHeight - scanAreaSize) / 2);
  const bottomShadeHeight = Math.max(
    0,
    measuredAreaHeight - scanTop - scanAreaSize,
  );

  return (
    <View
      style={styles.overlayContainer}
      pointerEvents="none"
      onLayout={({ nativeEvent }) =>
        setOverlayHeight(nativeEvent.layout.height)
      }
    >
      <View style={[styles.topShade, { height: scanTop }]} />

      <View style={[styles.middleRow, { top: scanTop, height: scanAreaSize }]}>
        <View style={styles.sideShade} />
        <View
          style={[
            styles.scanBox,
            { width: scanAreaSize, height: scanAreaSize },
          ]}
        >
          {/* Köşe çizgileri */}
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>
        <View style={styles.sideShade} />
      </View>

      <View
        style={[
          styles.bottomShade,
          {
            top: scanTop + scanAreaSize,
            height: bottomShadeHeight + BOTTOM_OVERFLOW,
          },
        ]}
      />

      <View
        style={[styles.hintContainer, { top: scanTop + scanAreaSize + 30 }]}
      >
        <Text style={styles.hintText}>Align QR code within the frame</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  topShade: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  middleRow: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  sideShade: {
    flex: 1,
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  scanBox: {
    position: "relative",
  },
  bottomShade: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -BOTTOM_OVERFLOW,
    backgroundColor: "rgba(0,0,0,0.55)",
    zIndex: 2,
  },
  hintContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 3,
  },
  hintText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "600",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  corner: {
    position: "absolute",
    width: 28,
    height: 28,
    borderColor: "#59c639",
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 10,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 10,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 10,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 10,
  },
});
