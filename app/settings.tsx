import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import {
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { useFonts } from "expo-font";
import { ChevronRight } from "lucide-react-native";

const Settings = () => {
  const [fontsLoaded] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  if (!fontsLoaded) return null;

  const SettingRow = ({
    title,
    danger = false,
  }: {
    title: string;
    danger?: boolean;
  }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      className={`flex-row items-center justify-between px-5 py-3 rounded-lg border ${
        danger
          ? "bg-red-500/10 border-red-500/30"
          : "bg-[#12152A] border-[#232742]"
      }`}
    >
      <Text
        style={{
          fontFamily: "Inter_500Medium",
          fontSize: 16,
          color: danger ? "#FF6B6B" : "#F5F7FF",
        }}
      >
        {title}
      </Text>

      <ChevronRight
        color={danger ? "#FF6B6B" : "#B8BEDD"}
        size={20}
        strokeWidth={1.8}
      />
    </TouchableOpacity>
  );

  const SectionTitle = ({ title }: { title: string }) => (
    <Text
      style={{
        fontFamily: "Inter_600SemiBold",
        fontSize: 13,
        letterSpacing: 1.2,
        color: "#8B90B0",
        marginBottom: 12,
      }}
    >
      {title}
    </Text>
  );

  return (
    <ScrollView
      className="flex-1 bg-[#05071A]"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingTop: 10,
        paddingBottom: 40,
      }}
    >
      <View className="px-6 mb-10">
        <Text
          style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 24,
            color: "#FFFFFF",
            marginBottom: 2,
          }}
        >
          Settings
        </Text>

        <Text
          style={{
            fontFamily: "Inter_300Light",
            fontSize: 12,
            color: "#9EA3C5",
          }}
        >
          Customize your experience and manage your account.
        </Text>
      </View>

      <View className="px-5 mb-8">
        <SectionTitle title="APPEARANCE" />

        <View className="gap-3">
          <SettingRow title="Theme" />
        </View>
      </View>

      <View className="px-5 mb-8">
        <SectionTitle title="SUPPORT US" />

        <View className="gap-3">
          <SettingRow title="Give Feedback" />
          <SettingRow title="Report Bug" />
        </View>
      </View>

      <View className="px-5 mb-8">
        <SectionTitle title="ACCOUNT" />

        <View className="gap-3">
          <SettingRow title="Logout" danger />
        </View>
      </View>

      <View className="px-5">
        <SectionTitle title="HOLYMOLY" />

        <View className="bg-[#12152A] border border-[#232742] rounded-lg px-5 py-4">
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 15,
              color: "#B8BEDD",
            }}
          >
            Version 1.0.0
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default Settings;
