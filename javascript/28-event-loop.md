# Chapter 28: Event Loop (Full Details + Interview Questions)

**Interviewer:** Event Loop explain karo.

**Tum:**

"JavaScript single-threaded hai. Event Loop woh mechanism hai jo Call Stack, Web APIs, Microtask Queue aur Macrotask Queue ko manage karta hai taaki async code properly chale."

---

## 1. Main Players

```
1. Call Stack       → Code yahan execute hota hai (LIFO)
2. Web APIs         → setTimeout, fetch, DOM events yahan jaate hain
3. Callback Queue   → Macrotasks (setTimeout, setInterval, I/O)
4. Microtask Queue  → Promises, queueMicrotask, MutationObserver
5. Event Loop       → Stack empty hone pe queues se kaam uthata hai
```

---

## 2. Flow (Step by Step)

```
Code chala → Call Stack mein gaya
   ↓
Async cheez mili (setTimeout / Promise)?
   ↓
Web API pe chali gayi
   ↓
Complete hone pe:
  - Promise → Microtask Queue
  - setTimeout → Callback Queue (Macrotask)
   ↓
Call Stack empty hote hi:
  1. Pehle SAARI Microtasks khatam
  2. Phir EK Macrotask
  3. Phir phir se Microtasks check
```

---

## 3. Classic Example

```js
console.log("1");

setTimeout(() => {
  console.log("2");
}, 0);

Promise.resolve().then(() => {
  console.log("3");
});

console.log("4");
```

**Output:**
```
1
4
3
2
```

**Kyun?**
1. `1` aur `4` → synchronous → turant Call Stack pe
2. `Promise` → Microtask Queue
3. `setTimeout` → Macrotask Queue
4. Stack empty → pehle Microtask (`3`) → phir Macrotask (`2`)

---

## 4. Microtask vs Macrotask

| Type       | Examples                                            | Priority   |
|------------|-----------------------------------------------------|------------|
| Microtask  | `Promise.then`, `queueMicrotask`, `MutationObserver`| **Higher** |
| Macrotask  | `setTimeout`, `setInterval`, `setImmediate`, I/O    | Lower      |

**Rule:** Har macrotask ke baad **saari** microtasks pehle khatam hoti hain.

---

## 5. Nested Microtasks

```js
Promise.resolve().then(() => {
  console.log("Micro 1");
  Promise.resolve().then(() => {
    console.log("Micro 2");
  });
});

setTimeout(() => console.log("Macro"), 0);

console.log("Sync");
```

**Output:**
```
Sync
Micro 1
Micro 2
Macro
```

Micro 2 bhi pehle chalega kyunki microtask queue tab tak empty nahi hui.

---

## 6. `async/await` bhi Microtask hai

```js
async function foo() {
  console.log("A");
  await Promise.resolve();
  console.log("B");
}

foo();
console.log("C");
```

**Output:**
```
A
C
B
```

`await` ke baad ka code microtask queue mein chala jata hai.

---

## 7. Visual Flow

```
┌───────────────────────────┐
│        Call Stack         │
└────────────┬──────────────┘
             │ empty?
             ▼
┌───────────────────────────┐
│     Microtask Queue       │  ← Pehle yeh khali karo
│  (Promises, queueMicrotask)│
└────────────┬──────────────┘
             │ empty?
             ▼
┌───────────────────────────┐
│     Macrotask Queue       │  ← Phir ek macrotask
│  (setTimeout, setInterval) │
└───────────────────────────┘
```

---

## 8. Hard Example (Interview Favorite)

```js
console.log("start");

setTimeout(() => console.log("timeout"), 0);

Promise.resolve()
  .then(() => {
    console.log("promise1");
    return Promise.resolve();
  })
  .then(() => console.log("promise2"));

console.log("end");
```

**Output:**
```
start
end
promise1
promise2
timeout
```

---

## 9. Common Interview Questions

**Q1. Event Loop kya hai?**  
→ Mechanism jo Call Stack empty hone pe Microtask/Macrotask queues se callbacks uthata hai.

**Q2. Microtask vs Macrotask?**  
→ Microtask (Promise) higher priority. Har macrotask se pehle saari microtasks chaliti hain.

**Q3. `setTimeout(..., 0)` turant kyun nahi chalta?**  
→ Macrotask queue mein jata hai. Stack + microtasks pehle clear hone chahiye.

**Q4. Promise `setTimeout` se pehle kyun chalta hai?**  
→ Promise microtask hai, setTimeout macrotask.

**Q5. `async/await` ka code kab chalta hai?**  
→ `await` ke baad ka hissa microtask queue mein jata hai.

**Q6. Infinite microtasks se kya hota hai?**  
→ Macrotasks kabhi nahi chalegi (starvation). UI freeze ho sakta hai.

**Q7. Browser rendering kab hota hai?**  
→ Macrotask ke baad, microtasks ke baad — render opportunity milti hai.

---

## Ek Line Summary (Interview mein bol dena)

> "JavaScript single-threaded hai. Event Loop Call Stack empty hone pe pehle saari Microtasks (Promises) chalata hai, phir ek Macrotask (setTimeout). Isliye Promise hamesha setTimeout se pehle chalta hai."
