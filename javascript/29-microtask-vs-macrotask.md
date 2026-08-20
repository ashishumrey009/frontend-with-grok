# Chapter 29: Microtask vs Macrotask (Complete)

**Interviewer:** Microtask aur Macrotask mein farak batao.

**Tum:**

"Microtask high-priority tasks hain (jaise Promise), Macrotask low-priority tasks hain (jaise setTimeout). Event Loop pehle **saari microtasks** khatam karta hai, phir **ek macrotask** uthata hai."

---

## Quick Comparison

| Feature | Microtask | Macrotask |
|---------|-----------|-----------|
| Priority | **High** | Low |
| Queue clear | Saari ek saath | Ek time pe ek |
| Examples | Promise, queueMicrotask, MutationObserver | setTimeout, setInterval, setImmediate, I/O |
| UI block risk | Starvation se ho sakta hai | Normal |
| `setTimeout(0)` se pehle? | Haan | — |
| Browser render | Render se pehle | Render ke baad (generally) |

---

## Examples

**Microtask:**
- `Promise.then()` / `.catch()` / `.finally()`
- `queueMicrotask()`
- `MutationObserver`
- `process.nextTick` (Node.js — sabse pehle)
- `async/await` ke baad ka code

**Macrotask:**
- `setTimeout`
- `setInterval`
- `setImmediate` (Node.js)
- I/O callbacks
- UI events

---

## Order (yaad rakh)

```text
1. Sync code (Call Stack)
2. SAARI Microtasks     ← pehle yeh khatam
3. requestAnimationFrame (browser)
4. Browser Render
5. EK Macrotask
6. Phir se Microtasks check...  ← har macrotask ke baad dobara!
```

**Important:** Sirf script end pe nahi — **har** macrotask ke baad saari pending microtasks dubara chaliti hain.

---

## Classic Example

```js
console.log("1 - sync");

setTimeout(() => console.log("2 - macrotask"), 0);

Promise.resolve().then(() => console.log("3 - microtask"));

queueMicrotask(() => console.log("4 - microtask"));

console.log("5 - sync");
```

**Output:**
```
1 - sync
5 - sync
3 - microtask
4 - microtask
2 - macrotask
```

---

## 1. `async/await` bhi Microtask hai

```js
async function test() {
  console.log("A");
  await null;        // yahan se baad microtask
  console.log("B");
}

test();
console.log("C");

// Output: A → C → B
```

Log sochte hain async alag queue mein jata hai — nahi. `await` ke baad ka code **microtask** queue mein jata hai.

---

## 2. `fetch` kahan jata hai?

```js
fetch("/api/data")
  .then((res) => res.json())   // ← yeh microtask
  .then((data) => console.log(data));

setTimeout(() => console.log("timeout"), 0);
```

- Network part → Web API pe
- Response aate hi `.then` callbacks → **Microtask** queue
- Isliye `fetch().then(...)` bhi Promise jaisa behave karta hai (setTimeout se pehle, jab response aa chuka ho)

---

## 3. Hard Mixed Example ⭐

```js
console.log("start");

setTimeout(() => {
  console.log("timeout");
  Promise.resolve().then(() => console.log("promise inside timeout"));
}, 0);

Promise.resolve().then(() => {
  console.log("promise");
  setTimeout(() => console.log("timeout inside promise"), 0);
});

console.log("end");
```

**Output:**
```
start
end
promise
timeout
promise inside timeout
timeout inside promise
```

**Kyun?**
1. Sync: start, end
2. Microtask: promise (andar setTimeout schedule hua)
3. Macrotask: timeout → uske andar microtask: promise inside timeout
4. Macrotask: timeout inside promise

Ye clear karta hai: **macrotask ke andar bhi microtask pehle chalti hai.**

---

## 4. Starvation Example

```js
function infiniteMicrotask() {
  Promise.resolve().then(() => {
    console.log("Microtask!");
    infiniteMicrotask();
  });
}

infiniteMicrotask();
setTimeout(() => console.log("Timeout"), 0);

// "Timeout" kabhi nahi chalega — UI freeze!
```

---

## 5. Node.js: `process.nextTick` vs Promise

```js
setTimeout(() => console.log("timeout"), 0);

Promise.resolve().then(() => console.log("promise"));

process.nextTick(() => console.log("nextTick"));

// Output (Node):
// nextTick
// promise
// timeout
```

- `process.nextTick` → Promise se bhi **pehle** (special queue)
- Browser mein `nextTick` nahi hota

---

## 6. Kab kya use karein?

| Use case | Prefer |
|----------|--------|
| Turant baad, UI se pehle | Microtask (`queueMicrotask` / Promise) |
| Thoda delay / non-blocking | Macrotask (`setTimeout`) |
| Smooth animation | `requestAnimationFrame` |
| Heavy CPU without freeze | Web Worker |

---

## Important Points (Interview)

1. **Microtasks hamesha Macrotasks se pehle** chalte hain.
2. **Har** macrotask ke baad saari pending microtasks chaliti hain (sirf script end pe nahi).
3. Agar microtasks infinite banate raho (starvation) → macrotasks / UI kabhi nahi chalenge.
4. `setTimeout(..., 0)` bhi turant nahi chalta — macrotask queue mein jata hai.
5. `async/await` ke `await` ke baad ka code **microtask** hai.
6. `fetch().then` bhi microtask hai (response aane ke baad).

---

## Interview Q&A

**Q1. Microtask vs Macrotask?**  
→ Microtask = high priority (Promise). Macrotask = low priority (setTimeout). Pehle saari microtasks, phir ek macrotask.

**Q2. Promise setTimeout se pehle kyun chalta hai?**  
→ Promise microtask hai, setTimeout macrotask.

**Q3. `setTimeout(fn, 0)` turant kyun nahi chalta?**  
→ Macrotask queue mein jata hai. Stack + microtasks pehle clear hone chahiye.

**Q4. Infinite microtasks se kya hota hai?**  
→ Macrotasks starve ho jaate hain. UI freeze.

**Q5. `queueMicrotask` kya hai?**  
→ Direct microtask queue mein daalne ka tarika. Promise jaisa priority, bina Promise overhead ke.

**Q6. `async/await` ka code kis queue mein jata hai?**  
→ `await` ke baad ka hissa microtask queue mein.

**Q7. `fetch().then` microtask hai ya macrotask?**  
→ Microtask (Promise-based).

**Q8. Har macrotask ke baad kya hota hai?**  
→ Saari pending microtasks pehle chaliti hain, phir next macrotask / render.

**Q9. Node mein `process.nextTick` vs Promise?**  
→ `nextTick` Promise se bhi pehle chalta hai.

---

## Ek Line Summary

> "Microtask = high priority (Promise, async/await, fetch.then). Macrotask = low priority (setTimeout). Event Loop pehle **saari microtasks** khatam karta hai, phir **ek macrotask** — aur yeh cycle har macrotask ke baad repeat hoti hai."
