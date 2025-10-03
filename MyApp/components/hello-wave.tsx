import Animated, { withRepeat, withSequence, withTiming, useSharedValue, useAnimatedStyle } from 'react-native-reanimated';
import { useEffect } from 'react';
import { Text } from 'react-native';

export function HelloWave() {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withSequence(
        withTiming(25, { duration: 300 }),
        withTiming(0, { duration: 300 })
      ),
      -1, // infinito
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Text
        style={{
          fontSize: 36,
          textShadowColor: 'rgba(0,0,0,0.2)', // sombra con opacidad
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 4,
        }}
      >
        👋
      </Text>
    </Animated.View>
  );
}
