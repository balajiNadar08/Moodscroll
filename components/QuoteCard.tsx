import { Link } from "expo-router";
import {
  Boxes,
  Earth,
  Funnel,
  Heart,
  Plus,
  Share,
  UserRound
} from "lucide-react-native";
import { Text, View, ImageBackground } from "react-native";

type Quote = {
  id: string;
  text: string;
  source?: {
    type?: string;
    name?: string;
    chapter?: number | string | null;
    verse?: number | string | null;
  };
  tags?: string[];
  language?: string;
  metrics?: {
    likes: number;
    dislikes: number;
  };
};
type QuoteCardProps = {
  quote: Quote;
};

export default function QuoteCard({ quote }: QuoteCardProps) {
  return (
    <ImageBackground
      source={require("../assets/images/backgrounds/bg1.webp")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View className="flex-1 bg-black/40">
        <View className="absolute top-6 left-0 right-0 flex-row justify-between px-6">
          <UserRound color="white" size={26} strokeWidth={1.5} />
          <Funnel color="white" size={26} strokeWidth={1.5} />
        </View>

        <View className="flex-1 justify-center items-center px-12">
          <Text
            style={{ fontFamily: "Inter_400Light" }}
            className="text-white font-semibold text-center text-2xl leading-relaxed tracking-wide"
          >
            {quote.text}
          </Text>

          {(quote.source?.type === "gita" ||
            quote.source?.type === "bible") && (
            <View className="mt-8 items-center">
              <Text
                style={{ fontFamily: "Inter_300Light" }}
                className="text-white font-bold text-md"
              >
                {quote.source?.type?.toUpperCase()}{" "}
                {quote.source?.chapter != null && quote.source?.verse != null
                  ? `${quote.source.chapter}.${quote.source.verse}`
                  : ""}
              </Text>
            </View>
          )}

          {quote.source?.name !== "Bhagavad Gita" &&
            quote.source?.name !== "Bible" && (
              <View className="mt-8 items-center">
                <Text
                  style={{ fontFamily: "Inter_300Light" }}
                  className="text-white text-md"
                >
                  - {quote.source?.name}
                </Text>
              </View>
            )}

          <View className="flex-row gap-6 mt-12">
            <Heart color="white" size={32} />
            <Plus color="white" size={32} />
          </View>
        </View>

        <View className="absolute bottom-20 left-0 right-0 flex-row justify-between items-end px-6">
          <Link href="/collection">
            <Boxes color="white" size={26} strokeWidth={1.5} />
          </Link>
          <View className="gap-6">
            <Earth color="white" size={26} strokeWidth={1.5} />
            <Share color="white" size={26} strokeWidth={1.5} />
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}
