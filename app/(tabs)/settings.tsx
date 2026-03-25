/* app/(tabs)/settings.tsx */

import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Linking,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme_context';

const SETTINGS_KEY = 'appSettings';
const PANTRY_KEY = 'pantryItems';
type Settings = { dietary: string[] };
const defaults: Settings = { dietary: [] };

const DIETS = ['vegetarian', 'vegan', 'gluten-free'];

export default function Settings() {
  const { dark, toggle: toggleTheme } = useTheme();
  const [settings, setSettings] = useState<Settings>(defaults);
  const [loaded, setLoaded] = useState(false);
  const { top } = useSafeAreaInsets();

  /* load */
  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(SETTINGS_KEY);
      if (saved) setSettings(JSON.parse(saved));
      setLoaded(true);
    })();
  }, []);

  /* save */
  useEffect(() => {
    if (loaded) AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings, loaded]);

  /* handlers */
  const toggleDiet = (tag: string) => {
    setSettings(s => {
      const next = s.dietary.includes(tag)
        ? s.dietary.filter(t => t !== tag)
        : [...s.dietary, tag];
      return { dietary: next };
    });
  };

  const clearPantry = () =>
    Alert.alert('Clear Pantry', 'Delete all saved ingredients?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.removeItem(PANTRY_KEY);
          Alert.alert('Pantry cleared');
        },
      },
    ]);

  /* colours */
  const BG = dark ? '#1b1208' : '#fff8ec';
  const CARD = dark ? '#2d2215' : '#ffffff';
  const TEXT = dark ? '#fff' : '#333';

  return (
    <View style={[styles.root, { backgroundColor: BG, paddingTop: top + 12 }]}>
      {/* header title */}
      <Text style={[styles.title, { color: TEXT }]}>Settings</Text>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 80, paddingHorizontal: 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Display card */}
        <Card bg={CARD}>
          <Subtitle label="Display" color={TEXT} />
          <Row label="Dark mode" color={TEXT}>
            <Switch value={dark} onValueChange={toggleTheme} />
          </Row>
        </Card>

        {/* Dietary card */}
        <Card bg={CARD}>
          <Subtitle label="Dietary Filters" color={TEXT} />
          <View style={styles.chipBlock}>
            {DIETS.map(tag => (
              <Chip
                key={tag}
                label={tag}
                active={settings.dietary.includes(tag)}
                onToggle={() => toggleDiet(tag)}
              />
            ))}
          </View>
        </Card>

        {/* Data card */}
        <Card bg={CARD}>
          <Subtitle label="Storage" color={TEXT} />
          <Row
            label="Clear pantry"
            destructive
            onPress={clearPantry}
            color={TEXT}
          />
        </Card>

        {/* About card */}
        <Card bg={CARD}>
          <Subtitle label="About" color={TEXT} />
          <Row label="App version" value="1.0.0" color={TEXT} />
          <Row
            label="Send feedback"
            onPress={() => Linking.openURL('mailto:shelfchef@example.com')}
            color={TEXT}
          />
        </Card>
      </ScrollView>
    </View>
  );
}

/* ---------- sub-components ---------- */
function Card({ bg, children }: any) {
  return (
    <View style={[styles.card, { backgroundColor: bg }]}>{children}</View>
  );
}

function Subtitle({ label, color }: any) {
  return (
    <Text style={[styles.subtitle, { color }]}>{label}</Text>
  );
}

function Row({ label, value, onPress, destructive, color, children }: any) {
  return (
    <TouchableOpacity
      disabled={!onPress}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={styles.row}
    >
      <Text
        style={[
          styles.rowLabel,
          { color: destructive ? '#d33' : color },
        ]}
      >
        {label}
      </Text>
      {value && (
        <Text style={[styles.rowValue, { color: color }]}>{value}</Text>
      )}
      {children}
      {onPress && <Ionicons name="chevron-forward" size={18} color={color} />}
    </TouchableOpacity>
  );
}

function Chip({ label, active, onToggle }: any) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      style={[
        styles.chip,
        active && { backgroundColor: '#ff914d', borderColor: '#ff914d' },
      ]}
    >
      <Text style={{ color: active ? '#fff' : '#555' }}>{label}</Text>
    </TouchableOpacity>
  );
}

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  root: { flex: 1 },
  title: {
    fontSize: 34,
    fontWeight: '700',
    alignSelf: 'flex-start',
    marginLeft: 20,
    marginBottom: 16,
  },

  card: {
    borderRadius: 16,
    paddingVertical: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },

  subtitle: {
    fontSize: 13,
    textTransform: 'uppercase',
    opacity: 0.7,
    marginLeft: 20,
    marginBottom: 8,
    fontWeight: '600',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  rowLabel: { fontSize: 16 },
  rowValue: { fontSize: 15, opacity: 0.8 },

  chipBlock: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 18,
    paddingBottom: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 6 : 4,
  },
});
