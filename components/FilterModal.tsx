import { View, Text, TouchableOpacity, Modal } from "react-native";
import { X } from "lucide-react-native";

const GENRES = [
  "Gita",
  "Bible",
  "Romance",
  "Motivation",
  "Humor",
  "Philosophical",
  "Political",
  "Movie & Book",
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
          className="bg-[#05071A] rounded-t-3xl p-6 border-t-4 border-[#C8B6FF]"
        >
          <View className="flex-row justify-between items-center mb-10">
            <Text className="text-white text-xl font-semibold">
              Filter By Genre
            </Text>

            <TouchableOpacity onPress={onClose}>
              <X color="white" size={24} />
            </TouchableOpacity>
          </View>

          <View className="flex-row flex-wrap gap-3 mb-12">
            {GENRES.map((genre) => {
              const isSelected = selectedGenres.includes(genre);

              return (
                <TouchableOpacity
                  key={genre}
                  onPress={() => toggleGenre(genre)}
                  className={`px-4 py-2 rounded-full border ${
                    isSelected
                      ? "bg-[#C8B6FF] border-[#C8B6FF]"
                      : "bg-white/5 border-white/10"
                  }`}
                >
                  <Text
                    className={`${isSelected ? "text-[#1B1833]" : "text-[#EAE6FF]"}`}
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
              className="bg-white/5 border border-white/10 px-5 py-2 rounded-full"
            >
              <Text className="text-[#EAE6FF] font-semibold">Reset</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onClose}
              className="bg-[#C8B6FF] border border-[#C8B6FF] px-5 py-2 rounded-full"
            >
              <Text className="text-[#1B1833] font-semibold">Apply</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default FilterModal;
