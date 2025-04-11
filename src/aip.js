const BASE_URL = "https://jobportal-backend-3jgb.onrender.com"


export async function getData() {
  const response = await fetch(`${BASE_URL}/`);
  const data = await response.text();
  return data;
}
