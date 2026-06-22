import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
} from "react-native";
import { Settings, House } from "lucide-react-native";
import { Link, useRouter } from "expo-router";
import { useState, useCallback } from "react";
import EditProfile from "@/components/EditProfile";
import { useTheme } from "@/context/ThemeContext";
import { useThemeColors } from "@/hooks/useThemeColors";
import { supabase } from "@/lib/supabase";
import { useFocusEffect } from "expo-router";
import { getStreak } from "@/utils/streak";
import AsyncStorage from "@react-native-async-storage/async-storage";

type UserProfile = {
  username: string;
  bio: string;
  totalQuotes: number;
  followers: number;
  following: number;
  currentStreak: number;
  personalBest: number;
  interests: string[];
  quotes: {
    id: number;
    text: string;
    upvotes_count: number;
    downvotes_count: number;
  }[];
  avatar: string | null;
};

const defaultProfile: UserProfile = {
  username: "",
  bio: "",
  totalQuotes: 0,
  followers: 0,
  following: 0,
  currentStreak: 0,
  personalBest: 0,
  interests: [],
  quotes: [],
  avatar: null,
};

const Profile = () => {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { toggleTheme, theme } = useTheme();
  const colors = useThemeColors();
  const router = useRouter();

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const streak = await getStreak();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsLoggedIn(false);

        setProfile((prev) => ({
          ...prev,
          currentStreak: streak.currentStreak,
          personalBest: streak.personalBest,
        }));

        setLoading(false);
        return;
      }

      setIsLoggedIn(true);
      setUserId(user.id);

      const { data, error } = await supabase
        .from("User")
        .select("username, avatar, interests")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;
      if (!data) return;

      const { data: quotesData } = await supabase
        .from("Community_Quotes")
        .select("id, quote, upvotes_count, downvotes_count")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      const quotes = (quotesData ?? []).map((q: any) => ({
        id: q.id,
        text: q.quote,
        upvotes_count: q.upvotes_count ?? 0,
        downvotes_count: q.downvotes_count ?? 0,
      }));
      const localAvatar = await AsyncStorage.getItem("profileImage");

      setProfile((prev) => ({
        ...prev,
        username: data.username ?? "",
        bio: prev.bio,
        avatar: localAvatar || data.avatar || null,
        interests: data.interests
          ? data.interests
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean)
          : [],
        quotes,
        totalQuotes: quotes.length,
        currentStreak: streak.currentStreak,
        personalBest: streak.personalBest,
      }));
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, []),
  );

  const avatarLetter = profile.username
    ? profile.username[0].toUpperCase()
    : "?";

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
    <>
      <ScrollView
        className="flex-1"
        style={{ backgroundColor: colors.background }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pt-14 pb-10">
          <View className="flex-row justify-between items-center">
            <TouchableOpacity onPress={() => router.push("/")}>
              <House color={colors.iconPrimary} size={26} strokeWidth={1.5} />
            </TouchableOpacity>
            <Link href={"/settings"}>
              <Settings
                color={colors.iconPrimary}
                size={26}
                strokeWidth={1.5}
              />
            </Link>
          </View>

          <View className="items-center mt-4">
            {profile.avatar ? (
              <Image
                source={{ uri: profile.avatar }}
                className="w-36 h-36 rounded-full border-4"
                style={{ borderColor: colors.borderPrimary }}
              />
            ) : (
              <View
                className="w-36 h-36 rounded-full border-4 items-center justify-center"
                style={{
                  borderColor: colors.borderPrimary,
                  backgroundColor: colors.accent,
                }}
              >
                <Text
                  className="text-5xl font-bold"
                  style={{ color: colors.background }}
                >
                  {avatarLetter}
                </Text>
              </View>
            )}
            <Text
              className="text-4xl font-bold mt-6"
              style={{ color: colors.textPrimary }}
            >
              {profile.username || "No username"}
            </Text>
            <Text
              className="text-lg italic mt-2"
              style={{ color: colors.textSecondary }}
            >
              {profile.bio || "No bio yet"}
            </Text>
          </View>

          <View
            className="flex-row justify-between gap-5 rounded-xl px-6 py-5 mt-10"
            style={{ backgroundColor: colors.cardSecondary }}
          >
            <View className="items-center flex-1">
              <Text style={{ color: colors.textPrimary }}>
                {profile.totalQuotes}
              </Text>
              <Text
                className="text-md mt-1"
                style={{ color: colors.textSecondary }}
              >
                Posts
              </Text>
            </View>
            <View
              className="w-[1px]"
              style={{ backgroundColor: colors.borderSecondary }}
            />
            <View className="items-center flex-1">
              <Text className="text-md" style={{ color: colors.textPrimary }}>
                {profile.followers}
              </Text>
              <Text
                className="text-md mt-1"
                style={{ color: colors.textSecondary }}
              >
                Followers
              </Text>
            </View>
            <View
              className="w-[1px]"
              style={{ backgroundColor: colors.borderSecondary }}
            />
            <View className="items-center flex-1">
              <Text className="text-md" style={{ color: colors.textPrimary }}>
                {profile.following}
              </Text>
              <Text
                className="text-md mt-1"
                style={{ color: colors.textSecondary }}
              >
                Following
              </Text>
            </View>
          </View>

          {isLoggedIn ? (
            <TouchableOpacity
              onPress={() => setShowEditProfile(true)}
              className="rounded-full py-4 mt-8"
              style={{ backgroundColor: colors.accent }}
            >
              <Text
                className="text-center text-md font-semibold"
                style={{ color: colors.textPrimary }}
              >
                Edit Profile
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => router.push("/settings")}
              className="rounded-full py-4 mt-8"
              style={{ backgroundColor: colors.accent }}
            >
              <Text
                className="text-center text-md font-semibold"
                style={{ color: colors.textPrimary }}
              >
                Register / Login
              </Text>
            </TouchableOpacity>
          )}

          <View
            className="rounded-xl p-6 mt-10 overflow-hidden"
            style={{
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.borderSecondary,
            }}
          >
            <View
              className="absolute -top-10 -left-10 w-40 h-40 rounded-full blur-3xl"
              style={{ backgroundColor: colors.borderPrimary + "33" }}
            />
            <View
              className="absolute -bottom-5 -right-5 w-32 h-32 rounded-full blur-3xl"
              style={{ backgroundColor: colors.accent + "1A" }}
            />
            <View className="absolute inset-0 bg-white/5 backdrop-blur-xl" />
            <Text
              className="text-xl font-semibold mb-6"
              style={{ color: colors.textPrimary }}
            >
              Stats
              <Text className="text-sm" style={{ color: colors.textSecondary }}>
                {" "}
                (in days)
              </Text>
            </Text>
            <View className="flex-row justify-around items-center">
              <View className="items-center">
                <View
                  className="w-24 h-24 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: colors.card,
                    borderWidth: 1,
                    borderColor: colors.borderSecondary,
                  }}
                >
                  <View
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: colors.borderPrimary + "33" }}
                  />
                  <Text
                    className="text-3xl font-bold"
                    style={{ color: colors.textPrimary }}
                  >
                    {profile.currentStreak}
                  </Text>
                </View>
                <Text
                  className="text-base font-semibold mt-3"
                  style={{ color: colors.textPrimary }}
                >
                  Current
                </Text>
              </View>
              <View
                className="w-[1px] h-24"
                style={{ backgroundColor: colors.borderSecondary }}
              />
              <View className="items-center">
                <View
                  className="w-24 h-24 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: colors.card,
                    borderWidth: 1,
                    borderColor: colors.borderSecondary,
                  }}
                >
                  <View
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: colors.accent + "1A" }}
                  />
                  <Text
                    className="text-3xl font-bold"
                    style={{ color: colors.textPrimary }}
                  >
                    {profile.personalBest}
                  </Text>
                </View>
                <Text
                  className="text-base font-semibold mt-3"
                  style={{ color: colors.textPrimary }}
                >
                  Best
                </Text>
              </View>
            </View>
          </View>

          <View
            className="rounded-xl p-6 mt-10"
            style={{ backgroundColor: colors.cardSecondary }}
          >
            <Text
              className="text-xl font-semibold mb-6"
              style={{ color: colors.textPrimary }}
            >
              My Interests
            </Text>
            <View className="flex-row flex-wrap gap-4">
              {profile.interests.length === 0 ? (
                <Text style={{ color: colors.textSecondary }}>
                  No interests added yet
                </Text>
              ) : (
                profile.interests.map((interest, index) => (
                  <View
                    key={index}
                    className="px-6 py-2 rounded-full"
                    style={{
                      backgroundColor: colors.cardSecondary,
                      borderWidth: 1,
                      borderColor: colors.borderSecondary,
                    }}
                  >
                    <Text
                      className="text-md"
                      style={{ color: colors.textPrimary }}
                    >
                      {interest}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </View>

          <View
            className="rounded-xl p-6 mt-10 overflow-hidden"
            style={{
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.borderSecondary,
            }}
          >
            <View className="absolute inset-0 bg-white/5 backdrop-blur-xl" />
            <View className="flex-row justify-between items-center mb-6">
              <Text
                className="text-xl font-bold"
                style={{ color: colors.textPrimary }}
              >
                Community Posts
              </Text>
              <View
                className="px-3 py-1 rounded-full"
                style={{
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.borderSecondary,
                }}
              >
                <Text className="text-sm" style={{ color: colors.accent }}>
                  {profile.quotes.length} Quotes
                </Text>
              </View>
            </View>

            {profile.quotes.length === 0 ? (
              <Text style={{ color: colors.textSecondary }}>No posts yet</Text>
            ) : (
              profile.quotes.map((quote, index) => (
                <View
                  key={quote.id}
                  className="rounded-3xl p-5 mb-5 overflow-hidden"
                  style={{
                    backgroundColor: colors.card,
                    borderWidth: 1,
                    borderColor: colors.borderSecondary,
                  }}
                >
                  <View className="absolute inset-0 bg-white/5 backdrop-blur-lg" />
                  <Text
                    className="text-3xl leading-none"
                    style={{ color: colors.accent }}
                  >
                    "
                  </Text>
                  <Text
                    className="text-[15px] leading-7 italic"
                    style={{ color: colors.textPrimary }}
                  >
                    {quote.text}
                  </Text>
                  <View className="flex-row items-center justify-between mt-4">
                    <View className="flex-row items-center mt-1">
                      <View
                        className="flex-1 h-[1px]"
                        style={{ backgroundColor: colors.borderSecondary }}
                      />
                      <Text
                        className="text-xs mx-3"
                        style={{ color: colors.textSecondary }}
                      >
                        Quote #{index + 1}
                      </Text>
                      <View
                        className="flex-1 h-[1px]"
                        style={{ backgroundColor: colors.borderSecondary }}
                      />
                    </View>
                  </View>
                  <Text
                    className="text-xs mt-3 text-right"
                    style={{ color: colors.textSecondary }}
                  >
                    {quote.upvotes_count - quote.downvotes_count > 0 ? "+" : ""}
                    {quote.upvotes_count - quote.downvotes_count} votes
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      <Modal visible={showEditProfile} animationType="slide">
        <View className="flex-1">
          <EditProfile
            profile={profile}
            onUpdateProfile={setProfile}
            onClose={() => {
              setShowEditProfile(false);
              fetchProfile();
            }}
            userId={userId}
          />
        </View>
      </Modal>
    </>
  );
};

export default Profile;
