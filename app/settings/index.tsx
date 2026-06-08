import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import {
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { useFonts } from "expo-font";
import { ChevronRight } from "lucide-react-native";
import { useTheme } from "@/context/ThemeContext";
import { useThemeColors } from "@/hooks/useThemeColors";
import { Href, Link } from "expo-router";

const Settings = () => {
  const { toggleTheme, theme } = useTheme();
  const colors = useThemeColors();

  const [fontsLoaded] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  if (!fontsLoaded) return null;

  type SettingRowProps = {
    title: string;
    href: Href;
    danger?: boolean;
  };

  const SettingRow = ({
    title,
    href = "/settings",
    danger = false,
  }: SettingRowProps) => (
    <Link href={href} asChild>
      <TouchableOpacity
        activeOpacity={0.8}
        className="flex-row items-center justify-between px-5 py-3 rounded-lg"
        style={{
          backgroundColor: danger
            ? colors.textTertiary + "1A"
            : colors.cardSecondary,
          borderWidth: 1,
          borderColor: danger
            ? colors.textTertiary + "4D"
            : colors.borderSecondary,
        }}
      >
        <>
          <Text
            style={{
              fontFamily: "Inter_500Medium",
              fontSize: 16,
              color: danger ? colors.textTertiary : colors.textPrimary,
            }}
          >
            {title}
          </Text>

          <ChevronRight
            color={danger ? colors.textTertiary : colors.textSecondary}
            size={20}
            strokeWidth={1.8}
          />
        </>
      </TouchableOpacity>
    </Link>
  );

  const SectionTitle = ({ title }: { title: string }) => (
    <Text
      style={{
        fontFamily: "Inter_600SemiBold",
        fontSize: 13,
        letterSpacing: 1.2,
        color: colors.textSecondary,
        marginBottom: 12,
      }}
    >
      {title}
    </Text>
  );

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
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
            color: colors.textPrimary,
            marginBottom: 2,
          }}
        >
          Settings
        </Text>

        <Text
          style={{
            fontFamily: "Inter_300Light",
            fontSize: 12,
            color: colors.textSecondary,
          }}
        >
          Customize your experience and manage your account.
        </Text>
      </View>

      <View className="px-5 mb-8">
        <SectionTitle title="APPEARANCE" />
        <View className="gap-3">
          <SettingRow title="Theme" href={"/settings/theme"} />
        </View>
      </View>

      <View className="px-5 mb-8">
        <SectionTitle title="SUPPORT US" />
        <View className="gap-3">
          <SettingRow title="Give Feedback" href={"/settings"} />
          <SettingRow title="Report Bug" href={"/settings"} />
        </View>
      </View>

      <View className="px-5 mb-8">
        <SectionTitle title="ACCOUNT" />
        <View className="gap-3">
          <SettingRow title="Logout" href={"/settings"} danger />
        </View>
      </View>

      <View className="px-5">
        <SectionTitle title="MOODSCROLL" />
        <View
          className="rounded-lg px-5 py-4"
          style={{
            backgroundColor: colors.cardSecondary,
            borderWidth: 1,
            borderColor: colors.borderSecondary,
          }}
        >
          <Text
            style={{
              fontFamily: "Inter_400Regular",
              fontSize: 15,
              color: colors.textSecondary,
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
