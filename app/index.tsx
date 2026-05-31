import {
  View,
  ActivityIndicator,
  Dimensions,
  FlatList,
  Text,
} from "react-native";
import Toast from "react-native-toast-message";
import "./global.css";
import { Inter_300Light, Inter_400Regular } from "@expo-google-fonts/inter";
import { useFonts } from "expo-font";
import { useState } from "react";

import sampleData from "../data/sampleData.json";
import QuoteCard from "../components/QuoteCard";
import FilterModal from "../components/FilterModal";
import { toastConfig } from "../components/toastConfig";

const { height } = Dimensions.get("window");

export default function Index() {
  const [fontsLoaded] = useFonts({
    Inter_300Light,
    Inter_400Regular,
  });

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const quotes = sampleData?.quotes || [];

  const filteredQuotes = quotes.filter(
    (q) =>
      selectedGenres.length === 0 ||
      q.tags?.some((tag: string) => selectedGenres.includes(tag.toLowerCase())),
  );

  if (!fontsLoaded) {
    return (
      <View className="flex-1 justify-center items-center bg-[#001a2c]">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  if (filteredQuotes.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-[#001a2c]">
        <Text className="text-white">No quotes found.</Text>

        <Text
          className="text-gray-400 mt-4"
          onPress={() => setIsFilterOpen(true)}
        >
          Adjust filters
        </Text>

        <FilterModal
          visible={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          selectedGenres={selectedGenres}
          setSelectedGenres={setSelectedGenres}
        />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <FlatList
        data={filteredQuotes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ height }}>
            <QuoteCard
              quote={item}
              onOpenFilter={() => setIsFilterOpen(true)}
            />
          </View>
        )}
        pagingEnabled
        decelerationRate="fast"
        snapToInterval={height}
        snapToAlignment="start"
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        initialNumToRender={2}
        maxToRenderPerBatch={3}
        windowSize={5}
        overScrollMode="never"
        getItemLayout={(data, index) => ({
          length: height,
          offset: height * index,
          index,
        })}
      />

      <FilterModal
        visible={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        selectedGenres={selectedGenres}
        setSelectedGenres={setSelectedGenres}
      />
      <Toast config={toastConfig} />
    </View>
  );
}
