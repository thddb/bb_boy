import {
  signOut, onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  addDoc, collection, getDocs, orderBy, query, serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { auth, db, ensureUserDoc } from "/firebase.js";

const $ = (id) => document.getElementById(id);

$("btn-logout").onclick = () => signOut(auth);

async function loadPlayers() {
  const snap = await getDocs(query(collection(db, "players"), orderBy("number")));
  const list = $("player-list");
  list.innerHTML = "";
  if (snap.empty) {
    list.innerHTML = "<li>目前沒有球員資料</li>";
    return;
  }
  snap.forEach((d) => {
    const p = d.data();
    const li = document.createElement("li");
    li.textContent = `#${p.number} ${p.name}（${(p.positions || []).join("/")}）`;
    list.appendChild(li);
  });
}

$("player-form").onsubmit = async (e) => {
  e.preventDefault();
  const f = e.target;
  try {
    await addDoc(collection(db, "players"), {
      name: f.name.value.trim(),
      number: Number(f.number.value),
      positions: f.positions.value.split(",").map((s) => s.trim()).filter(Boolean),
      bats: f.bats.value,
      throws: f.throws.value,
      active: true,
      createdAt: serverTimestamp(),
    });
    f.reset();
    loadPlayers();
  } catch (err) {
    alert("新增失敗（只有教練能新增）：" + err.message);
  }
};

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    location.replace("/login/");
    return;
  }
  const profile = await ensureUserDoc(user);
  $("user-info").textContent = `${user.displayName}（${user.email}）・身分：${
    profile.role === "coach" ? "教練" : "球員"
  }`;
  $("coach-only").hidden = profile.role !== "coach";
  loadPlayers();
});
