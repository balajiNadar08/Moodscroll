import React, { useEffect, useRef } from "react";
import { Animated, Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const LandingPage = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-[#070B16]">
      <Animated.View
        style={{
          flex: 1,
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        }}
        className="items-center justify-center px-8"
      >
        <Image
          source={require("../assets/images/icon.png")}
          resizeMode="contain"
          className="w-48 h-48 mb-8"
        />

        <Text className="text-4xl font-bold text-white tracking-tight">
          MoodScroll
        </Text>

        <Text className="mt-4 text-base text-center text-gray-500 leading-6 max-w-[280px]">
          Discover wisdom, motivation and inspiration one quote at a time.
        </Text>

        <Text className="mt-8 text-sm tracking-[3px] text-gray-400">
          DAILY QUOTES
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
};

export default LandingPage;