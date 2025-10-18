import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import { WidgetPreview } from "react-native-android-widget";

import HelloWidget from "./HelloWidget";

const priceAreas = ["SE1", "SE2", "SE3", "SE4"];

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [selectedArea, setSelectedArea] = useState("SE3");
  const [pricesArray, setPricesArray] = useState([]);
  const [showTomorrow, setShowTomorrow] = useState(false);

  const fetchPrices = async (date) => {
    try {
      setIsLoading(true);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      const apiUrl = `https://www.elprisetjustnu.se/api/v1/prices/${year}/${month}-${day}_${selectedArea}.json`;
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error("Failed to fetch prices");

      const jsonArray = await response.json();
      setPricesArray(jsonArray);

      if (!showTomorrow) {
        const now = new Date();
        const current = jsonArray.find((item) => {
          const start = new Date(item.time_start);
          const end = new Date(item.time_end);
          return now >= start && now < end;
        });
        setCurrentPrice(current ? current.SEK_per_kWh : null);
      } else {
        setCurrentPrice(null);
      }
    } catch (err) {
      console.error(err);
      setPricesArray([]);
      setCurrentPrice(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const date = new Date();
    if (showTomorrow) date.setDate(date.getDate() + 1);
    fetchPrices(date);
  }, [selectedArea, showTomorrow]);

  const priceChanges = pricesArray.map((item, index) => {
    if (index === 0) return { ...item, change: 0 };
    const prev = pricesArray[index - 1].SEK_per_kWh;
    return { ...item, change: item.SEK_per_kWh - prev };
  });

  const renderHeader = () => (
    <>
      <LinearGradient
        colors={["#4facfe", "#00f2fe"]}
        start={[0, 0]}
        end={[1, 1]}
        style={styles.card}
      >
        <Text style={styles.cardTitle}>Aktuellt Pris</Text>
        {isLoading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : currentPrice !== null ? (
          <Text style={styles.currentPrice}>{currentPrice} kr/kWh</Text>
        ) : (
          <Text style={styles.currentPrice}>N/A</Text>
        )}
        <Text style={styles.areaText}>Område: {selectedArea}</Text>
      </LinearGradient>

      <View style={styles.dropdownContainer}>
        <Text style={styles.label}>Valt Område:</Text>
        <Picker
          selectedValue={selectedArea}
          onValueChange={(itemValue) => setSelectedArea(itemValue)}
          style={styles.picker}
        >
          {priceAreas.map((area) => (
            <Picker.Item key={area} label={area} value={area} />
          ))}
        </Picker>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => setShowTomorrow(!showTomorrow)}
      >
        <Text style={styles.buttonText}>
          {showTomorrow ? "Visa Idag" : "Visa Imorgon"}
        </Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>
        Pris Skillnad {showTomorrow ? "(imorgon)" : "(idag)"}
      </Text>
    </>
  );

  return (
    <View style={styles.container}>
      <WidgetPreview
        renderWidget={() => <HelloWidget />}
        width={100}
        height={100}
      />
      <FlatList
        data={priceChanges}
        keyExtractor={(item) => item.time_start}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text style={styles.timeText}>
              {item.time_start.slice(11, 16)} → {item.time_end.slice(11, 16)}
            </Text>
            <Text
              style={[
                styles.priceText,
                {
                  color:
                    item.change > 0
                      ? "green"
                      : item.change < 0
                      ? "red"
                      : "black",
                },
              ]}
            >
              {item.SEK_per_kWh.toFixed(2)} SEK ({item.change.toFixed(2)})
            </Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, margin: 20, backgroundColor: "#f9f9f9" },
  card: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  cardTitle: { fontSize: 18, color: "#fff" },
  currentPrice: {
    fontSize: 32,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#fff",
  },
  areaText: { fontSize: 16, color: "#fff" },
  dropdownContainer: { marginBottom: 20 },
  label: { fontSize: 16, marginBottom: 8 },
  picker: { backgroundColor: "#fff", borderRadius: 8 },
  button: {
    backgroundColor: "#007bff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 20,
  },
  buttonText: { color: "#fff", fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  listItem: {
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeText: { fontSize: 14, color: "#555" },
  priceText: { fontSize: 14, fontWeight: "bold" },
});

export default App;
