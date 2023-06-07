//ideas: markdown?
//some quick math stuff

const clamp = (value, min, max) => {
    return Math.max(Math.min(value, max), min);
}

const params = {
    ids : {
        textContainerId : "notepad",
        textAreaId : "notepadInternal",
        titleAreaId : "notePadTitle",
        lockImageId : "lockicon",
        saveImageId : "saveIcon",
        copyButtonPopupId : "copy-Popup",
        buttonIDs : {
            capitilizeSelection : "capSelect",
            darkLightModeToggle : "lightDarkModeToggle",
            copyToClipboard : "clipboardCopy",
            sizeDown : "sizeDown",
            sizeUp : "sizeUp",
            download : "download",
            upload : "upload"
        },
        infoIDs : {
            textSizeID : "textSize",
            charCountID : "charCount",
            wordCountID : "wordCount"
        },
        fileSystemIds : {
            uploadInputElementId : "file",
            uploadFormId : "uploadForm",
            hiddenDownloadElement : "downloadingElement"
        }
    },
    storage : {
        storageArea : chrome.storage.local,
        autoSaveKey : "autoSave"
    },
    images : {
        savedIcon : "../images/sync_saved_locally_FILL0_wght400_GRAD0_opsz48.svg",
        savingIcon : "../images/sync_FILL0_wght400_GRAD0_opsz48.svg"
    },
    darkLightModeCss : {
        dark : "--notepad-border-style : white solid 3px; --text-color : white; --text-background-color : black; --background-color : black; --img-filter : invert();",
        light :  "--notepad-border-style : black solid 3px; --text-color : black; --text-background-color : white; --background-color : white; --img-filter : none;"
    },
    updateIdleEditDelay : 500, //ms
    autoSaveWaitTime : 1000,
    wordCountRegex: /(\w)+/g,
    textAreaDisableColor : "#a8a8a8",
    textAreaEnabledColor : "transparent",
}

let vars = {
    hasSaved : true,
    darkLightCurrMode : "dark",
    currentFontSize : 2
}

//element declarations
const textElement = document.getElementById(params.ids.textAreaId); 
const titleElement = document.getElementById(params.ids.titleAreaId); 

const lockIcon = document.getElementById(params.ids.lockImageId); 

const getCurrentContent = () => {
    return {
        title : titleElement.value, 
        text : textElement.value
    };
}

const getData = () => {
    const text = getCurrentContent();
    return {
        settings : {
            font_size : vars.currentFontSize,
            darkMode : vars.darkLightCurrMode
        },
        text : {
            title : text.title,
            text : text.text
        }
    };
}

const loadContent = (title, text) => {
    titleElement.value = title;
    textElement.value = text;
}

const loadSaved = async () =>{
    let titleText = "";
    let notepadText = "";
    let data = (await params.storage.storageArea.get(params.storage.autoSaveKey))[params.storage.autoSaveKey]
    console.log(data);
    if (data !== undefined) {
        if (data.settings == undefined) {return;}
        vars.currentFontSize = (data.settings.font_size) ? data.settings.font_size : 2;
        vars.darkLightCurrMode = (data.settings.darkMode) ? data.settings.darkMode : "light"; 
        titleText = data.text.title;  
        notepadText = data.text.text;
    }
    console.log(titleText + " : " + notepadText);
    loadContent(titleText, notepadText)
}

const saveContent = async () => {
    let data = getData();
    params.storage.storageArea.set({
        [params.storage.autoSaveKey] : data
    })
}


const charCounter = document.getElementById(params.ids.infoIDs.charCountID);
const wordCounter = document.getElementById(params.ids.infoIDs.wordCountID);

const updateValues = () => {
    const text = String(getCurrentContent().text);
    charCounter.innerText = text.length;
    wordCounter.innerText = (text.match(params.wordCountRegex) || []).length;
}

const onUpdate = () => {
    saveContent(); //TODO add a plus button to add a title to the saved title list
    updateValues();
}

const copyContent = async () => {
    try {
        let text = getCurrentContent().text;
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
    // updateLastEditTime();
})


//functioanl event listeners

//button declarations
const capSelecButton = document.getElementById(params.ids.buttonIDs.capitilizeSelection);
const copyToClipButton = document.getElementById(params.ids.buttonIDs.copyToClipboard);
const largerTextButton = document.getElementById(params.ids.buttonIDs.sizeUp);
const smallerTextButton = document.getElementById(params.ids.buttonIDs.sizeDown);
const darkLightToggleButton = document.getElementById(params.ids.buttonIDs.darkLightModeToggle);

//icon that needs style updates
const saveIcon = document.getElementById(params.ids.saveImageId);

//event listeners


copyToClipButton.addEventListener("click", async (event) => {
    await copyContent();
    let copyPopup = document.getElementById(params.ids.copyButtonPopupId);
    copyPopup.setAttribute("animate","true");
    setTimeout(()=>{
        copyPopup.setAttribute("animate","false")
    }, 1000);
})


//a quick startup thing that way the text size modifications work

const textSizeDisplay = document.getElementById(params.ids.infoIDs.textSizeID);
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

