let body = document.querySelector("body");
body.spellcheck = false;
let menuBarPtags = document.querySelectorAll(".menu-bar p");
let columnTags = document.querySelector(".column-tags");
let rowNumbers = document.querySelector(".row-numbers");
let grid = document.querySelector(".grid");
let oldCell;
let formulaSelectCell = document.querySelector("#selected-cell-formula");
let dataObj = {};
let formulaInput = document.querySelector("#complete-formula");
let fileOptions = menuBarPtags[0];

fileOptions.addEventListener("click", function (e) {
    if (e.currentTarget.classList.length == 0) {
      e.currentTarget.innerHTML = `File
      <span>
      <span>Clear</span>
      <span>Open</span>
      <span>Save</span>
      </span>`;
      let allFileOptions = e.currentTarget.querySelectorAll("span>span");

      //clear
      allFileOptions[0].addEventListener("click", function () {
        let allCells = document.querySelectorAll(".cell");
        for (let i = 0; i < allCells.length; i++) {
          allCells[i].innerText = "";
          let cellAdd = allCells[i].getAttribute("data-address");
          console.log(cellAdd);
          dataObj[cellAdd] = {
            value: "",
            formula: "",
            upstream: [],
            downstream: [],
            fontSize: 10,
            fontFamily: "Arial",
            fontWeight: "normal",
            color: "black",
            backgroundColor: "white",
            underline: "none",
            italics: "normal",
            textAlign: "left",
          };
        }
      });
  
      //open
      allFileOptions[1].addEventListener("click", function () {
        //1 - Fetch dataObj from localstorage
        //2 - replace current dataObj with fetched obj
        dataObj = JSON.parse(localStorage.getItem("sheet"));
  
        //3 - Populate UI with this data
  
        for (let j = 1; j <= 100; j++) {
          for (let i = 0; i < 26; i++) {
            let address = String.fromCharCode(i + 65) + j;
            let cellObj = dataObj[address];
            let cellOnUi = document.querySelector(`[data-address=${address}]`);
            cellOnUi.innerText = cellObj.value;
            cellOnUi.style.backgroundColor = cellObj.backgroundColor;
            //same kaam css styling kelie kr sakta hu?
          }
        }
      });
  
      //save
      allFileOptions[2].addEventListener("click", function () {
        localStorage.setItem("sheet", JSON.stringify(dataObj));
      });
    }else{
        e.currentTarget.innerHTML = `File`;
    }
});
for (let i = 0; i < menuBarPtags.length; i++) {
    menuBarPtags[i].addEventListener("click", function (e) {
        if (e.currentTarget.classList.contains("menu-bar-option-selected")) {
            e.currentTarget.classList.remove("menu-bar-option-selected");
        }
        else {
            for (let j = 0; j < menuBarPtags.length; j++) {
                if (menuBarPtags[j].classList.contains("menu-bar-option-selected")) {
                    menuBarPtags[j].classList.remove("menu-bar-option-selected");
                }
            }
            e.currentTarget.classList.add("menu-bar-option-selected");
        }
    });
}

for (let i = 0; i < 26; i++) {
    let div = document.createElement("div");
    div.classList.add("column-tag-cell");
    div.innerText = String.fromCharCode(65 + i);
    columnTags.append(div);
}

for (let i = 1; i <= 100; i++) {
    let div = document.createElement("div");
    div.classList.add("row-number-cell");
    div.innerText = i;
    rowNumbers.append(div);
}

for (let j = 1; j <= 100; j++) {

    let row = document.createElement("div");
    row.classList.add("row");

    for (let i = 0; i < 26; i++) {
        let cell = document.createElement("div");
        cell.classList.add("cell");
        let address = String.fromCharCode(i + 65) + j;
        cell.setAttribute("data-address", address);
        dataObj[address] = {
            value: "",
            formula: "",
            upstream: [],
            downstream: [],
            fontSize: 10,
            fontFamily: "Arial",
            fontWeight: "normal",
            color: "black",
            backgroundColor: "white",
            underline: "none",
            italics: "normal",
            textAlign: "left"
        }
        cell.addEventListener("click", function (e) {
            //check kro koi old cell hai kya pehli se selected
            if (oldCell) {
                // agr han to use deselect kro class remove krke
                oldCell.classList.remove("grid-selected-cell");
            }
            //jis cell pr click kra use select kro class add krke
            e.currentTarget.classList.add("grid-selected-cell");
            let cellAddress = e.currentTarget.getAttribute("data-address");
            formulaSelectCell.value = cellAddress;
            //and ab jo naya cell select hogya use save krdo old cell wali variable taki next time agr click ho kisi nye cell pr to ise deselect kr pai
            oldCell = e.currentTarget;
        });
        cell.addEventListener("input", function (e) {
            let address = e.currentTarget.getAttribute("data-address");
            dataObj[address].value = Number(e.currentTarget.innerText);
            dataObj[address].formula = "";

            // upstream clear krni hai
            let currCellUpstream = dataObj[address].upstream;
            for (let i = 0; i < currCellUpstream.length; i++) {
                removeFromUpstream(address, currCellUpstream[i]); // isse mei apni upstream ke elements ki downstream se remove hounga or fir upstream clear kedunga apni
            }
            dataObj[address].upstream = []; //depending ke dowstream se khudko remove krne ke baad apni upstrean clear krdi

            // downstream ke elements update krni hai
            let currCellDownstream = dataObj[address].downstream;
            for (let i = 0; i < currCellDownstream.length; i++) {
                updateDownstreamElements(currCellDownstream[i]);
            }
        });
        cell.contentEditable = true;
        row.append(cell);
    }
    grid.append(row);
}

