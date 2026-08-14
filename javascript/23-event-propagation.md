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

## Propagation ko rokna

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

## Event Delegation (Bahut Important)

**Concept:** Parent pe ek listener laga ke saare child elements ke events handle karna.

**Kyun use karte hain?**
- Performance better (kam listeners)
- Dynamically add hue elements bhi handle ho jaate hain

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

---

## Common Interview Questions

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
→ Nahi. `focus`, `blur`, `mouseenter`, `mouseleave` etc. bubble nahi karte.  
  (Unke liye capturing ya directly target pe listener lagana padta hai)

---

## Ek Line Summary (Interview mein yeh bol dena)

> "Event Propagation ke 3 phases hote hain — Capturing, Target aur Bubbling. Default bubbling hota hai. `stopPropagation` se rok sakte hain. Event Delegation bubbling ka best practical use-case hai performance aur dynamic elements ke liye."

---

Bhai yeh version interview ke liye **complete** hai.
