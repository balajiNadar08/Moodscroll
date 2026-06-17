import { useTheme } from "@/context/ThemeContext";
import { useThemeColors } from "@/hooks/useThemeColors";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

type CreateCollectionModalProps = {
  visible: boolean;
  collections: string[];
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
};

const CreateCollectionModal = ({
  visible,
  collections,
  onClose,
  onCreate,
}: CreateCollectionModalProps) => {
  const [newName, setNewName] = useState("");
  const [error, setError] = useState(false);
  const { toggleTheme, theme } = useTheme();
  const colors = useThemeColors();

  useEffect(() => {
    if (!visible) {
      setNewName("");
      setError(false);
    }
  }, [visible]);

  const createCollection = async () => {
    const trimmedName = newName.trim();

    if (!trimmedName) return;

    const alreadyExists = collections.some(
      (item) => item.toLowerCase() === trimmedName.toLowerCase(),
    );

    if (alreadyExists) {
      setError(true);
      return;
    }

    await onCreate(trimmedName);

    setNewName("");
    setError(false);
    onClose();

    Toast.show({
      type: "success",
      position: "bottom",
      text1: "Created collection",
      visibilityTime: 3000,
      bottomOffset: 20,

      props: {
        onPress: () => router.push("/collection"),
      },
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/40 justify-center px-6">
        <View
          className="rounded-2xl p-6"
          style={{
            backgroundColor: colors.cardSecondary,
            borderWidth: 1,
            borderColor: colors.borderSecondary,
          }}
        >
          <Text
            className="text-lg font-semibold mb-4"
            style={{ color: colors.textPrimary }}
          >
            New Collection
          </Text>

          <TextInput
            placeholder="Enter collection name"
            value={newName}
            onChangeText={(text) => {
              setNewName(text);
              setError(false);
            }}
            autoFocus
            className="rounded-xl px-5 py-4 mb-4"
            style={{
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.borderSecondary,
              color: colors.textPrimary,
            }}
            placeholderTextColor={colors.textSecondary}
          />

          {error && (
            <Text
              className="text-sm mb-4"
              style={{ color: colors.textTertiary }}
            >
              Collection with this name already exists
            </Text>
          )}

          <View className="flex-row justify-end gap-5 mt-4">
            <TouchableOpacity
              onPress={onClose}
              className="px-6 py-4 rounded-xl"
              style={{
                backgroundColor: colors.card,
                borderWidth: 1,
                borderColor: colors.borderSecondary,
              }}
            >
              <Text
                className="font-semibold"
                style={{ color: colors.textPrimary }}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={createCollection}
              className="px-6 py-4 rounded-xl"
              style={{ backgroundColor: colors.accent }}
            >
              <Text
                className="font-semibold"
                style={{ color: colors.cardSecondary }}
              >
                Create
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CreateCollectionModal;
