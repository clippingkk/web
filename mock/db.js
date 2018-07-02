const faker = require('faker')

module.exports = function() {
    return {
        hello: faker.lorem.words()
    }
}