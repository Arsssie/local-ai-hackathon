import { useEffect, useRef } from "react";
import {
  View,
  Image,
  Animated,
  Easing,
  Dimensions,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
// Point this at the full logo (bin + leaves + GIGO) used on the Login screen
import logo from "../../assets/Gigo-Logo.png";

const DARK_GREEN = "#1B6045";
const BALL = 50;
const LOGO = 160;
const START_Y = -Dimensions.get("window").height / 2 - BALL;

export default function IntroScreen() {
  const navigation = useNavigation<any>();

  const ballY = useRef(new Animated.Value(START_Y)).current; 
  const squash = useRef(new Animated.Value(0)).current; 
  const ballScale = useRef(new Animated.Value(1)).current;
  const shadowOpacity = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const tagline = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const move = (to: number, duration: number, easing: (t: number) => number) =>
      Animated.timing(ballY, { toValue: to, duration, easing, useNativeDriver: true });
    const setSquash = (to: number, duration: number) =>
      Animated.timing(squash, { toValue: to, duration, useNativeDriver: true });
    const fall = (duration: number) => move(0, duration, Easing.in(Easing.quad));
    const rise = (to: number, duration: number) =>
      Animated.parallel([
        setSquash(0, 90),
        move(to, duration, Easing.out(Easing.quad)),
      ]);

    const animation = Animated.sequence([
      // 1. Ball drops from the top and bounces, each bounce lower
      fall(550),
      setSquash(1, 80),
      rise(-140, 320),
      fall(320),
      setSquash(1, 70),
      rise(-50, 200),
      fall(200),
      // 2. Final landing: squash flat
      setSquash(1, 120),
      Animated.delay(80),
      // 3. Ball pops into the logo
      Animated.parallel([
        Animated.timing(ballScale, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(shadowOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 4,
          tension: 60,
          useNativeDriver: true,
        }),
      ]),
      // 4. Tagline fades up
      Animated.timing(tagline, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      // 5. Hold, then fade out to Login
      Animated.delay(700),
      Animated.timing(screenOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]);

    animation.start(({ finished }) => {
      if (finished) navigation.replace("Login");
    });
    return () => animation.stop();
  }, []);

  // Keep the bottom of the ball on the floor while it squashes
  const squashOffset = squash.interpolate({
    inputRange: [0, 1],
    outputRange: [0, (BALL * 0.35) / 2],
  });

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      <View style={styles.stage}>
        {/* Shadow grows as the ball gets closer to the floor */}
        <Animated.View
          style={[
            styles.shadow,
            {
              opacity: shadowOpacity,
              transform: [
                {
                  scale: ballY.interpolate({
                    inputRange: [-150, 0],
                    outputRange: [0.3, 1],
                    extrapolate: "clamp",
                  }),
                },
              ],
            },
          ]}
        />
        <Animated.View
          style={[
            styles.ball,
            {
              transform: [
                { translateY: Animated.add(ballY, squashOffset) },
                { scale: ballScale },
                { scaleX: squash.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] }) },
                { scaleY: squash.interpolate({ inputRange: [0, 1], outputRange: [1, 0.65] }) },
              ],
            },
          ]}
        />

        <Animated.View
          style={[
            styles.logoWrap,
            { opacity: logoOpacity, transform: [{ scale: logoScale }] },
          ]}
        >
          <Image source={logo} style={styles.logo} resizeMode="contain" />
        </Animated.View>
      </View>

      <Animated.Text
        style={[
          styles.tagline,
          {
            opacity: tagline,
            transform: [
              {
                translateY: tagline.interpolate({
                  inputRange: [0, 1],
                  outputRange: [10, 0],
                }),
              },
            ],
          },
        ]}
      >
        Garbage in, Garbage out
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  stage: {
    width: LOGO,
    height: LOGO,
    alignItems: "center",
    justifyContent: "center",
  },
  ball: {
    position: "absolute",
    top: LOGO / 2 - BALL,
    width: BALL,
    height: BALL,
    borderRadius: BALL / 2,
    backgroundColor: DARK_GREEN,
  },
  shadow: {
    position: "absolute",
    top: LOGO / 2 - 3,
    width: 36,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D9D9D9",
  },
  logoWrap: { position: "absolute" },
  logo: { width: LOGO, height: LOGO },
  tagline: { marginTop: 12, fontSize: 16, color: "#6B7280" },
});
