import { View, Text, TouchableOpacity, Modal } from "react-native";

const GENRES = [
  "Gita",
  "Bible",
  "Romance",
  "Motivation",
  "Spiritual",
  "Philosophical",
  "Political",
  "Scientific",
  "Business",
  "Humor"
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
          className="bg-white rounded-t-3xl p-6"
        >
          <Text className="text-black text-xl font-semibold mb-4">
            Filter by Genre
          </Text>

          <View className="flex-row flex-wrap gap-3 mb-6">
            {GENRES.map((genre) => {
              const isSelected = selectedGenres.includes(genre);

              return (
                <TouchableOpacity
                  key={genre}
                  onPress={() => toggleGenre(genre)}
                  className={`px-4 py-2 rounded-full border ${
                    isSelected ? "bg-black border-black" : "border-gray-600"
                  }`}
                >
                  <Text
                    className={`${isSelected ? "text-white" : "text-black"}`}
                  >
                    {genre}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View className="flex-row justify-between">
            <TouchableOpacity onPress={resetFilters}>
              <Text className="text-gray-400">Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              className="bg-white px-5 py-2 rounded-full"
            >
              <Text className="text-black font-semibold">Apply</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default FilterModal;
