# Chapter 21: asyncSeries – Run Async Tasks in Series

**Interviewer:** Async tasks ko series mein chalao (ek ke baad ek). Parallel nahi.

**Tum:**

"Sure. Series ka matlab hai — pehla task complete hone ke baad hi doosra start hona chahiye.

Teen tareeke se kar sakte hain:

1. `async/await` + for loop (sabse clean)
2. Recursion
3. `reduce` + Promise chaining

Main pehle `async/await` wala dikhata hoon, phir baaki."

---

## Solution 1: async/await (Recommended)

```js
async function asyncSeries(tasks) {
  const results = [];

  for (const task of tasks) {
    try {
      const result = await task();   // pehle complete hone do
      results.push(result);
    } catch (err) {
      // agar error pe bhi continue karna hai toh yahan handle karo
      // warna throw kar do
      throw err;
    }
  }

  return results;
}
```

---

## Solution 2: Reduce (bahut interview mein poochte hain)

```js
function asyncSeries(tasks) {
  return tasks.reduce((prevPromise, currentTask) => {
    return prevPromise.then((results) => {
      return currentTask().then((result) => {
        results.push(result);
        return results;
      });
    });
  }, Promise.resolve([]));
}
```

---

## Solution 3: Recursion

```js
function asyncSeries(tasks) {
  const results = [];

  function run(index) {
    if (index >= tasks.length) {
      return Promise.resolve(results);
    }

    return tasks[index]()
      .then((result) => {
        results.push(result);
        return run(index + 1);
      });
  }

  return run(0);
}
```

---

## Example

```js
const tasks = [
  () => new Promise(res => setTimeout(() => res("Task 1"), 1000)),
  () => new Promise(res => setTimeout(() => res("Task 2"), 500)),
  () => new Promise(res => setTimeout(() => res("Task 3"), 300)),
];

asyncSeries(tasks).then(console.log);
// Output (1 second baad): ["Task 1", "Task 2", "Task 3"]
// Notice: Task 2 aur 3 wait karte hain Task 1 ke complete hone ka
```

---

## Key Points (Interview mein bolna)

- Series mein **order guarantee** hota hai.
- Parallel mein order guarantee nahi hota.
- `reduce` wala version pure Promise chaining se banaya hai, isliye async/await ke bina bhi kaam karta hai.
- Error handling clearly batao — continue karna hai ya break.

---

## Ek line summary

> "asyncSeries mein har task pehle wale ke complete hone ke baad hi start hota hai. Main reduce + Promise chaining se implement karta hoon."
