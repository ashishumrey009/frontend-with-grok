# Chapter 36: Fetch API

**Interviewer:** Fetch se data kaise laate ho? Errors kaise handle?

**Tum:**

"`fetch` Promise return karta hai. Network success pe bhi 404 resolve hota hai — `response.ok` check zaroori. Body read `response.json()`. AbortController se cancel."

---

## 1. GET

```js
async function getUsers() {
  const res = await fetch("https://api.example.com/users");

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  return res.json();
}
```

**Gotcha:** HTTP 404/500 pe `fetch` reject nahi karta. Sirf network fail / CORS reject.

---

## 2. POST + JSON

```js
async function createUser(user) {
  const res = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(user),
  });

  if (!res.ok) throw new Error("Failed");
  return res.json();
}
```

---

## 3. Methods

`GET` `POST` `PUT` `PATCH` `DELETE`

---

## 4. Abort (cancel)

```js
const controller = new AbortController();

fetch(url, { signal: controller.signal })
  .then((r) => r.json())
  .catch((err) => {
    if (err.name === "AbortError") console.log("cancelled");
  });

controller.abort();
```

React `useEffect` cleanup mein abort — race condition avoid.

---

## 5. Parallel requests

```js
const [users, posts] = await Promise.all([
  fetch("/users").then((r) => r.json()),
  fetch("/posts").then((r) => r.json()),
]);
```

---

## Interview Q&A

**Q1. fetch 404 pe catch mein kyun nahi?**  
→ Fetch sirf network error pe reject. Status check `res.ok` / `res.status`.

**Q2. axios vs fetch?**  
→ Axios interceptors + auto JSON + 4xx throw. Fetch native, extra checks khud.

**Q3. Request cancel?**  
→ `AbortController`.

**Q4. CORS?**  
→ Browser cross-origin request block karta hai jab server allow na kare.

---

## Ek Line Summary

> "fetch Promise deta hai. 404 reject nahi — res.ok check karo. JSON body stringify/parse. Cancel ke liye AbortController."
