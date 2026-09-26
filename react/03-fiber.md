# React Chapter 03: Fiber Architecture

**Interviewer:** Fiber kya hai? Stack reconciler se kya problem thi?

**Tum:**

"Fiber React 16+ ka unit of work hai — har component/DOM node ka ek Fiber object, linked tree (child / sibling / return). Purana stack reconciler recursive tha, beech mein ruk nahi sakta tha, UI freeze. Fiber kaam ko chhote units mein todta hai: pause, resume, skip, prioritize. Isi se concurrent rendering possible hai."

---

## 1. Problem: Stack Reconciler (React 15)

Purana reconciler call stack pe recursive walk karta tha.

```text
render(A)
  render(B)
    render(C)
      render(D)   ← yahan 50ms lag gaye
    ...
```

- Beech mein **yield nahi** — browser paint / input wait kare
- Long tree = main thread block = typing/click lag
- Update ki **priority nahi** — animation aur click same queue

Isliye React 16 ne architecture replace ki: **Fiber**.

---

## 2. Fiber kya hai?

Do cheezein ek saath:

1. **Data structure** — har React element ka corresponding Fiber node
2. **Algorithm** — us tree pe incremental work loop

React element (jo `createElement` return karta hai) immutable description hai. Fiber uska **mutable work record** hai.

```text
Element (immutable)     Fiber (mutable, runtime)
type, props             type, props, state
                        child, sibling, return
                        flags, lanes, alternate
```

Typical Fiber fields (simplified):

```js
{
  type,           // 'div' | Function | Class
  key,
  child,          // pehla child fiber
  sibling,        // next sibling
  return,         // parent fiber
  pendingProps,
  memoizedProps,
  memoizedState,
  flags,          // Placement | Update | Deletion ...
  lanes,          // priority bits
  alternate,      // doosri tree ka counterpart
  stateNode,      // DOM node / class instance
}
```

Tree **linked list** hai, recursive stack nahi — isliye beech mein rok sakte ho.

```text
        App
       /   \
    Header  List
           /  |  \
         Item Item Item

App.child = Header
Header.sibling = List
List.child = Item1
Item1.sibling = Item2
har fiber.return = parent
```

---

## 3. Double buffering: current vs workInProgress

Do Fiber trees:

| Tree | Matlab |
|------|--------|
| **current** | Jo ab screen pe commit ho chuka |
| **workInProgress** | Jo is render mein ban raha hai |

Har fiber ka `alternate` doosri tree ke matching node pe point karta hai.

```text
current tree (screen)          workInProgress (render)
     A                              A'
    / \                            / \
   B   C                          B'  C'

commit ke baad: workInProgress → current
```

Fail / interrupt hua to current tree as-is rehta hai. Screen pe half-update nahi.

---

## 4. Work loop

Render phase Fiber pe **unit of work** process karti hai.

```text
while (nextUnitOfWork !== null && stillHaveTime) {
  nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
}
if (nextUnitOfWork !== null) {
  // time khatam — browser ko frame do, baad mein resume
  yield
} else {
  // tree complete → commit
}
```

`performUnitOfWork`:

1. **beginWork** — is fiber ko process, children schedule (tree **neeche**)
2. Child nahi bacha to **completeWork** — bubble up, sibling pe jao (tree **upar**)

```text
begin(A) → begin(B) → complete(B) → begin(C) → complete(C) → complete(A)
```

Time slice khatam → loop break, next frame pe wahi `nextUnitOfWork` se resume. Purana stack reconciler yahan stuck rehta.

---

## 5. Render interruptible, Commit nahi

Chapter 02 wahi two phases. Fiber unhe **enforce** karta hai:

| Phase | Interrupt? | Side effects |
|-------|------------|--------------|
| Render (begin/complete) | Haan | Nahi — sirf calculate |
| Commit | Nahi, sync | DOM + refs + layout effects |

Commit ke 3 sub-phases (order matter karta hai):

