const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const INDEX_URL = BASE_URL + '/api/v1/users/'

const friends = JSON.parse(localStorage.getItem('favoriteFriends'))

let filteredFriends = []
const FRIENDS_PER_PAGE = 12

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
            <img src="${item.avatar}" class="card-img-top" alt="User Avatar">
            <div class="card-body">
              <h5 class="card-title">${item.name}${item.surname}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-user" data-bs-toggle="modal"
                data-bs-target="#user-modal" data-id="${item.id}">More</button>
              <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
            </div>
          </div>
        </div>
      </div>
    `
  })
  dataPanel.innerHTML = rawHTML
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

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / FRIENDS_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

function getFriendsByPage(page) {
  const data = filteredFriends.length ? filteredFriends : friends
  const startIndex = (page - 1) * FRIENDS_PER_PAGE
  return data.slice(startIndex, startIndex + FRIENDS_PER_PAGE)
}

function removeFromFavorite(id) {
  if (!friends) return

  const friendIndex = friends.findIndex((friend) => friend.id === id)
  if (friendIndex === -1) return
  friends.splice(friendIndex, 1)
  localStorage.setItem('favoriteFriends', JSON.stringify(friends))
  renderFriendList(friends)
}


dataPanel.addEventListener('click', function onPanelClicked(event) {
  const id = Number(event.target.dataset.id)
  if (event.target.matches('.btn-show-info')) {
    showInfoModal(id)
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(id)
  }
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return

  const page = Number(event.target.dataset.page)
  renderFriendList(getFriendsByPage(page))
})

renderPaginator(friends.length)
renderFriendList(getFriendsByPage(1))