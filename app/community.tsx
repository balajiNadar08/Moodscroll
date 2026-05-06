import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";
import { useMemo, useState } from "react";

import {
  ArrowBigUp,
  ArrowBigDown,
  Flame,
  Clock3,
  Plus,
} from "lucide-react-native";

type VoteType = "up" | "down" | null;

type Post = {
  id: string;
  username: string;
  text: string;
  votes: number;
  userVote: VoteType;
  createdAt: number;
};

const starterPosts: Post[] = [
  {
    id: "1",
    username: "Balaji",
    text: "Discipline will take you places motivation never could.",
    votes: 124,
    userVote: null,
    createdAt: Date.now() - 1000,
  },

  {
    id: "2",
    username: "bala",
    text: "You don’t need more time. You need less distraction.",
    votes: 89,
    userVote: null,
    createdAt: Date.now() - 2000,
  },

  {
    id: "3",
    username: "iONE",
    text: "Consistency beats intensity every single time.",
    votes: 52,
    userVote: null,
    createdAt: Date.now() - 3000,
  },
];

const Community = () => {
  const [tab, setTab] = useState<"trending" | "recent">("trending");

  const [posts, setPosts] = useState<Post[]>(starterPosts);

  const [showInput, setShowInput] = useState(false);

  const [input, setInput] = useState("");

  const sortedPosts = useMemo(() => {
    if (tab === "trending") {
      return [...posts].sort((a, b) => b.votes - a.votes);
    }

    return [...posts].sort((a, b) => b.createdAt - a.createdAt);
  }, [posts, tab]);

  const vote = (id: string, type: VoteType) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;

        let votes = p.votes;
        let userVote: VoteType = p.userVote;

        if (p.userVote === type) {
          votes += type === "up" ? -1 : 1;
          userVote = null;
        } else if (p.userVote !== null) {
          votes += type === "up" ? 2 : -2;
          userVote = type;
        } else {
          votes += type === "up" ? 1 : -1;
          userVote = type;
        }

        return {
          ...p,
          votes,
          userVote,
        };
      }),
    );
  };

  const createPost = () => {
    if (!input.trim()) return;

    const newPost: Post = {
      id: Date.now().toString(),
      username: "demo",
      text: input.trim(),
      votes: 0,
      userVote: null,
      createdAt: Date.now(),
    };

    setPosts((prev) => [newPost, ...prev]);

    setInput("");
    setShowInput(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="light-content" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="px-6 pt-3 pb-6">
          <Text className="text-black text-3xl font-bold tracking-tight">
            Community
          </Text>
        </View>

        <View className="flex-row px-6 mb-6 gap-3">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setTab("trending")}
            className={`flex-1 rounded-lg py-3.5 items-center flex-row justify-center gap-2 border ${
              tab === "trending"
                ? "bg-black border-black"
                : "bg-white border-zinc-200"
            }`}
          >
            <Flame size={16} color={tab === "trending" ? "white" : "#18181b"} />

            <Text
              className={`text-sm font-medium ${
                tab === "trending" ? "text-white" : "text-zinc-800"
              }`}
            >
              Trending
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setTab("recent")}
            className={`flex-1 rounded-lg py-3.5 items-center flex-row justify-center gap-2 border ${
              tab === "recent"
                ? "bg-black border-black"
                : "bg-white border-zinc-200"
            }`}
          >
            <Clock3 size={16} color={tab === "recent" ? "white" : "#18181b"} />

            <Text
              className={`text-sm font-medium ${
                tab === "recent" ? "text-white" : "text-zinc-800"
              }`}
            >
              Recent
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={sortedPosts}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: 160
          }}
          renderItem={({ item }) => (
            <View className="bg-white border border-zinc-800 rounded-md p-4 mb-4">
              <Text className="text-black text-[14px] leading-5 ">
                {item.text}
              </Text>
              <Text className="text-zinc-600 text-[12px] text-right italic">- {item.username}</Text>

              <View className="flex-row justify-center items-center mt-4 border border-zinc-300 self-start rounded-xl p-1">
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => vote(item.id, "up")}
                  className={`w-10 h-10 rounded-lg items-center justify-center ${
                    item.userVote === "up" ? "bg-zinc-800" : "bg-white"
                  }`}
                >
                  <ArrowBigUp
                    size={18}
                    color={item.userVote === "up" ? "white" : "black"}
                  />
                </TouchableOpacity>

                <Text className="text-black text-sm font-bold mx-4">
                  {item.votes}
                </Text>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => vote(item.id, "down")}
                  className={`w-10 h-10 rounded-lg items-center justify-center ${
                    item.userVote === "down" ? "bg-zinc-800" : "bg-white"
                  }`}
                >
                  <ArrowBigDown
                    size={18}
                    color={item.userVote === "down" ? "white" : "black"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />

        {showInput ? (
          <View className="absolute bottom-6 left-6 right-6">
            <View className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <TextInput
                placeholder="Share something..."
                placeholderTextColor="#71717a"
                value={input}
                onChangeText={setInput}
                multiline
                autoFocus
                className="text-white text-base min-h-[80px]"
              />

              <View className="flex-row justify-end mt-4 gap-3">
                <TouchableOpacity
                  onPress={() => {
                    setShowInput(false);
                    setInput("");
                  }}
                  className="px-5 py-3 rounded-2xl bg-zinc-800"
                >
                  <Text className="text-white font-semibold">Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={createPost}
                  className="px-5 py-3 rounded-2xl bg-white"
                >
                  <Text className="text-black font-semibold">Post</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => setShowInput(true)}
            className="absolute bottom-8 right-6 w-16 h-16 rounded-full bg-black items-center justify-center"
          >
            <Plus size={28} color="white" />
          </TouchableOpacity>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Community;
