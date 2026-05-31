import { View, Text, TouchableOpacity } from "react-native";

export const toastConfig = {
  success: ({ text1, props }: any) => (
    <View className="w-[92%] overflow-hidden rounded-2xl border border-white/10 bg-[#05071A]">
      <View className="flex-row items-center justify-between px-5 py-4">
        <Text className="flex-1 text-sm font-medium text-[#EAE6FF]">
          {text1}
        </Text>

        <TouchableOpacity onPress={props?.onPress}>
          <Text className="ml-4 text-sm font-semibold text-[#C8B6FF]">
            VIEW
          </Text>
        </TouchableOpacity>
      </View>

      <View className="h-[3px] w-full bg-white/5">
        <View className="h-full w-full bg-[#EAE6FF]/80" />
      </View>
    </View>
  ),
};