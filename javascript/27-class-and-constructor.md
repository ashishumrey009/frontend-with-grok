# Chapter 27: Class and Constructor (Complete + Interview Ready)

**Interviewer:** Class aur Constructor explain karo.

**Tum:**

"Class ek blueprint hai objects banane ka. Constructor special method hai jo object banate time automatically chalta hai aur properties set karta hai. Andar se class bhi prototype hi use karti hai."

---

## 1. Basic Class

```js
class Person {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  greet() {
    console.log(`Hi, I am ${this.name}`);
  }
}

const p1 = new Person("Ashish", 25);
p1.greet(); // Hi, I am Ashish
```

---

## 2. Constructor

`constructor` object create hote time automatically call hota hai.

**Rules:**
- Class mein sirf **ek** constructor hota hai
- Agar nahi likho toh empty constructor milta hai
- `new` ke bina class call karoge toh TypeError aayega

```js
class Person {
  constructor(name) {
    this.name = name;
  }
}

const p1 = new Person("Ashish"); // OK
Person("Ashish"); // Error! Class constructor cannot be invoked without 'new'
```

---

## 3. `new` ke andar kya hota hai? ⭐

```js
class Person {
  constructor(name) {
    this.name = name;
  }
}

const p = new Person("Ashish");

// new ke andar YEH hota hai:

// Step 1: Naya empty object banao
const obj = {};

// Step 2: Prototype link karo
obj.__proto__ = Person.prototype;

// Step 3: Constructor chalao (this = naya object)
Person.call(obj, "Ashish");

// Step 4: Object return karo
return obj;

// Manual implementation:
function myNew(Constructor, ...args) {
  const obj = Object.create(Constructor.prototype);
  const result = Constructor.apply(obj, args);
  return result instanceof Object ? result : obj;
}

const p2 = myNew(Person, "Rahul");
p2.name; // "Rahul" ✅
```

---

## 4. Methods + Static Methods + Static Properties

```js
class Config {
  // Static property
  static version = "1.0.0";
  static count = 0;

  constructor(name) {
    this.name = name;
    Config.count++; // kitne objects bane!
  }

  // Instance method
  greet() {
    console.log(`Hi ${this.name}`);
  }

  // Static method
  static getCount() {
    return Config.count;
  }

  static info() {
    console.log("This is Config class");
  }
}

const c1 = new Config("App1");
const c2 = new Config("App2");

console.log(Config.version);    // "1.0.0"
console.log(Config.getCount()); // 2
console.log(c1.version);        // undefined ❌
// Static = class ka, instance ka nahi!
```

---

## 5. Inheritance + Method Overriding + `super`

```js
class Animal {
  constructor(name) {
    this.name = name;
  }

  speak() {
    return `${this.name} makes a sound`;
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name);        // parent constructor (zaroori!)
    this.breed = breed;
  }

  speak() {
    // Parent ka method bhi chalao!
    const parentSpeech = super.speak();
    return `${parentSpeech} ... and barks!`;
  }
}

const d = new Dog("Tommy", "Labra");
console.log(d.speak());
// "Tommy makes a sound ... and barks!" ✅

// super()        → parent constructor
// super.method() → parent method
```

**`super()` kyun zaroori hai?**  
Child constructor mein `this` use karne se pehle parent constructor call karna padta hai.

---

## 6. Private Fields + Public Fields + Private Methods

```js
class Person {
  // Public field
  species = "Human";

  // Private field
  #password = null;

  // Private method
  #validate(pass) {
    return pass.length >= 8;
  }

  constructor(name, password) {
    this.name = name;
    if (this.#validate(password)) {
      this.#password = password;
    } else {
      throw new Error("Password too short!");
    }
  }

  get isLoggedIn() {
    return this.#password !== null;
  }
}

const p = new Person("Ashish", "secret123");
console.log(p.species);    // "Human" ✅
console.log(p.isLoggedIn); // true ✅
console.log(p.#password);  // Error! ❌
```

---

## 7. Getters & Setters

```js
class Person {
  constructor(name) {
    this._name = name;
  }

  get name() {
    return this._name.toUpperCase();
  }

  set name(value) {
    if (value.length < 2) throw new Error("Name too short");
    this._name = value;
  }
}

const p = new Person("ashish");
console.log(p.name); // ASHISH
p.name = "Rahul";
```

---

## 8. Mixin Pattern — Multiple Inheritance

```js
// JavaScript mein multiple inheritance directly nahi hoti!
// ❌ class C extends A, B {} // SyntaxError!

// ✅ Mixin se karo:
const Flyable = (Base) =>
  class extends Base {
    fly() {
      console.log(this.name, "is flying!");
    }
  };

const Swimmable = (Base) =>
  class extends Base {
    swim() {
      console.log(this.name, "is swimming!");
    }
  };

class Animal {
  constructor(name) {
    this.name = name;
  }
}

// Dono mix karo!
class Duck extends Flyable(Swimmable(Animal)) {}

const d = new Duck("Donald");
d.fly();  // Donald is flying! ✅
d.swim(); // Donald is swimming! ✅
```

---

## 9. `instanceof` — Kaise Kaam Karta Hai?

