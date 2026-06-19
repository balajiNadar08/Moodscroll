import { Link } from "expo-router";
import {
  Boxes,
  Earth,
  Funnel,
  Heart,
  Plus,
  Share,
  UserRound,
  X,
} from "lucide-react-native";

import { supabase } from "@/lib/supabase";
import { Quote } from "@/types/quote";
import * as Sharing from "expo-sharing";
import { useEffect, useRef, useState } from "react";
import { router } from "expo-router";
import {
  FlatList,
  ImageBackground,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ViewShot from "react-native-view-shot";
import Toast from "react-native-toast-message";
import CreateCollectionModal from "@/components/CreateCollectionModal";
import { useTheme } from "@/context/ThemeContext";
import { useThemeColors } from "@/hooks/useThemeColors";

type Collection = {
  id: string;
  name: string;
};

type QuoteCardProps = {
  quote: Quote;
  onOpenFilter: () => void;
};

export default function QuoteCard({ quote, onOpenFilter }: QuoteCardProps) {
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [createCollectionModal, setCreateCollectionModal] = useState(false);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);
  const fetchCollections = async () => {
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

      setCollections(data || []);
    } catch (error) {
      console.error("Failed to fetch collections:", error);
    }
  };
  useEffect(() => {
    fetchCollections();
  }, []);
  const { toggleTheme, theme } = useTheme();
  const colors = useThemeColors();

  const viewShotRef = useRef<ViewShot>(null);

  const handleAddToCollection = async (
    collectionId: string,
    collectionName?: string,
  ) => {
    try {
      const { data: existing } = await supabase
        .from("Collection_Quotes")
        .select("quote_id")
        .eq("collection_id", collectionId)
        .eq("quote_id", quote.id)
        .maybeSingle();

      if (existing) {
        Toast.show({
          type: "info",
          text1: "Already in collection",
          text2: `This quote is already in "${collectionName}"`,
          position: "bottom",
          visibilityTime: 2000,
          bottomOffset: 20,
        });
        setShowCollectionModal(false);
        return;
      }

      const { error } = await supabase.from("Collection_Quotes").insert({
        collection_id: collectionId,
        quote_id: quote.id,
      });

      if (error) throw error;

      Toast.show({
        type: "success",
        text1: "Quote saved!",
        text2: `Added to "${collectionName}"`,
        position: "bottom",
        visibilityTime: 2000,
        bottomOffset: 20,
      });
    } catch (err) {
      console.error("Failed to add quote to collection:", err);
      Toast.show({
        type: "error",
        text1: "Failed to save",
        text2: "Something went wrong. Try again.",
        position: "bottom",
        visibilityTime: 2000,
        bottomOffset: 20,
      });
    } finally {
      setShowCollectionModal(false);
    }
  };

  const shareImg = async () => {
    try {
      const ref = viewShotRef.current;

      if (!ref || !ref.capture) return;

      const uri = await ref.capture();

      await Sharing.shareAsync(uri);
    } catch (error) {
      console.log(error);
    }
  };

  const [liked, setLiked] = useState(false);

  const handleLike = async () => {
    if (liked) {
      setLiked(false);

      await supabase.rpc("decrement_quote_likes", {
        quote_id_input: quote.id,
      });
      
    } else {
      setLiked(true);

      await supabase.rpc("increment_quote_likes", {
        quote_id_input: quote.id,
      });
    }
  };

  return (
    <>
      <ViewShot
        ref={viewShotRef}
        style={{ flex: 1 }}
        options={{
          format: "png",
          quality: 1,
        }}
      >
        <ImageBackground
          source={require("../assets/images/backgrounds/scroll-page-bg.webp")}
          style={{ flex: 1 }}
          resizeMode="cover"
        >
          <View className="flex-1 bg-black/40">
            <View className="absolute top-6 left-0 right-0 flex-row justify-between px-6">
              <Link href="/profile">
                <UserRound color="white" size={26} strokeWidth={1.5} />
              </Link>

              <TouchableOpacity onPress={onOpenFilter}>
                <Funnel color="white" size={26} />
              </TouchableOpacity>
            </View>

            <View className="flex-1 justify-center items-center px-12">
              <ViewShot
                ref={viewShotRef}
                options={{ format: "png", quality: 1 }}
              >
                <Text
                  style={{ fontFamily: "Inter_400Regular" }}
                  className="text-white text-center text-2xl leading-relaxed tracking-wide"
                >
                  {quote.quote}
                </Text>

                <View className="pt-8 items-center gap-4">
                  <Text
                    style={{ fontFamily: "Inter_300Light" }}
                    className="text-white text-md"
                  >
                    - {quote.author}
                  </Text>
                  <Text
                    style={{ fontFamily: "Inter_300Light" }}
                    className="text-white text-sm border border-white px-2 rounded-full capitalize"
                  >
                    {quote.category}
                  </Text>
                </View>
              </ViewShot>

              <View className="flex-row gap-6 pt-12">
                <TouchableOpacity onPress={handleLike}>
                  <Heart
                    size={32}
                    color="white"
                    fill={liked ? "white" : "transparent"}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={async () => {
                    await fetchCollections();
                    setShowCollectionModal(true);
                  }}
                >
                  <Plus color="white" size={32} />
                </TouchableOpacity>
              </View>
            </View>

            <View className="absolute bottom-20 left-0 right-0 flex-row justify-between items-end px-6">
              <Link href="/collection">
                <Boxes color="white" size={26} strokeWidth={1.5} />
              </Link>

              <View className="gap-6">
                <Link href="/community">
                  <Earth color="white" size={26} strokeWidth={1.5} />
                </Link>

                <TouchableOpacity onPress={shareImg}>
                  <Share color="white" size={26} strokeWidth={1.5} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ImageBackground>
      </ViewShot>
      <Modal visible={showCollectionModal} transparent animationType="fade">
        <Pressable
          className="flex-1 bg-black/30 justify-end"
          onPress={() => setShowCollectionModal(false)}
        >
          <Pressable
            className="rounded-t-3xl border-t-4 px-6 pt-6 pb-10"
            style={{
              backgroundColor: colors.background,
              borderColor: colors.borderPrimary,
            }}
            onPress={(e) => e.stopPropagation()}
          >
            <View className="flex-row justify-between items-center pb-6">
              <Text
                className="text-xl font-semibold"
                style={{ color: colors.textPrimary }}
              >
                Save Quote
              </Text>

              <TouchableOpacity onPress={() => setShowCollectionModal(false)}>
                <X color={colors.iconPrimary} size={24} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              className="rounded-2xl py-4 px-4 mb-5"
              style={{
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.borderSecondary,
              }}
              onPress={() => {
                if (!user) {
                  setShowCollectionModal(false);
                  router.push("/settings");
                  return;
                }

                setShowCollectionModal(false);
                setCreateCollectionModal(true);
              }}
            >
              <Text
                className="text-center font-semibold"
                style={{ color: colors.textPrimary }}
              >
                {user ? "+ Create New Collection" : "Login/Register to Save"}
              </Text>
            </TouchableOpacity>

            <Text
              className="mb-3 text-sm"
              style={{ color: colors.textSecondary }}
            >
              Existing Collections
            </Text>

            <FlatList
              data={collections}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleAddToCollection(item.id, item.name)}
                  className="rounded-2xl px-4 py-4 mb-3"
                  style={{ backgroundColor: colors.accent }}
                >
                  <Text
                    className="text-base font-semibold"
                    style={{ color: colors.cardSecondary }}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>

      <CreateCollectionModal
        visible={createCollectionModal}
        collections={collections.map((item) => item.name)}
        onClose={() => setCreateCollectionModal(false)}
        onCreate={async (name) => {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) return;

          const { data, error } = await supabase
            .from("Collections")
            .insert({
              name,
              user_id: user.id,
            })
            .select("id, name")
            .single();

          if (error) {
            console.error(error);
            throw error;
          }

          setCollections((prev) => [...prev, data]);

          handleAddToCollection(data.id, data.name);
        }}
      />
    </>
  );
}
