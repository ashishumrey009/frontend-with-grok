# Chapter 28: Event Loop (Complete + Interview Ready)

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
  2. Phir requestAnimationFrame (Browser)
  3. Browser Render
  4. Phir EK Macrotask
  5. Phir phir se Microtasks check
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

## 5. `queueMicrotask` — Direct Microtask

```js
queueMicrotask(() => {
  console.log("Direct microtask!");
});

Promise.resolve().then(() => {
  console.log("Promise microtask!");
});

console.log("Sync!");

// Output:
// Sync!
// Direct microtask!
// Promise microtask!

// Jo pehle register hua → pehle chala!
// Kab use: Jab Promise overhead nahi chahiye but microtask timing chahiye!
```

---

## 6. `requestAnimationFrame` — Browser Rendering

```js
console.log("1 - sync");

setTimeout(() => console.log("2 - timeout"), 0);

Promise.resolve().then(() => console.log("3 - promise"));

requestAnimationFrame(() => console.log("4 - rAF"));

console.log("5 - sync");

// Output:
// 1 - sync
// 5 - sync
// 3 - promise    ← microtask
// 4 - rAF        ← render se pehle!
// 2 - timeout    ← macrotask

// Order: Sync → Microtasks → rAF → Render → Macrotask
```

**Animation ke liye:**
```js
// BAD - setInterval
setInterval(() => {
  element.style.left = x + "px";
  x++;
}, 16);

// GOOD - rAF
function animate() {
  element.style.left = x + "px";
  x++;
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
```

---

## 7. Starvation — Real Problem!

```js
// Infinite microtasks = Macrotask kabhi nahi chalega!

function infiniteMicrotask() {
  Promise.resolve().then(() => {
    console.log("Microtask!");
    infiniteMicrotask(); // dobara queue mein!
  });
}

infiniteMicrotask();
setTimeout(() => console.log("Timeout"), 0);

// Output: Microtask! Microtask! ... infinite!
// "Timeout" KABHI NAHI CHALEGA! ❌ UI freeze!
```

---

## 8. `setTimeout` vs `setInterval`

```js
// PROBLEM with setInterval:
setInterval(() => {
  heavyWork(); // agar 200ms leta hai, interval 100ms hai?
}, 100);
// Queue mein callbacks pile up! Memory leak + unpredictable timing!

// BETTER: Recursive setTimeout
function repeat() {
  heavyWork(); // pehle kaam karo
  setTimeout(repeat, 100); // phir schedule karo
}
repeat(); // ✅ No pile up!
```

---

## 9. Nested Microtasks + `async/await`

```js
Promise.resolve().then(() => {
  console.log("Micro 1");
  Promise.resolve().then(() => {
    console.log("Micro 2");
  });
});

setTimeout(() => console.log("Macro"), 0);
console.log("Sync");

// Output: Sync → Micro 1 → Micro 2 → Macro
```

```js
async function foo() {
  console.log("A");
  await Promise.resolve();
  console.log("B");
}

foo();
console.log("C");

// Output: A → C → B
// await ke baad ka code microtask queue mein jata hai
```

---

## 10. Hard Interview Question ⭐

```js
async function async1() {
  console.log("async1 start");    // 2
  await async2();
  console.log("async1 end");      // 6
}

async function async2() {
  console.log("async2");          // 3
}

console.log("script start");        // 1

setTimeout(() => {
  console.log("setTimeout");      // 8
}, 0);

async1();

new Promise((resolve) => {
  console.log("promise1");        // 4
  resolve();
}).then(() => {
  console.log("promise2");        // 7
});

console.log("script end");          // 5

// Output:
// script start
// async1 start
// async2
// promise1
// script end
// async1 end
// promise2
// setTimeout
```

---

## 11. Promise.resolve() vs then mein Promise return

```js
Promise.resolve()
  .then(() => {
    console.log("1");
    return Promise.resolve(); // ← extra tick!
  })
  .then(() => console.log("2"));

Promise.resolve()
  .then(() => console.log("3"))
  .then(() => console.log("4"));

// Output:
// 1
// 3
// 4  ← "2" se pehle!
// 2  ← extra microtask (unwrap) ki wajah se!

// Interview: "Jab then() mein Promise return karo
// toh ek extra microtask lagti hai unwrapping ke liye!"
```

