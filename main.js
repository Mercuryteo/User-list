"use strict"
const BASE_URL = "https://user-list.alphacamp.io"   //宣告API位址的基底
const INDEX_URL = "/api/v1/users/"    //宣告以用戶為參數的API位址

const userLists = []   //宣告預裝載用戶列表的陣列
let filteredUserLists = []   //宣告預裝載經搜尋過濾后的的用戶列表的陣列
const USER_PER_PAGE = 30    //宣告每頁只有30筆用戶資料

//宣告所需的DOM節點
const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const pagination = document.querySelector('.pagination')

axios.get(BASE_URL + INDEX_URL)   //透過API取得所有用戶資料
  .then(function (response) { 
    userLists.push(...response.data.results)    //將資料裝入陣列
    renderUserLists(getUserByPage(1))   //以頁數1來渲染畫面
    paginationNum(userLists)    //以用戶數量來顯示頁數
  })
  .catch(function (error) {
    console.log(error);
  })

//利用迴圈，于dataPanel裏渲染card
function renderUserLists(data) {
  let html = ''
  data.forEach((user) => {
    html += `<div class="card m-3" style="width: 18rem;">
        <div data-bs-toggle="modal" data-bs-target="#user-modal">
          <img src="${user.avatar}" class="card-img-top" alt="robohash-image" data-id="${user.id}">
        </div>
        <div class="card-body">
          <h5 class="card-title" data-id="${user.id}">${user.name} ${user.surname}</h5>
          <button type="button" class="btn btn-primary" data-id="${user.id}">+</button>
        </div>
      </div>`
  })
  dataPanel.innerHTML = html
}

//在search bar安裝監聽器，提交關鍵字
searchForm.addEventListener('submit', function onSearchClicked(event) {
  event.preventDefault()    //防止瀏覽器做預設動作
  let input = searchInput.value.trim().toLowerCase()    //宣告關鍵字

  if (!input.length) {    //如果沒有輸入任何字，結束函式
    return alert('請輸入關鍵字')
  }

  filteredUserLists = userLists.filter((userList) => {    //利用filter，找出名字裏，含有關鍵字的用戶
    let userName = `${userList.name} ${userList.surname}`
    if (userName.toLowerCase().includes(input)) {
      return userList
    }
  })

  if (filteredUserLists.length === 0) {   //如果完全沒有符合的用戶，結束函式
    return alert('沒有符合的結果，請重新輸入')
  }

  renderUserLists(getUserByPage(1))   //以過濾后的陣列渲染畫面
  paginationNum(filteredUserLists)    //以過濾后的用戶數量顯示頁數
})

//于dataPanel安裝監聽器，取得用戶ID，並以符合的條件來執行相對的函式
dataPanel.addEventListener('click', function getId(event){
  const id = Number(event.target.dataset.id)
  if (event.target.matches('.btn')) {
    addFavourite(id)
  } else if (id) {
    showUserList(id)
  }
})

//以用戶的ID來渲染MODAL
function showUserList(id){
  const modalName = document.querySelector('#user-name')
  const modalImage = document.querySelector('#user-image')
  const modalInfo = document.querySelector('#user-info')

  modalName.textContent = ''
  modalImage.src = ''
  modalInfo.innerHTML = ''


  axios.get(BASE_URL + INDEX_URL + id)    //以特定的ID，取得相對應的用戶資料
    .then(function (response) {   //將資料裝入相對應的容器
      const data = response.data
      modalName.innerText = `${data.name} ${data.surname}`
      modalImage.src = data.avatar
      modalInfo.innerHTML = `<ul>
        <li>age: ${data.age}</li>
        <li>gender: ${data.gender}</li>
        <li>email: ${data.email}</li>
        <li>region: ${data.region}</li>
        <li>birthday: ${data.birthday}</li>
      </ul>`
    })
    .catch(function (error) {
      console.log(error);
    })
}

//以特定的ID，利用find。將對應的用戶資料塞入準備好的陣列，再將陣列加入到localstorage
function addFavourite(id) {
  const favouriteUsers = JSON.parse(localStorage.getItem('favouriteUsers')) ||  []

  let favouriteUser = userLists.find(userList => userList.id === id)

  if (favouriteUsers.some(favouriteUser => favouriteUser.id === id)) {    //如果選到已加過的用戶，結束函式
    return
  }

  favouriteUsers.push(favouriteUser)
  
  localStorage.setItem('favouriteUsers', JSON.stringify(favouriteUsers))
}

//以頁碼取得相對應的30筆用戶資料
function getUserByPage(page) {
  let list = filteredUserLists.length > 0 ? filteredUserLists : userLists   //如果左方為true，則list等於filteredUserLists；反之，list等於userLists
  let userStart = (page-1) * 30
  let userEnd = userStart + 30
  let userListByPage = list.slice(userStart, userEnd)

  console.log(userStart)
  console.log(userEnd)

  return userListByPage
}

//以用戶的數量，來取得相對應的頁數總量，並以迴圈取得分頁欄的html
function paginationNum(list) {
  let pageNum = Math.ceil(list.length / USER_PER_PAGE)
  let html = ''

  for (let i = 1 ; i <= pageNum ; i++) {
    html += `
      <li class="page-item"><a class="page-link" href="#">${i}</a></li>
    `
  }

  pagination.innerHTML = html
}

//在分頁欄安裝監聽器，點擊時，取得相對應的頁碼，並以頁碼取得相對應的用戶資料，並渲染畫面
pagination.addEventListener('click', function onPaginationClicked(event) {
  let target = event.target
  if (target.tagName === 'A') {
    let page = target.innerText

    renderUserLists(getUserByPage(page)) 
  }
})



