# Chapter 37: Error Handling

**Interviewer:** JS mein errors kaise handle karte ho — sync aur async?

**Tum:**

"Sync code `try/catch/finally`. Promise `.catch`. async/await `try/catch`. fetch mein HTTP error alag se `res.ok` se throw karo. Custom errors `Error` extend karke."

---

## 1. try / catch / finally / throw

```js
try {
  risky();
} catch (err) {
  console.log(err.message);
} finally {
  console.log("cleanup"); // hamesha
}
```

```js
throw new Error("Invalid amount");
```

---

## 2. Built-in types

| Type | Kab |
|------|-----|
| `Error` | Generic |
| `TypeError` | Galat type |
| `ReferenceError` | Variable exist nahi |
| `SyntaxError` | Parse time (try/catch se nahi pakadta runtime file mein already parsed) |
| `RangeError` | Out of range |

```js
err.name
err.message
err.stack
```

---

## 3. Custom error

```js
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

throw new ValidationError("Invalid email");
```

---

## 4. Async errors

```js
fetch(url)
  .then((r) => r.json())
  .catch((e) => console.error(e));

async function load() {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status);
    return await res.json();
  } catch (e) {
    console.error(e.message);
  }
}
```

**Remember:**
```text
Promise     → .catch()
async/await → try/catch
```

Uncaught promise = `unhandledrejection`.

---

## Interview Q&A

**Q1. finally kab chalta hai?**  
→ Success ya error dono ke baad.

**Q2. async function ke andar throw?**  
→ Promise reject.

**Q3. fetch catch mein 404?**  
→ Nahi, khud `res.ok` check + throw.

---

## Ek Line Summary

> "try/catch sync + await. Promise pe .catch. HTTP errors fetch automatically nahi throw karta. Custom Error se domain errors."
