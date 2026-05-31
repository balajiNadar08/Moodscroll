import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { useState } from "react";
import { Plus } from "lucide-react-native";

import CreateCollectionModal from "@/components/CreateCollectionModal";

const Collection = () => {
  const [collections, setCollections] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View className="flex-1 bg-[#05071A] px-6 pt-6">
      <Text className="text-[#EAE6FF] text-3xl font-semibold mb-6">
        Collections
      </Text>

      {collections.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-[#9EA3C5] text-base text-center opacity-60">
            Your jar seems empty.
          </Text>

          <Text className="text-[#9EA3C5] text-sm text-center opacity-40 mt-1">
            Start by creating your first collection
          </Text>
        </View>
      ) : (
        <FlatList
          data={collections}
          keyExtractor={(item, index) => index.toString()}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          contentContainerStyle={{ paddingBottom: 120 }}
          renderItem={({ item }) => (
            <View className="w-[48%] h-40 border border-white rounded-2xl p-4 mb-4">
              <Text className="text-red-400 text-base font-medium">{item}</Text>
            </View>
          )}
        />
      )}

      {!modalVisible && (
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="absolute bottom-10 left-6 right-6 bg-[#C8B6FF] py-4 rounded-2xl items-center flex-row justify-center"
        >
          <Plus color="#1B1833" size={20} />

          <Text className="text-[#1B1833] text-base font-medium ml-2">
            Create Collection
          </Text>
        </TouchableOpacity>
      )}

      <CreateCollectionModal
        visible={modalVisible}
        collections={collections}
        onClose={() => setModalVisible(false)}
        onCreate={(name) => setCollections((prev) => [...prev, name])}
      />
    </View>
  );
};

export default Collection;
