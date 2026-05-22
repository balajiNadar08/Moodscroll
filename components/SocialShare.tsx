import { View, Text, TouchableOpacity } from "react-native";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { useRef } from "react";

const SocialShare = () => {
  const viewShotRef = useRef<ViewShot>(null);

  const shareImage = async () => {
    try {
      const ref = viewShotRef.current;

      if (!ref || !ref.capture) return;

      const uri = await ref.capture();

      await Sharing.shareAsync(uri);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View className="flex-1 justify-center items-center bg-zinc-900">
      <ViewShot ref={viewShotRef} options={{ format: "png", quality: 1 }}>
        <View className="bg-black p-8 rounded-3xl w-80">
          <Text className="text-white text-2xl">
            Stay hungry, stay foolish.
          </Text>

          <Text className="text-gray-300 mt-4">— Steve Jobs</Text>
        </View>
      </ViewShot>

      <TouchableOpacity
        onPress={shareImage}
        className="mt-6 bg-white px-6 py-3 rounded-2xl"
      >
        <Text className="text-black font-semibold">Share Quote</Text>
      </TouchableOpacity>
    </View>
  );
};

export default SocialShare;