const updateTextSize = () =>{
    let formatText = fontSizeList[vars.currentFontSize].split("-");
    textSizeDisplay.innerText = ((formatText.length > 1) ? 
        (formatText[0] + "-" + formatText[1].charAt(0)) : 
        (formatText[0].charAt(0)));
    textElement.style.fontSize = fontSizeList[vars.currentFontSize];
    saveContent();
}

largerTextButton.addEventListener("click", (event) => {
    vars.currentFontSize = clamp(vars.currentFontSize + 1, 0, fontSizeList.length - 1);
    updateTextSize();
});

smallerTextButton.addEventListener("click", (event) => {
    vars.currentFontSize = clamp(vars.currentFontSize - 1, 0, fontSizeList.length - 1);
    updateTextSize();
});

darkLightToggleButton.addEventListener("click", (event) => {
    if (vars.darkLightCurrMode == "dark") {
        vars.darkLightCurrMode = "light";
    } else if (vars.darkLightCurrMode == "light") {
        vars.darkLightCurrMode = "dark";
    }
    updateDLMode()
});


var r = document.querySelector(':root');

const dLModeParser = (text) => {
    let keyValueArr = [[String()]];
    String(text).split(";").forEach(t => {
        if(t.length == 0) return;
        let pair = t.split(":").map((x) => {return String(x.trim())})
        keyValueArr.push(pair);
    });
    return keyValueArr;
}
const setProperties = (x) => {
    x.forEach(pair => {
        r.style.setProperty(pair[0], pair[1])
    });
}

const updateDLMode = () => {   
    setProperties(dLModeParser(params.darkLightModeCss[vars.darkLightCurrMode]));
    saveContent();
}

//the update interval script

//set time since last edit

//interval, if the time is > minimum, run updates

let lastEditTime = 0;

const updateLastEditTime = () => {
    // console.log(lastEditTime);
    lastEditTime = Date.now();
    vars.hasSaved = false;
    saveIcon.style.content = `url("${params.images.savingIcon}")` //TODO have the savecontent action unset this
    saveIcon.setAttribute("data-loading", "true");
    saveIcon.title = "saving..."
};

const onTextUpdate = () => {
    updateValues();
    updateLastEditTime();
}

if (textElement.addEventListener) {
    textElement.addEventListener('input', function() {
        onTextUpdate();
    }, false);
} else if (textElement.attachEvent) {
    textElement.attachEvent('onpropertychange', function() {
        onTextUpdate();
    });
}

if (titleElement.addEventListener) {
    titleElement.addEventListener('input', function() {
        onTextUpdate();
    }, false);
} else if (titleElement.attachEvent) {
    titleElement.attachEvent('onpropertychange', function() {
        onTextUpdate();
    });
}


setInterval(async () => {
    if ((Date.now() - lastEditTime > params.autoSaveWaitTime) && !vars.hasSaved) {
        await saveContent();
        updateValues();
        vars.hasSaved = true;
        saveIcon.style.content = `url("${params.images.savedIcon}")` //TODO have the savecontent action set this
        saveIcon.setAttribute("data-loading", "false");
        saveIcon.title = "saved locally!"
    }
}, params.updateIdleEditDelay)
 
window.onload = async () => {
    await loadSaved();
    updateDLMode();
    updateValues();
    updateTextSize();
}





//TODO add some safety, like a way to limit # of downloads per minute

const downloadFile = async () => {
    const a = document.getElementById(params.ids.fileSystemIds.hiddenDownloadElement);
    let data = getData();
    const blob = new Blob([JSON.stringify(data)], { type: "text/json" });

    a.download = (data.text.title) ? data.text.title + ".json" : "unamedNotePad.json";
    a.href = window.URL.createObjectURL(blob);
    a.dataset.downloadurl = ["text/json", a.download, a.href].join(":");

    a.click()
}

const fileInputElement = document.getElementById(params.ids.fileSystemIds.uploadInputElementId);
const uploadFormElement = document.getElementById(params.ids.fileSystemIds.uploadFormId);

fileInputElement.addEventListener("change", handleFiles, false);

function handleFiles() {
    const fileList = this.files;
    let file = fileList[0];

    const reader = new FileReader();
    reader.addEventListener(
        "load",
        () => {
            let x = reader.result;
            console.log(x);
            let jsonValue = JSON.parse(x);
            vars.currentFontSize = jsonValue["settings"]["font_size"];
            vars.darkLightCurrMode = jsonValue["settings"]["darkMode"]
            loadContent(jsonValue["text"]["title"],jsonValue["text"]["text"])
            updateTextSize()
        },
        false
    );
    reader.readAsText(file)
    fileInputElement.value = "";
}


const uploadTextFile = () =>{
    if (fileInputElement != null) fileInputElement.click(); //this will trigger the onchange
}

const downloadButton = document.getElementById(params.ids.buttonIDs.download);
const uploadButton = document.getElementById(params.ids.buttonIDs.upload);

downloadButton.addEventListener("click", downloadFile);
uploadButton.addEventListener("click", uploadTextFile);