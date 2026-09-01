# Chapter 35: Promises + async/await Basics

**Interviewer:** Promise kya hai? async/await kaise kaam karta hai?

**Tum:**

"Promise future value ka placeholder hai — pending → fulfilled/rejected. async/await Promise ka clean syntax hai. await ke baad ka code microtask queue mein jata hai."

---

## 1. States

```text
pending → fulfilled (resolve)
       → rejected  (reject)
```

Settled hone ke baad state change nahi hoti.

```js
const p = new Promise((resolve, reject) => {
  setTimeout(() => resolve("ok"), 100);
});

p.then((v) => console.log(v))
 .catch((e) => console.log(e))
 .finally(() => console.log("done"));
```

---

## 2. Callback hell → Promise

```js
// hell
getUser((u) => {
  getPosts(u.id, (posts) => {
    getComments(posts[0], (c) => console.log(c));
  });
});

// promise chain
getUser()
  .then((u) => getPosts(u.id))
  .then((posts) => getComments(posts[0]))
  .then(console.log)
  .catch(console.error);
```

---

## 3. async/await

```js
async function load() {
  try {
    const u = await getUser();
    const posts = await getPosts(u.id);
    return posts;
  } catch (err) {
    console.error(err);
  }
}
```

- `async` function hamesha Promise return karti hai
- `await` Promise settle hone tak wait (non-blocking for JS engine — function pause)
- Errors → `try/catch`

```js
async function f() { return 1; }
f(); // Promise { 1 }
```

---

## 4. Parallel vs sequential

```js
// sequential (slow)
const a = await fetchA();
const b = await fetchB();

// parallel
const [a, b] = await Promise.all([fetchA(), fetchB()]);
```

Combinators detail: Chapter 17.

---

## 5. Common mistakes

```js
// forgot await
const data = fetch(url); // Promise, not data

// try/catch without await
try {
  fetch(url); // error catch nahi hoga
} catch (e) {}

// swallowing
await fetch(url).catch(() => {});
```

---

## Interview Q&A

**Q1. Promise kya hai?**  
→ Async result ka object. 3 states. Immutable after settle.

**Q2. then vs await?**  
→ Same engine. await readable + try/catch.

**Q3. async function kya return?**  
→ Hamesha Promise.

**Q4. await loop ke andar?**  
→ Sequential. Parallel chahiye toh `Promise.all`.

---

## Ek Line Summary

> "Promise = pending/fulfilled/rejected. async/await usi ka sugar. await ke baad microtask. Parallel ke liye Promise.all, errors ke liye try/catch."
