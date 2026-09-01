# React Chapter 03: useState

**Interviewer:** useState kaise kaam karta hai? Batches? Stale state?

**Tum:**

"useState component ko local state deta hai. setState value replace nahi karta turant — update schedule hota hai, re-render trigger. Object/array ko naya reference dena padta hai. Functional updater stale state avoid karta hai."

---

## 1. Basic

```jsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      {count}
    </button>
  );
}
```

- `count` current value
- `setCount` update schedule + re-render
- Initial value sirf **pehli render** pe use

---

## 2. Lazy initial state

Expensive calculate ho toh function do — ek baar chalega:

```jsx
const [data, setData] = useState(() => JSON.parse(bigJson));
```

`useState(JSON.parse(bigJson))` har render parse karega — galat.

---

## 3. Functional updater (stale state fix)

```jsx
// BAD — same snapshot
setCount(count + 1);
setCount(count + 1); // ab bhi +1, +2 nahi

// GOOD
setCount((prev) => prev + 1);
setCount((prev) => prev + 1); // +2
```

Async / multiple updates / setTimeout andar **hamesha prev =>**.

---

## 4. Objects / arrays — immutable update

```jsx
const [user, setUser] = useState({ name: "Ashish", age: 25 });

// BAD — mutate
user.age = 26;
setUser(user); // same ref, re-render skip ho sakta

// GOOD
setUser({ ...user, age: 26 });
setUser((prev) => ({ ...prev, age: 26 }));
```

```jsx
setItems((prev) => [...prev, newItem]);
setItems((prev) => prev.filter((x) => x.id !== id));
```

---

## 5. Batching

React 18+ events, timeouts, promises — updates **batch**:

```jsx
setA(1);
setB(2);
// ek re-render
```

Turant alag render chahiye rare — `flushSync` (almost kabhi nahi).

---

## 6. State up vs derived

```jsx
// derived — extra state mat banao
const [first, last] = useState("");
const full = `${first} ${last}`;
```

Jo already state se nikal sake woh alag state nahi.

---

## Interview Q&A

**Q1. setState turant value badalta hai?**  
→ Nahi. Schedule. Next render pe naya value.

**Q2. Stale state kya hai?**  
→ Closure purani `count` pakde. Fix: `setCount(prev => prev + 1)`.

**Q3. Object mutate karke set?**  
→ Same reference — React change detect nahi kar sakta.

**Q4. useState(expensive()) vs () => ?**  
→ Function form lazy init — mount pe ek baar.

**Q5. Kitne useState?**  
→ Related fields ek object, independent alag. Over-nest mat karo.

---

## Ek Line Summary

> "useState local state + re-render. setState async/batched. Objects spread se naya ref. Multiple updates pe functional updater."
