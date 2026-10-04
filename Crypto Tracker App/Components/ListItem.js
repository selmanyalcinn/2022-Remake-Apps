import React, { memo, useState } from "react";
import { View, StyleSheet, Text, Image, Pressable } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { formatPrice, getChangeColor } from "../Utils/helpers";
import { useApp } from "../Context/AppContext";

function ListItem({
  coinId,
  name,
  symbol,
  currentPrice,
  priceChangePercentage,
  logoUrl,
  onPress,
}) {
  const { theme, isFavorite, toggleFavorite, currency } = useApp();
  const [imageFailed, setImageFailed] = useState(false);
  const favorited = isFavorite(coinId);
  const hasChange = Number.isFinite(priceChangePercentage);
  const isPositive = hasChange && priceChangePercentage > 0;
  const changeColor = getChangeColor(priceChangePercentage, theme.subtext);

  const handleFavorite = (event) => {
    event?.stopPropagation?.();
    toggleFavorite(coinId);
  };

  return (
    <View
      style={[
        styles.Card,
        {
          backgroundColor: theme.card,
          shadowColor: theme.cardShadow,
          shadowOpacity: theme.cardShadowOpacity,
        },
      ]}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.MainAction, pressed && styles.Pressed]}
        accessibilityRole="button"
        accessibilityLabel={`${name} detaylarını aç`}
      >
        {imageFailed || !logoUrl ? (
          <View style={[styles.LogoFallback, { backgroundColor: theme.accentLight }]}>
            <Text style={[styles.LogoFallbackText, { color: theme.accent }]}>
              {symbol?.slice(0, 1) || "?"}
            </Text>
          </View>
        ) : (
          <Image
            style={styles.Logo}
            source={{ uri: logoUrl }}
            onError={() => setImageFailed(true)}
          />
        )}

        <View style={styles.Info}>
          <Text style={[styles.Name, { color: theme.text }]} numberOfLines={1}>
            {name}
          </Text>
          <Text style={[styles.Symbol, { color: theme.subtext }]}>{symbol}</Text>
        </View>

        <View style={styles.PriceGroup}>
          <Text style={[styles.Price, { color: theme.text }]} numberOfLines={1}>
            {formatPrice(currentPrice, currency.symbol)}
          </Text>
          <View
            style={[
              styles.Pill,
              {
                backgroundColor: !hasChange
                  ? theme.chipInactiveBg
                  : isPositive
                    ? theme.pillPosBg
                    : priceChangePercentage < 0
                      ? theme.pillNegBg
                      : theme.chipInactiveBg,
              },
            ]}
          >
            <Text style={[styles.PillText, { color: changeColor }]}>
              {hasChange
                ? `${isPositive ? "▲" : priceChangePercentage < 0 ? "▼" : "•"} ${Math.abs(
                    priceChangePercentage
                  ).toFixed(2)}%`
                : "N/A"}
            </Text>
          </View>
        </View>
      </Pressable>

      <Pressable
        onPress={handleFavorite}
        style={({ pressed }) => [styles.FavBtn, pressed && styles.Pressed]}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel={favorited ? `${name} favorilerden çıkar` : `${name} favorilere ekle`}
        accessibilityState={{ selected: favorited }}
      >
        <Ionicons
          name={favorited ? "heart" : "heart-outline"}
          size={21}
          color={favorited ? theme.favActive : theme.favInactive}
        />
      </Pressable>
    </View>
  );
}

export default memo(ListItem);

const styles = StyleSheet.create({
  Card: {
    minHeight: 72,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 14,
    elevation: 2,
  },
  MainAction: {
    flex: 1,
    minWidth: 0,
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 14,
    paddingVertical: 12,
  },
  Pressed: {
    opacity: 0.65,
  },
  Logo: {
    height: 44,
    width: 44,
    borderRadius: 22,
  },
  LogoFallback: {
    height: 44,
    width: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  LogoFallbackText: {
    fontSize: 17,
    fontWeight: "800",
  },
  Info: {
    flex: 1,
    minWidth: 0,
    marginLeft: 12,
  },
  Name: {
    fontSize: 16,
    fontWeight: "600",
  },
  Symbol: {
    fontSize: 13,
    marginTop: 2,
  },
  PriceGroup: {
    maxWidth: "43%",
    alignItems: "flex-end",
    marginLeft: 6,
  },
  Price: {
    fontSize: 15,
    fontWeight: "600",
  },
  Pill: {
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    marginTop: 4,
  },
  PillText: {
    fontSize: 11,
    fontWeight: "600",
  },
  FavBtn: {
    width: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 4,
  },
});
