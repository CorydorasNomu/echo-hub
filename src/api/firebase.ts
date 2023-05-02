// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { getAuth } from "firebase/auth"
import { getFunctions, connectFunctionsEmulator } from "firebase/functions"
import { connectStorageEmulator } from "firebase/storage"

// アプリ登録情報
const firebaseConfig = {
  apiKey: "AIzaSyAsnYy3tV8dDqXpPsRf4sBzwY_ENchHGbE",
  authDomain: "echo-hub-88492.firebaseapp.com",
  projectId: "echo-hub-88492",
  storageBucket: "echo-hub-88492.appspot.com",
  messagingSenderId: "990780438012",
  appId: "1:990780438012:web:4d52486d4e12ee8c0cee79",
  measurementId: "G-RXBDSPPREQ"
};

// Firebase 初期化
const app = initializeApp(firebaseConfig)

// Firebase 各種サービス取得
const db = getFirestore(app)
const storage = getStorage(app)
const auth = getAuth(app)
const functions = getFunctions(app)

if (window.location.hostname === "localhost") {
  connectFunctionsEmulator(functions, "localhost", 5001);
  // connectStorageEmulator(storage, "localhost", 9199);
}

export default { db, storage, auth, functions };