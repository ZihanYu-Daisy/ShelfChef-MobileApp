/*  app/(tabs)/index.tsx  — ShelfChef Pantry  */

import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router'; /* ← NEW */
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
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
import { useRecipes } from '../recipes_context';
import { useTheme } from '../theme_context';

type Ingredient = { name: string; photoUri?: string };
const STORAGE_KEY = 'pantryItems';

export default function Pantry() {
  /* theme */
  const { dark } = useTheme();
  const BG   = dark ? '#121212' : '#fff8ec';
  const GRAD = dark ? ['#1d1d1d', '#121212'] : ['#ffe0c8', '#fff8d1'];
  const CARD = dark ? '#1e1e1e' : '#fff';
  const TEXT = dark ? '#eee'    : '#333';

  /* shared recipes */
  const { recipes } = useRecipes();

  /* state */
  const [items, setItems] = useState<Ingredient[]>([]);
  const [text, setText]   = useState('');
  const camRef = useRef<CameraView | null>(null);
  const [camOpen, setCamOpen] = useState(false);
  const [perm, askPerm] = useCameraPermissions();

  /* recipe modals */
  const [matchModal, setMatchModal] = useState(false);
  const [matched, setMatched]       = useState<any[]>([]);
  const [detail, setDetail]         = useState<any | null>(null);

  /* permissions once */
  useEffect(() => { ImagePicker.requestMediaLibraryPermissionsAsync(); }, []);

  /* load pantry first time */
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(s => s && setItems(JSON.parse(s)));
  }, []);

  /* reload every time tab gains focus (fixes “Clear pantry” not showing) */
  useFocusEffect(
    React.useCallback(() => {
      AsyncStorage.getItem(STORAGE_KEY).then(s =>
        setItems(s ? JSON.parse(s) : []),
      );
    }, [])
  );

  /* persist pantry */
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  /* helpers */
  const addItem = (name: string, uri?: string) => {
    const n = name.trim();
    if (!n) return;
    setItems(p => [...p, { name: n.toLowerCase(), photoUri: uri }]);
    setText('');
  };
  const remove = (n: string) => setItems(p => p.filter(i => i.name !== n));

  /* camera */
  const openCam = async () => {
    if (!text.trim()) return Alert.alert('Enter a name first!');
    if (!perm?.granted && !(await askPerm()).granted) return;
    setCamOpen(true);
  };
  const snap = async () => {
    if (!camRef.current) return;
    const pic = await camRef.current.takePictureAsync({ quality: 0.7 });
    setCamOpen(false);
    addItem(text, pic.uri);
  };

  /* gallery */
  const pick = async () => {
    if (!text.trim()) return Alert.alert('Enter a name first!');
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!r.canceled && r.assets[0]) addItem(text, r.assets[0].uri);
  };

  /* recipe matcher */
  const findRecipes = () => {
    const pantry = items.map(i => i.name.toLowerCase());

    const hits = recipes.filter(r =>
      Array.from({ length: 20 }, (_, i) => r[`strIngredient${i + 1}`])
        .filter(Boolean)
        .every(ingRaw => {
          const ing = ingRaw.toLowerCase();
          return pantry.some(p => p.includes(ing) || ing.includes(p));
        })
    );

    setMatched(hits);
    setMatchModal(true);
  };

  /* recipe card */
  const RecipeCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.cardH, { backgroundColor: CARD }]}
      onPress={() => setDetail(item)}
      activeOpacity={0.85}
    >
      <Image source={{ uri: item.strMealThumb }} style={styles.cardImg} />
      <Text style={[styles.cardTitle, { color: TEXT }]} numberOfLines={2}>
        {item.strMeal}
      </Text>
    </TouchableOpacity>
  );

  /* ─── UI ─── */
  return (
    <LinearGradient colors={GRAD as any} style={[styles.flex, { backgroundColor: BG }]}>
      <SafeAreaView style={styles.flex}>
        <View style={styles.heading}>
          <Text style={styles.appName}>ShelfChef</Text>
          <Text style={styles.sub}>My Pantry</Text>
        </View>

        <View style={[styles.bodyCard, { backgroundColor: CARD }]}>
          {/* input */}
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Add ingredient…"
              placeholderTextColor="#888"
              value={text}
              onChangeText={setText}
              onSubmitEditing={() => addItem(text)}
            />
            <TouchableOpacity style={[styles.fab, styles.orange]} onPress={() => addItem(text)}>
              <Ionicons name="add" size={28} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.fab, styles.green]} onPress={pick}>
              <Ionicons name="image-outline" size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.fab, styles.blue]} onPress={openCam}>
              <Ionicons name="camera-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.matchBtn} onPress={findRecipes}>
            <Text style={styles.matchTxt}>Find Recipes I Can Make</Text>
          </TouchableOpacity>

          {/* list */}
          <FlatList
            data={items}
            keyExtractor={(i, idx) => i.name + idx}
            renderItem={({ item }) => (
              <View style={styles.ingRow}>
                {item.photoUri ? (
                  <Image source={{ uri: item.photoUri }} style={styles.thumb} />
                ) : (
                  <View style={styles.placeholder}>
                    <Ionicons name="image" size={18} color="#bbb" />
                  </View>
                )}
                <Text style={[styles.ingTxt, { color: TEXT }]}>{item.name}</Text>
                <TouchableOpacity onPress={() => remove(item.name)}>
                  <Ionicons name="close" size={18} color="#666" />
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              <Text style={[styles.empty, { color: dark ? '#aaa' : '#888' }]}>
                No items yet – add one above!
              </Text>
            }
          />
        </View>
      </SafeAreaView>

      {/* match modal */}
      <Modal visible={matchModal} animationType="slide">
        <SafeAreaView style={[styles.flex, { backgroundColor: BG, padding: 20 }]}>
          <Text style={[styles.modalTitle, { color: '#ff914d' }]}>Recipes You Can Make</Text>
          {matched.length === 0 ? (
            <Text style={[styles.empty, { color: dark ? '#aaa' : '#888' }]}>
              No matching recipes.
            </Text>
          ) : (
            <FlatList
              data={matched}
              keyExtractor={r => r.idMeal}
              renderItem={RecipeCard}
              ItemSeparatorComponent={() => <View style={{ height: 14 }} />}
            />
          )}
          <TouchableOpacity style={styles.closeModal} onPress={() => setMatchModal(false)}>
            <Text style={{ color: '#fff' }}>Close</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Modal>

      {/* detail modal */}
      {detail && (
        <Modal visible animationType="slide">
          <SafeAreaView style={[styles.flex, { backgroundColor: BG }]}>
            <ScrollView contentContainerStyle={styles.detailWrap}>
              <Image source={{ uri: detail.strMealThumb }} style={styles.hero} />
              <Text style={[styles.detailTitle, { color: '#ff914d' }]}>🍴 {detail.strMeal}</Text>
              <Text style={[styles.section, { color: TEXT }]}>📝 Ingredients</Text>
              {Array.from({ length: 20 }, (_, i) => i + 1)
                .map(i => ({
                  ing: detail[`strIngredient${i}`],
                  meas: detail[`strMeasure${i}`],
                }))
                .filter(p => p.ing && p.ing.trim())
                .map((p, idx) => (
                  <Text key={idx} style={[styles.sectionTxt, { color: TEXT }]}>
                    • {p.meas.trim()} {p.ing.trim()}
                  </Text>
                ))}
              <Text style={[styles.section, { color: TEXT }]}>📖 Instructions</Text>
              <Text style={[styles.sectionTxt, { color: TEXT }]}>{detail.strInstructions}</Text>
            </ScrollView>
            <TouchableOpacity style={styles.closeDetail} onPress={() => setDetail(null)}>
              <Ionicons name="close" size={36} color="#fff" />
            </TouchableOpacity>
          </SafeAreaView>
        </Modal>
      )}

      {/* camera modal */}
      {perm?.granted && camOpen && (
        <Modal visible animationType="slide">
          <CameraView ref={camRef} style={styles.flex}>
            <TouchableOpacity style={styles.closeCam} onPress={() => setCamOpen(false)}>
              <Ionicons name="close" size={36} color="#fff" />
            </TouchableOpacity>
            <View style={styles.shutterBar}>
              <TouchableOpacity style={styles.shutter} onPress={snap} />
            </View>
          </CameraView>
        </Modal>
      )}
    </LinearGradient>
  );
}