formulaInput.addEventListener("change", function (e) {
    let formula = e.currentTarget.value;
    let formulaArr = formula.split(" ");
    let elementsArr = [];
    let selectedCellAddress = oldCell.getAttribute("data-address");
    dataObj[selectedCellAddress].formula = formula;
    for (let i = 0; i < formulaArr.length; i++) {
        if (formulaArr[i] != "+" && formulaArr[i] != "*" && formulaArr[i] != "-" && formulaArr[i] != "/" && isNaN(Number(formulaArr[i]))) {
            elementsArr.push(formulaArr[i]);
        }
    }
    // BEFORE SETTING NEW UPSTREAM , CLEAR OLD UPSTREAM
    let oldUpstream = dataObj[selectedCellAddress].upstream;
    for (let k = 0; k < oldUpstream.length; k++) {
        removeFromUpstream(selectedCellAddress, oldUpstream[k]);
    }
    dataObj[selectedCellAddress].upstream = elementsArr;

    for (let j = 0; j < elementsArr.length; j++) {
        addToDownStream(selectedCellAddress, elementsArr[j]);
    }

    let valObj = {};
    for (let i = 0; i < elementsArr.length; i++) {
        let formulaDependency = elementsArr[i];
        valObj[formulaDependency] = dataObj[formulaDependency].value;
    }

    for (let j = 0; j < formulaArr.length; j++) {
        if (valObj[formulaArr[j]] != undefined) {
            formulaArr[j] = valObj[formulaArr[j]];
        }
    }

    formula = formulaArr.join(" ");
    let newValue = eval(formula);
    dataObj[selectedCellAddress].value = newValue;

    let selectedCellDownstream = dataObj[selectedCellAddress].downstream;
    for (let i = 0; i < selectedCellDownstream.length; i++) {
        updateDownstreamElements(selectedCellDownstream[i]);
    }

    oldCell.innerText = newValue;
    formulaInput.value = "";
});
function addToDownStream(toBeAdded, inWhichWeAreAdding) {
    let reqDownstream = dataObj[inWhichWeAreAdding].downstream;
    reqDownstream.push(toBeAdded);
}
// isse mei apni upstream ke elements ki downstream se remove hounga or fir upstream clear kerunga apni
function removeFromUpstream(dependent, onWhichItIsDepending) {
    let newDownstream = [];
    let oldDownstream = dataObj[onWhichItIsDepending].downstream; // jis pr mei depend krta hu uski downstream nikal di
    for (let i = 0; i < oldDownstream.length; i++) {
        if (oldDownstream[i] != dependent) { // ab mujhe khud ko(dependent) remove krna hai dependung ki downstream se 
            newDownstream.push(oldDownstream[i]); // to khud ko chhod ke sbko newDowstream mei daal do
        }
    }
    dataObj[onWhichItIsDepending].downstream = newDownstream; // depending ki downstream ko newDownsteam bna do

}
function updateDownstreamElements(elementAddress) {
    // 1- jis elemnet ko update kr rhe hai unki upstream elements ki current value leao, unki upstream ke elemnets ka address use krke dataObj se unki value lao unhe as key vakue pair store krdo valObj naam ke obj me.
    let valObj = {};
    let currCellUpstream = dataObj[elementAddress].upstream;

    for (let i = 0; i < currCellUpstream.length; i++) {
        let upstreamCellAddress = currCellUpstream[i];
        let upstreamCellValue = dataObj[upstreamCellAddress].value;

        valObj[upstreamCellAddress] = upstreamCellValue;
    }

    //2- jis element ko update kr rhe hai uska formula leaoo
    let currFormula = dataObj[elementAddress].formula;
    // formula ko space basis pr split krdo 
    let formulaArr = currFormula.split(" ");
    // formula array = [A!,+,B1] after splitting 
    // split krke ke baad jo array mili hai uspr loop mara and formula me jo variable hai(cells(A1,B1)) unko unki value se replace krdo
    for (let j = 0; j < formulaArr.length; j++) {
        if (valObj[formulaArr[j]] != undefined) {
            formulaArr[j] = valObj[formulaArr[j]];
        }
    }
    // 3- create formula after splitting
    currFormula = formulaArr.join(" "); // after replacing variables with their value formula becomes [20 + 30];
    // 4- eval function se formula evaluate kro
    let newValue = eval(currFormula);
    // update the cell(jispr function call hua) in dataObj
    dataObj[elementAddress].value = newValue;
    // 5- UI pr update krdo newValue
    let cellOnUI = document.querySelector(`[data-address=${elementAddress}]`);
    cellOnUI.innerText = newValue;
    // downstream leke aao jis element ko update kra just abhi kyun ki uspr bhi kuch element depend kr skte hai unko hbhi update krna padega
    let currCellDownstream = dataObj[elementAddress].downstream;
    // check kro agr downstream mei hai ya nhi agr haan to unpr bhi yehi function call krdo jisse unki value bhi update ho jaye 
    if (currCellDownstream.length > 0) {
        for (let k = 0; k < currCellDownstream.length; k++) {
            updateDownstreamElements(currCellDownstream[k]);
        }
    }
}