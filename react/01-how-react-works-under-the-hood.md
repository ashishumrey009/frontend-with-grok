# React Chapter 01: How React Works Under the Hood

**Interviewer:** React andar se kaise kaam karta hai?

**Tum:**

"JSX Babel se `React.createElement` ban jata hai → Virtual DOM tree. State change pe naya tree banta hai, purane se diff (reconciliation), phir sirf changes Real DOM pe commit hote hain. Fiber is process ko interruptible banata hai."

---

## 1. Surface pe kya dikhta hai

```jsx
function App() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

Andar 3 badi cheezein:
1. JSX → React elements
2. Virtual DOM + Diffing (Reconciliation)
3. Commit → Real DOM

---

## 2. JSX actually kya hai?

JSX browser nahi samajhta. Babel convert karta hai:

```jsx
// Tum likhte ho
const el = <h1 className="title">Hello</h1>;

// Babel convert
const el = React.createElement("h1", { className: "title" }, "Hello");
```

`createElement` ek **plain object** return karta hai (React element):

```js
{
  type: "h1",
  props: {
    className: "title",
    children: "Hello"
  }
}
```

Yahi Virtual DOM ka building block hai — asli DOM node nahi.

---

## 3. Virtual DOM kya hai?

UI ka lightweight JS representation (element tree).

```text
Real DOM     → slow, browser heavy
Virtual DOM  → fast JS objects, React memory mein
```

Har render pe React naya Virtual DOM tree banata hai.

---

## 4. Reconciliation (Diffing)

State/props change pe:

```text
1. Naya Virtual DOM tree (render phase)
2. Purane tree se compare (diff)
3. Sirf jo badla hai Real DOM pe (commit)
```

**Diffing rules:**

| Rule | Matlab |
|------|--------|
| Different `type` | Purana udao, naya banao (`div` → `span`) |
| Same `type` | Props update, children pe recursion |
| Lists | `key` se identify |

```jsx
{items.map((item) => (
  <li key={item.id}>{item.name}</li>
))}
```

React poora page re-create nahi karta — **minimum changes** Real DOM pe.

---

## 5. Fiber — Two Phases (React 16+)

**Render phase (async, interruptible)**
- Components call
- Naya Virtual tree + Diff
- Side-effects yahan nahi

**Commit phase (sync)**
- Real DOM update
- `useLayoutEffect` → paint se pehle
- Browser paint
- `useEffect` → paint ke baad

Isliye heavy trees pe bhi UI freeze kam — kaam chunks mein.

---

## 6. State update flow

```text
setCount(1)
    ↓
Schedule update (Fiber)
    ↓
Re-render component
    ↓
Naya React element tree
    ↓
Diff (reconciliation)
    ↓
Commit → Real DOM update
    ↓
useLayoutEffect → Paint → useEffect
```

`setState` turant DOM nahi badalta — **schedule** hota hai, batch ho sakta hai.

---

## 7. Mental model

```text
JSX
 ↓ (Babel)
React.createElement → Element objects (Virtual DOM)
 ↓ (render)
Component functions run → naya tree
 ↓ (reconcile)
Diff old vs new
 ↓ (commit)
Minimum Real DOM changes
```

---

## Interview Q&A

**Q1. Virtual DOM kya hai?**  
→ UI ka JS object tree. Real DOM se cheap compare + update ke liye.

**Q2. React DOM ko directly kyun nahi badalta?**  
→ Full DOM manip mehnga. Diff se sirf zaroori changes.

**Q3. Reconciliation kya hai?**  
→ Purana vs naya Virtual tree compare karke minimum DOM updates nikalna.

**Q4. `key` kyun zaroori hai?**  
→ Lists mein items identify — reorder/add/remove pe correct reuse.

**Q5. JSX browser mein kaise chalta hai?**  
→ Nahi. Babel `React.createElement` mein convert karta hai.

**Q6. Fiber kya hai?**  
→ React 16+ architecture — render interruptible units mein, prioritise updates.

**Q7. Render vs Commit phase?**  
→ Render = calculate kya change. Commit = Real DOM pe apply (sync).

---

## Ek Line Summary

> "JSX → createElement → Virtual DOM tree. State change pe naya tree, purane se diff (reconciliation), phir sirf changes Real DOM pe commit. Fiber is process ko chunked + prioritised banata hai."
