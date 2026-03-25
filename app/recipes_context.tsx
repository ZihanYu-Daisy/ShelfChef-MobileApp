import React, { createContext, useContext, useEffect, useState } from 'react';

type Recipe = {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  [k: string]: any;          // keep all other fields for details
};

type Ctx = { recipes: Recipe[]; loading: boolean; error: string | null };
const RecipesContext = createContext<Ctx>({ recipes: [], loading: true, error: null });
export const useRecipes = () => useContext(RecipesContext);

const ENDPOINT = 'https://www.themealdb.com/api/json/v1/1/search.php?s=';

export function RecipesProvider({ children }: { children: React.ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const json = await (await fetch(ENDPOINT)).json();
        setRecipes(json.meals ?? []);
      } catch {
        setError('Failed to load recipes.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <RecipesContext.Provider value={{ recipes, loading, error }}>
      {children}
    </RecipesContext.Provider>
  );
}
