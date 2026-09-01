# Chapter 40: Map vs Set vs WeakMap

**Interviewer:** Object ki jagah Map kab? WeakMap kyun?

**Tum:**

"Map kisi bhi type ki key le sakta hai, insertion order rakhta hai. Set unique values. WeakMap keys sirf objects + weak ref — GC ho sakti hai, iterate nahi."

---

## Map vs Object

| | Object | Map |
|--|--------|-----|
| Keys | String / Symbol | Koi bhi (obj, fn, number) |
| Order | Integer keys special | Insertion order |
| Size | Manual | `.size` |
| Iterate | keys/values/entries | Direct iterable |
| Prototype keys | Collision risk | Clean |

```js
const m = new Map();
m.set("a", 1);
m.set({ id: 1 }, "objKey");
m.get("a"); // 1
m.has("a");
m.delete("a");
for (const [k, v] of m) {}
```

---

## Set

Unique values.

```js
const s = new Set([1, 1, 2]);
s.add(3);
s.has(2); // true
[...s]; // [1, 2, 3]
```

Use: unique list, visited nodes.

---

## WeakMap / WeakSet

```js
const wm = new WeakMap();
let obj = { name: "Ashish" };
wm.set(obj, "meta");
obj = null; // entry GC ho sakti hai
```

| | Map | WeakMap |
|--|-----|---------|
| Key | Any | Object only |
| Iterable | Haan | Nahi |
| size | Haan | Nahi |
| GC | Strong ref | Weak key |

**Use WeakMap:** private data, deep clone visited hash, DOM node metadata without leak.

---

## Interview Q&A

**Q1. Map vs Object?**  
→ Dynamic keys / non-string keys / frequent add-delete → Map.

**Q2. WeakMap kyun deep clone mein?**  
→ Circular track without memory leak.

**Q3. Set vs Array unique?**  
→ Set O(1) has. Array includes O(n).

---

## Ek Line Summary

> "Map = any-key dictionary. Set = unique values. WeakMap = object keys + GC friendly, no iterate."
