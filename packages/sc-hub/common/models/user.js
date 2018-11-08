'use strict';

module.exports = function(User) {
  User.settings.caseSensitiveEmail = false
  User.settings.caseSensitivePublicAddress = false

  User.validatesUniquenessOf('email')
  User.validatesUniquenessOf('publicAddress')
}
