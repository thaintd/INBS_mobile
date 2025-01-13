import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Calendar } from "react-native-calendars";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import colors from "@/assets/colors/colors";

// AI recommended time slots based on user preferences and availability
const recommendedSlots = [
  {
    time: "10:30",
    day: "Thursday",
    date: "March 21, 2024",
    available: true
  },
  {
    time: "15:00",
    day: "Friday",
    date: "March 22, 2024",
    available: true
  },
  {
    time: "11:00",
    day: "Saturday",
    date: "March 23, 2024",
    available: true
  }
];

// Available time slots
const timeSlots = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"];

export default function Schedule() {
  const router = useRouter();
  const { nailId, serviceType, additionalServices } = useLocalSearchParams();

  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedRecommended, setSelectedRecommended] = useState("");

  const markedDates = {
    [selectedDate]: {
      selected: true,
      selectedColor: colors.fifth
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back-circle-outline" size={32} color={colors.fifth} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose Date & Time</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* AI Recommended Slots */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="sparkles-outline" size={24} color={colors.fifth} />
            <Text style={styles.sectionTitle}>AI Recommended Times</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recommendedContainer}>
            {recommendedSlots.map((slot, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.recommendedCard, selectedRecommended === `${slot.date}-${slot.time}` && styles.recommendedCardSelected]}
                onPress={() => {
                  setSelectedRecommended(`${slot.date}-${slot.time}`);
                  setSelectedDate(slot.date);
                  setSelectedTime(slot.time);
                }}
              >
                <Text style={styles.recommendedTime}>{slot.time}</Text>
                <Text style={styles.recommendedDay}>{slot.day}</Text>
                <Text style={styles.recommendedDate}>{slot.date}</Text>
                <View style={styles.recommendedBadge}>
                  <Ionicons name="thumbs-up-outline" size={12} color={colors.fifth} />
                  <Text style={styles.recommendedBadgeText}>Best Match</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle1}>If not, please select the calendar below</Text>
        </View>

        {/* Calendar */}
        <View style={styles.calendarContainer}>
          <Calendar
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={markedDates}
            theme={{
              backgroundColor: colors.third,
              calendarBackground: colors.third,
              textSectionTitleColor: colors.fifth,
              selectedDayBackgroundColor: colors.fifth,
              selectedDayTextColor: colors.sixth,
              todayTextColor: colors.fifth,
              dayTextColor: colors.fifth,
              textDisabledColor: `${colors.fifth}50`,
              arrowColor: colors.fifth,
              monthTextColor: colors.fifth,
              textDayFontWeight: "500",
              textMonthFontWeight: "bold",
              textDayHeaderFontWeight: "500"
            }}
          />
        </View>

        {/* Time Slots */}
        <View style={styles.timeSection}>
          <Text style={styles.sectionTitle}>Available Times</Text>
          <View style={styles.timeSlotsContainer}>
            {timeSlots.map((time) => (
              <TouchableOpacity key={time} style={[styles.timeSlot, selectedTime === time && styles.timeSlotSelected]} onPress={() => setSelectedTime(time)}>
                <Text style={[styles.timeSlotText, selectedTime === time && styles.timeSlotTextSelected]}>{time}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action */}
      <View style={styles.bottomAction}>
        <View style={styles.bottomButtons}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.confirmButton, (!selectedDate || !selectedTime) && styles.confirmButtonDisabled]}
            disabled={!selectedDate || !selectedTime}
            onPress={() => {
              router.push({
                pathname: "/nails/confirmation",
                params: {
                  nailId,
                  serviceType,
                  additionalServices,
                  date: selectedDate,
                  time: selectedTime
                }
              });
            }}
          >
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.seventh
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.fourth
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: colors.fifth,
    marginLeft: 12
  },
  content: {
    flex: 1
  },
  section: {
    padding: 16
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.fifth
  },
  sectionTitle1: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.fifth,
    paddingLeft: 16
  },
  recommendedContainer: {
    marginBottom: 16
  },
  recommendedCard: {
    backgroundColor: colors.fourth,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    width: 150
  },
  recommendedCardSelected: {
    backgroundColor: `${colors.fifth}10`,
    borderColor: colors.fifth,
    borderWidth: 1
  },
  recommendedTime: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.fifth,
    marginBottom: 4
  },
  recommendedDay: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.fifth,
    marginBottom: 2
  },
  recommendedDate: {
    fontSize: 14,
    color: `${colors.fifth}80`,
    marginBottom: 8
  },
  recommendedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: `${colors.fifth}10`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start"
  },
  recommendedBadgeText: {
    fontSize: 12,
    color: colors.fifth
  },
  calendarContainer: {
    backgroundColor: colors.fourth,
    borderRadius: 12,
    margin: 16,
    overflow: "hidden"
  },
  timeSection: {
    padding: 16
  },
  timeSlotsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12
  },
  timeSlot: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.fourth,
    borderWidth: 1,
    borderColor: colors.fourth
  },
  timeSlotSelected: {
    backgroundColor: colors.fifth,
    borderColor: colors.fifth
  },
  timeSlotText: {
    fontSize: 14,
    color: colors.fifth
  },
  timeSlotTextSelected: {
    color: colors.sixth
  },
  bottomAction: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: colors.third,
    borderTopWidth: 1,
    borderTopColor: colors.fourth
  },
  bottomButtons: {
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 8
  },
  backButton: {
    flex: 1,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.fourth,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: colors.fifth,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  backText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.fifth
  },
  confirmButton: {
    flex: 1,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.fifth,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3
  },
  confirmButtonDisabled: {
    opacity: 0.6,
    backgroundColor: `${colors.fifth}80`
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.sixth
  }
});
