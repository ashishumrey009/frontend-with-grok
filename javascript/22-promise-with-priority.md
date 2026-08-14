# Chapter 22: promiseWithPriority – Priority based Promise Execution

**Interviewer:** Tumhare paas tasks hain jinke saath priority attached hai. Highest priority wala successful task ka result return karo. Agar highest fail ho jaye toh usse next highest try karo.

**Tum:**

"Samajh gaya. Matlab fallback with priority.

Approach:
1. Tasks ko priority ke hisaab se **descending** sort karo (highest pehle).
2. Ek-ek karke try karo (series).
3. Jo pehla successful ho, uska result return kar do.
4. Agar saare fail ho jaayein toh reject."

---

## Solution 1: async/await (Clean & Recommended)

```js
async function promiseWithPriority(tasks) {
  // highest priority pehle
  const sorted = [...tasks].sort((a, b) => b.priority - a.priority);

  for (const item of sorted) {
    try {
      const result = await item.task;
      return result;               // pehla successful → return
    } catch (err) {
      // fail ho gaya → next priority try karo
      continue;
    }
  }

  // saare fail ho gaye
  throw new Error("All tasks failed");
}
```

---

## Solution 2: Pure Promise (reduce)

```js
function promiseWithPriority(tasks) {
  // highest priority pehle
  const sorted = [...tasks].sort((a, b) => b.priority - a.priority);

  return sorted.reduce((prevPromise, current) => {
    return prevPromise.catch(() => {
      // previous fail ho gaya → ab current try karo
      return current.task;
    });
  }, Promise.reject()); // shuruat mein reject se start kiya taaki pehla task try ho
}
```

---

## Example

```js
const tasks = [
  { 
    priority: 1, 
    task: new Promise((_, reject) => setTimeout(() => reject("Low failed"), 300))
  },
  { 
    priority: 3, 
    task: new Promise((_, reject) => setTimeout(() => reject("High failed"), 100))
  },
  { 
    priority: 2, 
    task: new Promise((resolve) => setTimeout(() => resolve("Medium Success"), 200))
  },
];

promiseWithPriority(tasks)
  .then(res => console.log("Result:", res))      // "Medium Success"
  .catch(err => console.log("Error:", err));
```

**Flow:**
- Priority 3 try kiya → fail
- Priority 2 try kiya → success → return
- Priority 1 try hi nahi hua

---

## Interview Tips

| Point                    | Kya bolna hai                                      |
|--------------------------|----------------------------------------------------|
| Sorting                  | Highest priority pehle (descending)                |
| Fallback                 | Fail hone pe next priority try karo                |
| Success                  | Pehla successful result return                     |
| All fail                 | Final reject / error throw                         |
| Order of execution       | Series (ek ke baad ek)                             |

---

## Ek line summary

> "promiseWithPriority mein tasks ko priority ke hisaab se sort karta hoon aur highest se start karke pehle successful result return karta hoon. Fail hone pe next priority pe fall back karta hoon."
