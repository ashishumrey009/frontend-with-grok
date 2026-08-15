# Chapter 25: Prototypes (Full Details + Interview Questions)

**Interviewer:** Prototypes explain karo.

**Tum (Kahani style):**

```
Socho ek family hai.

Dada ke paas ek bada ghar hai. 🏠
Papa ke paas car hai. 🚗
Tum ke paas phone hai. 📱

Tum ghar use kar sakte ho → Dada se mila!
Tum car use kar sakte ho → Papa se mila!

JavaScript mein yahi Prototype hai!

"Jo cheez mere paas nahi hai,
 main apne PARENT se maangta hoon!"
```

---

## 1. Har Object ka ek `__proto__` hota hai

```js
const obj = { name: "Ashish" };

console.log(obj.__proto__);
// → Object.prototype
// Yeh uska "parent" hai!

// Matlab:
// obj ke paas "toString" nahi hai
// but phir bhi kaam karta hai:
obj.toString(); // "[object Object]"
// Kyun? __proto__ se mila!
```

---

## 2. Prototype Chain — Kahani

```
obj
 └── __proto__ → Object.prototype
                  └── __proto__ → null
                                   ↑
                              Chain khatam!

Jab obj.something dhundha:
  1. obj mein hai? → use karo ✅
  2. obj.__proto__ mein hai? → use karo ✅
  3. Object.prototype mein hai? → use karo ✅
  4. null → undefined return karo ❌
```

---

## 3. Function ka `prototype`

```js
function Person(name) {
  this.name = name;
}

Person.prototype.greet = function () {
  console.log("Hello! Main hoon", this.name);
};

const p1 = new Person("Ashish");
const p2 = new Person("Rahul");

p1.greet(); // "Hello! Main hoon Ashish"
p2.greet(); // "Hello! Main hoon Rahul"

// greet() dono ke paas hai?
// NAHI! Sirf Person.prototype pe hai!
// Dono share karte hain! ✅

console.log(p1.__proto__ === Person.prototype); // true
console.log(p1.greet === p2.greet); // true (same function)
```

**Kyun prototype pe method daalte hain?**
- Har object ke andar method copy nahi hota
- Memory bachti hai
- Ek jagah change karo, sab jagah reflect hota hai

---

## 4. `__proto__` vs `prototype` (Sabse Confused)

| Cheez         | Kya hai?                         | Kispe milta hai?    |
|---------------|----------------------------------|---------------------|
| `__proto__`   | Object ka actual prototype link  | Har object pe       |
| `prototype`   | Constructor ka blueprint         | Sirf functions pe   |

```js
function Person(name) {
  this.name = name;
}
const p = new Person("Ashish");

// Connection:
p.__proto__ === Person.prototype; // true ✅

// Simple yaad rakho:
// prototype → "Parent ka ghar"
// __proto__  → "Mera baap kaun hai"
```

---

## 5. `new` keyword ke andar kya hota hai?

```js
function Person(name) {
  this.name = name;
}

const p = new Person("Ashish");

// new ke andar yeh hota hai:
// 1. Ek naya empty object banao {}
// 2. __proto__ set karo Person.prototype se
// 3. this = naya object
// 4. Constructor chalao
// 5. Object return karo

// Behind the scenes (manual):
function myNew(Constructor, ...args) {
  const obj = {};
  obj.__proto__ = Constructor.prototype;
  const result = Constructor.apply(obj, args);
  return result instanceof Object ? result : obj;
}

const p2 = myNew(Person, "Ashish");
// Same as: new Person("Ashish")
```

---

## 6. Class bhi Prototype hi hai!

```js
// ES6 Class:
class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    console.log(this.name, "bol raha hai!");
  }
}

// Yeh EXACTLY same hai:
function Animal(name) {
  this.name = name;
}
Animal.prototype.speak = function () {
  console.log(this.name, "bol raha hai!");
};

// Class = Prototype ka SUGAR SYNTAX hai! ✅
typeof Animal; // "function" ← Class bhi function hai!
```

---

## 7. Full Inheritance Example

```js
function Animal(name) {
  this.name = name;
}
Animal.prototype.eat = function () {
  console.log(this.name, "kha raha hai!");
};

function Dog(name, breed) {
  Animal.call(this, name); // Step 1: parent constructor
  this.breed = breed;
}

// Step 2: Prototype chain link
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog; // Step 3: constructor fix

Dog.prototype.bark = function () {
  console.log(this.name, "bhaunk raha hai!");
};

const dog = new Dog("Tommy", "Labrador");

dog.bark();    // Tommy bhaunk raha hai! (Dog.prototype)
dog.eat();     // Tommy kha raha hai! (Animal.prototype)
dog.toString(); // (Object.prototype)

// Chain:
// dog
//  └── Dog.prototype
//       └── Animal.prototype
//            └── Object.prototype
//                 └── null
```

