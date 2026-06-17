import { X } from "lucide-react-native";
import { useTheme } from "@/context/ThemeContext";
import { useThemeColors } from "@/hooks/useThemeColors";

import { Modal, Text, TouchableOpacity, View } from "react-native";
const GENRES = [
  "Bhagavad Gita",
  "Bible",
  "Romance",
  "Motivational",
  "Humor",
  "Philosophical",
  "Political",
  "Movie",
];

type Props = {
  visible: boolean;
  onClose: () => void;
  selectedGenres: string[];
  setSelectedGenres: (genres: string[]) => void;
};

const FilterModal = ({
  visible,
  onClose,
  selectedGenres,
  setSelectedGenres,
}: Props) => {
  const { toggleTheme, theme } = useTheme();
  const colors = useThemeColors();

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const resetFilters = () => {
    setSelectedGenres([]);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        className="flex-1 bg-black/30 justify-end"
      >
        <TouchableOpacity
          activeOpacity={1}
          className="rounded-t-3xl p-6 border-t-4"
          style={{
            backgroundColor: colors.background,
            borderColor: colors.borderPrimary,
          }}
        >
          <View className="flex-row justify-between items-center mb-10">
            <Text
              className="text-xl font-semibold"
              style={{ color: colors.textPrimary }}
            >
              Filter By Genre
            </Text>

            <TouchableOpacity onPress={onClose}>
              <X color={colors.iconPrimary} size={24} />
            </TouchableOpacity>
          </View>

          <View className="flex-row flex-wrap gap-3 mb-12">
            {GENRES.map((genre) => {
              const isSelected = selectedGenres.includes(genre);

              return (
                <TouchableOpacity
                  key={genre}
                  onPress={() => toggleGenre(genre)}
                  className="px-4 py-2 rounded-full border"
                  style={{
                    backgroundColor: isSelected ? colors.accent : colors.card,
                    borderColor: isSelected
                      ? colors.borderPrimary
                      : colors.borderSecondary,
                  }}
                >
                  <Text
                    style={{
                      color: isSelected
                        ? colors.cardSecondary
                        : colors.textPrimary,
                    }}
                  >
                    {genre}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View className="flex-row justify-between items-center mb-6">
            <TouchableOpacity
              onPress={resetFilters}
              className="px-5 py-2 rounded-full"
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
                Reset
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              className="px-5 py-2 rounded-full"
              style={{
                backgroundColor: colors.accent,
                borderWidth: 1,
                borderColor: colors.borderPrimary,
              }}
            >
              <Text
                className="font-semibold"
                style={{ color: colors.cardSecondary }}
              >
                Apply
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default FilterModal;
