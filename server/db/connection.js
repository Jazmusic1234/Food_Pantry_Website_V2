const monk = require('monk');
const db = monk('localhost/auth-for-FoodPantry');

// export it so it can be accessed by other files
module.exports = db;

