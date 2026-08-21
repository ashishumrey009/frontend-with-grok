# React Chapter 02: Rendering Process + Diffing Algorithm

**Interviewer:** React rendering process aur diffing algorithm explain karo.

**Tum:**

"Render phase mein naya Virtual tree banta hai aur purane se diff hota hai. Commit phase mein sirf changes Real DOM pe apply hote hain. Diffing rules: alag type = replace, same type = update, lists = keys se match."

---

## 1. Overall Rendering Process

```text
Trigger (setState / props / parent re-render)
        |
        v
+-----------------------+
|   RENDER PHASE        |  <- calculation, DOM touch nahi
|  - Component function |
|  - Naya element tree  |
|  - Diff (reconcile)   |
+-----------+-----------+
            |
            v
+-----------------------+
|   COMMIT PHASE        |  <- Real DOM updates (sync)
|  - DOM mutations      |
|  - useLayoutEffect    |
|  - Browser paint      |
|  - useEffect          |
+-----------------------+
```

**Render** = kya dikhana hai calculate  
**Commit** = asli DOM pe laga do

---

## 2. Render Phase

1. Component function dobara chalta hai
2. JSX → createElement → naya React element tree
3. Purane tree se compare (diff / reconciliation)
4. Effect list: insert / update / delete

Yahan DOM change nahi. Fiber is phase ko pause/restart kar sakta hai.

---

## 3. Commit Phase

1. Changes Real DOM pe apply
2. `useLayoutEffect` (paint se pehle)
3. Browser paint
4. `useEffect` (paint ke baad)

Commit **sync** hai — interrupt nahi hota.

---

## 4. Diffing Algorithm (Reconciliation)

React O(n³) full tree compare nahi karta. Heuristics se ~O(n):

### Rule 1: Different type → replace tree

```jsx
// pehle
<div><Counter /></div>

// baad
<span><Counter /></span>
```

Type alag → purana unmount, naya mount. Child state lose ho sakti hai.

### Rule 2: Same type → update + recurse children

```jsx
// pehle
<div className="a" title="x" />

// baad
<div className="b" title="x" />
```

Sirf `className` update. DOM node reuse.

### Rule 3: Lists → keys se match

```jsx
// BAD - index key reorder pe bug
{items.map((item, i) => <Item key={i} />)}

// GOOD - stable id
{items.map((item) => <Item key={item.id} name={item.name} />)}
```

---

## 5. List Diffing

| Change | With keys |
|--------|-----------|
| Add end | Insert naya node |
| Remove | Delete us node |
| Reorder | Move (reuse) |
| Same key, props change | Update in place |

**Index as key** → reorder pe wrong state + extra DOM ops.

---

## 6. Mental Diagram

```text
Old tree          New tree
   A                 A
  / \               / \
 B   C             B   D
                    \
                     C

Diff: C move/update, D insert, B reuse
```

---

## 7. Rendering Types

| Type | Kab |
|------|-----|
| Initial render | Pehli baar mount |
| Re-render | State / props / context / parent |
| Reconciliation | Old vs new tree diff |
| Commit | DOM update |

Parent re-render → child default re-render (`React.memo` na ho).

---

## Interview Q&A

**Q1. Render vs Commit?**  
→ Render = Virtual tree + diff (interruptible). Commit = Real DOM apply (sync).

**Q2. Diffing algorithm ka basis?**  
→ Same type → update; different type → replace; lists → keys.

**Q3. Key kyun zaroori?**  
→ List items identity — correct reuse, state preserve, less DOM ops.

**Q4. Index key kab problem?**  
→ Reorder / middle insert → wrong state, unnecessary updates.

**Q5. Virtual DOM diff se kya bacha?**  
→ Full Real DOM rebuild nahi — sirf minimal patches.

**Q6. Component type change pe state kyun reset?**  
→ Type alag = unmount + mount.

---

## Ek Line Summary

> "Render phase = naya Virtual tree + diff. Commit = Real DOM update. Diffing: alag type = replace, same type = update, lists = keys — isliye ~O(n) aur minimal DOM changes."
