class Tools {
    static hide(...elements) {
        elements.forEach(element => element.style.display = "none")
    }

    static show(...elements) {
        elements.forEach(element => element.style.display = "block")
    }

    static flex(...elements) {
        elements.forEach(element => element.style.display = "flex")
    }

    static inlineBlock(...elements) {
        elements.forEach(element => element.style.display = "inline-block")
    } 

    static toggleOpen(element) {
        element.classList.toggle("open")
    }

}

function beautifyDate(date) {
    let newDate = date.split("-")
    let day = newDate[2].split("T")[0]
    
    return `${day}/${newDate[1]}/${newDate[0]}`
}

function setLocalStorage(lastSearchSource, lastSearchSourceNumber, lastSearchKeywords) {
    localStorage.setItem("lastSearchSource", lastSearchSource)
    localStorage.setItem("lastSearchSourceNumber", lastSearchSourceNumber)
    localStorage.setItem("lastSearchKeywords", lastSearchKeywords)
}

function showRegisterBlock(e) {
    e.preventDefault()
    const registerBlock = document.querySelector(".form-register")
    registerBlock.classList.toggle("show")
}

function showError(error, element) {
    const errorPanel = document.querySelector(".errorPanel")
    const errorPanelTextMessage = errorPanel.querySelector("p")
    Tools.toggleOpen(errorPanel)
    setTimeout(() => {
        Tools.toggleOpen(errorPanel)
    }, 3000)
    errorPanelTextMessage.innerHTML = error
}

function showGood(text, element) {
    const goodPanel = document.querySelector(".goodPanel")
    const goodPanelTextMessage = goodPanel.querySelector("p")
    Tools.toggleOpen(goodPanel)
    setTimeout(() => {
        Tools.toggleOpen(goodPanel)
    }, 3000)
    goodPanelTextMessage.innerHTML = text
}