```js
class Animal {}
class Dog extends Animal {}

const d = new Dog();

console.log(d instanceof Dog);    // true
console.log(d instanceof Animal); // true ← prototype chain
console.log(d instanceof Object); // true

// Manual implementation:
function myInstanceOf(obj, Constructor) {
  let proto = Object.getPrototypeOf(obj);
  while (proto !== null) {
    if (proto === Constructor.prototype) return true;
    proto = Object.getPrototypeOf(proto);
  }
  return false;
}
```

---

## 10. Abstract Class Pattern

```js
// JavaScript mein built-in abstract class nahi!
// But pattern se bana sakte hain:

class Shape {
  constructor() {
    if (new.target === Shape) {
      throw new Error("Shape directly instantiate nahi kar sakte!");
    }
  }

  // Abstract method
  area() {
    throw new Error("area() implement karo!");
  }

  describe() {
    return `Area is: ${this.area()}`;
  }
}

class Circle extends Shape {
  constructor(radius) {
    super();
    this.radius = radius;
  }
  area() {
    return Math.PI * this.radius ** 2;
  }
}

// new Shape();  // Error! ❌
const c = new Circle(5);
console.log(c.describe()); // "Area is: 78.53..." ✅

// new.target = currently call ho rahi constructor class!
```

---

## 11. Hoisting — Common Mistake

```js
// Function Constructor → HOIST HOTI HAI!
const p1 = new Person("Ashish"); // ✅ Kaam karta hai!
function Person(name) {
  this.name = name;
}

// Class → HOIST NAHI HOTI! (TDZ)
const p2 = new Animal("Cat"); // ❌ ReferenceError!
class Animal {
  constructor(name) {
    this.name = name;
  }
}
```

---

## 12. `toString` aur `valueOf` Override

```js
class Temperature {
  constructor(celsius) {
    this.celsius = celsius;
  }

  toString() {
    return `${this.celsius}°C`;
  }

  valueOf() {
    return this.celsius;
  }
}

const temp = new Temperature(37);

console.log(`Body temp: ${temp}`); // "Body temp: 37°C"
console.log(temp + 10);            // 47
console.log(temp > 36);            // true
```

---

## 13. Class vs Constructor Function (Under the Hood)

```js
// Class
class Person {
  constructor(name) {
    this.name = name;
  }
  greet() {
    console.log(this.name);
  }
}

// Exactly same as:
function Person(name) {
  this.name = name;
}
Person.prototype.greet = function () {
  console.log(this.name);
};

typeof Person; // "function"
```

**Matlab:** Class sirf syntactic sugar hai. Andar se prototype hi use hota hai.

---

## Comparison Table

| Feature            | Class              | Constructor Function   |
|--------------------|--------------------|------------------------|
| `new` zaroori      | ✅ Error aata hai  | ❌ Silent fail         |
| Hoisting           | ❌ TDZ             | ✅ Hoti hai            |
| Private fields     | ✅ `#` se          | ❌ Nahi                |
| Static fields      | ✅                 | ❌ Manually            |
| Abstract pattern   | ✅ `new.target`    | ✅ `new.target`        |
| Multiple inherit   | ❌ Mixin se        | ❌ Mixin se            |
| Strict mode        | ✅ Auto            | ❌ Manual              |

---

## Complete Interview Q&A

**Q1. Class kya hai?**  
→ Objects banane ka blueprint. Andar se prototype based hai.

**Q2. Constructor ka kaam?**  
→ Object create hote time properties initialize karna. `new` se auto call hota hai.

**Q3. `new` keyword ke andar kya hota hai?**  
→ 1. Empty object banao  
→ 2. `__proto__` = Constructor.prototype  
→ 3. Constructor chalao (`this` = object)  
→ 4. Object return karo

**Q4. `super()` kyun call karte hain?**  
→ Parent constructor chalane ke liye. `this` se pehle zaroori hai.

**Q5. `super()` aur `super.method()` mein fark?**  
→ `super()` = parent constructor  
→ `super.method()` = parent method

**Q6. Class vs Constructor Function?**  
→ Syntax ka farak. Dono prototype use karte hain. Class ko `new` ke bina call nahi kar sakte.

**Q7. Static method/property kab use karte hain?**  
→ Jab data/method instance se nahi class se related ho (counter, config, utility).

**Q8. Private field kaise banate ho?**  
→ `#` se. Bahar se access nahi hota.

**Q9. Multiple inheritance kaise karoge?**  
→ Mixin pattern: `class C extends Mixin1(Mixin2(Base))`

**Q10. Abstract class kaise banate hain JS mein?**  
→ `new.target` check karo: `if (new.target === MyClass) throw Error`

**Q11. `instanceof` kaise kaam karta hai?**  
→ Prototype chain mein Constructor.prototype ko dhundhta hai.

**Q12. Class hoist hoti hai?**  
→ Nahi. TDZ mein rehti hai.

**Q13. `new.target` kya hai?**  
→ Currently call ho rahi constructor class. Abstract pattern mein use hota hai.

---

## Ek Line Summary (Interview mein bol dena)

> "Class prototype ka sugar syntax hai. `new` = object banao + proto link + constructor chalao. Private fields (`#`) se encapsulation. Static = class ka, instance ka nahi. Multiple inheritance = Mixin pattern. Abstract class = `new.target` se. Andar se sab prototype hai — class sirf clean syntax hai!"
