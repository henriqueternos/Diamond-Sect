import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { firebaseConfig, ADMIN_EMAIL } from "./firebase-config.js";
import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET } from "./cloudinary-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getFirestore(app);

/*
  Este projeto foi migrado do Realtime Database para o Firestore.
  Para o restante do site continuar funcionando sem precisar reescrever
  catalog.js, product.js, admin.js, cart.js, auth.js e heroes.js,
  mantemos as mesmas funções (readPath, writePath, updatePath, removePath, pushPath)
  só que por baixo dos panos elas agora conversam com o Firestore.

  Cada "caminho" antigo do Realtime Database é traduzido para uma
  coleção/documento do Firestore pela função resolveRef abaixo.
*/

function resolveRef(path){
  const clean = String(path).replace(/^\/+|\/+$/g, "");

  if(clean === "products/products/items"){
    return { kind: "collection", name: "products" };
  }
  if(clean.startsWith("products/products/items/")){
    const id = clean.split("/").pop();
    return { kind: "doc", name: "products", id };
  }
  if(clean === "products/siteContent/heroes"){
    return { kind: "doc", name: "siteContent", id: "heroes" };
  }
  if(clean === "orders"){
    return { kind: "collection", name: "orders" };
  }
  if(clean.startsWith("orders/")){
    return { kind: "doc", name: "orders", id: clean.split("/").pop() };
  }
  if(clean === "payments"){
    return { kind: "collection", name: "payments" };
  }
  if(clean.startsWith("payments/")){
    return { kind: "doc", name: "payments", id: clean.split("/").pop() };
  }
  if(clean === "users"){
    return { kind: "collection", name: "users" };
  }
  if(clean.startsWith("users/")){
    return { kind: "doc", name: "users", id: clean.split("/").pop() };
  }

  throw new Error(`Caminho não mapeado para o Firestore: "${path}"`);
}

async function getFallbackData(){
  const fallbackPath = location.pathname.includes("/admin/") ? "../js/fallback-data.json" : "js/fallback-data.json";
  const res = await fetch(fallbackPath);
  return await res.json();
}

async function readFallback(path){
  const fb = await getFallbackData();
  return path.split("/").reduce((acc, key) => acc?.[key], fb);
}

async function readPath(path){
  try{
    const r = resolveRef(path);
    if(r.kind === "doc"){
      const snap = await getDoc(doc(db, r.name, r.id));
      if(snap.exists()) return snap.data();
      return null;
    }else{
      const snap = await getDocs(collection(db, r.name));
      const out = {};
      snap.forEach(d => { out[d.id] = d.data(); });
      return out;
    }
  }catch(e){
    console.warn("Firestore read fallback:", e?.message || e);
  }
  return await readFallback(path);
}

async function writePath(path, value){
  const r = resolveRef(path);
  if(r.kind !== "doc"){
    throw new Error(`writePath precisa de um caminho de documento, recebeu uma coleção: "${path}"`);
  }
  return setDoc(doc(db, r.name, r.id), value);
}

async function updatePath(path, value){
  const r = resolveRef(path);
  if(r.kind !== "doc"){
    throw new Error(`updatePath precisa de um caminho de documento, recebeu uma coleção: "${path}"`);
  }
  const ref = doc(db, r.name, r.id);
  try{
    return await updateDoc(ref, value);
  }catch(e){
    // se o documento ainda não existir, cria (merge) em vez de falhar
    return await setDoc(ref, value, { merge: true });
  }
}

async function removePath(path){
  const r = resolveRef(path);
  if(r.kind !== "doc"){
    throw new Error(`removePath precisa de um caminho de documento, recebeu uma coleção: "${path}"`);
  }
  return deleteDoc(doc(db, r.name, r.id));
}

async function pushPath(path, value){
  const r = resolveRef(path);
  if(r.kind !== "collection"){
    throw new Error(`pushPath precisa de um caminho de coleção, recebeu um documento: "${path}"`);
  }
  const docRef = await addDoc(collection(db, r.name), value);
  return docRef.id;
}

function isAdmin(user){
  return !!user && user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

async function uploadProductImage(file, folder="products"){
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", folder);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData
  });

  if(!res.ok){
    const errText = await res.text().catch(() => "");
    throw new Error(`Falha no upload da imagem (Cloudinary): ${res.status} ${errText}`);
  }

  const data = await res.json();
  return data.secure_url;
}

export {
  auth, db, provider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  signOut,
  updateProfile,
  readPath, writePath, updatePath, removePath, pushPath,
  uploadProductImage,
  isAdmin, ADMIN_EMAIL
};
