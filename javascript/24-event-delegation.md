# Chapter 24: Event Delegation (Deep Dive)

**Interviewer:** Event Delegation kya hota hai? Explain with example.

**Tum:**

"Event Delegation mein hum parent element pe **ek hi listener** laga ke uske saare children (even dynamically added) ke events handle karte hain. Yeh Event Bubbling ka best practical use-case hai."

---

## Problem kya tha (Bina Delegation ke)?

```js
// 1000 buttons hain
document.querySelectorAll("button").forEach((btn) => {
  btn.addEventListener("click", () => {
    console.log("clicked");
  });
});
```

**Problems:**
- 1000 alag-alag listeners → Memory waste
- Naya button dynamically add kiya toh uspe listener nahi chalega
- Code messy ho jata hai
- Performance kharab hoti hai

---

## Solution: Event Delegation

```js
// Sirf 1 listener parent pe
document.querySelector("ul").addEventListener("click", (e) => {
  if (e.target.tagName === "BUTTON") {
    console.log("Button clicked:", e.target.textContent);
  }
});
```

**Kaise kaam karta hai?**

1. Button pe click hota hai
2. Event **bubble** hoke `ul` tak pahunchta hai
3. `ul` pe laga hua listener chal jata hai
4. `e.target` se pata chal jata hai exactly kaunsa button click hua

---

## `e.target` vs `e.currentTarget` (Bahut Important)

```js
ul.addEventListener("click", (e) => {
  console.log(e.target);        // Actual element jahan click hua (button, span etc.)
  console.log(e.currentTarget); // Jis element pe listener laga hai (ul)
});
```

| Property         | Meaning                              |
|------------------|--------------------------------------|
| `e.target`       | Jis element pe **actually** click hua |
| `e.currentTarget`| Jis element pe **listener** laga hai  |

**Interview mein bolna:**  
"Delegation mein `e.target` se pata chalta hai kaunsa child click hua, `e.currentTarget` se pata chalta hai parent kaunsa hai."

---

## Real World Example (Todo List)

```js
const todoList = document.querySelector("#todo-list");

todoList.addEventListener("click", (e) => {
  const target = e.target;

  // Delete button
  if (target.classList.contains("delete-btn")) {
    target.closest("li").remove();
  }

  // Complete button
  if (target.classList.contains("complete-btn")) {
    target.closest("li").classList.toggle("completed");
  }

  // Edit button
  if (target.classList.contains("edit-btn")) {
    const id = target.dataset.id;
    console.log("Editing todo:", id);
  }
});
```

Ab chahe 10 items ho ya 1000 — **sirf 1 listener** kaafi hai.  
Naye items dynamically add karo, automatically handle ho jaayenge.

---

## Performance Comparison

```js
// BAD — 1000 listeners! ❌
document.querySelectorAll("li").forEach((li) => {
  li.addEventListener("click", handler);
});

// GOOD — Sirf 1 listener! ✅
document.querySelector("ul").addEventListener("click", (e) => {
  if (e.target.tagName === "LI") {
    handler(e);
  }
});
```

---

## Kab use karein Event Delegation?

| Use Case                      | Delegation use karein? |
|------------------------------|------------------------|
| Dynamic list (Todo, Chat)    | ✅ Yes                 |
| Table rows pe click          | ✅ Yes                 |
| Tabs / Accordion             | ✅ Yes                 |
| Infinite scroll items        | ✅ Yes                 |
| Sirf 2-3 static buttons      | ❌ Zarurat nahi        |
| Form submit                  | ❌ Nahi                |

---

## Important Edge Cases

### 1. Events jo bubble nahi karte

```js
// focus, blur, mouseenter, mouseleave bubble nahi karte

// Solution 1: focusin / focusout use karo (yeh bubble karte hain)
ul.addEventListener("focusin", (e) => {
  console.log("Focused on:", e.target);
});

// Solution 2: Capturing phase use karo
ul.addEventListener("focus", (e) => {
  console.log("Focused on:", e.target);
}, true);
```

### 2. Nested elements (closest ka use)

```js
// Agar button ke andar <span> hai toh e.target span ho sakta hai
ul.addEventListener("click", (e) => {
  const button = e.target.closest("button"); // nearest button dhundho
  if (button) {
    console.log("Button clicked");
  }
});
```

---

## Common Interview Questions

**Q1. Event Delegation kya hai?**  
→ Parent pe ek listener laga ke children ke events handle karna (bubbling ki wajah se).

**Q2. Kyun use karte hain?**  
→ Better performance + dynamically added elements automatically handle ho jaate hain.

**Q3. `e.target` aur `e.currentTarget` mein farak?**  
→ `target` = actual clicked element  
→ `currentTarget` = element jahan listener laga hai

**Q4. Kaunse events pe Delegation nahi chalega?**  
→ Jo events bubble nahi karte: `focus`, `blur`, `mouseenter`, `mouseleave`  
→ Unke liye `focusin`/`focusout` ya capturing use karo.

**Q5. Performance kaise better hoti hai?**  
→ 1000 listeners ki jagah sirf 1 listener. Memory + speed dono better.

**Q6. Dynamically added elements kaise handle hote hain?**  
→ Kyunki listener parent pe hai, naya child add hone pe bhi bubbling se event parent tak pahunch jata hai.

---

## Ek Line Summary (Interview mein bol dena)

> "Event Delegation mein hum parent pe ek listener laga dete hain aur bubbling ki wajah se saare children ke events handle kar lete hain. Isse performance better hoti hai aur dynamically added elements bhi automatically kaam karte hain."
