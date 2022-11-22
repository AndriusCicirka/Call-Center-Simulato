'use strict';

import data from './Callers.json' assert { type: 'json' };

const callerArray = data.callers;

let incomingCall;
let latestCaller;

//////////////////////////////////////////////////////////////////////////////////

const lineOne = {
   limit: 6,
   length: 0,
   isEmpty: true,
   isFull: false,
   sublineREG: [],
   sublineVIP: [],
   line: [],
};
const lineTwo = structuredClone(lineOne);
const lineThree = structuredClone(lineOne);

//////////////////////////////////////////////////////////////////////////////////

let isWorking = false;
let debugMode = false;

const workingButton = document.querySelector('#workingStatusButton');
const addCallerButton = document.querySelector('#addCallerButton');
const debugModeButton = document.querySelector('#debugModeButton');
const acceptCallButton1 = document.querySelector('#acceptCallButton1');
const acceptCallButton2 = document.querySelector('#acceptCallButton2');
const acceptCallButton3 = document.querySelector('#acceptCallButton3');

const formName = document.querySelector('#form_Name');
const formPhoneNumber = document.querySelector('#form_PhoneNumber');
const formVIP = document.querySelector('#form_VIP');
const formCallReason = document.querySelector('#form_CallReason');
const formComments = document.querySelector('#form_AdditionalComments');

const acceptedCallName = document.querySelector('#acceptedCallName');
const acceptedPhoneNumber = document.querySelector('#acceptedPhoneNumber');
const acceptedCallerStatus = document.querySelector('#acceptedCallerStatus');
const acceptedCallReason = document.querySelector('#acceptedCallReason');
const acceptedCallComments = document.querySelector('#acceptedCallComments');

const floatingWindow = document.querySelector('.floating__window');
const floatingWindowOverlay = document.querySelector('.overlay');
const floatingWindowButton = document.querySelector(
   '.floating__window--button'
);

//////////////////////////////////////////////////////////////////////////////////

const htmlToInsert = `<div class="call__line--element caller--empty"></div>`;
const lineOneHTML = document.querySelector('.call__line--one');
const lineTwoHTML = document.querySelector('.call__line--two');
const lineThreeHTML = document.querySelector('.call__line--three');

const initializeLineDisplay = function (lineHTML) {
   for (let i = 0; i < lineOne.limit; i++) {
      lineHTML.insertAdjacentHTML('beforeend', htmlToInsert);
   }
};

initializeLineDisplay(lineOneHTML);
initializeLineDisplay(lineTwoHTML);
initializeLineDisplay(lineThreeHTML);

const lineOneElements = lineOneHTML.querySelectorAll('.call__line--element');
const lineTwoElements = lineTwoHTML.querySelectorAll('.call__line--element');
const lineThreeElements = lineThreeHTML.querySelectorAll(
   '.call__line--element'
);

function updateLineDisplay(line, lineElements) {
   lineElements.forEach((element, i) => {
      if (!line.line[i]) {
         element.classList.remove('caller--vip');
         element.classList.remove('caller--reg');
         element.classList.add('caller--empty');
      } else if (line.line[i]['VIP']) {
         element.classList.add('caller--vip');
         element.classList.remove('caller--reg');
         element.classList.remove('caller--empty');
      } else if (!line.line[i]['VIP']) {
         element.classList.remove('caller--vip');
         element.classList.add('caller--reg');
         element.classList.remove('caller--empty');
      }
   });
}

function updateAllLineDisplay() {
   updateLineDisplay(lineOne, lineOneElements);
   updateLineDisplay(lineTwo, lineTwoElements);
   updateLineDisplay(lineThree, lineThreeElements);
}

updateAllLineDisplay();

//////////////////////////////////////////////////////////////////////////////////

const callLog = {
   callerName: [],
   callerPhoneNumber: [],
   callerStatus: [],
   callerReason: [],
   callerComments: [],
};

function latestCallerDetails() {
   formPhoneNumber.value = latestCaller['number'];
   if (latestCaller['VIP']) {
      formVIP.value = 'VIP';
   } else {
      formVIP.value = 'REG';
   }

   acceptedCallName.textContent = `Caller Name: ${latestCaller['name']}`;
   acceptedPhoneNumber.textContent = `Phone Number: ${latestCaller['number']}`;
   acceptedCallerStatus.textContent = `Is a VIP: ${latestCaller['VIP']}`;
   acceptedCallReason.textContent = `Call Reason: ${latestCaller['reason']}`;
   acceptedCallComments.textContent = `Additional Comments: ${latestCaller['comments']}`;
}

