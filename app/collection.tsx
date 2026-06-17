import CreateCollectionModal from "@/components/CreateCollectionModal";
import { useTheme } from "@/context/ThemeContext";
import { useThemeColors } from "@/hooks/useThemeColors";
import { supabase } from "@/lib/supabase";
import { useFocusEffect } from "expo-router";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react-native";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";

type Quote = {
  id: number;
  quote: string;
  author: string;
};

type Collection = {
  id: number;
  name: string;
  quotes?: Quote[];
  expanded?: boolean;
  loadingQuotes?: boolean;
};

const Collection = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const { toggleTheme, theme } = useTheme();
  const colors = useThemeColors();

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("Collections")
        .select("id, name")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCollections(data ?? []);
    } catch (err) {
      console.error("Failed to fetch collections:", err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCollections();
    }, []),
  );

  const handleCreate = async (name: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not logged in");

      const { data, error } = await supabase
        .from("Collections")
        .insert({ name, user_id: user.id })
        .select("id, name")
        .single();

      if (error) throw error;
      setCollections((prev) => [data, ...prev]);
    } catch (err) {
      console.error("Failed to create collection:", err);
      throw err;
    }
  };

  const handleDelete = (id: number, name: string) => {
    Alert.alert(
      "Delete Collection",
      `Are you sure you want to delete "${name}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("Collections")
                .delete()
                .eq("id", id);

              if (error) throw error;
              setCollections((prev) => prev.filter((c) => c.id !== id));
            } catch (err) {
              console.error("Failed to delete collection:", err);
              Alert.alert("Error", "Failed to delete collection.");
            }
          },
        },
      ],
    );
  };

  const handleToggleExpand = async (id: number) => {
    const collection = collections.find((c) => c.id === id);
    if (!collection) return;

    if (collection.expanded) {
      setCollections((prev) =>
        prev.map((c) => (c.id === id ? { ...c, expanded: false } : c)),
      );
      return;
    }

    setCollections((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, expanded: true, loadingQuotes: true } : c,
      ),
    );

    try {
      const { data: cqData, error: cqError } = await supabase
        .from("Collection_Quotes")
        .select("quote_id")
        .eq("collection_id", id);

      console.log("CQ DATA:", cqData);
      console.log("CQ ERROR:", cqError);
      if (cqError) throw cqError;

      const quoteIds = (cqData ?? []).map((row) => row.quote_id);
      console.log("QUOTE IDS:", quoteIds);
      if (quoteIds.length === 0) {
        setCollections((prev) =>
          prev.map((c) =>
            c.id === id ? { ...c, quotes: [], loadingQuotes: false } : c,
          ),
        );
        return;
      }

      const { data: quotesData, error: quotesError } = await supabase
        .from("Quotes")
        .select("id, quote, author")
        .in("id", quoteIds);

      console.log("QUOTES DATA:", quotesData);
      console.log("QUOTES ERROR:", quotesError);

      if (quotesError) throw quotesError;

      const quotes: Quote[] = quotesData ?? [];

      setCollections((prev) =>
        prev.map((c) =>
          c.id === id ? { ...c, quotes, loadingQuotes: false } : c,
        ),
      );
    } catch (err) {
      console.error("Failed to fetch quotes:", err);
      setCollections((prev) =>
        prev.map((c) => (c.id === id ? { ...c, loadingQuotes: false } : c)),
      );
    }
  };

  if (loading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: colors.background }}
      >
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View
      className="flex-1 px-6 pt-6"
      style={{ backgroundColor: colors.background }}
    >
      <Text
        className="text-3xl font-semibold mb-6"
        style={{ color: colors.textPrimary }}
      >
        Collections
      </Text>

      {collections.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text
            className="text-base text-center opacity-60"
            style={{ color: colors.textSecondary }}
          >
            Your jar seems empty.
          </Text>
          <Text
            className="text-sm text-center opacity-40 mt-1"
            style={{ color: colors.textSecondary }}
          >
            Start by creating your first collection
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {collections.map((item) => (
            <View
              key={item.id}
              className="rounded-2xl mb-4 overflow-hidden"
              style={{
                borderWidth: 1,
                borderColor: colors.borderSecondary,
                backgroundColor: colors.card,
              }}
            >
              <View className="flex-row items-center px-4 py-4">
                <TouchableOpacity
                  className="flex-1 flex-row items-center"
                  onPress={() => handleToggleExpand(item.id)}
                >
                  <Text
                    className="text-base font-semibold flex-1"
                    style={{ color: colors.textPrimary }}
                  >
                    {item.name}
                  </Text>
                  {item.expanded ? (
                    <ChevronUp size={18} color={colors.textSecondary} />
                  ) : (
                    <ChevronDown size={18} color={colors.textSecondary} />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  className="ml-4 p-1"
                  onPress={() => handleDelete(item.id, item.name)}
                >
                  <Trash2 size={18} color={colors.textTertiary} />
                </TouchableOpacity>
              </View>

              {item.expanded && (
                <View
                  className="px-4 pb-4"
                  style={{
                    borderTopWidth: 1,
                    borderTopColor: colors.borderSecondary,
                  }}
                >
                  {item.loadingQuotes ? (
                    <ActivityIndicator
                      size="small"
                      color={colors.accent}
                      style={{ marginTop: 16 }}
                    />
                  ) : item.quotes && item.quotes.length > 0 ? (
                    item.quotes.map((q, index) => (
                      <View
                        key={q.id}
                        className="mt-4 rounded-xl p-4"
                        style={{
                          backgroundColor: colors.cardSecondary,
                          borderWidth: 1,
                          borderColor: colors.borderSecondary,
                        }}
                      >
                        <Text
                          className="text-2xl leading-none"
                          style={{ color: colors.accent }}
                        >
                          "
                        </Text>
                        <Text
                          className="text-sm leading-6 italic"
                          style={{ color: colors.textPrimary }}
                        >
                          {q.quote}
                        </Text>
                        {q.author ? (
                          <Text
                            className="text-xs mt-2 text-right"
                            style={{ color: colors.textSecondary }}
                          >
                            — {q.author}
                          </Text>
                        ) : null}
                      </View>
                    ))
                  ) : (
                    <Text
                      className="text-sm mt-4 text-center opacity-50"
                      style={{ color: colors.textSecondary }}
                    >
                      No quotes in this collection yet
                    </Text>
                  )}
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      )}

      {!modalVisible && (
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="absolute bottom-10 left-6 right-6 py-4 rounded-2xl items-center flex-row justify-center"
          style={{ backgroundColor: colors.accent }}
        >
          <Plus color={colors.iconPrimary} size={20} />
          <Text
            className="text-base font-medium ml-2"
            style={{ color: colors.background }}
          >
            Create Collection
          </Text>
        </TouchableOpacity>
      )}

      <CreateCollectionModal
        visible={modalVisible}
        collections={collections.map((c) => c.name)}
        onClose={() => setModalVisible(false)}
        onCreate={handleCreate}
      />
    </View>
  );
};

export default Collection;
