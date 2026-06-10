import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { colors, font, radius } from '../theme';

export default function TakenButton({ onPress, taken }) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (taken) {
      Animated.sequence([
        Animated.spring(scale, { toValue: 1.08, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      ]).start();
    }
  }, [taken]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={[styles.btn, taken && styles.btnTaken]}
        onPress={onPress}
        activeOpacity={0.8}
        disabled={taken}
      >
        <Text style={[styles.label, taken && styles.labelTaken]}>
          {taken ? '✓ taken!' : 'i took it'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: colors.coral,
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  btnTaken: {
    backgroundColor: colors.stateTakenBg,
  },
  label: {
    fontFamily: font.family,
    fontWeight: font.weights.semiBold,
    fontSize: 18,
    color: colors.onCoral,
  },
  labelTaken: {
    color: colors.stateTaken,
  },
});
