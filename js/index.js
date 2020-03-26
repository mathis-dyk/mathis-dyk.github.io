const CONFIG = {
  baseURL: "https://newsapp.dwsapp.io/api/",
  maxNumberOfArticles: 10,
  defaultSource: "abc-news",
  APIKey: "d08775f6de3144a8bbb61bfa86325025"
}

function init() {
  const showRegister = document.querySelector(".form-login button")
  const signet = document.querySelector(".aside-signet")
  const formSourceKeyword = document.querySelector("form.formSource")
  const sideBar = document.querySelector("aside")
  const articlesSection = document.querySelector(".section-articles")
  const selectSources = document.querySelector("select.sourcesSelect")
  const optionsSources = document.getElementsByTagName("option")
  const resetBtn = document.querySelector(".reset")
  const inputKeywords = document.querySelector("form.formSource input[type='text']")
  const loginForm = document.querySelector(".form-login")
  const registerForm = document.querySelector(".form-register")
  const logoutSignet = document.querySelector(".aside-disconnect")
  const asideFavorites = document.querySelector(".aside-favorites")
  const nameSpace = document.querySelector(".aside-favorites p span")
  const addSourceToFav = document.querySelector(".addSourceToFavorites")
  const favorites = asideFavorites.querySelector(".aside-favorites ul")

  let isOpenSideBar = false
  let favoritesList

  handleArticles(localStorage.lastSearchSource, localStorage.lastSearchKeywords)
  handleSources()

  inputKeywords.value = localStorage.lastSearchKeywords || ""

  signet.addEventListener("click", toggleSideBar)
  formSourceKeyword.addEventListener("submit", submitKeywordsAndSourcesForm)
  showRegister.addEventListener("click", showRegisterBlock)
  resetBtn.addEventListener("click", resetForm)
  loginForm.addEventListener("submit", handleLogin)
  registerForm.addEventListener("submit", handleRegister)
  logoutSignet.addEventListener("click", logout)
  addSourceToFav.addEventListener("click", addSourceToFavorites)

  function removeArticles() {
    articlesSection.innerHTML = ""
  }

  function showArticles(articles) {
    if (articles.length != 0) {
        removeArticles()
      articles.slice(0, CONFIG.maxNumberOfArticles).forEach(article => {
        let img = (article.urlToImage != "null" && article.urlToImage != null) ? article.urlToImage : "./assets/img/no-image.png"
        articlesSection.innerHTML += `
            <article>
                <a href="${article.url}"><img src=${img} alt='' /></a>
                <a href="${article.url}"><h2>${article.title}</h2></a>
                <span>${beautifyDate(article.publishedAt)} 📚 ${ article.source.name } - ${article.author}</span>
                <p>${article.description}<br />
                <a href="${article.url}" class="readMore">Read More</a></p>
            </article>
            `
      })
    } else {
      articlesSection.innerHTML = `
            <h1>Oups !</h1>
            <h2>Il semble qu'aucun article n'ait été trouvé 😞</h2>
        `
    }
  }

  function resetForm(e) {
    e.preventDefault()

    selectSources.value = CONFIG.defaultSource
    inputKeywords.value = ""

    const sourceValue = document.querySelector("select").value
    const keywordsValue = document.querySelector("input.keywordsInput").value
    handleArticles(sourceValue, keywordsValue)
  }

  function addSourcesToSelect(sources) {
    sources.forEach(source => {
      selectSources.innerHTML += `<option value=${source.id}>${source.name}</option>`
    })
  }

  async function handleArticles(source = "bbc-news", keywords = "null") {
    if (keywords == "") { keywords = "null" }

    const articles = new RequestAPI(`${CONFIG.baseURL}news/${source}/${keywords}`, 'POST', {
      "news_api_token": CONFIG.APIKey
    })

    let articleList = await articles.callAPI()
    console.log(articleList)
    articleList = articleList.data.articles
    
    showArticles(articleList)
  }

  async function handleSources() {
    let sourcesList
    new RequestAPI(`${CONFIG.baseURL}news/sources`, 'POST', {
      "news_api_token": CONFIG.APIKey
    })
    .callAPI()
    .then(res => {
      sourcesList = res.data.sources
      addSourcesToSelect(sourcesList)
      if (localStorage.lastSearchSourceNumber) { optionsSources.item(localStorage.lastSearchSourceNumber).selected = true }
    })

  }

  function submitKeywordsAndSourcesForm(e) {
    e.preventDefault()

    const sourceValue = document.querySelector("select").value
    const sourceNumber = document.querySelector("select").selectedIndex
    const keywordsValue = document.querySelector("input.keywordsInput").value

    setLocalStorage(sourceValue, sourceNumber, keywordsValue)
    removeArticles()
    handleArticles(sourceValue, keywordsValue)
  }

  function toggleSideBar() {
    sideBar.classList.toggle("open")
    isOpenSideBar = !isOpenSideBar
  }

  async function handleLogin(e = null) {
      if (e) {
          e.preventDefault()
      }

      const loginMail = document.querySelector(".login-mail").value
      const loginPassword = document.querySelector(".login-password").value

      const login = new RequestAPI(`${CONFIG.baseURL}login`, 'POST', {
        "email": loginMail,
        "password": loginPassword
    })
    .callAPI()
    .then(res => {
        localStorage.setItem('tokenUser', res.data.token)
        localStorage.setItem('userFirstName', res.data.user.firstname)
        localStorage.setItem('userLastName', res.data.user.lastname)
        checkLogin()
        return showGood(res.message, document)
    })
    .catch(err => showError(err.message, document))
  }

  async function handleRegister(e) {
    e.preventDefault()

      const registerMail = document.querySelector(".register-mail").value
      const registerPassword = document.querySelector(".register-password").value
      const registerFirstName = document.querySelector(".register-firstname").value
      const registerLastName = document.querySelector(".register-lastname").value

      new RequestAPI(`${CONFIG.baseURL}register`, 'POST', {
        "email": registerMail,
        "password": registerPassword,
        "firstname": registerFirstName,
        "lastname": registerLastName })
            .callAPI()
            .then(res => isRegister(res.message))
            .catch(err => showError(err.message, document))
  }

  function isRegister(message) {
    showGood(message, document)
    handleLogin()
  }

  function logout() {
    localStorage.clear()
    new RequestAPI(`${CONFIG.baseURL}logout`)
      .callAPI()
      .then(res => showGood(res.message, document))
      .catch(err => showError(err.message, document))
    
    Tools.hide(logoutSignet, asideFavorites)
    Tools.hide(addSourceToFav)
    Tools.flex(registerForm, loginForm)
  }

  function checkLogin() {
      if (localStorage.getItem("tokenUser")) {
        new RequestAPI(`${CONFIG.baseURL}me`, 'POST', {
            "token": localStorage.getItem("tokenUser")
        })
        .callAPI()
        .then(res => {
            Tools.flex(logoutSignet, asideFavorites)
            Tools.hide(registerForm, loginForm)
            Tools.inlineBlock(addSourceToFav)
            favoritesList = res.data.bookmark
            nameSpace.innerHTML = localStorage.getItem("userFirstName")
            getFavorites()
        }) 
      }
  }

  function getFavorites() {
    if (localStorage.getItem("tokenUser")) {
      new RequestAPI(`${CONFIG.baseURL}me`, 'POST', {
          "token": localStorage.getItem("tokenUser")
      })
      .callAPI()
      .then(res => {
        favoritesList = res.data.bookmark
        if (favoritesList.length > 0) {
          favorites.innerHTML = ''
          favoritesList.forEach(favorite => {
            favorites.innerHTML += `<li class="favItem"><h3 data-id=${favorite.id}>${favorite.name}</h3><img data-idmongo="${favorite._id}" src="./assets/icons/delete.png" class="delete" alt="Supprimer le favori nommé ${favorite.name}" /></li>`
          })

          asideFavorites.querySelectorAll(".aside-favorites ul h3").forEach(fav => {
            fav.addEventListener("click", () => {
              handleArticles(fav.dataset.id, inputKeywords.value)
              selectSources.value = fav.dataset.id;
            })
          })

          asideFavorites.querySelectorAll(".aside-favorites ul img").forEach(deleteElement => {
            deleteElement.addEventListener("click", () => {
              deleteFavorite(deleteElement.dataset.idmongo)
              getFavorites()
            })
          })
        } else {
          favorites.innerHTML = "<span>Il semble que vous n'ayez pas de favoris pour le moment.</span>"
        }
      })
    }
  }

  function deleteFavorite(idMongoDelete) {
    new RequestAPI(`${CONFIG.baseURL}bookmark/${idMongoDelete}`, 'DELETE', {
      "token": localStorage.getItem("tokenUser")
    })
    .callAPI()
    .then(res => getFavorites())
  }

  function addSourceToFavorites(e) {
      e.preventDefault()

      handleArticles(selectSources.value, inputKeywords.value)

      const sourceValue = document.querySelector("select").value
      const sourceNumber = document.querySelector("select").selectedIndex
      const keywordsValue = document.querySelector("input.keywordsInput").value

      setLocalStorage(sourceValue, sourceNumber, keywordsValue)

      if (favoritesList.filter(favorite => favorite.name === selectSources.options[selectSources.selectedIndex].text).length == 0) {
        new RequestAPI(`${CONFIG.baseURL}bookmark`, 'POST', {
          "token": localStorage.getItem("tokenUser"),
          "id": selectSources.value,
          "name": selectSources.options[selectSources.selectedIndex].text,
          "description": "",
          "url": "",
          "category": "",
          "language": "",
          "country": ""
        })
        .callAPI()
        .then(res => getFavorites())
      } else {
        showError("Vous avez déjà enregistré ce favoris", document)
      }
  }

  checkLogin()
  console.warn("Que-faites vous ici ? Vous allez faire des bêtises, c'est pour voir si j'ai fais des erreurs ! Spoilez : Oui, peut-être. Allez, fermez cette console...")
}

window.addEventListener("DOMContentLoaded", init)
