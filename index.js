const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const INDEX_URL = BASE_URL + '/api/v1/users/'
const FRIENDS_PER_PAGE = 12

const friends = []
let filteredFriends = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')


function renderFriendList(data) {
  let rawHTML = ''

  data.forEach((item) => {
    rawHTML += `
     <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img src="${item.avatar}" class="card-img-top" alt="info-avatar">
            <div class="card-body">
              <h5 class="card-title">${item.name}${item.surname}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-info" data-bs-toggle="modal"
                data-bs-target="#info-modal" data-id="${item.id}">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>
    `
  })

  dataPanel.innerHTML = rawHTML
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / FRIENDS_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `
     <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
    `
  }
  paginator.innerHTML = rawHTML
}

function getFriendsByPage(page) {
  const data = filteredFriends.length ? filteredFriends : friends
  const startIndex = (page - 1) * FRIENDS_PER_PAGE
  return data.slice(startIndex, startIndex + FRIENDS_PER_PAGE)
}

function showInfoModal(id) {
  const modalTitle = document.querySelector('#info-modal-title')
  const modalImage = document.querySelector('#info-modal-image')
  const modalDescription = document.querySelector('#info-modal-description')

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data
    modalTitle.innerText = `${data.name} ${data.surname}`
    modalImage.innerHTML = `
    <img src="${data.avatar}" alt="info-avatar" class="img-fluid">
    `
    modalDescription.innerHTML = `
    <p>region: ${data.region}</p>
    <p>gender: ${data.gender}</p>
    <p>age: ${data.age}</p>
    <p>birthday: ${data.birthday}</p>
    <p>email: ${data.email}</p>  
    `
  })
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteFriends')) || []
  const friend = friends.find((friend) => friend.id === id)

  if (list.some((friend) => friend.id === id)) {
    return alert('此好友已經在最愛清單中！')
  }

  list.push(friend)
  localStorage.setItem('favoriteFriends', JSON.stringify(list))
}

dataPanel.addEventListener('click', function onPanelClicked(event) {
  const id = Number(event.target.dataset.id)
  if (event.target.matches('.btn-show-info')) {
    showInfoModal(id)
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(id)
  }
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  renderFriendList(getFriendsByPage(page))
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()


  filteredFriends = friends.filter((friend) => friend.name.toLowerCase().includes(keyword) || friend.surname.toLowerCase().includes(keyword))

  if (filteredFriends.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的結果`)
  }
  renderPaginator(filteredFriends.length)
  renderFriendList(getFriendsByPage(1))
})

axios.get(INDEX_URL).then((response) => {
  friends.push( ... response.data.results)
  renderPaginator(friends.length)
  renderFriendList(getFriendsByPage(1))
})
.catch((err) => console.log(err))