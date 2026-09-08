# React Chapter 06: Fiber Architecture

**Interviewer:** React Fiber kya hai? Stack reconciler se kya farak?

**Tum:**

"Fiber React 16+ ka reconciler hai. Har component/DOM node ka ek Fiber object hota hai. Kaam chhote units mein toot-ta hai — pause, resume, priority de sakte ho. Purana stack reconciler recursive tha, beech mein rok nahi sakte the — UI freeze."

---

## 1. Problem (React 15 — Stack Reconciler)

```text
render(App)
  → render(Header)
    → render(Nav)
  → render(Feed)   // 1000 items, 50ms+
    → ... recursive, stack pe atka
```

- Recursive call stack
- Beech mein **interrupt nahi**
- Badi tree → main thread block → typing/scroll lag
- High priority (click) wait kare low priority (list render) ke peeche

---

## 2. Fiber kya hai?

**Fiber** = ek unit of work + ek node ka internal object.

Har React element ke peeche ek Fiber:

```js
{
  type: "div",           // ya function / class
  key: "a",
  pendingProps: {...},
  memoizedProps: {...},
  memoizedState: {...},  // hooks yahin linked list
  return: parentFiber,
  child: firstChild,
  sibling: nextSibling,
  alternate: otherTree,  // current <-> workInProgress
  flags: /* Placement | Update | Deletion */,
  lanes: /* priority bits */
}
```

Tree linked list jaisi:

```text
App
 |
 child → Header — sibling → Feed — sibling → Footer
             |
           child → Logo
```

`child` / `sibling` / `return` se React tree walk karta hai **bina deep recursion ke** — loop se.

---

## 3. Double buffering — current vs workInProgress

Do trees:

| Tree | Matlab |
|------|--------|
| **current** | Screen pe jo committed hai |
| **workInProgress** | Naya tree jo build ho raha hai |

`fiber.alternate` doosri tree ka pair.

Render phase WIP tree banata hai. Commit pe pointer swap — WIP **current** ban jaati hai.

Isliye incomplete render discard kar sakte ho (user naya click kar de) — screen half-updated nahi dikhti.

---

## 4. Two phases (yaad rakh)

```text
setState / props change
        |
        v
+---------------------------+
| RENDER (interruptible)    |
|  Fiber walk               |
|  Component functions call |
|  Diff / flags mark        |
|  Pause if browser busy    |
+-------------+-------------+
              |
              v
+---------------------------+
| COMMIT (sync, must finish)|
|  DOM mutations            |
|  useLayoutEffect          |
|  paint                    |
|  useEffect                |
+---------------------------+
```

**Render** = kya change (DOM touch nahi, theoretically pause-able)  
**Commit** = Real DOM apply (interrupt mat karo — UI inconsistent ho jaaye)

---

## 5. Unit of work + time slicing

```text
while (nextFiber && timeRemaining()) {
  nextFiber = performUnitOfWork(nextFiber);
}
// time khatam? control browser ko do (input, paint)
// baad mein wapas aake resume
```

`performUnitOfWork`:
1. Is fiber pe kaam (component run / diff)
2. Child ho toh child next
3. Warna sibling
4. Warna parent pe wapas (`completeWork`)

Yahi **incremental rendering** hai.

---

## 6. Priority / Lanes

Har update ko lane (priority bit) milti hai.

| Example | Priority feeling |
|---------|------------------|
| User typing, click | High |
| Data fetch result | Medium |
| Offscreen / transition | Low |

High priority aa jaaye toh low wala WIP **discard / reuse** karke pehle urgent kaam.

`startTransition` / `useTransition` → update ko low priority mark.

```jsx
startTransition(() => {
  setQuery(value); // urgent nahi — list filter laggy nahi karega input ko
});
```

---

## 7. Hooks Fiber pe kaise rehte hain

```text
FunctionFiber.memoizedState → hook0 → hook1 → hook2 → null
```

Har hook node: `{ memoizedState, queue, next }`

Render pe React is list ko order se walk karta hai — wahi polyfill wala `cursor`, bas array ki jagah linked list.

---

## 8. Fiber vs Stack — comparison

| | Stack (v15) | Fiber (v16+) |
|--|-------------|--------------|
| Walk | Recursion | Loop + linked list |
| Pause | Nahi | Haan (render phase) |
| Priority | Nahi | Lanes |
| Incomplete work | Nahi chhod sakte | Discard / reuse WIP |
| Error | Pura tree toot sakta | Error boundaries |
| Fragments / portals / suspense | Limited | First-class |

---

## 9. Mental diagram

```text
Update
  → schedule (lane)
  → work loop (fiber by fiber)
  → build workInProgress tree + effect list
  → (maybe pause... resume)
  → commit: apply DOM + run layout effects + paint + passive effects
```

---

## Interview Q&A

**Q1. Fiber kya hai?**  
→ Internal node + unit of work. Reconciler ko incremental / prioritized banata hai.

**Q2. Kyun banaya?**  
→ Stack reconciler block karta tha. Animation + input smooth rakhne ke liye pause/resume + priority.

**Q3. Render vs Commit?**  
→ Render interruptible calculation. Commit sync DOM + effects.

**Q4. `alternate` kya hai?**  
→ current tree aur WIP tree ke beech pairing (double buffer).

**Q5. Hooks Fiber se kaise jude?**  
→ Function fiber ke `memoizedState` pe linked list.

**Q6. Concurrent React Fiber ke bina possible?**  
→ Nahi. Time slicing + lanes Fiber pe built hain.

**Q7. Fiber Virtual DOM hai?**  
→ Related but not same. Virtual DOM = element tree description. Fiber = uska runtime bookkeeping (state, position, work, priority).

---

## Ek Line Summary

> "Fiber = linked-list unit of work. Render phase pause/resume + priority (lanes). Commit phase sync DOM. Isliye React 16+ concurrent features — transitions, Suspense — possible hue."
