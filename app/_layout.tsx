import { Stack } from 'expo-router';
import { RecipesProvider } from './recipes_context'; // ← add
import { ThemeProvider } from './theme_context';

export default function Root() {
  return (
    <ThemeProvider>
      <RecipesProvider>        {/* ← wrap the navigator */}
        <Stack screenOptions={{ headerShown: false }} />
      </RecipesProvider>
    </ThemeProvider>
  );
}
