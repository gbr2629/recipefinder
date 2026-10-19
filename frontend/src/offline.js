// Keeps a copy of saved recipes in the browser so they can be shown when offline

const read = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
};
const write = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full or blocked, ignore */
  }
};

// list of saved recipes for one user
export const readFavs = (userId) => read(`rf_favs_${userId}`);
export const writeFavs = (userId, list) => write(`rf_favs_${userId}`, list);

// full details of one saved recipe
export const readRecipe = (id) => read(`rf_recipe_${id}`);
export const writeRecipe = (id, recipe) => write(`rf_recipe_${id}`, recipe);
export const removeRecipe = (id) => localStorage.removeItem(`rf_recipe_${id}`);