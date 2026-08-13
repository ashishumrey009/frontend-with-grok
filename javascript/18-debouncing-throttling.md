# Chapter 18: Debouncing & Throttling
# (Explanation + Polyfills + Interview Questions)

Bhai, yeh topic almost **har frontend interview** mein aata hai.
Main story + code + common questions — sab ek saath de raha hoon.

---

## Simple Story se Samjho

### Debouncing (Debounce)

**Story:**
Tum lift mein khade ho. Button dabate ho.
Lift turant nahi aati. Jab tak tum **ruk ke** button dabate rehte ho, lift wait karti hai.
Jab tum **ruk jaate** ho (last button press ke baad thodi der), tab lift aati hai.

Matlab → **Last action ke baad wait karo, phir execute karo.**

**Real life examples:**
- Search bar (user typing rukne ke baad API call)
- Window resize
- Button double-click prevention

---

### Throttling (Throttle)

**Story:**
Tum machine gun chala rahe ho.
Bullet har second mein sirf **ek** hi nikal sakti hai.
Kitna bhi tezi se trigger dabao — rate limited hai.

Matlab → **Har fixed time interval mein sirf ek baar execute.**

**Real life examples:**
- Scroll event (infinite scroll, parallax)
- Mouse move (dragging)
- Button click spam prevention (lekin continuously allow)
- Game controls / shooting

---

## Difference Table (Interview mein yeh yaad rakhna)

| Feature              | Debounce                          | Throttle                          |
|----------------------|-----------------------------------|-----------------------------------|
| Kab execute hota hai | Last call ke baad delay           | Har fixed interval mein           |
| Frequency            | Kam (sirf end mein)               | Regular (controlled rate)         |
| Use case             | Search, resize, form validation   | Scroll, mousemove, resize continuous |
| Feeling              | "Ruk ja, last mein karunga"       | "Har X ms mein ek baar"           |

---

## 1. Debounce Polyfill

```js
function debounce(fn, delay) {
  let timerId;

  return function (...args) {
    // Pehle wala timer clear kar do
    clearTimeout(timerId);

    // Naya timer set karo
    timerId = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}
```

**Kaise kaam karta hai?**
1. Har baar function call hone pe pehle wala timer cancel
2. Naya timer start
3. Agar delay ke andar dobara call aaya → phir cancel
4. Jab delay complete ho jaye bina interrupt ke → original function chalegi

**Example:**

```js
const search = debounce((query) => {
  console.log("API call for:", query);
}, 500);

// User typing
search("a");     // timer start
search("ap");    // previous cancel, new timer
search("app");   // previous cancel, new timer
search("appl");  // previous cancel, new timer
search("apple"); // 500ms baad API call → "apple"
```

---

## 2. Throttle Polyfill (Leading Edge)

```js
function throttle(fn, delay) {
  let lastCall = 0;

  return function (...args) {
    const now = Date.now();

    if (now - lastCall >= delay) {
      lastCall = now;
      fn.apply(this, args);
    }
  };
}
```

**Kaise kaam karta hai?**
- Pehli call turant chalti hai
- Uske baad `delay` time tak ignore
- Phir dobara allow

**Example:**

```js
const handleScroll = throttle(() => {
  console.log("Scroll position:", window.scrollY);
}, 200);

window.addEventListener("scroll", handleScroll);
```

---

## 3. Throttle with Trailing Edge (Advanced - Interview Level)

Kabhi-kabhi last call bhi chahiye hota hai (jaise scroll end pe).

```js
function throttle(fn, delay) {
  let lastCall = 0;
  let timerId = null;

  return function (...args) {
    const now = Date.now();
    const remaining = delay - (now - lastCall);

    clearTimeout(timerId);

    if (remaining <= 0) {
      // Time ho gaya → abhi chalao
      lastCall = now;
      fn.apply(this, args);
    } else {
      // Remaining time ke baad last call chalao (trailing)
      timerId = setTimeout(() => {
        lastCall = Date.now();
        fn.apply(this, args);
      }, remaining);
    }
  };
}
```

---

## Leading vs Trailing (Interview Deep Question)

| Type        | Pehli call | Last call | Use case                     |
|-------------|------------|-----------|------------------------------|
| Leading     | ✅ Turant  | ❌ Nahi   | Button click, shoot          |
| Trailing    | ❌ Wait    | ✅ Haan   | Search, resize end           |
| Both        | ✅         | ✅        | Scroll + final position      |

**Debounce** by default **trailing** hota hai.
**Throttle** by default **leading** hota hai.

---

## Real Interview Questions + Answers

### Q1. Debounce aur Throttle mein farak kya hai?

**Answer:**
> Debounce → last action ke baad wait karta hai, phir execute.
> Throttle → fixed interval mein maximum ek baar execute karta hai.
> Debounce search ke liye best, Throttle scroll ke liye.

### Q2. Debounce ka polyfill likho.

(Upar wala code de dena)

### Q3. Throttle ka polyfill likho.

(Upar wala code)

### Q4. Search bar mein debounce kyun use karte hain?

**Answer:**
> User har keystroke pe API call nahi karna chahiye.
> Debounce se last typing ke 300-500ms baad hi API call hoti hai.
> Network calls kam ho jaati hain + better UX.

### Q5. Scroll event pe throttle kyun?

**Answer:**
> Scroll event bahut zyada fire hota hai (60+ times per second).
> Bina throttle ke performance kharab ho jaati hai.
> Throttle se har 100-200ms mein ek baar hi logic chalti hai.

### Q6. Leading edge aur Trailing edge kya hota hai?

**Answer:**
> Leading → pehli call turant execute
> Trailing → last call delay ke baad execute
> Debounce mostly trailing, Throttle mostly leading.

### Q7. Kya debounce aur throttle dono ek saath use kar sakte hain?

**Answer:**
> Haan, rare cases mein. Example: resize event pe throttle + final calculation ke liye debounce.

### Q8. `this` aur arguments kaise preserve karte ho?

**Answer:**
> `fn.apply(this, args)` use karke.
> Arrow function se bhi kar sakte ho lekin `this` binding toot sakti hai isliye normal function + apply better hai.

### Q9. Cancel karne ka option chahiye ho toh?

```js
function debounce(fn, delay) {
  let timerId;

  function debounced(...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn.apply(this, args), delay);
  }

  debounced.cancel = () => clearTimeout(timerId);
  return debounced;
}
```

### Q10. Lodash ka debounce/throttle use karte ho kya?

**Answer:**
> Production mein mostly lodash ya own utility use karte hain.
> Interview mein polyfill likhna aana chahiye.

---

## Bonus: React mein kaise use karte hain?

```js
import { useMemo } from "react";

function SearchComponent() {
  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        // API call
        console.log("Searching:", value);
      }, 400),
    []
  );

  return (
    <input
      onChange={(e) => debouncedSearch(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

---

## Ek Line Summary (Interview mein bol dena)

> "Debounce last action ke baad wait karta hai (search ke liye), Throttle fixed rate pe limit karta hai (scroll ke liye). Dono performance optimize karte hain."

---

Bhai yeh chapter solid hai. Polyfills + leading/trailing + 10 interview questions.
Practice karke jao — clear ho jaayega!
