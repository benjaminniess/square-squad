'use_strict'

const crypto = require('crypto')

class Helpers {
  /**
   * Slugify a string with spaces or accents
   *
   * @param {string} str
   * @returns
   */
  static stringToSlug(str) {
    str = str.replace(/^\s+|\s+$/g, '') // trim
    str = str.toLowerCase()

    // remove accents, swap ñ for n, etc
    var from = 'àáäâèéëêìíïîòóöôùúüûñç·/_,:;'
    var to = 'aaaaeeeeiiiioooouuuunc------'
    for (var i = 0, l = from.length; i < l; i++) {
      str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i))
    }

    str = str
      .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
      .replace(/\s+/g, '-') // collapse whitespace and replace by -
      .replace(/-+/g, '-') // collapse dashes

    return str
  }

  /**
   * Generates a random 16 char string
   *
   * @returns {string} the random string
   */
  static getRandomID() {
    return crypto.randomBytes(8).toString('hex')
  }

  /**
   * Generates a random int between a given min and max int
   *
   * @returns {int} the random int
   */
  static getRandomInt(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min)) + min
  }
}

module.exports = Helpers
