import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import colors from "@/assets/colors/colors";
import api from "@/lib/api";

type Skintone = {
  id: number;
  name: string;
  hexCode: string;
};

type PaintType = {
  id: number;
  name: string;
  description: string;
  date: string | null;
};

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
  const [skintones, setSkintones] = useState<Skintone[]>([]);
  const [paintTypes, setPaintTypes] = useState<PaintType[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [sections, setSections] = useState<Section[]>([
    {
      id: "skinTone",
      title: "Skin tone",
      isExpanded: false,
      type: "single",
      options: [],
      selected: []
    },
    {
      id: "paintTypes",
      title: "Paint types",
      isExpanded: false,
      type: "multiple",
      options: [],
      selected: []
    }
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [skintoneResponse, paintTypeResponse] = await Promise.all([
          api.get("/api/Adjective/Skintone"),
          api.get("/api/Adjective/PaintType")
        ]);

        setSkintones(skintoneResponse.data);
        setPaintTypes(paintTypeResponse.data);

        setSections(prev => prev.map(section => {
          if (section.id === "skinTone") {
            return {
              ...section,
              options: skintoneResponse.data.map((item: Skintone) => item.name)
            };
          }
          if (section.id === "paintTypes") {
            return {
              ...section,
              options: paintTypeResponse.data.map((item: PaintType) => item.name)
            };
          }
          return section;
        }));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Get selected skintone ID
      const selectedSkintone = skintones.find(skintone => 
        sections.find(section => section.id === "skinTone")?.selected.includes(skintone.name)
      );

      // Get selected paint type IDs
      const selectedPaintTypes = paintTypes.filter(paintType => 
        sections.find(section => section.id === "paintTypes")?.selected.includes(paintType.name)
      );

      if (!selectedSkintone) {
        Alert.alert("Error", "Please select a skin tone");
        return;
      }

      const response = await api.post("/api/Customer/preferences", {
        skintoneIds: [selectedSkintone.id],
        occasionIds: selectedPaintTypes.map(type => type.id)
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
      );

      if (response.status === 200) {
        Alert.alert("Success", "Preferences saved successfully", [
          { text: "OK", onPress: () => router.back() }
        ]);
        router.push("/home");
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      Alert.alert("Error", "Failed to save preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.fifth} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Preferences</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {sections.map((section) => (
          <View key={section.id} style={styles.section}>
            <TouchableOpacity style={styles.sectionHeader} onPress={() => toggleSection(section.id)}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Ionicons name={section.isExpanded ? "chevron-up" : "chevron-down"} size={20} color="#666" />
            </TouchableOpacity>

            {section.isExpanded && section.options.length > 0 && (
              <View style={styles.optionsContainer}>
                {section.id === "skinTone" ? (
                  <View style={styles.skintoneContainer}>
                    {skintones.map((skintone) => (
                      <TouchableOpacity 
                        key={skintone.id} 
                        style={[styles.skintoneOption, section.selected.includes(skintone.name) && styles.skintoneSelected]} 
                        onPress={() => toggleOption(section.id, skintone.name)}
                      >
                        <View style={[styles.colorPreview, { backgroundColor: skintone.hexCode }]} />
                        <View style={styles.skintoneInfo}>
                          <Text style={styles.skintoneName}>{skintone.name}</Text>
                          <Text style={styles.hexCode}>{skintone.hexCode}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <View style={styles.paintTypesContainer}>
                    {paintTypes.map((paintType) => (
                      <TouchableOpacity 
                        key={paintType.id} 
                        style={[styles.paintTypeOption, section.selected.includes(paintType.name) && styles.paintTypeSelected]} 
                        onPress={() => toggleOption(section.id, paintType.name)}
                      >
                        <View style={styles.paintTypeInfo}>
                          <Text style={[styles.paintTypeText, section.selected.includes(paintType.name) && styles.paintTypeTextSelected]}>
                            {paintType.name}
                          </Text>
                          <Text style={styles.paintTypeDescription}>{paintType.description}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity 
        style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}>Save</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 20
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee"
  },
  headerTitle: {
    fontSize: 20,
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
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#eee"
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.fifth
  },
  optionsContainer: {
    padding: 16,
    paddingTop: 8
  },
  skintoneContainer: {
    gap: 12
  },
  skintoneOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8
  },
  skintoneSelected: {
    borderColor: colors.fifth,
    backgroundColor: "#f8f8f8"
  },
  colorPreview: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12
  },
  skintoneInfo: {
    flex: 1
  },
  skintoneName: {
    fontSize: 16,
    color: colors.fifth
  },
  hexCode: {
    fontSize: 14,
    color: "#666",
    marginTop: 4
  },
  paintTypesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  paintTypeOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 8,
    marginBottom: 8,
    width: "100%"
  },
  paintTypeSelected: {
    borderColor: colors.fifth,
    backgroundColor: "#f8f8f8"
  },
  paintTypeInfo: {
    flex: 1
  },
  paintTypeText: {
    fontSize: 16,
    color: colors.fifth,
    fontWeight: "500"
  },
  paintTypeTextSelected: {
    fontWeight: "600"
  },
  paintTypeDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 4
  },
  saveButton: {
    backgroundColor: colors.fifth,
    margin: 16,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center"
  },
  saveButtonDisabled: {
    opacity: 0.7
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600"
  }
});
