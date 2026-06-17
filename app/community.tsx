import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useMemo, useState, useEffect, useCallback } from "react";
import { useTheme } from "@/context/ThemeContext";
import { useThemeColors } from "@/hooks/useThemeColors";
import { supabase } from "@/lib/supabase";

import {
  ArrowBigUp,
  ArrowBigDown,
  Star,
  Clock3,
  Plus,
} from "lucide-react-native";

type VoteType = "up" | "down" | null;

type Post = {
  id: number;
  username: string;
  text: string;
  author: string;
  upvotes_count: number;
  downvotes_count: number;
  userVote: VoteType;
  created_at: string;
  user_id: string;
};

const Community = () => {
  const [tab, setTab] = useState<"popular" | "recent">("popular");
  const [posts, setPosts] = useState<Post[]>([]);
  const [showInput, setShowInput] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { toggleTheme, theme } = useTheme();
  const colors = useThemeColors();

  const fetchUserVotes = useCallback(
    async (postIds: number[]): Promise<Record<number, VoteType>> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || postIds.length === 0) return {};

      const { data } = await supabase
        .from("Community_Quote_Votes")
        .select("quote_id, vote")
        .eq("user_id", user.id)
        .in("quote_id", postIds);

      if (!data) return {};

      return data.reduce(
        (acc, row) => {
          acc[row.quote_id] = row.vote === 1 ? "up" : "down";
          return acc;
        },
        {} as Record<number, VoteType>,
      );
    },
    [],
  );

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("Community_Quotes")
      .select(
        `id, created_at, user_id, quote, author, upvotes_count, downvotes_count`,
      )
      .order("created_at", { ascending: false });

    if (error || !data) {
      console.log("Fetch error:", error);
      setLoading(false);
      return;
    }

    const postIds = data.map((d) => d.id);
    const userVotes = await fetchUserVotes(postIds);

    const mapped: Post[] = data.map((d: any) => ({
      id: d.id,
      username: d.author ?? "Unknown",
      text: d.quote,
      author: d.author ?? "",
      upvotes_count: d.upvotes_count ?? 0,
      downvotes_count: d.downvotes_count ?? 0,
      userVote: userVotes[d.id] ?? null,
      created_at: d.created_at,
      user_id: d.user_id,
    }));

    setPosts(mapped);
    setLoading(false);
  }, [fetchUserVotes]);

  useEffect(() => {
    fetchPosts();

    const channel = supabase
      .channel("community_quotes_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Community_Quotes" },
        () => fetchPosts(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPosts]);

  const sortedPosts = useMemo(() => {
    if (tab === "popular") {
      return [...posts].sort(
        (a, b) =>
          b.upvotes_count -
          b.downvotes_count -
          (a.upvotes_count - a.downvotes_count),
      );
    }

    return [...posts].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [posts, tab]);

  const vote = async (id: number, type: VoteType) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const post = posts.find((p) => p.id === id);
    if (!post) return;

    const voteValue = type === "up" ? 1 : -1;

    if (post.userVote === type) {
      await supabase
        .from("Community_Quote_Votes")
        .delete()
        .eq("user_id", user.id)
        .eq("quote_id", id);

      await supabase
        .from("Community_Quotes")
        .update({
          upvotes_count:
            type === "up" ? post.upvotes_count - 1 : post.upvotes_count,
          downvotes_count:
            type === "down" ? post.downvotes_count - 1 : post.downvotes_count,
        })
        .eq("id", id);
    } else if (post.userVote !== null) {
      await supabase
        .from("Community_Quote_Votes")
        .update({ vote: voteValue })
        .eq("user_id", user.id)
        .eq("quote_id", id);

      await supabase
        .from("Community_Quotes")
        .update({
          upvotes_count:
            type === "up" ? post.upvotes_count + 1 : post.upvotes_count - 1,
          downvotes_count:
            type === "down"
              ? post.downvotes_count + 1
              : post.downvotes_count - 1,
        })
        .eq("id", id);
    } else {
      await supabase.from("Community_Quote_Votes").insert({
        user_id: user.id,
        quote_id: id,
        vote: voteValue,
      });

      await supabase
        .from("Community_Quotes")
        .update({
          upvotes_count:
            type === "up" ? post.upvotes_count + 1 : post.upvotes_count,
          downvotes_count:
            type === "down" ? post.downvotes_count + 1 : post.downvotes_count,
        })
        .eq("id", id);
    }

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;

        let upvotes = p.upvotes_count;
        let downvotes = p.downvotes_count;
        let userVote: VoteType = p.userVote;

        if (p.userVote === type) {
          if (type === "up") upvotes--;
          else downvotes--;
          userVote = null;
        } else if (p.userVote !== null) {
          if (type === "up") {
            upvotes++;
            downvotes--;
          } else {
            downvotes++;
            upvotes--;
          }
          userVote = type;
        } else {
          if (type === "up") upvotes++;
          else downvotes++;
          userVote = type;
        }

        return {
          ...p,
          upvotes_count: upvotes,
          downvotes_count: downvotes,
          userVote,
        };
      }),
    );
  };

  const createPost = async () => {
    if (!input.trim() || submitting) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please sign in to post quotes.");
      return;
    }

    setSubmitting(true);

    const { data: userData, error: userError } = await supabase
      .from("User")
      .select("username")
      .eq("id", user.id)
      .single();

    if (userError || !userData) {
      alert("Could not fetch user profile.");
      setSubmitting(false);
      return;
    }

    const { error } = await supabase.from("Community_Quotes").insert({
      user_id: user.id,
      quote: input.trim(),
      author: userData.username,
      upvotes_count: 0,
      downvotes_count: 0,
    });

    if (error) {
      console.error("Insert error:", error.message, error.details, error.hint);
      alert(`Failed to post: ${error.message}`);
    } else {
      setInput("");
      setShowInput(false);
      fetchPosts();
    }

    setSubmitting(false);
  };

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      console.log("CURRENT USER:", user);
    };

    checkUser();
  }, []);

  return (
    <SafeAreaView
      style={{ backgroundColor: colors.background }}
      className="flex-1"
    >
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
      />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 0}
      >
        <View className="px-6 pb-6 pt-4">
          <Text
            style={{ color: colors.textPrimary }}
            className="text-3xl font-bold"
          >
            Community
          </Text>
          <Text style={{ color: colors.textSecondary }} className="text-[12px]">
            Discover quotes from the community
          </Text>
        </View>

        <View className="flex-row px-6 mb-6 gap-4">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setTab("popular")}
            className="flex-1 rounded-md py-2 items-center flex-row justify-center gap-2 border"
            style={{
              backgroundColor: tab === "popular" ? colors.accent : colors.card,
              borderColor:
                tab === "popular"
                  ? colors.borderPrimary
                  : colors.borderSecondary,
            }}
          >
            <Star
              size={18}
              color={
                tab === "popular" ? colors.cardSecondary : colors.textPrimary
              }
            />
            <Text
              style={{
                color:
                  tab === "popular" ? colors.cardSecondary : colors.textPrimary,
              }}
              className="text-base font-semibold"
            >
              Popular
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setTab("recent")}
            className="flex-1 rounded-md py-2 items-center flex-row justify-center gap-2 border"
            style={{
              backgroundColor: tab === "recent" ? colors.accent : colors.card,
              borderColor:
                tab === "recent"
                  ? colors.borderPrimary
                  : colors.borderSecondary,
            }}
          >
            <Clock3
              size={18}
              color={
                tab === "recent" ? colors.cardSecondary : colors.textPrimary
              }
            />
            <Text
              style={{
                color:
                  tab === "recent" ? colors.cardSecondary : colors.textPrimary,
              }}
              className="text-base font-semibold"
            >
              Recent
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : (
          <FlatList
            data={sortedPosts}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingBottom: 80,
            }}
            renderItem={({ item }) => (
              <View
                className="rounded-2xl p-5 mb-5 overflow-hidden"
                style={{
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.borderSecondary,
                }}
              >
                <View className="absolute inset-0 bg-white/5 backdrop-blur-xl" />

                <Text
                  style={{ color: colors.textPrimary }}
                  className="text-[14px] leading-5"
                >
                  {item.text}
                </Text>

                <Text
                  style={{ color: colors.textTertiary }}
                  className="text-[12px] text-right italic mt-2"
                >
                  — {item.username}
                </Text>

                <View className="flex-row items-center justify-between mt-2">
                  <View
                    className="flex-row items-center rounded-xl"
                    style={{
                      borderWidth: 1,
                      borderColor: colors.borderSecondary,
                    }}
                  >
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => vote(item.id, "up")}
                      className="w-11 h-11 rounded-xl items-center justify-center"
                      style={{
                        backgroundColor:
                          item.userVote === "up"
                            ? colors.accent
                            : "transparent",
                      }}
                    >
                      <ArrowBigUp
                        size={18}
                        color={
                          item.userVote === "up"
                            ? colors.cardSecondary
                            : colors.textPrimary
                        }
                      />
                    </TouchableOpacity>

                    <Text
                      style={{ color: colors.textPrimary }}
                      className="text-sm font-bold mx-3"
                    >
                      {item.upvotes_count - item.downvotes_count}
                    </Text>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => vote(item.id, "down")}
                      className="w-11 h-11 rounded-xl items-center justify-center"
                      style={{
                        backgroundColor:
                          item.userVote === "down"
                            ? colors.accent
                            : "transparent",
                      }}
                    >
                      <ArrowBigDown
                        size={18}
                        color={
                          item.userVote === "down"
                            ? colors.cardSecondary
                            : colors.textPrimary
                        }
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          />
        )}

        {showInput && (
          <View className="absolute inset-0 bg-black/50 backdrop-blur-xl z-10" />
        )}

        {showInput ? (
          <View className="absolute inset-0 justify-center px-6 z-20">
            <View
              className="rounded-2xl p-5"
              style={{
                backgroundColor: colors.cardSecondary,
                borderWidth: 1,
                borderColor: colors.borderSecondary,
              }}
            >
              <Text
                style={{ color: colors.textPrimary }}
                className="text-xl font-bold mb-5"
              >
                Create Post
              </Text>

              <TextInput
                placeholder="Share something inspiring..."
                placeholderTextColor={colors.textSecondary}
                value={input}
                onChangeText={setInput}
                multiline
                autoFocus
                style={{
                  color: colors.textPrimary,
                  borderColor: colors.borderSecondary,
                  backgroundColor: colors.card,
                }}
                className="rounded-2xl px-5 py-4 text-base min-h-[120px] border"
              />

              <View className="flex-row justify-end mt-5 gap-3">
                <TouchableOpacity
                  onPress={() => {
                    setShowInput(false);
                    setInput("");
                  }}
                  className="px-6 py-4 rounded-xl"
                  style={{
                    backgroundColor: colors.card,
                    borderWidth: 1,
                    borderColor: colors.borderSecondary,
                  }}
                >
                  <Text
                    style={{ color: colors.textPrimary }}
                    className="font-semibold"
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={createPost}
                  disabled={submitting}
                  className="px-6 py-4 rounded-xl"
                  style={{
                    backgroundColor: colors.accent,
                    opacity: submitting ? 0.6 : 1,
                  }}
                >
                  {submitting ? (
                    <ActivityIndicator
                      size="small"
                      color={colors.cardSecondary}
                    />
                  ) : (
                    <Text
                      style={{ color: colors.cardSecondary }}
                      className="font-bold"
                    >
                      Post
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={async () => {
              const {
                data: { user },
              } = await supabase.auth.getUser();

              if (!user) {
                alert("Please sign in to post quotes.");
                return;
              }

              setShowInput(true);
            }}
            className="absolute bottom-8 right-6 w-16 h-16 rounded-full items-center justify-center shadow-2xl"
            style={{ backgroundColor: colors.accent }}
          >
            <Plus size={30} color={colors.cardSecondary} />
          </TouchableOpacity>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Community;