---

## 12. Node.js Event Loop (Agar Poochha)

```js
// Node.js phases:
// 1. timers        → setTimeout, setInterval
// 2. pending       → I/O callbacks
// 3. idle/prepare  → internal
// 4. poll          → naye I/O events
// 5. check         → setImmediate (Node only!)
// 6. close         → cleanup

// I/O callback ke andar:
fs.readFile("file.txt", () => {
  setTimeout(() => console.log("timeout"), 0);
  setImmediate(() => console.log("immediate"));
  // Output: HAMESHA immediate pehle! (check phase after poll)
});

// process.nextTick → Promise se bhi pehle!
process.nextTick(() => console.log("nextTick"));
Promise.resolve().then(() => console.log("promise"));
// nextTick pehle! Special priority!
```

---

## Event Loop Diagram (Clean)

```text
+--------------------------------------+
|            CALL STACK                |
|   console.log(), functions, etc.     |
+------------------+-------------------+
                   |
                   |  Stack empty?
                   v
+--------------------------------------+
|         MICROTASK QUEUE              |
|  Promise.then                        |
|  queueMicrotask                      |
|  MutationObserver                    |
|  process.nextTick (Node)             |
|                                      |
|  >>> SAARI microtasks khatam karo    |
+------------------+-------------------+
                   |
                   |  Queue empty?
                   v
+--------------------------------------+
|     requestAnimationFrame (rAF)      |
|     (Browser only)                   |
|                                      |
|  >>> Render se PEHLE chalta hai      |
+------------------+-------------------+
                   |
                   v
+--------------------------------------+
|         BROWSER RENDER               |
|     Paint + Layout + Composite       |
+------------------+-------------------+
                   |
                   v
+--------------------------------------+
|         MACROTASK QUEUE              |
|  setTimeout                          |
|  setInterval                         |
|  setImmediate (Node)                 |
|  I/O callbacks                       |
|                                      |
|  >>> Sirf EK macrotask uthao         |
+------------------+-------------------+
                   |
                   |
                   +-----> Loop wapas Call Stack pe
```

**Simple Order yaad rakh:**

```text
Sync Code
   ↓
Saari Microtasks
   ↓
rAF (animation)
   ↓
Browser Render
   ↓
Ek Macrotask
   ↓
(dobara Microtasks check...)
```

---

## Complete Interview Q&A

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
→ Microtasks ke baad, Macrotask se pehle.

**Q8. `queueMicrotask` kya hai?**  
→ Direct microtask queue mein daalo. Promise banane ki zarurat nahi. Same priority as Promise.then.

**Q9. `requestAnimationFrame` kab chalta hai?**  
→ Microtasks ke baad, Browser render se pehle, Macrotask se pehle. Animations ke liye best!

**Q10. Microtask starvation kya hai?**  
→ Infinite microtasks se macrotasks kabhi nahi chalte! UI freeze.

**Q11. `setInterval` ki problem kya hai?**  
→ Heavy kaam ho toh callbacks pile up. Recursive `setTimeout` better hai.

**Q12. `then()` mein Promise return karne se kya fark?**  
→ Extra microtask lagti hai unwrap ke liye. Order unexpected lag sakta hai.

**Q13. Node.js mein `setImmediate` vs `setTimeout`?**  
→ I/O callback ke andar: setImmediate pehle (check phase). Bahar: unpredictable.

**Q14. `process.nextTick` kya hai?**  
→ Node.js only! Promise se bhi pehle chalta hai. Special microtask queue.

---

## Ek Line Summary (Interview mein bol dena)

> "Event Loop: Sync → Microtasks (saari) → rAF → Render → Macrotask (ek) → repeat! Promise = microtask (high priority), setTimeout = macrotask (low priority), rAF = render cycle se tied. Infinite microtasks = UI freeze! Recursive setTimeout > setInterval!"
