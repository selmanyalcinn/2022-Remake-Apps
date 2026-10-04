import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useNavigation, useIsFocused } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import CodeScanner from "../Component/CodeScanner";

export default function Home() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState(false);
  const isScanningRef = useRef(false);
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  // Flaş butonunu sağ üst başlığa (Header Right) yerleştir
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => setTorch((prev) => !prev)}
          style={styles.headerTorchButton}
          activeOpacity={0.7}
        >
          <Ionicons
            name={torch ? "flash" : "flash-off"}
            size={22}
            color={torch ? "#59c639" : "#9ca3af"}
          />
        </TouchableOpacity>
      ),
    });
  }, [navigation, torch]);

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  // Sayfa odağa geldiğinde veya ayrıldığında tarama durumunu sıfırla/kilitle
  useEffect(() => {
    if (isFocused) {
      // Geri gelindiğinde hemen anında eski kodu taramaması için 800ms gecikme ver
      const timer = setTimeout(() => {
        isScanningRef.current = false;
        setScanned(false);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      isScanningRef.current = true;
      setScanned(true);
      setTorch(false);
    }
  }, [isFocused]);

  const handleBarCodeScanned = ({ type, data }) => {
    if (isScanningRef.current || scanned) return;
    isScanningRef.current = true;
    setScanned(true);
    navigation.navigate("Result", { data });
  };

  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#59c639" />
        <Text style={styles.loadingText}>Initializing camera...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.permissionTitle}>Camera Permission Required</Text>
        <Text style={styles.permissionText}>
          Camera access is required to scan QR codes.
        </Text>
        {permission.canAskAgain ? (
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={requestPermission}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={() => Linking.openSettings()}
          >
            <Text style={styles.permissionButtonText}>Open Settings</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isFocused && (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          enableTorch={torch}
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        />
      )}
      <CodeScanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0f17",
  },
  headerTorchButton: {
    padding: 8,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#0b0f17",
  },
  loadingText: {
    marginTop: 14,
    fontSize: 16,
    color: "#9ca3af",
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#f9fafb",
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 15,
    color: "#9ca3af",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: "#59c639",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
