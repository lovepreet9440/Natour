// const axios = require('axios')
import axios from 'axios'
import { showAlert } from './alerts'

export const login = async (email, password) => {
    try {
        const res = await axios({
            method: 'POST',
            url: 'http://127.0.0.1:8000/api/v1/users/login',
            data: {
                email,
                password,
            },
        })

        if (res.data.status === 'success') {
            showAlert('success', 'Logged in Successfully')
            window.setTimeout(() => {
                location.assign('/overview')
            }, 1500)
        }
    } catch (error) {
        showAlert('error', error.response.data.message)
    }
}

export const logout = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: 'http://127.0.0.1:8000/api/v1/users/logout',
        })

        console.log(res.data)

        if (res.data.status === 'success') {
            showAlert('success', 'Logout Successfully')
            location.reload()
        }
    } catch (error) {
        console.log(error.response)
        showAlert('error', 'Error logging out! Try again.')
    }
}
