import { useThemeColors } from "@/hooks/useThemeColors";
import { supabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { ArrowLeft } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type PasswordVisibility = { old: boolean; new: boolean; confirm: boolean };
type PasswordFields = { old: string; new: string; confirm: string };

type UserProfile = {
  username: string;
  bio: string;
  totalQuotes: number;
  followers: number;
  following: number;
  currentStreak: number;
  personalBest: number;
  interests: string[];
  quotes: {
    id: number;
    text: string;
    upvotes_count: number;
    downvotes_count: number;
  }[];
  avatar: string | null;
};

type EditProfileProps = {
  profile: UserProfile;
  onUpdateProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  onClose: () => void;
  userId: string | null;
};

const EditProfile: React.FC<EditProfileProps> = ({
  profile,
  onUpdateProfile,
  onClose,
  userId,
}) => {
  const [interestInput, setInterestInput] = useState("");
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [passwords, setPasswords] = useState<PasswordFields>({
    old: "",
    new: "",
    confirm: "",
  });
  const [showPassword, setShowPassword] = useState<PasswordVisibility>({
    old: false,
    new: false,
    confirm: false,
  });
  const [passwordError, setPasswordError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const colors = useThemeColors();

  const avatarLetter = profile.username
    ? profile.username[0].toUpperCase()
    : "?";

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Allow access to photos to change your profile picture.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1], 
      quality: 0.7,
    });

    if (result.canceled) return;

    try {
      setUploading(true);

      const imageUri = result.assets[0].uri;

      await AsyncStorage.setItem("profileImage", imageUri);

      onUpdateProfile((prev) => ({
        ...prev,
        avatar: imageUri,
      }));
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Something went wrong");
    } finally {
      setUploading(false);
    }
  };

  const addInterest = () => {
    const trimmed = interestInput.trim();
    if (!trimmed || profile.interests.includes(trimmed)) return;
    onUpdateProfile((prev) => ({
      ...prev,
      interests: [...prev.interests, trimmed],
    }));
    setInterestInput("");
  };

  const removeInterest = (interest: string) => {
    onUpdateProfile((prev) => ({
      ...prev,
      interests: prev.interests.filter((i) => i !== interest),
    }));
  };

  const handleSave = async () => {
    if (!userId) return;
    try {
      setSaving(true);
      const { error } = await supabase
        .from("User")
        .update({
          username: profile.username,
          interests: profile.interests.join(", "),
        })
        .eq("id", userId);

      if (error) throw error;

      Alert.alert("Success", "Profile updated successfully!");
      onClose();
    } catch (err: any) {
      Alert.alert("Save failed", err.message ?? "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const validatePassword = (password: string): string | null => {
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (!/[A-Z]/.test(password))
      return "Must contain at least 1 uppercase letter.";
    if (!/[a-z]/.test(password))
      return "Must contain at least 1 lowercase letter.";
    if (!/[0-9]/.test(password)) return "Must contain at least 1 number.";
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password))
      return "Must contain at least 1 special character.";
    return null;
  };

  const handlePasswordChange = async () => {
    if (!passwords.old) {
      setPasswordError("Please enter your current password.");
      return;
    }
    const validationError = validatePassword(passwords.new);
    if (validationError) {
      setPasswordError(validationError);
      return;
    }
    if (passwords.new !== passwords.confirm) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }
    if (passwords.old === passwords.new) {
      setPasswordError("New password must be different from old password.");
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwords.new,
      });
      if (error) throw error;
      setPasswordError("");
      setPasswords({ old: "", new: "", confirm: "" });
      setPasswordModalVisible(false);
      Alert.alert("Success", "Password changed successfully!");
    } catch (err: any) {
      setPasswordError(err.message ?? "Failed to change password");
    }
  };

  const handleCloseModal = () => {
    setPasswordModalVisible(false);
    setPasswords({ old: "", new: "", confirm: "" });
    setPasswordError("");
    setShowPassword({ old: false, new: false, confirm: false });
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        className="flex-1"
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 60,
          paddingBottom: 40,
        }}
      >
        <View className="flex-row items-center mb-8">
          <TouchableOpacity
            onPress={onClose}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.borderSecondary,
            }}
          >
            <ArrowLeft size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text
            className="text-[24px] font-bold ml-4"
            style={{ color: colors.textPrimary }}
          >
            Edit Profile
          </Text>
        </View>

        <View className="items-center mb-8">
          <TouchableOpacity onPress={handlePickImage}>
            {uploading ? (
              <View
                className="w-[110px] h-[110px] rounded-full items-center justify-center"
                style={{
                  backgroundColor: colors.card,
                  borderWidth: 3,
                  borderColor: colors.borderPrimary,
                }}
              >
                <ActivityIndicator color={colors.accent} />
              </View>
            ) : profile.avatar ? (
              <Image
                source={{ uri: profile.avatar }}
                className="w-[110px] h-[110px] rounded-full border-[3px]"
                style={{ borderColor: colors.borderPrimary }}
              />
            ) : (
              <View
                className="w-[110px] h-[110px] rounded-full border-[3px] items-center justify-center"
                style={{
                  borderColor: colors.borderPrimary,
                  backgroundColor: colors.accent,
                }}
              >
                <Text
                  className="text-4xl font-bold"
                  style={{ color: colors.background }}
                >
                  {avatarLetter}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handlePickImage}
            className="mt-3 px-4 py-2 rounded-full"
            style={{ backgroundColor: colors.accent }}
          >
            <Text
              className="font-semibold"
              style={{ color: colors.cardSecondary }}
            >
              Change Photo
            </Text>
          </TouchableOpacity>
        </View>

        <View className="mb-5">
          <Text
            className="text-[13px] font-semibold mb-1.5 uppercase tracking-[0.8px]"
            style={{ color: colors.textSecondary }}
          >
            Username
          </Text>
          <TextInput
            className="rounded-xl px-4 py-3 text-[15px]"
            style={{
              backgroundColor: colors.card,
              borderWidth: 1.5,
              borderColor: colors.borderSecondary,
              color: colors.textPrimary,
            }}
            value={profile.username}
            onChangeText={(text) =>
              onUpdateProfile((prev) => ({ ...prev, username: text }))
            }
            placeholder="Enter new username"
            placeholderTextColor={colors.textSecondary}
            autoCapitalize="none"
          />
        </View>

        <View className="mb-5">
          <Text
            className="text-[13px] font-semibold mb-1.5 uppercase tracking-[0.8px]"
            style={{ color: colors.textSecondary }}
          >
            Bio
          </Text>
          <TextInput
            multiline
            value={profile.bio}
            onChangeText={(text) =>
              onUpdateProfile((prev) => ({ ...prev, bio: text }))
            }
            placeholder="Tell people about yourself..."
            placeholderTextColor={colors.textSecondary}
            className="rounded-xl px-4 py-4 min-h-[100px]"
            style={{
              backgroundColor: colors.card,
              borderWidth: 1.5,
              borderColor: colors.borderSecondary,
              color: colors.textPrimary,
              textAlignVertical: "top",
            }}
          />
        </View>

        <View className="mb-7">
          <Text
            className="text-[13px] font-semibold mb-3 uppercase tracking-[0.8px]"
            style={{ color: colors.textSecondary }}
          >
            Interests
          </Text>
          <View className="flex-row gap-2">
            <TextInput
              value={interestInput}
              onChangeText={setInterestInput}
              placeholder="Add interest"
              placeholderTextColor={colors.textSecondary}
              className="flex-1 rounded-xl px-4 py-3"
              style={{
                backgroundColor: colors.card,
                borderWidth: 1.5,
                borderColor: colors.borderSecondary,
                color: colors.textPrimary,
              }}
            />
            <TouchableOpacity
              onPress={addInterest}
              className="px-5 rounded-xl justify-center"
              style={{ backgroundColor: colors.accent }}
            >
              <Text
                className="font-semibold"
                style={{ color: colors.cardSecondary }}
              >
                Add
              </Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row flex-wrap gap-2 mt-4">
            {profile.interests.map((interest) => (
              <TouchableOpacity
                key={interest}
                onPress={() => removeInterest(interest)}
                className="px-4 py-2 rounded-full"
                style={{
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.borderSecondary,
                }}
              >
                <Text style={{ color: colors.textPrimary }}>{interest} ✕</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          className="mt-2 mb-7 py-3 rounded-xl items-center"
          style={{ borderWidth: 1.5, borderColor: colors.textTertiary }}
          onPress={() => setPasswordModalVisible(true)}
        >
          <Text
            className="text-[15px] font-semibold"
            style={{ color: colors.textTertiary }}
          >
            Change Password
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="py-4 rounded-[14px] items-center"
          style={{
            backgroundColor: saving ? colors.borderSecondary : colors.accent,
          }}
          onPress={handleSave}
          disabled={saving}
        >
          <Text
            className="text-base font-bold tracking-[0.5px]"
            style={{ color: colors.cardSecondary }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>

        <Modal
          visible={passwordModalVisible}
          transparent
          animationType="slide"
          onRequestClose={handleCloseModal}
        >
          <View className="flex-1 bg-black/50 justify-center items-center px-6">
            <View
              className="w-full rounded-[20px] p-6"
              style={{ backgroundColor: colors.cardSecondary }}
            >
              <Text
                className="text-xl font-bold mb-5 text-center"
                style={{ color: colors.textPrimary }}
              >
                Change Password
              </Text>

              {(["old", "new", "confirm"] as (keyof PasswordFields)[]).map(
                (field) => (
                  <View
                    key={field}
                    className="flex-row items-center rounded-xl px-3.5 mb-3.5"
                    style={{
                      backgroundColor: colors.card,
                      borderWidth: 1.5,
                      borderColor: colors.borderSecondary,
                    }}
                  >
                    <TextInput
                      className="flex-1 py-3 text-[15px]"
                      style={{ color: colors.textPrimary }}
                      placeholder={
                        field === "old"
                          ? "Current Password"
                          : field === "new"
                            ? "New Password"
                            : "Confirm New Password"
                      }
                      placeholderTextColor={colors.textSecondary}
                      secureTextEntry={!showPassword[field]}
                      value={passwords[field]}
                      onChangeText={(text) => {
                        setPasswords((prev) => ({ ...prev, [field]: text }));
                        setPasswordError("");
                      }}
                    />
                    <TouchableOpacity
                      onPress={() =>
                        setShowPassword((prev) => ({
                          ...prev,
                          [field]: !prev[field],
                        }))
                      }
                    >
                      <Text className="text-lg pl-2">
                        {showPassword[field] ? "🙈" : "👁️"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ),
              )}

              <Text
                className="text-[11px] text-center mb-2 leading-4"
                style={{ color: colors.textSecondary }}
              >
                Min 6 chars · 1 uppercase · 1 lowercase · 1 number · 1 special
                character
              </Text>

              {passwordError ? (
                <Text
                  className="text-[13px] text-center mb-3 font-medium"
                  style={{ color: colors.textTertiary }}
                >
                  {passwordError}
                </Text>
              ) : null}

              <View className="flex-row justify-between gap-3 mt-1">
                <TouchableOpacity
                  className="flex-1 py-3 rounded-xl items-center"
                  style={{
                    borderWidth: 1.5,
                    borderColor: colors.borderSecondary,
                  }}
                  onPress={handleCloseModal}
                >
                  <Text
                    className="text-[15px] font-semibold"
                    style={{ color: colors.textSecondary }}
                  >
                    Cancel
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 py-3 rounded-xl items-center"
                  style={{ backgroundColor: colors.accent }}
                  onPress={handlePasswordChange}
                >
                  <Text
                    className="text-[15px] font-bold"
                    style={{ color: colors.cardSecondary }}
                  >
                    Confirm
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default EditProfile;
