# Chapter 20: mapAsyncLimit (Concurrency Limit)

**Interviewer:** mapAsyncLimit implement karo. Matlab async map, lekin ek time pe maximum `limit` number of promises hi chalein.

**Tum (Interview mein aise bolna):**

"Sure. Pehle approach clear karta hoon.

`mapAsync` mein hum saari promises ek saath start kar dete hain.  
Lekin `mapAsyncLimit` mein humein **concurrency control** chahiye. Matlab ek time pe maximum `limit` promises hi pending ho sakti hain.

Main isko **recursive** tareeke se karunga:

1. Pehle `limit` number of tasks start karunga.
2. Jab koi ek task complete ho, toh uski jagah next pending task start kar dunga.
3. Order maintain karne ke liye results array mein index ke hisaab se daalunga.
4. Jab saare tasks complete ho jaayein, tab resolve kar dunga."

---

## Code (Interview mein yeh likhna)

```js
function mapAsyncLimit(iterable, callbackFn, limit) {
  return new Promise((resolve, reject) => {
    const results = new Array(iterable.length);
    let nextIndex = 0;          // agla kaunsa item lena hai
    let activeCount = 0;        // abhi kitne chal rahe hain
    let completedCount = 0;     // kitne complete ho chuke hain

    // Edge case
    if (iterable.length === 0) {
      resolve([]);
      return;
    }

    function runNext() {
      // Agar saare items process ho gaye aur koi active nahi hai
      if (nextIndex >= iterable.length && activeCount === 0) {
        resolve(results);
        return;
      }

      // Jab tak limit se kam active hain aur items bache hain
      while (activeCount < limit && nextIndex < iterable.length) {
        const currentIndex = nextIndex;
        const item = iterable[currentIndex];
        nextIndex++;
        activeCount++;

        Promise.resolve(callbackFn(item))
          .then((value) => {
            results[currentIndex] = value;
            activeCount--;
            completedCount++;

            // Agli task start karo
            runNext();
          })
          .catch((err) => {
            reject(err);
          });
      }
    }

    // Shuruat
    runNext();
  });
}
```

---

## Example se explain karo (Interview mein)

```js
const nums = [1, 2, 3, 4, 5, 6];

function doubleAsync(num) {
  return new Promise((resolve) => {
    console.log(`Started: ${num}`);
    setTimeout(() => {
      console.log(`Finished: ${num}`);
      resolve(num * 2);
    }, 1000);
  });
}

mapAsyncLimit(nums, doubleAsync, 2).then((result) => {
  console.log("Final Result:", result);
});
```

**Output hoga kuch aisa:**

```
Started: 1
Started: 2
Finished: 1
Started: 3
Finished: 2
Started: 4
Finished: 3
Started: 5
Finished: 4
Started: 6
Finished: 5
Finished: 6
Final Result: [2, 4, 6, 8, 10, 12]
```

Dekho — ek time pe **sirf 2** hi chal rahe hain.

---

## Interviewer follow-up questions ke answers:

**Q. Order maintain kaise kiya?**  
→ `results[currentIndex] = value` se. Index pehle se pakad liya tha.

**Q. Kyun recursive kiya?**  
→ Jab ek task complete hota hai, tabhi next task start karna hota hai. Isliye `runNext()` ko recursively call kiya.

**Q. Agar limit = 1 ho toh kya hoga?**  
→ Fully sequential chalega (ek ke baad ek).

**Q. Agar limit bahut bada ho (jaise 1000) aur array chhota ho?**  
→ Toh practically normal `mapAsync` jaisa behave karega.

**Q. Error handling?**  
→ Koi bhi promise reject hua toh turant pura reject kar diya.

---

## Ek line summary (last mein bol dena):

> "mapAsyncLimit basically controlled concurrency deta hai. Main active tasks ki counting karta hoon, aur jaise hi koi task free hota hai, next task start kar deta hoon. Order maintain karne ke liye index use kiya."

---

Bhai yeh solid answer hai interview ke liye.
