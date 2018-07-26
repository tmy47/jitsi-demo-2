import axios from 'axios'
import { AsyncStorage } from 'react-native'

class NativeAuthService {
  loggedIn() {
    return this.getToken() ? true : false
  }

  logout() {
    this.deleteToken()
  }

  async login(userName, password) {
    try {
      const response = await axios.post(
        'https://dev-stg-api.synzi.com/authentication/login',
        {
          email: userName,
          password: password,
        }
      )
      this.setToken(response.data.access_token)
      return {
        status: response.status,
        statusText: response.statusText,
        access_token: response.data.access_token,
      }
    } catch (error) {
      console.log(error)
      if (error.response.status === 400 || 401) {
        return {
          status: error.response.status,
          statusText: error.response.statusText,
          errorMessage: 'The username / password was not recognized',
        }
      } else {
        return {
          status: error.response.status,
          statusText: error.response.statusText,
          errorMessage: 'Unknown error occurred',
        }
      }
    }
  }

  setToken(token) {
    AsyncStorage.setItem('auth_token', token, () => {})
  }

  getToken() {
    AsyncStorage.getItem('auth_token', (err, result) => {
      console.log(result)
      return result
    })
  }

  deleteToken() {
    AsyncStorage.removeItem('auth_token', () => {})
  }
}

export default new NativeAuthService()
