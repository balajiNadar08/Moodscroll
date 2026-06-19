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

import QuoteCard from "../components/QuoteCard";
import FilterModal from "../components/FilterModal";
import { toastConfig } from "../components/toastConfig";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Quote } from "@/types/quote";
import LandingPage from "@/components/LandingPg";
const { height } = Dimensions.get("window");

export default function Index() {
  const [fontsLoaded] = useFonts({
    Inter_300Light,
    Inter_400Regular,
  });
const [showLanding, setShowLanding] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const shuffledIdsRef = useRef<number[]>([]);

  const PAGE_SIZE = 20;

  useEffect(() => {
  const timer = setTimeout(() => {
    setShowLanding(false);
  }, 3000);

  return () => clearTimeout(timer);
}, []);

  useEffect(() => {
    fetchQuotes();
  }, []);

  function shuffle<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  async function loadQuotesByIds(ids: number[]) {
    if (ids.length === 0) return [];

    const { data, error } = await supabase
      .from("Quotes")
      .select("*")
      .in("id", ids);

    if (error) throw error;

    const byId = new Map(data.map((q) => [q.id, q]));
    return ids.map((id) => byId.get(id)).filter(Boolean) as Quote[];
  }

  async function loadPage(pageNumber: number) {
    const from = pageNumber * PAGE_SIZE;
    const to = from + PAGE_SIZE;
    const idsForPage = shuffledIdsRef.current.slice(from, to);

    return loadQuotesByIds(idsForPage);
  }

  async function fetchAllIds() {
    const PAGE = 1000;
    let allIds: number[] = [];
    let from = 0;

    while (true) {
      const { data, error } = await supabase
        .from("Quotes")
        .select("id")
        .range(from, from + PAGE - 1);

      if (error) throw error;
      if (!data || data.length === 0) break;

      allIds = allIds.concat(data.map((r) => r.id));

      if (data.length < PAGE) break; 
      from += PAGE;
    }

    return allIds;
  }

  async function fetchQuotes() {
    try {
      const allIds = await fetchAllIds();

      shuffledIdsRef.current = shuffle(allIds);

      const data = await loadPage(0);

      setQuotes(data);
      setPage(1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function loadMoreQuotes() {
    if (loadingMore) return;

    try {
      setLoadingMore(true);

      const data = await loadPage(page);

      if (data.length > 0) {
        setQuotes((prev) => [...prev, ...data]);
        setPage((prev) => prev + 1);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMore(false);
    }
  }

  const filteredQuotes = quotes.filter(
  (q) =>
    selectedGenres.length === 0 ||
    selectedGenres
      .map((g) => g.toLowerCase())
      .includes(q.category.toLowerCase()),
);

if (showLanding) {
  return <LandingPage />;
}

  if (!fontsLoaded || loading) {
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
          className="text-gray-400 pt-4"
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
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ height }}>
            <QuoteCard
              quote={item}
              onOpenFilter={() => setIsFilterOpen(true)}
            />
          </View>
        )}
        onEndReached={loadMoreQuotes}
        onEndReachedThreshold={0.7}
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