function insertCallLog() {
   callLog.callerName.push(formName);
   callLog.callerPhoneNumber.push(formPhoneNumber);
   callLog.callerStatus.push(formVIP);
   callLog.callerReason.push(formCallReason);
   callLog.callerComments.push(formComments);
}

const toggleFloatingWindow = function (visible = true) {
   if (visible) {
      floatingWindow.classList.remove('hidden');
      floatingWindowOverlay.classList.remove('hidden');
   } else {
      floatingWindow.classList.add('hidden');
      floatingWindowOverlay.classList.add('hidden');
   }
};

floatingWindowButton.addEventListener('click', (event) => {
   event.preventDefault();
   toggleFloatingWindow(false);
   console.log(formName.value);
   insertCallLog();
   formName.value = '';
   formCallReason.value = '';
   formComments.value = '';
});

//////////////////////////////////////////////////////////////////////////////////

function updateLine(line, display = true) {
   line.length = line.sublineREG.length + line.sublineVIP.length;

   if (line.length == line.limit) {
      line.isFull = true;
   } else {
      line.isFull = false;
   }

   if (line.length == 0) {
      line.isEmpty = true;
   } else {
      line.isEmpty = false;
   }

   line.line = line.sublineVIP.concat(line.sublineREG);

   if (display) console.log(line);
}

function updateAllLines(bool) {
   updateLine(lineOne, bool);
   updateLine(lineTwo, bool);
   updateLine(lineThree, bool);
}

//////////////////////////////////////////////////////////////////////////////////

function insertToLine(incomingCall, line) {
   if (incomingCall['VIP'] == true) {
      line.sublineVIP.push(incomingCall);
   } else {
      line.sublineREG.push(incomingCall);
   }
   updateAllLines();
}

function comparativeInsert(incomingCall, a, b) {
   if (a.length <= b.length) {
      insertToLine(incomingCall, a);
   } else {
      insertToLine(incomingCall, b);
   }
}

function comparativeInsertAll(incomingCall) {
   if (lineOne.length <= lineTwo.length && lineOne.length <= lineThree.length) {
      insertToLine(incomingCall, lineOne);
   } else if (
      lineOne.length >= lineTwo.length &&
      lineTwo.length <= lineThree.length
   ) {
      insertToLine(incomingCall, lineTwo);
   } else {
      insertToLine(incomingCall, lineThree);
   }
}

function getRandomInt(max) {
   return Math.floor(Math.random() * max);
}

function insertCall(arrayLength, ignoreWorkingState = false) {
   console.log('insertCall function called');
   incomingCall = callerArray[getRandomInt(arrayLength - 1)];
   //
   if (isWorking || ignoreWorkingState) {
      //
      if (lineOne.isFull && lineTwo.isFull && lineThree.isFull) {
         console.log('Call lines are full');
         //
      } else if (lineThree.isEmpty) {
         //
         if (!lineOne.isFull && lineTwo.isEmpty) {
            insertToLine(incomingCall, lineOne);
            //
         } else if (lineOne.isFull && lineTwo.isEmpty) {
            lineOne.sublineVIP.forEach(() => {
               lineTwo.sublineVIP.push(lineOne.sublineVIP.shift());
            });

            while (lineOne.line.length > lineTwo.line.length) {
               updateAllLines(false);
               lineTwo.sublineREG.push(lineOne.sublineREG.shift());
            }
            //
            comparativeInsert(incomingCall, lineOne, lineTwo);
            //
         } else if (!lineOne.isFull || !lineTwo.isFull) {
            comparativeInsert(incomingCall, lineOne, lineTwo);
            //
         } else if (lineOne.isFull && lineTwo.isFull) {
            //
            while (lineThree.length < lineThree.limit * 0.4) {
               //
               if (lineOne.sublineVIP.length > 1) {
                  lineThree.sublineVIP.push(lineOne.sublineVIP.shift());
                  updateAllLines(false);
               }

               if (lineTwo.sublineVIP.length > 1) {
                  lineThree.sublineVIP.push(lineTwo.sublineVIP.shift());
                  updateAllLines(false);
               }

               if (lineOne.sublineREG.length > 1) {
                  lineThree.sublineREG.push(lineOne.sublineREG.shift());
                  updateAllLines(false);
               }

               if (lineTwo.sublineREG.length > 1) {
                  lineThree.sublineREG.push(lineTwo.sublineREG.shift());
                  updateAllLines(false);
               }
            }

            comparativeInsertAll(incomingCall);
         }
         //IF LINETHREE IS EMPTY ^
      } else {
         //IF LINETHREE IS NOT EMPTY
         comparativeInsertAll(incomingCall);
      }
   }

   updateAllLineDisplay();
}