1. **Before mutation** — `getSnapshotBeforeUpdate`
2. **Mutation** — DOM insert/update/delete
3. **Layout** — `useLayoutEffect` / `componentDidMount` (paint se pehle)

Phir browser paint, phir **passive** = `useEffect`.

Isliye interviewer ko ye line bolo: *"Fiber render ko pause kar sakta hai, commit ko nahi — DOM kabhi half-updated nahi dikhna chahiye."*

---

## 6. Priority / Lanes

Har update ek **lane** (bitmask) pe chadh ti hai. Higher priority pehle.

Rough mental model (names evolve, idea same):

| Source | Priority feel |
|--------|----------------|
| User click / type / tap | High (discrete / urgent) |
| Default `setState` | Normal |
| `startTransition` / `useDeferredValue` | Low (transition) |
| Offscreen / hidden | Idle |

```jsx
import { startTransition } from "react";

// urgent — input turant
setQuery(e.target.value);

// non-urgent — list baad mein
startTransition(() => {
  setResults(filterHugeList(e.target.value));
});
```

Kaam chal raha ho low lane pe, click aa gaya → React **incomplete work discard / reuse** karke urgent update pehle complete karta hai. Yahi concurrent rendering ka point hai.

**Expiration:** zyada der pending lane eventually "expire" karke sync render force — starvation nahi.

---

## 7. Concurrent rendering — Fiber ke bina nahi

Concurrent mode koi alag algorithm nahi. Fiber ki ability:

- work **chunks** mein
- **yield** to browser
- **higher lane** ke liye in-progress render chhodna
- **double buffer** se screen consistent

`useTransition`, `useDeferredValue`, `Suspense` — ye sab Fiber work loop + lanes pe built hain.

---

## 8. Mental diagram (end-to-end)

```text
setState / click
    ↓
scheduleUpdateOnFiber (lane assign)
    ↓
ensureRootIsScheduled → work loop
    ↓
RENDER  (interruptible)
  beginWork / completeWork on workInProgress tree
  time out? yield, next frame resume
  higher lane? existing WIP chhod / reuse
    ↓
tree complete + no more urgent work
    ↓
COMMIT (sync)
  mutation → layout → paint → useEffect
    ↓
workInProgress becomes current
```

---

## Interview Q&A

**Q1. Fiber kya hai?**  
→ React 16+ architecture: har node ka mutable work unit (linked tree) + incremental work loop. Render interruptible units mein.

**Q2. Stack reconciler kyun hata?**  
→ Recursive, pause nahi, long updates main thread block, priority nahi.

**Q3. Fiber tree kaise linked hai?**  
→ `child` (first child), `sibling` (next), `return` (parent). Stack ki jagah pointers.

**Q4. `alternate` kya hota hai?**  
→ Double buffering — current fiber ka counterpart workInProgress pe (aur vice versa).

**Q5. Render interrupt ho sakta hai, commit kyun nahi?**  
→ Commit Real DOM mutate karta hai. Half DOM = broken UI. Isliye commit sync.

**Q6. Lane / priority kya karti hai?**  
→ Updates ko urgency bits. Click transition se pehle. `startTransition` low lane.

**Q7. Concurrent rendering Fiber se kaise aata hai?**  
→ Work loop yield karta hai, WIP tree screen nahi hai, high-priority update in-progress render ko preempt kar sakti hai.

**Q8. Fiber Virtual DOM se alag hai?**  
→ Element tree = Virtual DOM (immutable description). Fiber = uska runtime work graph. Related, same nahi.

**Q9. `key` Fiber mein kahan use?**  
→ Reconciliation: same parent ke children match. Key se Fiber reuse, state preserve.

**Q10. React 17 vs 18 Fiber?**  
→ Fiber 16 se. 18 ne concurrent features **default** kiye (`createRoot`, automatic batching, transitions). Architecture wahi.

---

## Ek Line Summary

> "Fiber = unit of work + linked tree. Stack reconciler recursive tha, freeze. Fiber render ko pause/resume/prioritize karta hai (lanes), commit sync rehta hai — isliye concurrent UI possible hai bina half-updated DOM ke."
