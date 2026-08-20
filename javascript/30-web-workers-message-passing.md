# Chapter 30: Web Workers + Message Passing

**Interviewer:** Web Workers aur message passing explain karo.

**Tum:**

"Web Worker alag background thread pe JS chalata hai taaki heavy kaam se UI freeze na ho. Main thread aur Worker **postMessage / onmessage** se baat karte hain."

---

## 1. Web Workers kya hain?

JavaScript main thread pe chalta hai. Heavy kaam se UI block ho sakta hai.

**Web Worker** = alag thread, bina UI block kiye.

```text
Main Thread (UI)  <-->  Message Passing  <-->  Worker Thread
```

---

## 2. Types

| Type | Use |
|------|-----|
| Dedicated Worker | Ek page / script ke liye |
| Shared Worker | Multiple tabs share |
| Service Worker | Network proxy, offline, push |

Focus: **Dedicated Worker + Message Passing**

---

## 3. Basic Setup

**main.js**
```js
const worker = new Worker("worker.js");

worker.postMessage({ type: "start", data: 1000000 });

worker.onmessage = (e) => {
  console.log("Result from worker:", e.data);
};

worker.onerror = (err) => {
  console.error("Worker error:", err.message);
};
```

**worker.js**
```js
self.onmessage = (e) => {
  const { type, data } = e.data;

  if (type === "start") {
    let sum = 0;
    for (let i = 0; i < data; i++) {
      sum += i;
    }
    self.postMessage({ result: sum });
  }
};
```

---

## 4. Message Passing

- `postMessage(data)` → doosri side bhejo
- `onmessage` / `addEventListener("message")` → receive
- Data **structured clone** se **copy** hota hai (default share nahi)
- Functions, DOM nodes transfer nahi ho sakte

```js
// Main → Worker
worker.postMessage({ name: "Ashish", nums: [1, 2, 3] });

// Worker → Main
self.postMessage({ done: true, value: 42 });
```

---

## 5. Transferable Objects (Zero-copy)

Bade `ArrayBuffer` pe copy mehnga. **Transfer** se ownership move — faster.

```js
const buffer = new ArrayBuffer(1024 * 1024); // 1MB

// Main → Worker (ownership transfer)
worker.postMessage(buffer, [buffer]);

// Ab main pe buffer detached
console.log(buffer.byteLength); // 0
```

**Worker:**
```js
self.onmessage = (e) => {
  const buf = e.data;
  // process...
  self.postMessage(buf, [buf]); // wapas transfer
};
```

---

## 6. Limits

| Cheez | Worker mein? |
|-------|----------------|
| postMessage / onmessage | ✅ |
| fetch, XHR | ✅ |
| setTimeout, Promise | ✅ |
| OffscreenCanvas | ✅ (modern) |
| DOM (`document`, `window`) | ❌ |
| alert / parent | ❌ |

Worker ke paas `self` hota hai, `window` nahi.

---

## 7. Terminate / Cleanup

```js
worker.terminate(); // main se band
worker = null;

// Worker ke andar:
self.close();
```

---

## 8. Inline Worker (Blob)

```js
const code = `
  self.onmessage = (e) => {
    self.postMessage(e.data * 2);
  };
`;

const blob = new Blob([code], { type: "application/javascript" });
const worker = new Worker(URL.createObjectURL(blob));

worker.postMessage(21);
worker.onmessage = (e) => console.log(e.data); // 42
```

---

## 9. Interview Questions

**Q1. Web Worker kya hai?**  
→ Background thread jahan heavy JS chala sakte ho bina main thread (UI) block kiye.

**Q2. Message passing kaise hoti hai?**  
→ `postMessage` se bhejo, `onmessage` se receive. Data structured clone se copy hota hai.

**Q3. Worker DOM access kyun nahi kar sakta?**  
→ Thread-safety. DOM single-threaded model pe based hai.

**Q4. Transferable objects kya hain?**  
→ ArrayBuffer etc. jinki ownership transfer hoti hai (zero-copy), copy nahi.

**Q5. Dedicated vs Shared Worker?**  
→ Dedicated = ek script. Shared = multiple tabs share kar sakte hain.

**Q6. Worker kab use karein?**  
→ Heavy computation, image processing, large JSON parse, crypto — UI smooth rakhne ke liye.

**Q7. postMessage mein functions kyun nahi bhej sakte?**  
→ Structured clone algorithm functions / DOM nodes support nahi karta.

---

## Ek Line Summary

> "Web Worker alag thread pe JS chalata hai. Main aur Worker postMessage / onmessage se baat karte hain. DOM access nahi milta. Bade binary data ke liye Transferable Objects use karo."
