# Chapter 6: Closure Memory Leaks – Deep Dive

## 1. Why Closures Can Cause Memory Leaks

A **memory leak** happens when memory that is no longer needed is still held by the program and cannot be freed by the garbage collector.

Closures are a common source of leaks because:

- A closure keeps a **reference** to its outer Lexical Environment.
- As long as the inner function exists, the variables it closed over **cannot be garbage collected**.
- If those variables hold large objects, DOM nodes, or other heavy data, they stay in memory forever (or until the closure itself is released).

---

## 2. How Garbage Collection Works with Closures

JavaScript uses **reachability** for garbage collection (mostly Mark-and-Sweep).

- If an object is reachable from the root (global object, currently executing context, etc.), it stays alive.
- A closure makes the outer variables reachable through the inner function.

```js
function createLeak() {
  const hugeArray = new Array(1000000).fill("💥"); // ~ big memory

  return function() {
    console.log(hugeArray[0]); // still references hugeArray
  };
}

const leakyFn = createLeak();
// hugeArray cannot be garbage collected as long as leakyFn exists
```

Even if you never call `leakyFn` again, the array stays in memory.

---

## 3. Common Real-World Leak Scenarios

### Scenario 1: Accidental reference to large data

```js
function processData() {
  const bigData = fetchHugeDataset(); // imaginary large object

  return function onClick() {
    // We only needed one small value, but closed over the whole bigData
    console.log(bigData.id);
  };
}
```

**Problem**: The entire `bigData` object is kept alive just because of one property.

**Fix**:
```js
function processData() {
  const bigData = fetchHugeDataset();
  const id = bigData.id;          // extract only what you need

  return function onClick() {
    console.log(id);              // now only the primitive is closed over
  };
}
```

---

### Scenario 2: Event listeners that are never removed

```js
function setupButton() {
  const heavyObject = { /* large data */ };

  const button = document.getElementById("myBtn");

  button.addEventListener("click", function handler() {
    console.log(heavyObject.name);
  });

  // If the button is later removed from DOM but we never remove the listener,
  // the closure (and heavyObject) can still stay alive.
}
```

**Better pattern**:
```js
function setupButton() {
  const heavyObject = { /* large data */ };
  const button = document.getElementById("myBtn");

  function handler() {
    console.log(heavyObject.name);
  }

  button.addEventListener("click", handler);

  // Later when cleaning up:
  // button.removeEventListener("click", handler);
}
```

Or use `{ once: true }` if it should run only once.

---

### Scenario 3: Timers / Intervals that are never cleared

```js
function startPolling() {
  const largeCache = new Map();

  const intervalId = setInterval(() => {
    // uses largeCache
    console.log(largeCache.size);
  }, 1000);

  // If we never call clearInterval(intervalId),
  // the closure and largeCache live forever.
}
```

**Fix**: Always store the timer ID and clear it when no longer needed.

---

### Scenario 4: Detached DOM nodes held by closures

```js
function createComponent() {
  const element = document.createElement("div");
  element.innerHTML = "..."; // potentially large

  element.addEventListener("click", function() {
    // this closure keeps a reference to `element`
    console.log("clicked");
  });

  document.body.appendChild(element);

  // Later someone does:
  // document.body.removeChild(element);
  // But the event listener (closure) still holds the element → detached DOM leak
}
```

This is a classic browser memory leak pattern.

---

### Scenario 5: Long-lived global / module-level closures

```js
// In a module or global scope
const cache = new Map();

function getHandler(key) {
  return function() {
    return cache.get(key); // the returned functions keep the whole cache alive
  };
}
```

If many such handlers are created and stored, the entire cache stays in memory.

---

## 4. How to Detect Closure Memory Leaks

### Tools

1. **Chrome DevTools → Memory tab**
   - Take Heap Snapshot
   - Look for detached DOM nodes
   - Search for retained size of objects you expect to be gone
   - Use "Comparison" between two snapshots

2. **Performance tab** → Memory checkbox
   - Record while using the app
   - Look for steadily rising memory that never drops

3. **`console.memory`** (Chrome only, approximate)

4. **Performance Monitor** (Chrome) – live JS heap size

### Signs of a leak
- Memory keeps growing over time even when the user is idle
- Detached HTML elements still appear in heap snapshots
- Large arrays/objects that should have been released are still reachable

---

## 5. Best Practices to Avoid Closure Memory Leaks

