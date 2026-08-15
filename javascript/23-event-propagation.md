# Chapter 23: Event Propagation (Bubbling + Capturing + Delegation)

**Interviewer:** Event Propagation explain karo.

**Tum:**

"Event Propagation woh process hai jismein event target element se travel karta hai DOM tree mein. Iske 3 phases hote hain:"

1. **Capturing Phase** (Top → Target)
2. **Target Phase**
3. **Bubbling Phase** (Target → Top)

---

## Visual Structure

```
document
  └─ html
       └─ body
            └─ div          ← Grandparent
                 └─ p        ← Parent
                      └─ button   ← Target (yahan click hua)
```

Jab button pe click hota hai:

**Capturing:** `document → html → body → div → p → button`  
**Target:** button pe event handle hota hai  
**Bubbling:** `button → p → div → body → html → document`

---

## 1. Event Bubbling (Default)

```js
const div = document.querySelector("div");
const p = document.querySelector("p");
const button = document.querySelector("button");

div.addEventListener("click", () => console.log("div bubbling"));
p.addEventListener("click", () => console.log("p bubbling"));
button.addEventListener("click", () => console.log("button bubbling"));
```

**Output (button click):**
```
button bubbling
p bubbling
div bubbling
```

---

## 2. Event Capturing

`addEventListener` ka **3rd parameter** `true` karne se capturing enable hota hai.

```js
div.addEventListener("click", () => console.log("div capturing"), true);
p.addEventListener("click", () => console.log("p capturing"), true);
button.addEventListener("click", () => console.log("button capturing"), true);
```

**Output:**
```
div capturing
p capturing
button capturing
```

---

## 3. Capturing + Bubbling saath mein

```js
div.addEventListener("click", () => console.log("div capturing"), true);
div.addEventListener("click", () => console.log("div bubbling"), false);

p.addEventListener("click", () => console.log("p capturing"), true);
p.addEventListener("click", () => console.log("p bubbling"), false);

button.addEventListener("click", () => console.log("button capturing"), true);
button.addEventListener("click", () => console.log("button bubbling"), false);
```

**Button click pe output order:**
```
div capturing
p capturing
button capturing
button bubbling
p bubbling
div bubbling
```

---

## 4. event.target vs event.currentTarget ⭐ (MOST ASKED)

```js
document.querySelector("div").addEventListener("click", (e) => {
  console.log(e.target);        
  // ↑ jis element pe ACTUALLY click hua (could be child!)
  
  console.log(e.currentTarget); 
  // ↑ jis element pe LISTENER laga hai (hamesha div rahega)
});

// Example:
// <div>
//   <button>Click me</button>
// </div>

// Button pe click kiya:
// e.target        → <button>  (actual click)
// e.currentTarget → <div>     (listener wala)
```

**Interview mein bolna:**  
"Event Delegation mein `e.target` se pata chalta hai KONSE child pe click hua, `e.currentTarget` se pata chalta hai KONSE element pe listener laga hai!"

---

## 5. Propagation ko rokna

### 1. `event.stopPropagation()`
Event aage nahi jayega (na bubble, na capture).

```js
button.addEventListener("click", (e) => {
  console.log("button clicked");
  e.stopPropagation();
});
```

### 2. `event.stopImmediatePropagation()`
Same element pe baaki listeners bhi nahi chalenge.

```js
button.addEventListener("click", (e) => {
  console.log("First listener");
  e.stopImmediatePropagation();
});

button.addEventListener("click", () => {
  console.log("Second listener"); // yeh nahi chalega
});
```

### 3. `event.preventDefault()`
Default browser behavior rokta hai (form submit, link open etc.), lekin **propagation nahi rokta**.

---

## 6. `{ once: true }` — Sirf Ek Baar Chalega

```js
button.addEventListener("click", () => {
  console.log("Sirf ek baar chalunga!");
}, { once: true });
// ↑ automatically remove ho jaata hai after first call!

// Yeh equivalent hai:
button.addEventListener("click", function handler() {
  console.log("Sirf ek baar!");
  button.removeEventListener("click", handler);
});
```

---

## 7. `{ passive: true }` — Performance ke liye

```js
// Scroll events ke saath use hota hai!
window.addEventListener("scroll", (e) => {
  // kuch karo
}, { passive: true });
// ↑ browser ko bata raha hai:
//   "Main preventDefault() nahi karunga!
//    Tu scroll smoothly kar — wait mat kar!"

// Jab passive: true → browser scroll immediately start karta hai
// Better performance! ✅
```

---

## 8. removeEventListener — Memory Leak!

```js
// GALAT — memory leak! ❌
function badCode() {
  button.addEventListener("click", () => {
    console.log("clicked");
  });
  // Anonymous function — remove nahi kar sakte!
}

// SAHI ✅
function handleClick() {
  console.log("clicked");
}
button.addEventListener("click", handleClick);

// Baad mein remove karo!
button.removeEventListener("click", handleClick);
// ↑ Same function reference chahiye!
//   Isliye named function use karo!
```

**Interview mein bolna:**  
"Anonymous function se memory leak hoti hai kyunki `removeEventListener` ke liye same reference chahiye hota hai!"

---

## 9. Custom Events

```js
// Apna khud ka event banana!
const myEvent = new CustomEvent("myCustomEvent", {
  detail: { userId: 123, name: "Ashish" },
  bubbles: true,    // bubble karega?
  cancelable: true  // preventDefault() chalega?
});

// Dispatch karo
document.querySelector("div").dispatchEvent(myEvent);

// Listen karo
document.addEventListener("myCustomEvent", (e) => {
  console.log(e.detail.userId); // 123
  console.log(e.detail.name);   // "Ashish"
});
```

