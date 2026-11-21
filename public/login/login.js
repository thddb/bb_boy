import {
  GoogleAuthProvider, signInWithPopup, onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { auth, ensureUserDoc } from "/firebase.js";

const btn = document.getElementById("btn-login");
const msg = document.getElementById("msg");

onAuthStateChanged(auth, async (user) => {
  if (!user) return;
  try {
    await ensureUserDoc(user);
    location.replace("/");
  } catch (e) {
    msg.textContent = "建立帳號資料失敗：" + e.message;
  }
});

btn.onclick = async () => {
  btn.disabled = true;
  msg.textContent = "";
  try {
    await signInWithPopup(auth, new GoogleAuthProvider());
  } catch (e) {
    msg.textContent = "登入失敗：" + e.message;
    btn.disabled = false;
  }
};
