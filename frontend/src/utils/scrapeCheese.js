// Utility to fetch cheese value from backend API (avoids CORS)
export async function fetchCheeseFromStore() {
  try {
    const res = await fetch('/api/scrape/cheese');
    const data = await res.json();
    if (data.success && typeof data.cheese === 'number') {
      return data.cheese;
    }
    return null;
  } catch (e) {
    return null;
  }
}
