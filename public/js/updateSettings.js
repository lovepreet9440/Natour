/* eslint-disable */
import axios from 'axios'
import { showAlert } from './alerts'

// type is either 'password' or 'data'
export const updateSettings = async (name, email) => {
    try {
        const url = 'http://127.0.0.1:8000/api/v1/users/updateMe'

        const res = await axios({
            method: 'PATCH',
            url,
            data: { name, email },
        })

        if (res.data.status === 'success') {
            showAlert('success', `${type.toUpperCase()} updated successfully!`)
        }
    } catch (err) {
        showAlert('error', err.response.data.message)
    }
}
