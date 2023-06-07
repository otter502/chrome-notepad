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
    updateIdleEditDelay : 500, //ms
    autoSaveWaitTime : 1000,
    wordCountRegex: /(\w)+/g,
    textAreaDisableColor : "#a8a8a8",
    textAreaEnabledColor : "transparent",
}

let vars = {}

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

const loadContent = (title, text) => {
    titleElement.value = title;
    textElement.value = text;
}

const loadSaved = async () =>{
    let titleText = "";
    let notepadText = "";
    let data = (await params.storage.storageArea.get(params.storage.autoSaveKey))[params.storage.autoSaveKey]
    if (data !== undefined) {
        titleText = data.title   
        notepadText = data.text
    }
    loadContent(titleText, notepadText)
}

const saveContent = async () => {
    let textarr = getCurrentContent();
    params.storage.storageArea.set({
        [params.storage.autoSaveKey] : textarr
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
let currentFontSize = 2;

const updateTextSize = () =>{
    textSizeDisplay.innerText = fontSizeList[currentFontSize];
    textElement.style.fontSize = fontSizeList[currentFontSize];    
}

largerTextButton.addEventListener("click", (event) => {
    currentFontSize = clamp(currentFontSize + 1, 0, fontSizeList.length - 1);
    updateTextSize();
});

smallerTextButton.addEventListener("click", (event) => {
    currentFontSize = clamp(currentFontSize - 1, 0, fontSizeList.length - 1);
    updateTextSize()
});



//the update interval script

//set time since last edit

//interval, if the time is > minimum, run updates

let hasSaved = true; 
let lastEditTime = 0;

const updateLastEditTime = () => {
    // console.log(lastEditTime);
    lastEditTime = Date.now();
    hasSaved = false;
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
    if ((Date.now() - lastEditTime > params.autoSaveWaitTime) && !hasSaved) {
        await saveContent();
        updateValues();
        hasSaved = true;
        saveIcon.style.content = `url("${params.images.savedIcon}")` //TODO have the savecontent action set this
        saveIcon.setAttribute("data-loading", "false");
        saveIcon.title = "saved locally!"
    }
}, params.updateIdleEditDelay)
 
window.onload = async () => {
    await loadSaved();
    updateValues();
    updateTextSize();
}




//TODO add some safety, like a way to limit # of downloads per minute

const downloadFile = async () => {
    const a = document.getElementById(params.ids.fileSystemIds.hiddenDownloadElement);
    const text = getCurrentContent();
    const blob = new Blob([JSON.stringify(text)], { type: "text/json" });

    a.download = (text.title) ? text.title + ".json" : "unamedNotePad.json";
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
            loadContent(jsonValue["title"],jsonValue["text"])
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