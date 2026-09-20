# Machine Coding 01: Autocomplete / Typeahead

**Interviewer:** Search input banao — type karte hi suggestions aayein.

**Tum (pehle 2 min):**

"Debounced input, API se list, keyboard up/down/enter, stale response ignore, cache, loading + no results."

Time: 45 min. Pehle vanilla JS ya React — jo comfortable ho, ek complete version.

---

## 1. Requirements (interview mein pucho)

**Must**
- Input pe type → suggestions dropdown
- Min 2 characters ke baad search
- Debounce 300ms (har key pe API mat maaro)
- Click se select
- Arrow keys + Enter + Escape
- Loading / empty / error state

**Should**
- Out-of-order API (purana response late aaye toh ignore)
- Cache same query
- Outside click se close

**Nice**
- Highlight match
- Accessibility (`aria-activedescendant`)

Fake API (interview mein allowed):
```js
// https://dummyjson.com/products/search?q=phone
```

---

## 2. States

```text
query, results, loading, error, open, activeIndex
```

---

## 3. Debounce + Abort (race fix)

```js
function debounce(fn, delay) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}
```

Race: user type `app` phir `apple`. `app` ka response late aaye toh list galat.

**Fix:** `AbortController` + latest query check.

---

## 4. React version (interview mein yeh likhna)

```jsx
import { useEffect, useMemo, useRef, useState } from "react";

function debounce(fn, delay) {
  let t;
  const wrapped = (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
  wrapped.cancel = () => clearTimeout(t);
  return wrapped;
}

export default function Autocomplete() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const cache = useRef(new Map());
  const boxRef = useRef(null);

  const search = useMemo(
    () =>
      debounce(async (text, signal) => {
        if (text.trim().length < 2) {
          setResults([]);
          setLoading(false);
          return;
        }

        if (cache.current.has(text)) {
          setResults(cache.current.get(text));
          setLoading(false);
          setOpen(true);
          return;
        }

        try {
          const res = await fetch(
            `https://dummyjson.com/products/search?q=${encodeURIComponent(text)}`,
            { signal }
          );
          if (!res.ok) throw new Error("Failed");
          const data = await res.json();
          const list = (data.products || []).map((p) => p.title);
          cache.current.set(text, list);
          setResults(list);
          setOpen(true);
        } catch (e) {
          if (e.name !== "AbortError") setError("Could not fetch");
        } finally {
          setLoading(false);
        }
      }, 300),
    []
  );

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

    setLoading(true);
    search(query.trim(), controller.signal);
    return () => {
      controller.abort();
      search.cancel();
    };
  }, [query, search]);

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
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={boxRef} className="ac">
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length && setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Search products..."
        aria-autocomplete="list"
      />

      {loading && <div className="hint">Loading...</div>}
      {error && <div className="hint error">{error}</div>}

      {open && !loading && results.length === 0 && query.length >= 2 && (
        <div className="hint">No results</div>
      )}

      {open && results.length > 0 && (
        <ul className="list" role="listbox">
          {results.map((item, i) => (
            <li
              key={item + i}
              role="option"
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

**Note:** list item pe `onMouseDown` — `click` se pehle input blur ho jaata hai, dropdown band. `mousedown` pehle fire hota hai.

---

## 5. Minimal CSS

```css
.ac { position: relative; width: 320px; font-family: sans-serif; }
.ac input { width: 100%; padding: 8px; }
.list {
  position: absolute; left: 0; right: 0;
  margin: 0; padding: 0; list-style: none;
  border: 1px solid #ccc; background: #fff; max-height: 240px; overflow: auto;
}
.list li { padding: 8px; cursor: pointer; }
.list li.active, .list li:hover { background: #eee; }
.hint { font-size: 12px; color: #666; padding: 6px 0; }
.hint.error { color: crimson; }
```

---

## 6. Vanilla JS sketch (agar React na bole)

```js
const input = document.querySelector("#q");
const list = document.querySelector("#list");
let controller;

const run = debounce(async (q) => {
  controller?.abort();
  controller = new AbortController();
  const res = await fetch(
    `https://dummyjson.com/products/search?q=${encodeURIComponent(q)}`,
    { signal: controller.signal }
  );
  const data = await res.json();
  render(data.products.map((p) => p.title));
}, 300);

input.addEventListener("input", (e) => {
  const q = e.target.value.trim();
  if (q.length < 2) { list.innerHTML = ""; return; }
  run(q);
});
```

---

## 7. Interview mein yeh bolna (extra marks)

| Topic | Point |
|-------|--------|
| Debounce | 300ms, har key pe network nahi |
| AbortController | stale response ignore |
| Cache | Map query → results |
| Keyboard | a11y + power users |
| mousedown vs click | blur race |
| Min chars | useless 1-letter API save |
| Highlight | `split` + `<mark>` optional |

**Complexity:** debounce O(1) extra. Render O(n) suggestions.

---

## 8. Follow-up questions

**Q1. Debounce vs throttle yahan?**  
→ Debounce. Last key ke baad wait. Scroll pe throttle.

**Q2. Purana API late aaye?**  
→ Abort previous request. Ya `let latest = query` check after await.

**Q3. Cache unbounded?**  
→ LRU / max 50 keys.

**Q4. Server load?**  
→ Debounce + min length + cache + abort.

**Q5. Accessibility?**  
→ `role="listbox"`, `aria-activedescendant`, keyboard.

---

## Ek Line Summary

> "Autocomplete = debounce + fetch + abort stale + cache + keyboard + loading/empty. List item pe mousedown, click nahi."
