import React from 'react';
import { View, Text, Switch, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, font, radius } from '../theme';

function pad(n) {
  return String(n).padStart(2, '0');
}

export default function ReminderCard({ reminder, onToggle, onEdit }) {
  const timeStr = `${pad(reminder.hour)}:${pad(reminder.minute)}`;

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.left} onPress={onEdit} activeOpacity={0.7}>
        <Text style={styles.label}>{reminder.label}</Text>
        <Text style={styles.time}>{timeStr}</Text>
        <Text style={styles.message} numberOfLines={1}>{reminder.message}</Text>
      </TouchableOpacity>
      <Switch
        value={reminder.enabled}
        onValueChange={onToggle}
        trackColor={{ false: colors.hairline, true: colors.coral }}
        thumbColor={colors.white}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.hairline,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  left: {
    flex: 1,
    marginRight: 12,
  },
  label: {
    fontFamily: font.family,
    fontWeight: font.weights.bold,
    fontSize: 16,
    color: colors.cocoa,
  },
  time: {
    fontFamily: font.family,
    fontWeight: font.weights.extraBold,
    fontSize: 28,
    color: colors.coralDeep,
    marginTop: 2,
  },
  message: {
    fontFamily: font.family,
    fontWeight: font.weights.regular,
    fontSize: 13,
    color: colors.taupe,
    marginTop: 4,
    fontStyle: 'italic',
  },
});
