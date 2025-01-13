import { View, Text, StyleSheet, Image, Animated, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import colors from "@/assets/colors/colors";
import { useEffect, useRef } from "react";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const FLOWER_SIZE = 20;
const NUMBER_OF_FLOWERS = 30;
const FLOWER_EMOJIS = ["💅", "✨", "🌸", "🎀"];

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

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/signin");
    }, 5000);

    return () => clearTimeout(timer);
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
  }
});
