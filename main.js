let themeToggle = document.querySelector(".theme-toggle");

let currentTheme = localStorage.getItem("theme");
if (!currentTheme) {
  // os default
  var preference = window.matchMedia("(prefers-color-scheme: dark)");
  if (preference.matches) {
    currentTheme = "dark";
  } else {
    currentTheme = "light";
  }
}

if (currentTheme === "dark") toggleTheme(false);

function toggleTheme(setLocalStorage = true) {
  document.body.classList.toggle("dark-mode");

  if (document.body.classList.contains("dark-mode")) {
    themeToggle.textContent = "Light Mode";

    if (setLocalStorage) localStorage.setItem("theme", "dark");
  } else {
    themeToggle.textContent = "Dark Mode";

    if (setLocalStorage) localStorage.setItem("theme", "light");
  }
}

//
function executeFunc(calcBodyFunction) {
  if (calcBodyFunction.isFourFunc) {
    if (currNum) {
      prevNum = currBodyFunction.func();
      currNum = null;
      currBodyFunction = null;
    }

    if (currBodyFunction) {
      op = currBodyFunction;
      currBodyFunction = null;
      op.func();
      currBodyFunction = calcBodyFunction;
    } else {
      currBodyFunction = calcBodyFunction;
    }
  } else {
    calcBodyFunction.func();
  }
}

function add() {
  return (Number(prevNum) + Number(currNum)).toString();
}

function subtract() {
  return (Number(prevNum) - Number(currNum)).toString();
}

function multiply() {
  return (Number(prevNum) * Number(currNum)).toString();
}

function divide() {
  if (Number(currNum) === 0) {
    handleError("Tried to divide by 0", true);
    return "0";
  } else {
    return (Number(prevNum) / Number(currNum)).toString();
  }
}

function addDecimal() {
  if (currNum) {
    if (!currNum.includes(".")) {
      currNum += ".";
    }
  } else if (prevNum) {
    if (!prevNum.includes(".")) {
      prevNum += ".";
    }
  }
}

function equals() {
  if (currBodyFunction && !currNum) {
    handleError("Can't use = when there is no second number", false);
  } else {
    if (currBodyFunction) {
      executeFunc(currBodyFunction);
      currBodyFunction = null;
    } else {
      // do nothing
    }
  }
}

function clear() {
  prevNum = "0";
  currBodyFunction = null;
  currNum = null;
}

function back() {
  if (currNum && currNum !== "0") {
    currNum = currNum.slice(0, currNum.length - 1);

    if (currNum === "") {
      currNum = "0";
    }
  } else if (prevNum !== "0" && !currBodyFunction) {
    prevNum = prevNum.slice(0, prevNum.length - 1);

    if (prevNum === "") {
      prevNum = "0";
    }
  }
}

function negate() {
  if (currNum && currNum !== "0") {
    currNum = (-1 * Number(currNum)).toString();
  } else if (prevNum !== "0" && !currBodyFunction) {
    prevNum = (-1 * Number(prevNum)).toString();
  }
}

//
let prevNum = "0";
let currNum = null;
let currBodyFunction = null;
function operate(classList) {
  if (classList[1] === "body-function") {
    calcBodyFunction = calcBodyFunctions.find(
      (calcBody) => calcBody.name === classList[0]
    );

    executeFunc(calcBodyFunction);
  } else if (classList[1] === "digit") {
    const digit = classList[0].slice(-1);
    if (currBodyFunction) {
      if (currNum) {
        if (currNum === "0") {
          currNum = digit;
        } else {
          if ((roundDisplayNumber(prevNum, 6) + currNum).length < 24) {
            currNum += digit;
          } else {
            handleError("Maximum length of digit reached", false);
          }
        }
      } else {
        currNum = digit;
      }
    } else {
      if (prevNum === "0") {
        prevNum = digit;
      } else {
        if (prevNum.length < 24) {
          prevNum += digit;
        } else {
          handleError("Maximum length of digit reached", false);
        }
      }
    }
  }
}

