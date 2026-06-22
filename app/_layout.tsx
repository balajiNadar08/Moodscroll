import { Stack } from "expo-router";
import "./global.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { useEffect } from "react";
import { updateStreak } from "@/utils/streak";

export default function RootLayout() {
  useEffect(() => {
    const init = async () => {
      await updateStreak();
    };

    init();
  }, []);

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}