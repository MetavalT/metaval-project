import axios from "axios";

const API = axios.create({
  // ✅ THE ABSOLUTE MASTER FIX: Binds your server prefix directly onto your network base!
  baseURL: "http://localhost:5000/api/data",
  headers: {
    "Content-Type": "application/json",
  }
});

export default API;