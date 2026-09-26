// Machine Coding 02: promiseAllWithRetry
// Run: node 02-promise-all-with-retry.js

// 1. Promise.all ka polyfill
function myAll(promises) {
  return new Promise((resolve, reject) => {
    const results = [];
    let done = 0;

    if (promises.length === 0) return resolve([]);

    promises.forEach((p, i) => {
      Promise.resolve(p)
        .then(value => {
          results[i] = value; // index se daalo, taaki order same rahe
          done++;
          if (done === promises.length) resolve(results);
        })
        .catch(reject); // koi ek fail = poora reject
    });
  });
}

// 2. Ek task ko n baar tak retry karna
function retry(fn, n) {
  return fn().catch(err => {
    if (n === 0) throw err; // chances khatam, error aage bhejo
    return retry(fn, n - 1); // ek chance kam karke dobara try
  });
}

// 3. Final answer
function promiseAllWithRetry(tasks, retries) {
  return myAll(tasks.map(task => retry(task, retries)));
}

// ---------- Test ----------

// Nakli task: pehli `failTimes` baar fail hoga, fir pass
function makeTask(name, failTimes, delay) {
  let attempts = 0;
  return () =>
    new Promise((resolve, reject) => {
      attempts++;
      setTimeout(() => {
        if (attempts <= failTimes) {
          console.log(`${name}: attempt ${attempts} fail`);
          reject(new Error(`${name} failed`));
        } else {
          console.log(`${name}: attempt ${attempts} pass`);
          resolve(name);
        }
      }, delay);
    });
}

// Case 1: sab retries ke andar pass
promiseAllWithRetry(
  [makeTask("A", 0, 300), makeTask("B", 2, 100), makeTask("C", 1, 200)],
  2
)
  .then(res => console.log("Case 1 result:", res)) // [ 'A', 'B', 'C' ]
  .catch(err => console.log("Case 1 error:", err.message));

// Case 2: Y retries khatam hone tak fail
setTimeout(() => {
  promiseAllWithRetry([makeTask("X", 0, 100), makeTask("Y", 5, 100)], 2)
    .then(res => console.log("Case 2 result:", res))
    .catch(err => console.log("Case 2 error:", err.message)); // Y failed
}, 1500);
