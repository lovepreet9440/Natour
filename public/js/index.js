console.log('Hello from index.js')

import '@babel/polyfill'
import { login, logout } from './login'
// import { displayMap } from './mapBox'
import { updateData } from './updateSettings'

// DOM elements
// const mapBox = document.getElementById('map')
const formElemnt = document.querySelector('.form')
const logoutBtn = document.querySelector('.nav__el--logout')
const userDataForm = document.querySelector('.form-user-data')
console.log(userDataForm)
// const locations = JSON.parse(mapBox.dataset.locations)
// if (mapBox) displayMap()

if (formElemnt)
    formElemnt.addEventListener('submit', (e) => {
        e.preventDefault()
        const email = document.getElementById('email').value
        const password = document.getElementById('password').value
        login(email, password)
    })

// if (logoutBtn) logoutBtn.addEventListener('click', logout)
if (logoutBtn) logoutBtn.addEventListener('click', logout)

if (userDataForm)
    userDataForm.addEventListener('submit', (e) => {
        e.preventDefault()
        const name = document.getElementById('name').value
        const email = document.getElementById('email').value
        updateData(name, email)
    })
