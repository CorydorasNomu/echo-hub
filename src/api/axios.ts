import type { AxiosInstance } from "axios"
import axios from "axios"

const apiClient: AxiosInstance = axios.create({
  // baseURL: "https://us-central1-tmp-chest.cloudfunctions.net/",
  headers: {
    "Content-type": "application/json",
  },
});

export default apiClient;