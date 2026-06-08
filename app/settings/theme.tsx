import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import {
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { useFonts } from "expo-font";
import { Check } from "lucide-react-native";

import { useTheme } from "@/context/ThemeContext";
import { useThemeColors } from "@/hooks/useThemeColors";

const ThemeScreen = () => {
  const { theme, setTheme } = useTheme();
  const colors = useThemeColors();

  const [fontsLoaded] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  if (!fontsLoaded) return null;

  const SettingRow = ({
    title,
    selected,
    onPress,
  }: {
    title: string;
    selected: boolean;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className="flex-row items-center justify-between px-5 py-4 rounded-lg"
      style={{
        backgroundColor: colors.cardSecondary,
        borderWidth: 1,
        borderColor: selected ? colors.accent : colors.borderSecondary,
      }}
    >
      <Text
        style={{
          fontFamily: "Inter_500Medium",
          fontSize: 16,
          color: colors.textPrimary,
        }}
      >
        {title}
      </Text>

      {selected && <Check size={20} color={colors.accent} strokeWidth={2.5} />}
    </TouchableOpacity>
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
          Theme
        </Text>

        <Text
          style={{
            fontFamily: "Inter_300Light",
            fontSize: 12,
            color: colors.textSecondary,
          }}
        >
          Change theme according to your preference.
        </Text>
      </View>

      <View className="px-5 mb-8">
        <Text
          style={{
            fontFamily: "Inter_600SemiBold",
            fontSize: 13,
            letterSpacing: 1.2,
            color: colors.textSecondary,
            marginBottom: 12,
          }}
        >
          SELECT THEME
        </Text>

        <View className="gap-3">
          <SettingRow
            title="Sunshine"
            selected={theme === "light"}
            onPress={() => setTheme("light")}
          />

          <SettingRow
            title="Night Owl"
            selected={theme === "dark"}
            onPress={() => setTheme("dark")}
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default ThemeScreen;
