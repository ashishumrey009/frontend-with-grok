# Chapter 29: Microtask vs Macrotask

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
6. Phir se Microtasks check...
```

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

**Kyun?**  
Sync pehle → phir saari microtasks → last mein macrotask.

---

## Important Points (Interview)

1. **Microtasks hamesha Macrotasks se pehle** chalte hain.
2. Ek macrotask ke baad **saari** pending microtasks chaliti hain.
3. Agar microtasks infinite banate raho (starvation) → macrotasks / UI kabhi nahi chalenge.
4. `setTimeout(..., 0)` bhi turant nahi chalta — macrotask queue mein jata hai.
5. `async/await` ke `await` ke baad ka code **microtask** hai.

---

## Starvation Example

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

---

## Ek Line Summary

> "Microtask = high priority (Promise). Macrotask = low priority (setTimeout). Event Loop pehle **saari microtasks** khatam karta hai, phir **ek macrotask** uthata hai."
