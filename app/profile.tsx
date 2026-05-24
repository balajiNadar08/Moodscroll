import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
} from "react-native";
import { useState } from "react";

type Profile = {
  username: string;
  bio: string;
  totalQuotes: number;
  followers: number;
  following: number;
  currentStreak: number;
  personalBest: number;
  interests: string[];
  quotes: string[];
};

const initialProfile: Profile = {
  username: "Gojo",
  bio: "Half philosopher, half disaster",
  totalQuotes: 120,
  followers: 340,
  following: 180,
  currentStreak: 12,
  personalBest: 18,
  interests: ["Sleeping", "Eating", "Reading", "Gaming"],
  quotes: [
    "Yes, they're sharing a drink called loneliness. But it's better than drinking alone.",
    "Everyone believes in the world's greatest lie, even the person who lied.",
  ],
};

const Profile = () => {
  const [profile, setProfile] = useState<Profile>(initialProfile);

  const [modalVisible, setModalVisible] = useState(false);

  const [editedUsername, setEditedUsername] = useState(profile.username);
  const [editedBio, setEditedBio] = useState(profile.bio);
  const [editedInterests, setEditedInterests] = useState(
    profile.interests.join(", ")
  );

  const handleSave = () => {
    setProfile({
      ...profile,
      username: editedUsername,
      bio: editedBio,
      interests: editedInterests
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    });

    setModalVisible(false);
  };

  const openModal = () => {
    setEditedUsername(profile.username);
    setEditedBio(profile.bio);
    setEditedInterests(profile.interests.join(", "));
    setModalVisible(true);
  };

  return (
    <>
      <ScrollView
        className="flex-1 bg-[#05071A]"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6 pt-14 pb-10">
          <View className="items-center">
            <Image
              source={require("../assets/images/profile-pic/pfp-1.webp")}
              className="w-36 h-36 rounded-full border-4 border-[#C8B6FF]"
            />

            <Text className="text-[#EAE6FF] text-4xl font-bold mt-6">
              {profile.username}
            </Text>

            <Text className="text-[#B8B4D9] text-lg italic mt-2">
              {profile.bio}
            </Text>
          </View>

          <View className="flex-row justify-between bg-[#1A1D36] gap-5 rounded-xl px-6 py-5 mt-10">
            <View className="items-center flex-1">
              <Text className="text-[#F4F1FF] text-md">
                {profile.totalQuotes}
              </Text>
              <Text className="text-[#B8B4D9] text-md mt-1">Posts</Text>
            </View>

            <View className="w-[1px] bg-[#3B3E5B]" />

            <View className="items-center flex-1">
              <Text className="text-[#F4F1FF] text-md">
                {profile.followers}
              </Text>
              <Text className="text-[#B8B4D9] text-md mt-1">Followers</Text>
            </View>

            <View className="w-[1px] bg-[#3B3E5B]" />

            <View className="items-center flex-1">
              <Text className="text-[#F4F1FF] text-md">
                {profile.following}
              </Text>
              <Text className="text-[#B8B4D9] text-md mt-1">Following</Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={openModal}
            className="bg-[#C8B6FF] rounded-full py-4 mt-8"
          >
            <Text className="text-[#1B1833] text-center text-md font-semibold">
              Edit Profile
            </Text>
          </TouchableOpacity>

          <View className="bg-white/5 border border-white/10 rounded-xl p-6 mt-10 overflow-hidden">
            <View className="absolute -top-10 -left-10 w-40 h-40 bg-[#7C5CFF]/20 rounded-full blur-3xl" />
            <View className="absolute -bottom-5 -right-5 w-32 h-32 bg-[#C8B6FF]/10 rounded-full blur-3xl" />
            <View className="absolute inset-0 bg-white/5 backdrop-blur-xl" />

            <Text className="text-[#EAE6FF] text-xl font-semibold mb-6">
              Stats
              <Text className="text-[#EAE6FF]/70 text-sm"> (in days)</Text>
            </Text>

            <View className="flex-row justify-around items-center">
              <View className="items-center">
                <View className="w-24 h-24 rounded-full bg-white/10 border border-white/20 items-center justify-center">
                  <View className="absolute inset-0 rounded-full bg-[#7C5CFF]/20" />

                  <Text className="text-white text-3xl font-bold">
                    {profile.currentStreak}
                  </Text>
                </View>

                <Text className="text-[#EAE6FF] text-base font-semibold mt-3">
                  Current
                </Text>
              </View>

              <View className="w-[1px] h-24 bg-white/10" />

              <View className="items-center">
                <View className="w-24 h-24 rounded-full bg-white/5 border border-white/20 items-center justify-center">
                  <View className="absolute inset-0 rounded-full bg-[#C8B6FF]/10" />

                  <Text className="text-[#EAE6FF] text-3xl font-bold">
                    {profile.personalBest}
                  </Text>
                </View>

                <Text className="text-[#EAE6FF] text-base font-semibold mt-3">
                  Best
                </Text>
              </View>
            </View>
          </View>

          <View className="bg-[#1A1D36] rounded-xl p-6 mt-10">
            <Text className="text-[#EAE6FF] text-xl font-semibold mb-6">
              My Interests
            </Text>

            <View className="flex-row flex-wrap gap-4">
              {profile.interests.map((interest, index) => (
                <View
                  key={index}
                  className="bg-[#1A1D36] border border-[#343756] px-6 py-2 rounded-full"
                >
                  <Text className="text-[#EAE6FF] text-md">{interest}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className="bg-white/5 border border-white/10 rounded-xl p-6 mt-10 overflow-hidden">
            <View className="absolute inset-0 bg-white/5 backdrop-blur-xl" />

            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-[#EAE6FF] text-xl font-bold">
                Community Posts
              </Text>

              <View className="bg-white/10 border border-white/10 px-3 py-1 rounded-full">
                <Text className="text-[#C8B6FF] text-sm">
                  {profile.quotes.length} Quotes
                </Text>
              </View>
            </View>

            {profile.quotes.map((quote, index) => (
              <View
                key={index}
                className="bg-white/5 border border-white/10 rounded-3xl p-5 mb-5 overflow-hidden"
              >
                <View className="absolute inset-0 bg-white/5 backdrop-blur-lg" />

                <Text className="text-[#7C5CFF] text-3xl leading-none">“</Text>

                <Text className="text-[#E4E0FF] text-[15px] leading-7 italic">
                  {quote}
                </Text>

                <View className="flex-row items-center mt-5">
                  <View className="flex-1 h-[1px] bg-white/10" />

                  <Text className="text-[#B3AED6] text-xs mx-3">
                    Quote #{index + 1}
                  </Text>

                  <View className="flex-1 h-[1px] bg-white/10" />
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 bg-black/70 justify-end">
          <View className="bg-[#111428] rounded-t-[35px] px-6 pt-8 pb-10">
            <Text className="text-[#EAE6FF] text-2xl font-bold mb-8">
              Edit Profile
            </Text>

            <View className="mb-5">
              <Text className="text-[#B8B4D9] mb-2">Username</Text>

              <TextInput
                value={editedUsername}
                onChangeText={setEditedUsername}
                placeholder="Enter username"
                placeholderTextColor="#777"
                className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white"
              />
            </View>

            <View className="mb-5">
              <Text className="text-[#B8B4D9] mb-2">Bio</Text>

              <TextInput
                value={editedBio}
                onChangeText={setEditedBio}
                placeholder="Enter bio"
                placeholderTextColor="#777"
                multiline
                className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white"
              />
            </View>

            <View className="mb-8">
              <Text className="text-[#B8B4D9] mb-2">
                Interests (comma separated)
              </Text>

              <TextInput
                value={editedInterests}
                onChangeText={setEditedInterests}
                placeholder="Gaming, Reading..."
                placeholderTextColor="#777"
                className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white"
              />
            </View>

            <View className="flex-row gap-4">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-4"
              >
                <Text className="text-white text-center font-semibold">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSave}
                className="flex-1 bg-[#C8B6FF] rounded-2xl py-4"
              >
                <Text className="text-[#1B1833] text-center font-bold">
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default Profile;
