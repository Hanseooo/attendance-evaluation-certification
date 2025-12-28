import { API_BASE_URL } from "@/api/baseUrl";


const BASE_URL = API_BASE_URL

export default async function login(name: string, password: string) {
    // let isEmail = name.includes('@');
    // let payload = isEmail ? { email: name, password } : { username: name, password };
    const payload = { username: name, password };
    const response = await fetch(
      `${BASE_URL}/dj-rest-auth/login/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
    const errorData = await response.json();
    console.error(errorData);
    return undefined
    } else {
    const data = await response.json();
    console.log(typeof(data));
    return data
    }
}