const request = require('request')
const colors = require('colors')
const config = require('../config.json')

class FOnline {
  constructor () {
    this.getQuestion = (reqbody, callback) => {
      request.post(reqbody, (err, httpres, body) => {
        if (err) {
          console.info('ERROR:'.red, 'Fehler beim Frage POST aufgetreten... versuche erneut')
          return this.getQuestion(reqbody, callback)
        }
        try {
          let question = JSON.parse(body)
          if (question[0] === undefined) {
            question.msg && console.error('F-Online:', question.msg.yellow)
            callback && callback(question)
            return question
          }
          callback && callback(question)
          return question
        } catch (error) {
          console.log('ERROR:'.red, 'Fehler beim JSON parsen aufgetreten...')
        }
      })
    }

    this.login = (reqbody, callback) => {
      request.post(reqbody, (err, httpres, body) => {
        if (err) {
          console.info('ERROR:'.red, 'Fehler beim einloggen POST aufgetreten... versuche erneut')
          return this.login(reqbody, callback)
        }
        let login = JSON.parse(body)
        console.info('eingeloggt mit User:'.green, login.user.username, 'Session:'.green, login.user.sessionId)
        login.user.cookie = config.cookieBase + login.user.sessionId
        callback && callback(login.user)
        return login.user
      })
    }

    this.logout = (reqbody, callback) => {
      request.get(reqbody, (err, httpres, body) => {
        if (err) return console.error(err)
        let info = JSON.parse(body)
        console.log('F-Online:', info.msg.yellow)
        callback && callback(info)
        return info
      })
    }

    this.LoginBody = class {
      constructor () {
        // Post URL
        this.url = 'https://www.f-online.at/json/login'
        // Login Daten als Body
        this.body = JSON.stringify({
          'username': config.username,
          'password': config.password,
          'password_again': config.password,
          'recaptcha_challenge_field': '',
          'recaptcha_response_field': ''
        })
        this.headers = {
          'User-Agent': 'F-Online non-scraping Nodejs Api',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      }
    }

    this.LogoutBody = class {
      constructor () {
        // Get URL
        this.url = 'https://www.f-online.at/json/logout'
        // Cookie mit SessionId wird benötigt
        this.headers = {
          'User-Agent': 'F-Online non-scraping Nodejs Api',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Cookie': config.cookieBase + 'placeholderid' // SessionID
        }
      }
    }

    this.GetQuestionBody = class {
      constructor () {
        // Post URL
        this.url = 'https://www.f-online.at/json/questions'
        // Fragen Ids als Stringarray im Body
        this.body = JSON.stringify(['1'])
        // Cookie mit SessionId wird benötigt
        this.headers = {
          'User-Agent': 'F-Online non-scraping Nodejs Api',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Cookie': config.cookieBase + 'placeholderid' // SessionID
        }
      }
    }
  }
}

module.exports = new FOnline()
