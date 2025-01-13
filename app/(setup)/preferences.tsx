import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import colors from "@/assets/colors/colors";

type Section = {
  id: string;
  title: string;
  isExpanded: boolean;
  type: "single" | "multiple";
  options: string[];
  selected: string[];
};

export default function Preferences() {
  const router = useRouter();
  const [sections, setSections] = useState<Section[]>([
    {
      id: "skinTone",
      title: "Skin tone",
      isExpanded: false,
      type: "single",
      options: ["Light", "Medium", "Dark", "Very Dark"],
      selected: []
    },
    {
      id: "season",
      title: "Season/Occasion",
      isExpanded: false,
      type: "multiple",
      options: ["Christmas", "Birthday", "Wedding", "Valentine", "Party"],
      selected: []
    },
    {
      id: "paintTypes",
      title: "Paint types",
      isExpanded: false,
      type: "multiple",
      options: ["Acrylic", "Gel", "Regular polish", "Dipping powder"],
      selected: []
    },
    {
      id: "favoriteColor",
      title: "Favorite color",
      isExpanded: false,
      type: "multiple",
      options: ["Red", "Pink", "Blue", "Purple", "Black", "White"],
      selected: []
    },
    {
      id: "shape",
      title: "Shape",
      isExpanded: false,
      type: "multiple",
      options: ["Square", "Round", "Almond", "Stiletto", "Coffin"],
      selected: []
    }
  ]);

  const [description, setDescription] = useState("");

  const toggleSection = (sectionId: string) => {
    setSections((prev) =>
      prev.map((section) => ({
        ...section,
        isExpanded: section.id === sectionId ? !section.isExpanded : false
      }))
    );
  };

  const toggleOption = (sectionId: string, option: string) => {
    setSections((prev) =>
      prev.map((section) => {
        if (section.id !== sectionId) return section;

        if (section.type === "single") {
          return {
            ...section,
            selected: [option]
          };
        }

        const isSelected = section.selected.includes(option);
        return {
          ...section,
          selected: isSelected ? section.selected.filter((item) => item !== option) : [...section.selected, option]
        };
      })
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-circle-outline" size={32} color={colors.fifth} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Set Up Preference</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {sections.map((section) => (
          <TouchableOpacity key={section.id} style={styles.section} onPress={() => toggleSection(section.id)}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Ionicons name={section.isExpanded ? "chevron-up" : "chevron-down"} size={24} color={colors.first} style={{ transform: [{ rotate: section.isExpanded ? "0deg" : "0deg" }] }} />
            </View>

            {section.isExpanded && section.options.length > 0 && (
              <View style={styles.optionsContainer}>
                {section.id === "skinTone" ? (
                  <View style={styles.radioGroup}>
                    {section.options.map((option) => (
                      <TouchableOpacity key={option} style={styles.radioOption} onPress={() => toggleOption(section.id, option)}>
                        <View style={styles.radioButton}>{section.selected.includes(option) && <View style={styles.radioSelected} />}</View>
                        <Text style={styles.radioText}>{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <View style={styles.tagsContainer}>
                    {section.options.map((option) => (
                      <TouchableOpacity key={option} style={[styles.tag, section.selected.includes(option) && styles.tagSelected]} onPress={() => toggleOption(section.id, option)}>
                        <Text style={[styles.tagText, section.selected.includes(option) && styles.tagTextSelected]}>{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}
          </TouchableOpacity>
        ))}

        <View style={styles.descriptionSection}>
          <View style={styles.descriptionHeader}>
            <Ionicons name="person-outline" size={24} color={colors.fifth} />
            <Text style={styles.descriptionTitle}>Description about artist</Text>
          </View>
          <TextInput style={styles.descriptionInput} placeholder="Enter your description..." placeholderTextColor={`${colors.first}80`} multiline numberOfLines={4} value={description} onChangeText={setDescription} />
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.saveButton} onPress={() => router.back()}>
        <Text style={styles.saveButtonText}>Save</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.seventh,
    paddingTop: 20
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.third
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: colors.fifth,
    marginLeft: 12
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16
  },
  section: {
    marginBottom: 20,
    backgroundColor: colors.fourth,
    borderRadius: 12,
    overflow: "hidden"
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: colors.fourth
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.fifth
  },
  optionsContainer: {
    padding: 16,
    paddingTop: 8,
    backgroundColor: colors.third
  },
  radioGroup: {
    paddingVertical: 8
  },
  radioOption: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.first,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center"
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.fifth
  },
  radioText: {
    fontSize: 15,
    color: colors.fifth
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingVertical: 8
  },
  tag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.first,
    backgroundColor: colors.third
  },
  tagSelected: {
    backgroundColor: colors.first
  },
  tagText: {
    fontSize: 14,
    color: colors.fifth
  },
  tagTextSelected: {
    color: colors.third,
    fontWeight: "500"
  },
  saveButton: {
    backgroundColor: colors.fifth,
    margin: 16,
    paddingVertical: 16,
    borderRadius: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  saveButtonText: {
    color: colors.sixth,
    fontSize: 16,
    fontWeight: "600"
  },
  descriptionSection: {
    backgroundColor: colors.fourth,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20
  },
  descriptionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.fifth
  },
  descriptionInput: {
    backgroundColor: colors.third,
    borderRadius: 8,
    padding: 12,
    color: colors.first,
    fontSize: 15,
    minHeight: 100,
    textAlignVertical: "top"
  }
});
