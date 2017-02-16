const fs = require('fs')
const request = require('request')
const colors = require('colors')
const config = require('./config.json')

class getQuestionBody {
    constructor() {
        // Post URL
        this.url = 'http://78.47.249.57/json/questions'
        // Fragen Ids als Stringarray im Body
        this.body = JSON.stringify(["1"])
        // Cookie mit SessionId wird benötigt
        this.headers = {
            'User-Agent': 'F-Online non-scraping Nodejs Api',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Cookie': config.cookieBase + 'placeholderid' // SessionID
        }
    }
}

class loginBody {
    constructor() {
        // Post URL
        this.url = 'http://78.47.249.57/json/login'
        // Login Daten als Body
        this.body = JSON.stringify({
            "username": config.username,
            "password": config.password,
            "password_again": config.password,
            "recaptcha_challenge_field": "",
            "recaptcha_response_field": ""
        })
        this.headers = {
            'User-Agent': 'F-Online non-scraping Nodejs Api',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
    }
}

class logoutBody {
    constructor() {
        // Get URL
        this.url = 'http://78.47.249.57/json/logout'
        // Cookie mit SessionId wird benötigt
        this.headers = {
            'User-Agent': 'F-Online non-scraping Nodejs Api',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Cookie': config.cookieBase + 'placeholderid' // SessionID
        }
    }
}


class fOnline {
    constructor() {
        this.getQuestion = (reqbody, callback) => {
            request.post(reqbody, (err, httpres, body) => {
                if (err) {
                    console.info('ERROR:'.red, 'Fehler beim Frage POST aufgetreten... versuche erneut')
                    return this.getQuestion(reqbody, callback)
                }
                try {
                    let question = JSON.parse(body)
                    if (question[0] == undefined) {
                        question.msg && console.error('F-Online:', question.msg.yellow)
                        callback && callback(void 0)
                        return void 0
                    }
                    callback && callback(question)
                    return question                    
                } catch (error) {
                    console.log('ERROR:'.red, 'Fehler beim JSON parsen aufgetreten...')
                    // return this.getQuestion(reqbody, callback)
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

        this.dump = (data = '', filename = 'unbenannt', callback) => {
            const dumpBase = __dirname + '\\dump\\'
            const filepath = dumpBase + '\\' + filename + '.json'
            fs.writeFile(filepath, data, function(err) {
                err ? console.error(err) : console.info('Dump'.green, filename, 'wurde in'.green, filepath, 'gespeichert'.green)
                callback && callback(data)
            })
        }
    }
}

// fOnline object definieren
const fo = new fOnline()

// Login Info in json packen
let loginInfo = new loginBody()

// Login Info abschicken
fo.login(loginInfo, loginData => {
    global.loginData = loginInfo

    // Fragen Body bereit machen
    let getQuestionInfo = new getQuestionBody()

    // Fragen Ids als Stringarray vorbereiten
    let questionCount = []
    for (var i = 1; i < 5000; i++) {
        questionCount.push(i.toString())
    }
    // Fragen Ids als Body
    getQuestionInfo.body = JSON.stringify(questionCount)
    // Login cookie in header einfügen
    getQuestionInfo.headers.Cookie = loginData.cookie
    // Fragen POST request
    fo.getQuestion(getQuestionInfo, question => {
        // falls frage undefined error loggen
        if (question == undefined) {
            return console.log('exit')
        }

        // erhaltene Daten im dump Ordner speichern
        // stringify parameter 3 = spaces
        fo.dump(JSON.stringify(question, null, 2), 'Fragen Dump', () => {

            console.log('du wirst ausgeloggt. bitte warten...'.yellow)
            // Ausloggen Body bereit machen
            let logoutInfo = new logoutBody()
            // Login cookie in header einfügen
            logoutInfo.headers.Cookie = loginData.cookie
            // mit Body Ausloggen
            fo.logout(logoutInfo, () => {
                process.exit(1)
            })
        })
    })

    process.on('exit', function () {
        console.log('bye bye')
    })
})


