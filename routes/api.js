const express = require('express')
const router = express.Router()
const fo = require('../modules/fOnline')

router.get('/:firstId?/:secondId?', function (req, res, next) {
  // Login Info in json packen
  let loginInfo = new fo.LoginBody()

  // Login Info abschicken
  fo.login(loginInfo, loginData => {
    global.loginData = loginInfo

    // Fragen Body bereit machen
    let getQuestionInfo = new fo.GetQuestionBody()

    // Fragen Ids als Stringarray vorbereiten
    let questionCount = []
    if (req.params.firstId !== undefined && req.params.secondId !== undefined) {
      let start = parseInt(req.params.firstId) || 0
      let end = parseInt(req.params.secondId) || 0

      for (var i = start; i < end; i++) {
        questionCount.push(i.toString())
      }
    } else if (req.params.firstId !== undefined) {
      let id = parseInt(req.params.firstId) || 0
      questionCount.push(id.toString())
    } else {
      for (var j = 1; i < 4500; i++) {
        questionCount.push(j.toString())
      }
    }

    // Fragen Ids als Body
    getQuestionInfo.body = JSON.stringify(questionCount)
    // Login cookie in header einfügen
    getQuestionInfo.headers.Cookie = loginData.cookie
    // Fragen POST request
    fo.getQuestion(getQuestionInfo, question => {
      // falls frage undefined error loggen
      if (question === undefined) {
        return req.render('index')
      }

      // json an client schicken
      res.json(JSON.stringify(question))

      console.log('Daten erfolgreich erhalten, User wird wieder ausgeloggt...'.yellow)
      // Ausloggen Body bereit machen
      let logoutInfo = new fo.LogoutBody()
      // Login cookie in header einfügen
      logoutInfo.headers.Cookie = loginData.cookie
      // mit Body Ausloggen
      fo.logout(logoutInfo, () => {

      })
    })
  })
})

module.exports = router
