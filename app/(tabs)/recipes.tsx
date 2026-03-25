/* app/(tabs)/recipes.tsx */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRecipes } from '../recipes_context'; // ← shared list
import { useTheme } from '../theme_context';

export default function Recipes() {
  /* theme colours */
  const { dark } = useTheme();
  const BG   = dark ? '#121212' : '#fff8ec';
  const GRAD = dark ? ['#1d1d1d', '#121212'] : ['#ffe0c8', '#fff8d1'];
  const CARD = dark ? '#1e1e1e' : '#fff';
  const TEXT = dark ? '#eee' : '#333';

  /* recipes from context */
  const { recipes, loading, error } = useRecipes();

  /* local ui state */
  const [selected, setSelected] = useState<any | null>(null);
  const [query, setQuery] = useState('');

  /* search filter */
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return recipes;
    return recipes.filter(r =>
      Array.from({ length: 20 }, (_, i) => r[`strIngredient${i + 1}`])
        .filter(Boolean)
        .some((ing: string) => ing.toLowerCase().includes(q)),
    );
  }, [recipes, query]);

  /* card renderer */
  const Card = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: CARD }]}
      onPress={() => setSelected(item)}
      activeOpacity={0.85}
    >
      <Image source={{ uri: item.strMealThumb }} style={styles.cardImg} />
      <Text style={[styles.cardTitle, { color: TEXT }]} numberOfLines={2}>
        {item.strMeal}
      </Text>
    </TouchableOpacity>
  );

  /* ─── JSX ─── */
  return (
    <LinearGradient colors={GRAD as any} style={[styles.flex, { backgroundColor: BG }]}>
      <SafeAreaView style={styles.flex}>
        {/* title */}
        <Text style={[styles.heading, { color: '#ff914d' }]}>🍲 Recipes Library</Text>

        {/* search */}
        <View style={[styles.searchRow, { backgroundColor: CARD }]}>
          <Ionicons name="search" size={18} color="#888" style={{ marginLeft: 10 }} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search ingredient…"
            placeholderTextColor="#888"
            style={[styles.searchInput, { color: TEXT }]}
          />
          {query !== '' && (
            <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
              <Ionicons name="close" size={18} color="#888" />
            </TouchableOpacity>
          )}
        </View>

        {/* list / states */}
        {loading && (
          <ActivityIndicator size="large" color="#ff914d" style={{ marginTop: 40 }} />
        )}
        {!loading && error && (
          <Text style={[styles.error, { color: '#d00' }]}>{error}</Text>
        )}
        {!loading && !error && (
          <FlatList
            data={visible}
            keyExtractor={r => r.idMeal}
            renderItem={Card}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
            ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>

      {/* detail modal */}
      {selected && (
        <Modal visible animationType="slide">
          <SafeAreaView style={[styles.flex, { backgroundColor: BG }]}>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <Image source={{ uri: selected.strMealThumb }} style={styles.hero} />
              <Text style={[styles.modalTitle, { color: '#ff914d' }]}>🍴 {selected.strMeal}</Text>

              <Text style={[styles.section, { color: TEXT }]}>📝 Ingredients</Text>
              {Array.from({ length: 20 }, (_, i) => i + 1)
                .map(i => ({
                  ing: selected[`strIngredient${i}`],
                  meas: selected[`strMeasure${i}`],
                }))
                .filter(p => p.ing && p.ing.trim())
                .map((p, idx) => (
                  <Text key={idx} style={[styles.ingredient, { color: TEXT }]}>
                    • {p.meas.trim()} {p.ing.trim()}
                  </Text>
                ))}

              <Text style={[styles.section, { color: TEXT }]}>📖 Instructions</Text>
              <Text style={[styles.instructions, { color: TEXT }]}>
                {selected.strInstructions}
              </Text>
            </ScrollView>

            <TouchableOpacity style={styles.closeBtn} onPress={() => setSelected(null)}>
              <Ionicons name="close" size={32} color="#fff" />
            </TouchableOpacity>
          </SafeAreaView>
        </Modal>
      )}
    </LinearGradient>
  );
}

/* ─── styles ─── */
const styles = StyleSheet.create({
  flex: { flex: 1 },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    alignSelf: 'center',
    marginVertical: 10,
  },
  error: { marginTop: 40, textAlign: 'center' },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    paddingHorizontal: 8,
  },
  clearBtn: { padding: 8 },

  card: {
    flexDirection: 'row',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  cardImg: { width: 100, height: 80 },
  cardTitle: {
    flex: 1,
    alignSelf: 'center',
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: '600',
  },

  modalContent: { padding: 20, paddingBottom: 60 },
  hero: { width: '100%', height: 260, borderRadius: 12 },
  modalTitle: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 14,
  },
  section: { fontSize: 20, fontWeight: '700', marginTop: 20, marginBottom: 6 },
  ingredient: { fontSize: 16, marginLeft: 4 },
  instructions: { fontSize: 16, lineHeight: 22, marginTop: 6 },

  closeBtn: {
    position: 'absolute',
    top: Platform.select({ ios: 60, android: 20 }),
    right: 20,
    backgroundColor: '#ff914d',
    borderRadius: 24,
    padding: 6,
  },
});
