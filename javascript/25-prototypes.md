# Chapter 25: Prototypes (Full Details + Interview Questions)

**Interviewer:** Prototypes explain karo.

**Tum:**

"JavaScript mein har object ke paas ek hidden property hoti hai → `[[Prototype]]`. Isse hum `.__proto__` se access karte hain.

Jab tum kisi object pe property/method access karte ho:
1. Pehle **us object** mein dhundhta hai
2. Nahi mili toh uske **prototype** mein dhundhta hai
3. Wahan bhi nahi mili toh uske prototype ke prototype mein...
4. `null` tak jaata hai

Is pure chain ko **Prototype Chain** kehte hain."

---

## 1. Simple Example

```js
const animal = {
  eats: true,
  walk() {
    console.log("Animal walking");
  }
};

const dog = {
  barks: true
};

// dog ka prototype animal bana diya
dog.__proto__ = animal;

console.log(dog.barks);  // true  (khud ke paas)
console.log(dog.eats);   // true  (prototype se mila)
dog.walk();              // Animal walking
```

---

## 2. `__proto__` vs `prototype` (Bahut Confused karne wala)

| Cheez              | Kya hai?                                      | Kispe milta hai?       |
|--------------------|-----------------------------------------------|------------------------|
| `__proto__`        | Object ka actual prototype                    | Har object pe          |
| `prototype`        | Constructor function ki property              | Sirf functions pe      |

```js
function Person(name) {
  this.name = name;
}

const p1 = new Person("Ashish");

console.log(p1.__proto__ === Person.prototype); // true
console.log(Person.prototype.__proto__ === Object.prototype); // true
console.log(Object.prototype.__proto__); // null
```

**Yaad rakhne ka tarika:**
- `prototype` → **function** ki property (blueprint)
- `__proto__` → **object** ka prototype link

---

## 3. Prototype Chain Visual

```
p1
  ↓ __proto__
Person.prototype
  ↓ __proto__
Object.prototype
  ↓ __proto__
null
```

---

## 4. Constructor Function + Prototype (Classic Way)

```js
function Person(name, age) {
  this.name = name;
  this.age = age;
}

// Methods prototype pe daalo (memory efficient)
Person.prototype.greet = function () {
  console.log(`Hi, I am ${this.name}`);
};

Person.prototype.isAdult = function () {
  return this.age >= 18;
};

const p1 = new Person("Ashish", 25);
const p2 = new Person("Rahul", 17);

p1.greet();           // Hi, I am Ashish
console.log(p2.isAdult()); // false

// Dono objects same method share kar rahe hain
console.log(p1.greet === p2.greet); // true
```

**Kyun prototype pe method daalte hain?**
- Har object ke andar method copy nahi hota
- Memory bachti hai
- Ek jagah change karo, sab jagah reflect hota hai

---

## 5. `Object.create()` se Inheritance

```js
const animal = {
  eats: true,
  walk() {
    console.log("Walking");
  }
};

const rabbit = Object.create(animal);
rabbit.jumps = true;

console.log(rabbit.eats);  // true (prototype se)
rabbit.walk();             // Walking
```

`Object.create(proto)` → naya object banata hai jiska prototype `proto` hota hai.

---

## 6. Modern `class` bhi Prototype pe based hai

```js
class Person {
  constructor(name) {
    this.name = name;
  }

  greet() {
    console.log(`Hi ${this.name}`);
  }
}

const p1 = new Person("Ashish");

console.log(typeof Person);                // function
console.log(p1.__proto__ === Person.prototype); // true
console.log(p1.greet === Person.prototype.greet); // true
```

**Matlab:** `class` sirf syntactic sugar hai. Andar se wahi prototype inheritance chal raha hai.

---

## 7. Important Methods

```js
const obj = { name: "Ashish" };

// 1. hasOwnProperty → sirf khud ki property check karta hai
console.log(obj.hasOwnProperty("name")); // true
console.log(obj.hasOwnProperty("toString")); // false

// 2. isPrototypeOf
console.log(Object.prototype.isPrototypeOf(obj)); // true

// 3. instanceof
function Person() {}
const p = new Person();
console.log(p instanceof Person); // true
console.log(p instanceof Object); // true

// 4. Object.getPrototypeOf / setPrototypeOf
console.log(Object.getPrototypeOf(p) === Person.prototype); // true
```

---

## 8. Inheritance Example (Full)

```js
function Animal(name) {
  this.name = name;
}

Animal.prototype.eat = function () {
  console.log(`${this.name} is eating`);
};

function Dog(name, breed) {
  Animal.call(this, name); // parent constructor call
  this.breed = breed;
}

// Inheritance setup
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

Dog.prototype.bark = function () {
  console.log(`${this.name} is barking`);
};

const d1 = new Dog("Tommy", "Labra");
d1.eat();   // Tommy is eating
d1.bark();  // Tommy is barking
```

---

## 9. Common Interview Questions

**Q1. Prototype kya hota hai?**  
→ Har object ke paas ek hidden `[[Prototype]]` hota hai. Property nahi mili toh usme dhundhta hai.

**Q2. `__proto__` aur `prototype` mein farak?**  
→ `prototype` function ki property hai.  
→ `__proto__` object ka actual prototype link hai.  
→ `obj.__proto__ === Constructor.prototype`

**Q3. Prototype Chain kya hai?**  
→ Object → uska prototype → uska prototype → ... → `Object.prototype` → `null`

**Q4. Kyun methods prototype pe define karte hain?**  
→ Memory efficient. Saare instances same method share karte hain.

**Q5. `Object.create` kya karta hai?**  
→ Naya object banata hai jiska prototype specified object hota hai.

**Q6. `hasOwnProperty` vs `in` operator?**  
```js
"toString" in obj          // true (prototype se bhi check)
obj.hasOwnProperty("toString") // false (sirf own)
```

**Q7. `instanceof` kaise kaam karta hai?**  
→ Object ki prototype chain mein Constructor.prototype ko dhundhta hai.

**Q8. Class inheritance ke peeche kya hota hai?**  
→ Wahi prototype chain set hoti hai. `class` sirf sugar hai.

**Q9. `null` prototype wala object kaise banaye?**  
```js
const pure = Object.create(null); // koi prototype nahi
```

**Q10. Prototype pollution kya hota hai?**  
→ `Object.prototype` ko modify karne se saare objects affect hote hain (security risk).

---

## 10. Quick Summary (Interview mein bol dena)

> "JavaScript prototypal inheritance use karta hai. Har object ke paas `[[Prototype]]` hota hai. Property nahi mili toh prototype chain mein upar jata hai. `prototype` property constructor functions pe hoti hai, `__proto__` objects pe. Modern `class` bhi andar se prototype hi use karti hai. Methods ko prototype pe rakhne se memory efficient hota hai."