//////////////////////////////////////////////////////////////////////////////////

workingButton.addEventListener('click', (event) => {
   event.preventDefault();
   if (!isWorking) {
      workingButton.classList.add('button__true');
      workingButton.classList.remove('button__false');
      isWorking = true;
   } else {
      workingButton.classList.remove('button__true');
      workingButton.classList.add('button__false');
      isWorking = false;
   }
});

addCallerButton.addEventListener('click', (event) => {
   event.preventDefault();
   insertCall(callerArray.length, true);
});

debugModeButton.addEventListener('click', (event) => {
   event.preventDefault();
   if (!debugMode) {
      debugMode = true;
      debugModeButton.classList.add('button__true');
      debugModeButton.classList.remove('button__false');
   } else {
      debugMode = false;
      debugModeButton.classList.remove('button__true');
      debugModeButton.classList.add('button__false');
   }
});

//////////////////////////////////////////////////////////////////////////////////

function acceptCall(line, debug = false) {
   if (!line.isEmpty) {
      if (line.sublineVIP.length > 0) {
         latestCaller = line.sublineVIP.shift();
      } else {
         latestCaller = line.sublineREG.shift();
      }

      if (!debug) toggleFloatingWindow();
      updateAllLines();
   } else {
      console.log('Line is empty!');
   }
}

//////////////////////////////////////////////////////////////////////////////////

acceptCallButton1.addEventListener('click', (event) => {
   event.preventDefault();
   acceptCall(lineOne, debugMode);
   latestCallerDetails();
   updateLineDisplay(lineOne, lineOneElements);
});

acceptCallButton2.addEventListener('click', (event) => {
   event.preventDefault();
   acceptCall(lineTwo, debugMode);
   latestCallerDetails();
   updateLineDisplay(lineTwo, lineTwoElements);
});

acceptCallButton3.addEventListener('click', (event) => {
   event.preventDefault();
   acceptCall(lineThree, debugMode);
   latestCallerDetails();
   updateLineDisplay(lineThree, lineThreeElements);
});

//////////////////////////////////////////////////////////////////////////////////

let time = 10000;

setInterval(() => {
   if (isWorking) {
      insertCall(callerArray.length);
   }
   console.log('Tick');
}, time);

//////////////////////////////////////////////////////////////////////////////////

// const exitButton = document.querySelector('#exitProgram');
// exitButton.addEventListener('click', (event) => {
//    event.preventDefault();
//    close();
// });

//////////////////////////////////////////////////////////////////////////////////

const downloadButton = document.querySelector('#downloadCallLogs');
let csv = 'Call Log\n';

function download_csv_file() {
   for (let i = 0; i <= callLog.length; i++) {
      let logArray = [
         callLog.callerName[i].textContent,
         callLog.callerPhoneNumber[i].value,
         callLog.callerStatus[i].value,
         callLog.callerReason[i].textContent,
         callLog.callerComments[i].textContent,
      ];
      csv += logArray.join('\r\n');
      csv += '\n';
   }

   const blob = new Blob([csv], { type: 'application/csv' });
   const url = URL.createObjectURL(blob);
   console.log(url);

   const a = document.createElement('a');
   a.download = 'Call Log.csv';
   a.href = url;
   a.style.display = 'none';

   document.body.appendChild(a);

   a.click();
   URL.revokeObjectURL(url);
   a.remove();
}

downloadButton.addEventListener('click', () => {
   download_csv_file();
});