/* ───────── styles unchanged (same as previous file) ───────── */
const styles = StyleSheet.create({
  /* … (identical to previous styles block) … */
  flex: { flex: 1 },
  heading: { alignItems: 'center', marginTop: 12, marginBottom: 8 },
  appName: { fontSize: 30, fontWeight: '800', color: '#ff914d' },
  sub: { fontSize: 20, fontWeight: '600', color: '#444' },
  bodyCard: {
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 16,
    paddingHorizontal: 20,
  },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 6 },
  input: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    fontSize: 16,
    color: '#333',
  },
  fab: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  orange: { backgroundColor: '#ff914d' },
  green: { backgroundColor: '#4caf50' },
  blue: { backgroundColor: '#2196f3' },
  matchBtn: {
    backgroundColor: '#ff914d',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  matchTxt: { color: '#fff', fontSize: 16, fontWeight: '600' },
  ingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  thumb: { width: 40, height: 40, borderRadius: 6 },
  placeholder: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ingTxt: { flex: 1, fontSize: 16 },
  empty: { textAlign: 'center', marginTop: 40 },
  cardH: {
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
  modalTitle: { fontSize: 24, fontWeight: '700', marginBottom: 14, alignSelf: 'center' },
  closeModal: {
    alignSelf: 'center',
    marginTop: 20,
    backgroundColor: '#888',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  detailWrap: { padding: 20, paddingBottom: 60 },
  hero: { width: '100%', height: 240, borderRadius: 12 },
  detailTitle: { fontSize: 28, fontWeight: '700', textAlign: 'center', marginVertical: 16 },
  section: { fontSize: 20, fontWeight: '700', marginTop: 18, marginBottom: 6 },
  sectionTxt: { fontSize: 16, lineHeight: 22 },
  closeDetail: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: '#ff914d',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeCam: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterBar: { position: 'absolute', bottom: 50, left: 0, right: 0, alignItems: 'center' },
  shutter: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    borderWidth: 5,
    borderColor: '#ddd',
  },
});
