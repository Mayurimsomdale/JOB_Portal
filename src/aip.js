const BASE_URL = "https://job-portal-4-xwnr.onrender.com"


export async function getData() {
  const response = await fetch(`${BASE_URL}/`);
  const data = await response.text();
  return data;
}
