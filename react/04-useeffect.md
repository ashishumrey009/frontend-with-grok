# React Chapter 04: useEffect

**Interviewer:** useEffect kab chalta hai? Cleanup? Dependency array?

**Tum:**

"useEffect render ke baad side-effects ke liye — fetch, subscription, DOM. Dependency array decide karti hai kab dubara chale. Return function cleanup hai (unmount + deps change se pehle)."

---

## 1. Basic

```jsx
import { useEffect, useState } from "react";

function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then(setUsers);
  }, []); // mount pe ek baar

  return users.map((u) => <div key={u.id}>{u.name}</div>);
}
```

Paint ke **baad** chalta hai (commit ke baad). Layout measure ke liye `useLayoutEffect`.

---

## 2. Dependency array

| Deps | Kab chale |
|------|-----------|
| `[]` | Sirf mount |
| nahi diya | Har render (almost hamesha galat) |
| `[id]` | `id` change pe |

```jsx
useEffect(() => {
  document.title = `Count ${count}`;
}, [count]);
```

---

## 3. Cleanup

```jsx
useEffect(() => {
  const id = setInterval(() => console.log("tick"), 1000);
  return () => clearInterval(id);
}, []);
```

```jsx
useEffect(() => {
  const controller = new AbortController();
  fetch(url, { signal: controller.signal })
    .then((r) => r.json())
    .then(setData)
    .catch((e) => {
      if (e.name !== "AbortError") console.error(e);
    });
  return () => controller.abort();
}, [url]);
```

Cleanup: unmount + next effect se **pehle** (deps change).

---

## 4. Stale closure

```jsx
useEffect(() => {
  const id = setInterval(() => {
    setCount((c) => c + 1); // prev updater ✅
  }, 1000);
  return () => clearInterval(id);
}, []);
```

`setCount(count + 1)` empty deps ke saath hamesha 0+1.

---

## 5. Common pitfalls

- Object/array deps har render naya ref → infinite loop
- `useEffect` ke andar setState → extra render; sync derive mat karo effect se
- Strict Mode (dev) effect **2 baar** mount — cleanup zaroori

```jsx
// BAD infinite
useEffect(() => {
  setUser({ ...user, seen: true });
}, [user]);
```

---

## 6. useEffect vs useLayoutEffect

| | useEffect | useLayoutEffect |
|--|-----------|-----------------|
| Timing | Paint ke baad | DOM update ke baad, paint se pehle |
| Use | Fetch, log, subscribe | Measure DOM, prevent flicker |

---

## Interview Q&A

**Q1. useEffect kab run?**  
→ Commit + paint ke baad. Deps change pe dubara.

**Q2. Cleanup kyun?**  
→ Leak avoid: timer, listener, fetch abort.

**Q3. [] vs no deps?**  
→ `[]` mount. No array = har render.

**Q4. Strict Mode double effect?**  
→ Dev only — cleanup test. Production ek baar.

**Q5. Data fetch race?**  
→ AbortController ya ignore flag cleanup mein.

---

## Ek Line Summary

> "useEffect = render ke baad side effect. Deps = kab chale. Return = cleanup. Fetch pe abort. State updates functional updater se stale mat hone do."