//
function updateDisplay() {
  const displayP = document.querySelector(".display-p");
  if (currBodyFunction) {
    displayP.textContent = roundDisplayNumber(prevNum, 6);
    displayP.textContent += " " + currBodyFunction.value;

    if (currNum) {
      displayP.textContent += " " + currNum; // roundDisplayNumber(currNum, 6);
    }
  } else {
    displayP.textContent = prevNum;
  }
}

function roundDisplayNumber(num, decimalPlaces) {
  let newNum = String(+parseFloat(num).toFixed(decimalPlaces));
  if (newNum.includes("e")) {
    let numBefore = newNum.split("e")[0];
    let numAfter = "e" + newNum.split("e")[1];

    numBefore = String(+parseFloat(numBefore).toFixed(decimalPlaces));
    newNum = numBefore + numAfter;
  } else {
    if (num.includes(".") && !newNum.includes(".")) {
      newNum += ".";
    }
  }
  return newNum;
}

let timeoutID = null;
function handleError(eMsg, reset) {
  const errorDialog = document.querySelector(".error-dialog");
  errorDialog.textContent = eMsg;
  errorDialog.classList.add("show");

  if (timeoutID) {
    clearTimeout(timeoutID);
  }
  timeoutID = setTimeout(() => errorDialog.classList.remove("show"), 3000);

  if (reset) {
    prevNum = "0";
    currNum = null;
    currBodyFunction = null;
  }
}

//
function CalcFunc(name, value, keyMapping, func, isFourFunc) {
  this.name = name; // used to link class to function
  this.value = value; // used for display
  this.keyMapping = keyMapping; // used to link keystroke to function
  this.func = func; // the actual function
  this.isFourFunc = isFourFunc; // is four func or not
}
const calcBodyFunctions = [
  new CalcFunc("add", "+", ["+"], add, true),
  new CalcFunc("subtract", "−", ["-"], subtract, true),
  new CalcFunc("multiply", "×", ["*"], multiply, true),
  new CalcFunc("decimal", ".", ["."], addDecimal, false),
  new CalcFunc("equals", "=", ["=", "Enter"], equals, false),
  new CalcFunc("divide", "÷", ["/"], divide, true),

  new CalcFunc("clear", "", ["c"], clear, false),
  new CalcFunc("back", "", ["Backspace"], back, false),
  new CalcFunc("negate", "", ["n"], negate, false),
];

//
function createCalcBody() {
  const calcDiv = document.querySelector(".calc");

  let startDigit = 7;
  let startFunction = 0;
  for (let row = 0; row < 4; row++) {
    if (row === 3) {
      startDigit = 0;
    }

    for (let col = 0; col < 4; col++) {
      const newButton = document.createElement("button");

      if (col === 3 || (row === 3 && col > 0)) {
        const func = calcBodyFunctions[startFunction];
        newButton.textContent = func["value"];
        newButton.classList.add(func["name"]);
        newButton.classList.add("body-function");
        newButton.classList.add("main-grid");

        startFunction++;
      } else {
        newButton.textContent = startDigit;
        newButton.classList.add(`digit-${startDigit}`);
        newButton.classList.add("digit");
        newButton.classList.add("main-grid");

        startDigit++;
      }
      calcDiv.appendChild(newButton);
    }
    startDigit -= 6;
  }

  const allButtons = document.querySelectorAll("button");
  for (const button of allButtons) {
    button.onclick = function () {
      operate(button.classList);
      updateDisplay();
    };
  }
}
createCalcBody();

//
body = document.querySelector("body");
body.onkeydown = function (e) {
  calcBodyFunction = calcBodyFunctions.find((calcBody) =>
    calcBody.keyMapping.includes(e.key)
  );

  if (!calcBodyFunction && e.key.match(/^[0-9]+$/) == null) {
    return;
  }

  let button;
  if (calcBodyFunction) {
    button = document.querySelector(`.${calcBodyFunction.name}`);

    operate([calcBodyFunction.name, "body-function"]);
  } else if (e.key.match(/^[0-9]+$/) != null) {
    button = document.querySelector(`.digit-${e.key}`);

    operate([e.key, "digit"]);
  }

  updateDisplay();
  button.classList.add("active");
  setTimeout(() => button.classList.remove("active"), 100);
};

//
themeToggle.onclick = function () {
  toggleTheme();
};
