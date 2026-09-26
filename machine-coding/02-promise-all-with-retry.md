# 02 · promiseAllWithRetry (Promise.all polyfill + retry)

**Asked at:** Walmart, Intuit (Promise polyfills are common at Adobe and ServiceNow too)
**Level:** Senior frontend, JS round
**Runnable code:** [`02-promise-all-with-retry.js`](./02-promise-all-with-retry.js), run it with `node 02-promise-all-with-retry.js`

## Question

Write `promiseAllWithRetry(tasks, retries)`:

- `tasks` is an array of functions, and each one returns a promise.
- If a task fails, re-run it up to `retries` times.
- Results must come back in the same order as the input.
- If a task still fails after all retries, reject the whole thing with that error.
- Don't use `Promise.all`; write it yourself.

## Approach: break it into small pieces

One big problem, three small functions:

1. `myAll`: your own `Promise.all`
2. `retry`: retry a single task n times
3. `promiseAllWithRetry`: wrap every task in `retry` and hand them all to `myAll`

---

## Step 1: `.then` runs work after a promise resolves

```js
fetchUser().then(user => console.log(user));
```

## Step 2: keep order with an index, not push

```js
const results = [];
p1.then(value => { results[0] = value; });
p2.then(value => { results[1] = value; });
```

`push` puts results in whatever order they finish (if `p2` resolves first, it lands at index 0). Writing by index always keeps the order right. **This is the core idea of `Promise.all`.**

## Step 3: a counter tells you when everything is done

```js
done++;
if (done === promises.length) resolve(results);
```

## Step 4: failures and the empty array

```js
.catch(reject)            // ✅ pass the function
.catch(reject(value))     // ❌ calls reject immediately, without waiting for a failure
```

`.catch` needs a **function**, not the result of calling one. This is a common interview trap.

Empty array: `forEach` never runs, so resolve never gets called, and the promise hangs forever.

```js
if (promises.length === 0) return resolve([]);
```

### Final `myAll`

```js
function myAll(promises) {
  return new Promise((resolve, reject) => {
    const results = [];
    let done = 0;

    if (promises.length === 0) return resolve([]);

    promises.forEach((p, i) => {
      Promise.resolve(p)
        .then(value => {
          results[i] = value;
          done++;
          if (done === promises.length) resolve(results);
        })
        .catch(reject);
    });
  });
}
```

**Senior point:** `Promise.resolve(p)` also turns plain values (like `5`) into promises. The real `Promise.all` does the same.

---

## Step 5: `retry`, thought through the way a person retries

"Try it. If it works, great. If it fails and there are chances left, try again. If the chances are used up, give up."

```js
function retry(fn, n) {
  return fn().catch(err => {
    if (n === 0) throw err;      // chances used up
    return retry(fn, n - 1);     // one fewer chance, run the whole thing again
  });
}
```

Two common mistakes:

1. **Using `reject` here.** We aren't inside `new Promise`, so there's no `reject`. Inside `.catch`, you pass an error on with `throw`, and the outer promise rejects.
2. **Calling `fn()` directly instead of `retry(fn, n - 1)`.** That only retries once, and if that attempt fails too, nothing catches it. Recursion is what makes it retry n times.

## Step 6: put them together

```js
function promiseAllWithRetry(tasks, retries) {
  return myAll(tasks.map(task => retry(task, retries)));
}
```

- Order: handled by `myAll`
- Retry: handled by `retry`
- Final failure: `myAll` rejects

---

## Testing: a fake task that fails on purpose

The simplest version:

```js
let attempts = 0;

function flakyTask() {
  attempts++;
  if (attempts <= 2) return Promise.reject(new Error("fail"));
  return Promise.resolve("pass");
}

retry(flakyTask, 2).then(console.log).catch(e => console.log(e.message)); // "pass"
// retry(flakyTask, 1) would give "fail", because only 2 attempts happen
```

In the `.js` file, `makeTask(name, failTimes, delay)` is a factory that makes several tasks like this and adds a `setTimeout` delay so they behave like a real API.

Output:

```
B: attempt 1 fail
C: attempt 1 fail
B: attempt 2 fail
A: attempt 1 pass
B: attempt 3 pass
C: attempt 2 pass
Case 1 result: [ 'A', 'B', 'C' ]
X: attempt 1 pass
Y: attempt 1 fail
Y: attempt 2 fail
Y: attempt 3 fail
Case 2 error: Y failed
```

B finishes before A, but the result is still `['A', 'B', 'C']`, because the index keeps the order.

## Complexity

- Time: O(n × (retries + 1)) task calls in the worst case. Tasks run in parallel.
- Space: O(n) for the results array.

## Follow-ups (practice)

1. **Exponential backoff:** wait before each retry (1s, 2s, 4s…). Hint: write `const sleep = ms => new Promise(r => setTimeout(r, ms));` and chain it before `retry`.
2. **`Promise.allSettled` polyfill:** never reject; return `{ status, value | reason }` for each task.
3. **`Promise.any` / `Promise.race` polyfills.**
4. **Concurrency limit:** run at most k tasks at a time (the Adobe task-runner question).

## Interview checklist

- [ ] Say the approach out loud first: "Three pieces: myAll, retry, and combining them."
- [ ] Keep order with an index
- [ ] Handle the empty-array edge case
- [ ] Pass the function to `.catch`, don't call it
- [ ] `throw` inside `retry`, not `reject`
- [ ] State the complexity