| Practice | Why it helps |
|----------|--------------|
| Close over **only what you need** | Prevents holding large objects accidentally |
| Extract primitives early | Primitives are copied, objects are referenced |
| Always remove event listeners | Breaks the reference chain |
| Clear timers (`clearTimeout` / `clearInterval`) | Releases the closure |
| Avoid unnecessary long-lived closures | Especially in modules and global scope |
| Use `WeakMap` / `WeakRef` when appropriate | Allows garbage collection of keys/values |
| Null out references when done | Helps in older patterns |

### Good example (minimal closure)

```js
function createHandler(userId) {
  // Only close over the primitive
  return function() {
    console.log("User:", userId);
  };
}
```

### Better with WeakMap (advanced)

```js
const privateData = new WeakMap();

function createObject() {
  const obj = {};
  privateData.set(obj, { secret: "data" });
  return obj;
}

// When obj is no longer referenced, its private data can be GC'd
```

---

## 6. Interview Questions (Q + A together)

**Q1. How can a closure cause a memory leak?**  
**A:** Because the inner function keeps a reference to the outer Lexical Environment. Any variables in that environment (especially large objects or DOM nodes) cannot be garbage collected as long as the inner function is reachable.

**Q2. Does every closure cause a memory leak?**  
**A:** No. Closures only become a problem when they retain large or unnecessary data for longer than needed.

**Q3. What is a detached DOM node leak?**  
**A:** When a DOM element is removed from the document but still referenced by a JavaScript closure (usually an event listener). The element cannot be garbage collected.

**Q4. How do you fix a setInterval memory leak?**  
**A:** Store the ID returned by `setInterval` and call `clearInterval(id)` when the component/page is destroyed or the polling is no longer needed.

**Q5. Why is it better to close over a primitive than an object?**  
**A:** Primitives are copied by value. Objects are held by reference, so the entire object graph stays alive.

**Q6. How can you detect a memory leak caused by closures?**  
**A:** Take heap snapshots in Chrome DevTools Memory tab, compare snapshots over time, and look for objects that should have been released but are still retained by closures.

---

## 7. Coding Challenges (Q + Solution together)

### Challenge 1
Identify the leak and fix it.

```js
function attachHandler() {
  const data = new Array(1000000).fill("leak");

  document.getElementById("btn").addEventListener("click", function() {
    console.log(data[0]);
  });
}
```

**Solution (minimal fix):**
```js
function attachHandler() {
  const data = new Array(1000000).fill("leak");
  const firstItem = data[0];           // extract only what we need

  document.getElementById("btn").addEventListener("click", function() {
    console.log(firstItem);
  });
}
```

Even better: remove the listener when no longer needed.

---

### Challenge 2
Fix the potential leak.

```js
function startTimer() {
  const cache = new Map();

  setInterval(() => {
    cache.set(Date.now(), Math.random());
    console.log(cache.size);
  }, 1000);
}
```

**Solution:**
```js
function startTimer() {
  const cache = new Map();
  const id = setInterval(() => {
    cache.set(Date.now(), Math.random());
    console.log(cache.size);
  }, 1000);

  // Return a cleanup function
  return function stop() {
    clearInterval(id);
    cache.clear();
  };
}

const stop = startTimer();
// later: stop();
```

---

### Challenge 3
Explain why this can leak and how to improve it.

```js
function makeButtons(items) {
  items.forEach(item => {
    const btn = document.createElement("button");
    btn.textContent = item.name;

    btn.addEventListener("click", () => {
      console.log(item);          // closes over the whole item object
    });

    document.body.appendChild(btn);
  });
}
```

**Solution approach:**
- If you only need `item.id` or `item.name`, extract those primitives.
- Prefer event delegation on a parent instead of adding many individual listeners.
- Provide a way to remove the buttons and their listeners when the list is updated.

---

## 8. Key Takeaways

- Closures keep outer variables alive — this is powerful but dangerous if the data is large.
- Always ask: “Do I really need to close over this whole object?”
- Clean up event listeners and timers.
- Prefer extracting the minimum data needed before creating the closure.
- Use Chrome DevTools Memory tab to confirm leaks.
- In modern code, also consider `AbortController` for event listeners and `WeakMap`/`WeakRef` for advanced cases.

---

**Related chapters:**
- [05 - Closures Deep Dive](./05-closures-deep-dive.md)
- [04 - Coding Challenges TDZ + Hoisting](./04-coding-challenges-tdz-hoisting.md)
