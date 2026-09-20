# Machine Coding 01: Autocomplete / Typeahead

**Interviewer:** Search input banao — type karte hi suggestions aayein.

Time: 45 min. React comfortable ho toh React, warna vanilla.

---

## LIVE INTERVIEW — Tum kya karoge (step by step)

Soch: interviewer dekh raha hai. **Pehle bol, phir likh.** Poora perfect component ek saath mat ghumao.

### Minute 0–5 — Baat karo, code mat chhedo

**Bol:**

"Pehle requirements lock karte hain, phir working happy path, phir edge cases."

**Pucho (zaroor):**
1. Data kahan se? Local list ya API?
2. Kitne character ke baad search?
3. Debounce kitna?
4. Keyboard chahiye?
5. Multi-select ya single?

Agar woh vague ho toh **assume** karke bol do:

"Main assume karta hoon: API search, min 2 chars, debounce 300ms, single select, mouse + keyboard."

**Whiteboard / comments mein yeh likh:**

```text
UI: input + dropdown
States: query, results, loading, error, open, activeIndex
Flow: type → wait 300ms → fetch → list → click/enter select
```

Yeh 2 minute interviewer ko confidence deta hai ki tum plan jaante ho.

---

### STEP 1 — Skeleton UI (5 min)

Sirf dikhne laga do. API nahi.

**Bol:** "Pehle controlled input aur dummy list — structure lock."

```jsx
function Autocomplete() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
      />
      {open && (
        <ul>
          {results.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

Thoda CSS: `position: relative` parent, list `absolute`.

**Interviewer ko dikhao:** input type ho raha hai. Dropdown abhi empty — theek hai.

---

### STEP 2 — Fake / real fetch, bina debounce (8 min)

**Bol:** "Ab type pe data laata hoon. Debounce baad mein — pehle happy path."

```jsx
useEffect(() => {
  if (query.trim().length < 2) {
    setResults([]);
    setOpen(false);
    return;
  }

  fetch(`https://dummyjson.com/products/search?q=${query}`)
    .then((r) => r.json())
    .then((data) => {
      setResults(data.products.map((p) => p.title));
      setOpen(true);
    });
}, [query]);
```

**Demo:** `ph` type karo — list aayi.  
Yahan ruk ke bolo: "Kaam kar raha hai, lekin har key pe API — debounce lagata hoon."

---

### STEP 3 — Debounce (5 min)

**Bol:** "User rukne ke 300ms baad hi call. Warna 10 letters = 10 requests."

Do tarike, jo easy lage:

**A. Timer wala (simple, interview-safe)**

```jsx
useEffect(() => {
  if (query.trim().length < 2) {
    setResults([]);
    setOpen(false);
    return;
  }

  const t = setTimeout(() => {
    fetch(...).then(...);
  }, 300);

  return () => clearTimeout(t);
}, [query]);
```

Cleanup = debounce. Har nayi key purana timer cancel.

**Demo:** jaldi type karo — ek hi request jaani chahiye (Network tab).

---

### STEP 4 — Loading + empty + error (4 min)

**Bol:** "User ko feedback dena hai."

```jsx
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

// fetch se pehle
setLoading(true);
setError("");

// success
setLoading(false);

// catch
setError("Failed");
setLoading(false);
```

JSX:
```jsx
{loading && <p>Loading...</p>}
{error && <p>{error}</p>}
{open && !loading && results.length === 0 && query.length >= 2 && (
  <p>No results</p>
)}
```

---

### STEP 5 — Click se select (3 min)

**Bol:** "Item click pe query set, list band."

```jsx
function select(item) {
  setQuery(item);
  setOpen(false);
}

<li onMouseDown={() => select(item)}>{item}</li>
```

**Zaroori bolna:**
"`onClick` nahi — input blur pe list unmount ho jaati hai, click miss. `onMouseDown` pehle fire hota hai."

Yeh line extra marks.

---

### STEP 6 — Race condition (5 min) ⭐ interviewer yahi pakdega

**Bol:**
"User `app` type kare phir `apple`. Agar `app` ka response late aaya toh galat list. Purani request abort karta hoon."

```jsx
useEffect(() => {
  const controller = new AbortController();

  const t = setTimeout(async () => {
    try {
      const res = await fetch(url, { signal: controller.signal });
      const data = await res.json();
      setResults(data.products.map((p) => p.title));
    } catch (e) {
      if (e.name !== "AbortError") setError("Failed");
    }
  }, 300);

  return () => {
    clearTimeout(t);
    controller.abort();
  };
}, [query]);
```

Cleanup mein **abort + clearTimeout** dono.

---

### STEP 7 — Keyboard (5 min)

**Bol:** "ArrowDown / Up highlight, Enter select, Escape close."

```jsx
const [active, setActive] = useState(-1);

