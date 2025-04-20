import { View, Text, StyleSheet, Image, Animated, Dimensions, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import colors from "@/assets/colors/colors";
import { useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { designService } from "@/services/nailDesign";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const FLOWER_SIZE = 20;
const NUMBER_OF_FLOWERS = 30;
const FLOWER_EMOJIS = ["💅", "✨", "🌸", "🎀"];

interface NailDesign {
  Name: string;
  TrendScore: number;
  AverageRating: number;
  ID: string;
  Medias: Medias[];
}

interface Medias {
  ImageUrl: string;
}

function FlowerFall() {
  const flowers = [...Array(NUMBER_OF_FLOWERS)].map(() => ({
    translateY: new Animated.Value(-FLOWER_SIZE),
    translateX: new Animated.Value(Math.random() * SCREEN_WIDTH),
    rotate: new Animated.Value(0),
    opacity: new Animated.Value(0.4 + Math.random() * 0.6),
    emoji: FLOWER_EMOJIS[Math.floor(Math.random() * FLOWER_EMOJIS.length)]
  }));

  useEffect(() => {
    flowers.forEach((flower) => {
      const duration = 6000 + Math.random() * 4000;
      const delay = Math.random() * 5000;

      Animated.loop(
        Animated.sequence([
          Animated.parallel([
            Animated.timing(flower.translateY, {
              toValue: SCREEN_HEIGHT,
              duration,
              useNativeDriver: true,
              delay
            }),
            Animated.timing(flower.rotate, {
              toValue: 360,
              duration: duration * 1.2,
              useNativeDriver: true,
              delay
            })
          ]),
          Animated.timing(flower.translateY, {
            toValue: -FLOWER_SIZE,
            duration: 0,
            useNativeDriver: true
          })
        ])
      ).start();
    });
  }, []);

  return (
    <>
      {flowers.map((flower, index) => (
        <Animated.View
          key={index}
          style={[
            styles.flower,
            {
              transform: [
                { translateY: flower.translateY },
                { translateX: flower.translateX },
                {
                  rotate: flower.rotate.interpolate({
                    inputRange: [0, 360],
                    outputRange: ["0deg", "360deg"]
                  })
                }
              ],
              opacity: flower.opacity
            }
          ]}
        >
          <Text style={styles.flowerEmoji}>{flower.emoji}</Text>
        </Animated.View>
      ))}
    </>
  );
}

export default function Welcome() {
  const router = useRouter();
  const [nailDesigns, setNailDesigns] = useState<NailDesign[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/signin");
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleGetNailDesign = async () => {
      try {
        setLoading(true);
        const res = await designService.getNailDesigns();
        if (Array.isArray(res)) {
          setNailDesigns(res.slice(0, 4)); // Chỉ lấy 4 mẫu đầu tiên
        }
      } catch (error) {
        console.error("Failed to load nail design:", error);
      } finally {
        setLoading(false);
      }
    };
    handleGetNailDesign();
  }, []);

  return (
    <View style={styles.container}>
      <FlowerFall />
      <View style={styles.mainContent}>
        <View style={styles.logoContainer}>
          <Image source={require("../assets/images/image 6.png")} style={styles.image} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.brandName}>INBS</Text>
          <Text style={styles.slogan}>Nail Beauty Service</Text>
          <Text style={styles.subSlogan}>Professional • Luxury • Convenience</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.third
  },
  mainContent: {
    flex: 1,
    alignItems: "center",
    paddingTop: "15%",
    marginTop: 150
  },
  logoContainer: {
    width: "100%",
    alignItems: "center",
    height: 150,
    overflow: "hidden"
  },
  image: {
    width: 300,
    height: 300,
    resizeMode: "contain",
    marginTop: -40
  },
  textContainer: {
    alignItems: "center",
    gap: 12,
    marginTop: -20
  },
  brandName: {
    fontSize: 36,
    color: colors.fifth,
    letterSpacing: 10,
    fontWeight: "600"
  },
  slogan: {
    fontSize: 20,
    color: colors.fifth,
    letterSpacing: 2
  },
  subSlogan: {
    fontSize: 14,
    color: colors.fifth,
    opacity: 0.8,
    letterSpacing: 1
  },
  flower: {
    position: "absolute",
    width: FLOWER_SIZE,
    height: FLOWER_SIZE,
    justifyContent: "center",
    alignItems: "center"
  },
  flowerEmoji: {
    fontSize: FLOWER_SIZE
  },
  gridContainer: {
    padding: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20
  },
  nailCard: {
    width: "48%",
    backgroundColor: colors.third,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16
  },
  nailImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover"
  },
  nailInfo: {
    padding: 12
  },
  nailHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8
  },
  nailName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: colors.eigth
  },
  nailDetails: {
    flexDirection: "column",
    gap: 8
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: `${colors.eigth}10`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start"
  },
  detailLabel: {
    fontSize: 12,
    color: colors.eigth,
    fontWeight: "500"
  },
  detailValue: {
    fontSize: 12,
    color: colors.eigth,
    fontWeight: "600"
  }
});