---

## 10. Jo Events Bubble Nahi Karte

```js
// Yeh events BUBBLE NAHI KARTE:
// focus, blur, mouseenter, mouseleave, load, scroll

// Problem:
document.querySelector("div").addEventListener("focus", () => {
  console.log("focused"); // NAHI CHALEGA! ❌
  // focus bubble nahi karta!
});

// Solutions:

// Solution 1: Capturing use karo
document.querySelector("div").addEventListener("focus", () => {
  console.log("focused"); // ✅
}, true); // capturing!

// Solution 2: focusin use karo (bubble karta hai!)
document.querySelector("div").addEventListener("focusin", () => {
  console.log("focused"); // ✅
});
```

---

## 11. Event Delegation (Bahut Important)

**Concept:** Parent pe ek listener laga ke saare child elements ke events handle karna.

**Kyun use karte hain?**
- Performance better (kam listeners)
- Dynamically add hue elements bhi handle ho jaate hain

### Simple Example

```js
// Galat tarika
document.querySelectorAll("button").forEach(btn => {
  btn.addEventListener("click", () => {
    console.log(btn.textContent);
  });
});

// Sahi tarika (Event Delegation)
document.querySelector("ul").addEventListener("click", (e) => {
  if (e.target.tagName === "BUTTON") {
    console.log(e.target.textContent);
  }
});
```

### Real World Example (Todo List)

```js
const ul = document.querySelector("ul");

// Ek listener saari functionality ke liye!
ul.addEventListener("click", (e) => {
  
  // Delete button click
  if (e.target.classList.contains("delete")) {
    e.target.closest("li").remove();
  }
  
  // Complete button click
  if (e.target.classList.contains("complete")) {
    e.target.closest("li").classList.toggle("done");
  }
  
  // Edit button click
  if (e.target.classList.contains("edit")) {
    console.log("editing:", e.target.dataset.id);
  }
});

// Naya item dynamically add kiya
// Automatically handle ho jaayega! ✅
ul.innerHTML += `
  <li>
    New Item 
    <button class="delete">Del</button>
    <button class="complete">Done</button>
    <button class="edit" data-id="123">Edit</button>
  </li>
`;
```

### Performance Comparison

```js
// BAD — 1000 listeners! ❌
document.querySelectorAll("li") // 1000 li hain
  .forEach(li => {
    li.addEventListener("click", handler);
    // 1000 alag alag listeners!
    // Memory waste!
  });

// GOOD — Sirf 1 listener! ✅
document.querySelector("ul")
  .addEventListener("click", (e) => {
    if (e.target.tagName === "LI") {
      handler(e);
    }
  });
// Bubbling ki wajah se kaam karta hai!
```

---

## Complete Interview Q&A

**Q1. Event Bubbling aur Capturing mein farak?**  
→ Bubbling: Target se upar jata hai (default)  
→ Capturing: Top se Target tak aata hai

**Q2. Default konsa phase hota hai?**  
→ Bubbling

**Q3. Propagation kaise rokoge?**  
→ `e.stopPropagation()`

**Q4. `stopPropagation` vs `stopImmediatePropagation`?**  
→ `stopPropagation` → event aage nahi jayega  
→ `stopImmediatePropagation` → same element pe baaki listeners bhi nahi chalenge

**Q5. `preventDefault` aur `stopPropagation` mein farak?**  
→ `preventDefault` → default behavior rokta hai  
→ `stopPropagation` → event flow rokta hai

**Q6. Event Delegation kya hai aur kyun use karte hain?**  
→ Parent pe listener laga ke children handle karna. Performance + dynamic elements ke liye best.

**Q7. Kya saare events bubble hote hain?**  
→ Nahi. `focus`, `blur`, `mouseenter`, `mouseleave`, `load`, `scroll` etc. bubble nahi karte.

**Q8. `event.target` vs `event.currentTarget`?**  
→ `target` = jahan ACTUALLY click hua  
→ `currentTarget` = jahan LISTENER laga hai

**Q9. `{ once: true }` kya karta hai?**  
→ Event sirf ek baar fire hoga, phir automatically remove!

**Q10. `{ passive: true }` kyun use karte hain?**  
→ Scroll performance improve karne ke liye. Browser ko batate hain ki `preventDefault()` nahi karenge.

**Q11. `removeEventListener` mein anonymous function kyun problem hai?**  
→ Same reference chahiye remove ke liye. Anonymous = no reference = memory leak!

**Q12. Custom Event kaise banate hain?**  
→ `new CustomEvent("name", { detail: {...} })` + `element.dispatchEvent(event)`

**Q13. focus event delegation kaise karoge?**  
→ `focusin` use karo (bubble karta hai) ya capturing use karo (`{ capture: true }`)

---

## Ek Line Summary (Interview mein yeh bol dena)

> "Event Propagation ke 3 phases — Capturing, Target, Bubbling. `e.target` actual element, `e.currentTarget` listener wala. Delegation se performance better — ek listener saare children handle karta hai. `{ once, passive }` options performance ke liye. Named functions use karo memory leak se bachne ke liye!"

---

## Priority Order — Interview mein kya poochha jaata hai

```
Must Know:         ✅
  Bubbling/Capturing
  stopPropagation
  preventDefault
  Event Delegation

Zaroor Poochha Jaata Hai:   ⭐
  target vs currentTarget ← MOST ASKED!
  removeEventListener + memory leak
  { once, passive } options
  Non-bubbling events + fixes

Bonus Points:      🔥
  Custom Events
  Real world delegation example
  Performance comparison
```