---

## 8. `Object.create()` — Direct Prototype Set

```js
const parent = {
  greet() {
    console.log("Hello from parent!");
  }
};

const child = Object.create(parent);
child.name = "Ashish";

child.greet(); // "Hello from parent!" ✅
console.log(child.__proto__ === parent); // true
```

### `Object.create()` vs `new`

|                  | `new`                          | `Object.create()`              |
|------------------|--------------------------------|--------------------------------|
| Constructor      | Chalata hai                    | Nahi chalata                   |
| Prototype link   | Haan                           | Haan                           |
| Kab use karein   | Full object banana hai         | Sirf inheritance chahiye       |

---

## 9. `hasOwnProperty` — Mera hai ya Parent ka?

```js
function Person(name) {
  this.name = name;
}
Person.prototype.greet = function () {};

const p = new Person("Ashish");

console.log(p.hasOwnProperty("name"));  // true  (own)
console.log(p.hasOwnProperty("greet")); // false (prototype se)

// for...in loop mein:
for (let key in p) {
  if (p.hasOwnProperty(key)) {
    console.log("Own:", key);       // name
  } else {
    console.log("Inherited:", key); // greet
  }
}
```

---

## 10. Prototype Pollution — Security Issue!

```js
// BAHUT DANGEROUS! ❌
Object.prototype.hack = "hacked!";

const obj = {};
console.log(obj.hack); // "hacked!"
// Saare objects affect ho gaye!

// Real attack:
const userInput = JSON.parse('{"__proto__": {"admin": true}}');
// Ab saare objects ka admin = true! 💀

// Fix:
const safeObj = Object.create(null); // koi prototype nahi! ✅
// Ya Map use karo Object ki jagah
```

---

## 11. Important Methods

```js
// 1. Object.getPrototypeOf()  (sahi tarika)
Object.getPrototypeOf(obj);

// 2. Object.setPrototypeOf()
Object.setPrototypeOf(child, parent);

// 3. instanceof
dog instanceof Dog;    // true
dog instanceof Animal; // true
dog instanceof Object; // true

// 4. Object.create(null)
const pure = Object.create(null); // koi prototype nahi
```

---

## 12. Common Interview Questions

**Q1. Prototype kya hai?**  
"Prototype ek object hai jo doosre objects ko properties aur methods inherit karne deta hai. Har object ke paas ek `__proto__` hota hai jo uske parent ko point karta hai. Jab koi property nahi milti toh JavaScript prototype chain mein upar jaata hai!"

**Q2. `__proto__` vs `prototype`?**  
```js
p.__proto__ === Person.prototype; // true
// prototype → function pe hoti hai ("Parent ka ghar")
// __proto__  → object pe hota hai ("Mera baap kaun hai")
```

**Q3. Prototype Chain kaise kaam karta hai?**  
Property pehle object mein, phir `__proto__` mein, phir uske upar... `null` tak.

**Q4. `new` keyword ke andar kya hota hai?**  
```js
function myNew(Constructor, ...args) {
  const obj = {};
  obj.__proto__ = Constructor.prototype;
  const result = Constructor.apply(obj, args);
  return result instanceof Object ? result : obj;
}
```

**Q5. Inheritance kaise karoge?**  
```js
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;
Animal.call(this, name); // properties ke liye
```

**Q6. `instanceof` kaise kaam karta hai?**  
```js
function myInstanceOf(obj, Constructor) {
  let proto = Object.getPrototypeOf(obj);
  while (proto !== null) {
    if (proto === Constructor.prototype) return true;
    proto = Object.getPrototypeOf(proto);
  }
  return false;
}
```

**Q7. Class aur Prototype mein fark?**  
Sirf syntax ka fark. Class = Syntactic Sugar. Andar se same prototype inheritance.

**Q8. Prototype Pollution kya hai?**  
`Object.prototype` ko modify karne se saare objects affect hote hain. Fix: `Object.create(null)` ya `Map`.

**Q9. `Object.create()` vs `new`?**  
`new` → constructor bhi chalata hai  
`Object.create()` → sirf prototype link karta hai

**Q10. `hasOwnProperty` vs `in`?**  
```js
"toString" in obj               // true (prototype se bhi)
obj.hasOwnProperty("toString")  // false (sirf own)
```

---

## Ek Line Summary (Interview mein bol dena)

> "Prototype ek parent object hai. Har object apne `__proto__` se properties inherit karta hai. Yahi chain banati hai — Prototype Chain! Class bhi andar se prototype hi use karti hai — sirf syntax alag hai."
