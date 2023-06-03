//some quick math stuff

const clamp = (value, min, max) => {
    return Math.max(Math.min(value, max), min);
}

const params = {
    ids : {
        textContainerId : "notepad",
        textAreaId : "notepadInternal",
        lockImageId : "lockicon",
        saveImageId : "saveIcon",
        buttonIDs : {
            capitilizeSelection : "capSelect",
            darkLightModeToggle : "lightDarkModeToggle",
            copyToClipboard : "clipboardCopy",
            sizeDown : "sizeDown",
            sizeUp : "sizeUp"
        }
    },
    images : {
        savedIcon : "../images/sync_saved_locally_FILL0_wght400_GRAD0_opsz48.svg",
        savingIcon : "../images/sync_FILL0_wght400_GRAD0_opsz48.svg"
    },
    updateIdleEditDelay : 500, //ms
    autoSaveWaitTime : 1000,
    wordCountRegex: /(\w)+/g,
    textAreaDisableColor : "#a8a8a8",
    textAreaEnabledColor : "transparent",
}

let vars = {}

//element declarations
const textElement = document.getElementById(params.ids.textAreaId); 
const lockIcon = document.getElementById(params.ids.lockImageId); 



const getCurrentContent = () => {
    return textElement.value;
}

// const disable = () => {
//     textElement.disabled = true;
//     textElement.style.setProperty("--background-color-var", params.textAreaDisableColor);
//     lockIcon.style.content = "url(../svg/lock_FILL0_wght400_GRAD0_opsz48.svg)"
//     lockIcon.style.opacity = "100%";
//     vars.textDisabled = true;
// }
// const enable = () => {
//     textElement.disabled = false;
//     textElement.style.setProperty("--background-color-var", params.textAreaEnabledColor);
//     lockIcon.style.content = "url(../svg/lock_open_FILL0_wght400_GRAD0_opsz48.svg)";
//     lockIcon.style.opacity = "10%";
//     vars.textDisabled = false;
// }

const saveContent = async () => {
    //change to loading / spinning icon
    //save via chrome.local
    //use .then to set it back to the checkmark
}

const updateValues = () => {
    //update char / word counters
}

const onUpdate = () => {
    saveContent();
    updateValues();
}

const loadSaved = () =>{

}

window.onload = () => {
    loadSaved();
    updateValues();
} 

const copyContent = async () => {
    try {
        let text = getCurrentContent();
        await navigator.clipboard.writeText(text).then((value)=>{
            console.log("fufilled: " + value)
        }, (value) => {
            console.log("rejected: " + value)
        });
        console.log('Content copied to clipboard');
    } catch (err) {
        console.error('Failed to copy: ', err);
    }
}
//need a hasen't edited after a while event listener

// lockIcon.addEventListener("click", (x) => {
//     if (!vars.textDisabled) {
//         disable();
//     }else enable();
// })

textElement.addEventListener("focusout", (event) => {
    saveContent();
})


//functioanl event listeners

//button declarations
const capSelecButton = document.getElementById(params.ids.buttonIDs.capitilizeSelection);
const copyToClipButton = document.getElementById(params.ids.buttonIDs.copyToClipboard);
const largerTextButton = document.getElementById(params.ids.buttonIDs.sizeUp);
const smallerTextButton = document.getElementById(params.ids.buttonIDs.sizeDown);

//icon that needs style updates
const saveIcon = document.getElementById(params.ids.saveImageId);

//event listeners


copyToClipButton.addEventListener("click", (event) => {
    copyContent();
})


//a quick startup thing that way the text size modifications work
textElement.style.fontSize = "small";
var fontSizeList = [
    "xx-small",
    "x-small",
    "small",
    "medium",
    "large",
    "x-large",
    "xx-large",
    "xxx-large"
];
let currentFontSize = 2;

largerTextButton.addEventListener("click", (event) => {
    currentFontSize = clamp(currentFontSize + 1, 0, fontSizeList.length - 1);
    textElement.style.fontSize = fontSizeList[currentFontSize];
});

smallerTextButton.addEventListener("click", (event) => {
    currentFontSize = clamp(currentFontSize - 1, 0, fontSizeList.length - 1);
    textElement.style.fontSize = fontSizeList[currentFontSize];
});



//the update interval script

//set time since last edit

//interval, if the time is > minimum, run updates

let hasSaved = true; 
let lastEditTime = 0;

const updateLastEditTime = () => {
    console.log(lastEditTime);
    lastEditTime = Date.now();
    hasSaved = false;
    saveIcon.style.content = `url("${params.images.savingIcon}")` //TODO have the savecontent action unset this
    saveIcon.setAttribute("data-loading", "true");
    saveIcon.title = "saving..."
};

if (textElement.addEventListener) {
    textElement.addEventListener('input', function() {
        updateLastEditTime();
    }, false);
} else if (textElement.attachEvent) {
    textElement.attachEvent('onpropertychange', function() {
        updateLastEditTime();
    });
}

setInterval(async () => {
    if ((Date.now() - lastEditTime > params.autoSaveWaitTime) && !hasSaved) {
        await saveContent();
        hasSaved = true;
        saveIcon.style.content = `url("${params.images.savedIcon}")` //TODO have the savecontent action unset this
        saveIcon.setAttribute("data-loading", "false");
        saveIcon.title = "saved locally!"
    }
}, params.updateIdleEditDelay)