# Chapter 31: Service Worker Lifecycle

**Interviewer:** Service Worker lifecycle explain karo.

**Tum:**

"Service Worker browser ke peeche chalta hai — offline, cache, push ke liye. Iska lifecycle: Register → Install → Waiting → Activate → Active."

---

## Service Worker kya hai?

- Offline support
- Caching
- Push notifications
- Network requests intercept (`fetch`)

Web Worker se alag — page se independent, alag lifecycle.

---

## Lifecycle Flow

```text
register() → installing → installed (waiting)
                              ↓
                         activating → activated
                              ↓
                    fetch / push / sync events...
                              ↓
                         redundant (purana SW)
```

---

## 1. Register

```js
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js")
    .then((reg) => console.log("Registered:", reg.scope))
    .catch((err) => console.error("SW failed:", err));
}
```

Browser `sw.js` download karta hai. Scope = kis path pe control.

---

## 2. Install

```js
const CACHE = "v1";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => {
      return cache.addAll(["/", "/index.html", "/styles.css", "/app.js"]);
    })
  );

  // self.skipWaiting(); // optional: waiting skip
});
```

**`event.waitUntil(promise)`** — install tab tak complete nahi jab tak promise resolve na ho.

Is phase mein purana SW abhi pages control kar sakta hai. Naya SW **waiting** mein rehta hai.

---

## 3. Activate

```js
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE)
          .map((key) => caches.delete(key))
      );
    })
  );

  // self.clients.claim(); // optional: turant control
});
```

Activate pe: purani caches clean + clients claim.

---

## 4. Active — fetch / push

```js
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});

self.addEventListener("push", (event) => {
  const data = event.data?.json();
  event.waitUntil(
    self.registration.showNotification(data.title, { body: data.body })
  );
});
```

---

## Update Cycle

1. `sw.js` change → naya SW install
2. Naya **waiting** (purana active)
3. Tabs close / refresh → naya activate
4. Purana → redundant

**Turant update:**
```js
// install
self.skipWaiting();

// activate
self.clients.claim();
```

```js
// main.js
navigator.serviceWorker.addEventListener("controllerchange", () => {
  window.location.reload();
});
```

---

## States

| State | Matlab |
|-------|--------|
| installing | Download + install event |
| installed / waiting | Install done, purane SW ka wait |
| activating | Activate event |
| activated | fetch / push handle |
| redundant | Replace / fail |

---

## Diagram

```text
Page load
    |
    v
register("/sw.js")
    |
    v
+-------------+
| installing  |  <-- install event (cache assets)
+------+------+
       |
       v
+-------------+
|   waiting   |  <-- purana SW active toh wait
+------+------+
       |  (skipWaiting / tabs close)
       v
+-------------+
| activating  |  <-- activate (delete old cache)
+------+------+
       |
       v
+-------------+
|  activated  |  <-- fetch / push handle
+-------------+
```

---

## Interview Q&A

**Q1. Lifecycle phases?**  
→ Register → Install → Waiting → Activate → Active → Redundant

**Q2. `install` vs `activate`?**  
→ Install = cache new assets. Activate = purani cache clean, control lo.

**Q3. `waitUntil` kyun?**  
→ Async kaam khatam hone tak phase complete mat maano.

**Q4. `skipWaiting`?**  
→ Waiting skip — naya SW turant activate.

**Q5. `clients.claim`?**  
→ Bina refresh open pages pe naya SW control le.

**Q6. Update kab?**  
→ `sw.js` change → install → waiting → activate (tabs close / skipWaiting).

**Q7. Service Worker vs Web Worker?**  
→ Web Worker = heavy compute, page-linked. Service Worker = network proxy, offline, independent lifecycle.

---

## Ek Line Summary

> "Service Worker lifecycle: Register → Install (cache) → Waiting → Activate (cleanup) → Active (fetch/push). `waitUntil` se async complete karo. Update pe naya SW waiting rehta hai jab tak skipWaiting / refresh na ho."