function onKeyDown(e) {
  if (!open || results.length === 0) return;
  if (e.key === "ArrowDown") {
    e.preventDefault();
    setActive((i) => (i + 1) % results.length);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    setActive((i) => (i <= 0 ? results.length - 1 : i - 1));
  } else if (e.key === "Enter" && active >= 0) {
    select(results[active]);
  } else if (e.key === "Escape") {
    setOpen(false);
  }
}
```

Active item pe class `active` (background).
Query change pe `setActive(-1)`.

---

### STEP 8 — Time bache toh (bonus, order yahi)

1. Cache: `useRef(new Map())` — same query dubara fetch mat karo
2. Outside click: `mousedown` document pe, box ke bahar toh close
3. `encodeURIComponent(query)`
4. `res.ok` check (fetch 404 reject nahi karta)

Time na bache toh **bol dena**, mat atakna:

"Cache aur outside-click next add karta — approach yeh hai: Map mein query→results, document listener se close."

Interviewer approach sun ke khush hota hai even without code.

---

## Timebox (45 min)

| Min | Kaam |
|-----|------|
| 0–5 | Requirements + plan bolna |
| 5–10 | UI skeleton |
| 10–18 | Fetch happy path |
| 18–23 | Debounce |
| 23–27 | Loading / empty / error |
| 27–30 | Select (mousedown) |
| 30–35 | Abort race |
| 35–40 | Keyboard |
| 40–45 | Bonus + explain |

Agar 20 min mein happy path nahi dikha — debounce/keyboard chhod, pehle list dikhao.

---

## Interviewer ke saamne mat karna

- 10 minute silent coding
- Pehle debounce + cache + a11y ek saath
- Perfect CSS
- Library (`lodash.debounce`) bina poochhe — khud 5 line likh do
- `innerHTML` user query se (XSS)

**Karte rehna:** har step ke baad 10 second demo + ek line "ab next X".

---

## Full code (end goal)

Neeche wala tab likhna jab steps 1–7 done hon — copy-paste start mat karna interview mein.

```jsx
import { useEffect, useRef, useState } from "react";

export default function Autocomplete() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const cache = useRef(new Map());
  const boxRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    setError("");
    setActive(-1);

    if (query.trim().length < 2) {
      setResults([]);
      setOpen(false);
      setLoading(false);
      return () => controller.abort();
    }

    if (cache.current.has(query.trim())) {
      setResults(cache.current.get(query.trim()));
      setOpen(true);
      setLoading(false);
      return () => controller.abort();
    }

    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://dummyjson.com/products/search?q=${encodeURIComponent(query.trim())}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        const list = (data.products || []).map((p) => p.title);
        cache.current.set(query.trim(), list);
        setResults(list);
        setOpen(true);
      } catch (e) {
        if (e.name !== "AbortError") setError("Could not fetch");
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    const onDoc = (e) => {
      if (!boxRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function select(item) {
    setQuery(item);
    setOpen(false);
    setActive(-1);
  }

  function onKeyDown(e) {
    if (!open || results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i <= 0 ? results.length - 1 : i - 1));
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      select(results[active]);
    } else if (e.key === "Escape") setOpen(false);
  }

  return (
    <div ref={boxRef} className="ac">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length && setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Search products..."
      />
      {loading && <div className="hint">Loading...</div>}
      {error && <div className="hint error">{error}</div>}
      {open && !loading && results.length === 0 && query.length >= 2 && (
        <div className="hint">No results</div>
      )}
      {open && results.length > 0 && (
        <ul className="list">
          {results.map((item, i) => (
            <li
              key={item + i}
              className={i === active ? "active" : ""}
              onMouseDown={() => select(item)}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

```css
.ac { position: relative; width: 320px; font-family: sans-serif; }
.ac input { width: 100%; padding: 8px; }
.list {
  position: absolute; left: 0; right: 0; margin: 0; padding: 0;
  list-style: none; border: 1px solid #ccc; background: #fff;
  max-height: 240px; overflow: auto;
}
.list li { padding: 8px; cursor: pointer; }
.list li.active, .list li:hover { background: #eee; }
.hint { font-size: 12px; color: #666; padding: 6px 0; }
.hint.error { color: crimson; }
```

---

## Follow-up (wo poochhega, tum ready raho)

**Q. Debounce vs throttle?**  
→ Yahan debounce. Last pause ke baad search.

**Q. Purana response late?**  
→ AbortController cleanup.

**Q. Click kaam nahi kar raha?**  
→ Blur vs click — `onMouseDown`.

**Q. Cache leak?**  
→ Max 50 keys / LRU.

---

## Ek Line Summary

> "Plan bol → skeleton → fetch → debounce → states → select → abort → keyboard. Har step demo. Silent mat baith."
