# ShelfChef: Your Pantry Management 🥬📲

Your **pocket sous-chef**: snap or type the ingredients you have on hand and get instant, device-side recipe suggestions—no sign-up, no backend, 100 % privacy-friendly.

## 🚀 Key Features

   - Inventory Capture: Integrated device camera functionality to catalog pantry items efficiently.
   - Dynamic Recipe Retrieval: Utilized REST APIs to retrieve and display personalized recipes based on real-time ingredient availability.
   - Reliable User Experience: Implemented local state management to ensure offline-friendly data persistence and a seamless user flow.

| Capability | Details |
|------------|---------|
| **Pantry tracker** | • Add ingredients by text<br>• Or capture / upload a photo<br>• Item list persisted locally with `@react-native-async-storage/async-storage` |
| **Built-in camera flow** | Modern `expo-camera` experience with permission gating, shutter animation and thumbnail preview |
| **Recipe matcher (offline)** | Smart, case-insensitive matching against a bundled recipe set — only meals whose entire ingredient list is present in your pantry are suggested |
| **Expandable recipe library** | Full JSON meals pulled from _TheMealDB_ <https://www.themealdb.com/> |
| **Search & Filter** | Ingredient search bar with instant filtering |
| **Dark-/Light-mode toggle** | Global React Context theme switch, animated with `LinearGradient` |
| **Settings screen** | • Toggle theme<br>• Clear pantry (1-tap reset)<br>• Links to repo / licence |
| **Modern navigation** | File-system routing via `expo-router` (Tabs ➜ Pantry / Recipes / Settings) |

## 🛠 Tech Stack
   - Frontend: React Native, TypeScript, Expo
   - Backend Integration: REST APIs (Spoonacular/Food APIs)
   - **Expo SDK 53** (React Native 0.72)
   - **TypeScript 5**
   - **expo-router 2**
   - `expo-camera`, `expo-image-picker`, `expo-linear-gradient`
   - `@react-native-async-storage/async-storage`
   - **CI** – GitHub Actions: ESLint + type-check on every push
   
## ⚡️ Quick Start

> Tested on **node 18 LTS** and **npm 9**.

```bash
git clone https://github.com/ZihanYu-Daisy/ShelfChef.git
cd ShelfChef
npm install        # or pnpm / yarn
npx expo start     # press i / a / w for iOS, Android, Web
```

iOS real device – Expo Go from the App Store currently targets SDK 54.
To test SDK 53 projects you can:

- run in an **iOS simulator** (npx expo run:ios), **or**
- create a custom dev-build with EAS (eas build --profile development).

## 🗂 Project Structure
app/
  (tabs)/              ← Expo Router tab group
    index.tsx          ← Pantry screen + camera & matcher
    recipes.tsx        ← External API library + details modal
    settings.tsx       ← Theme toggle & maintenance actions
  _layout.tsx          ← Global router layout
assets/                ← App icons & splash
components/            ← Re-usable UI pieces
hooks/                 ← `useTheme`, `useColorScheme`, …
constants/             ← Theme colors, helper enums
theme_context.tsx      ← Global ThemeProvider
scripts/               ← one-off reset script

## 🚀 Future Roadmap
- 🔍 Cloud recipe search (OpenAI Function-calling → dynamic suggestions).
- 🥡 Left-over mode – fuzzy match meals you can almost make + shopping list export.
- ☁️ Optional sync – Supabase back-end for multi-device pantries.
- 🗣️ Voice scanning – add ingredients via speech recognition.
