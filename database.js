const mongoose = require("mongoose");
// // mongoose.set('useNewUrlParser', true);
// mongoose.set('useUnifiedTopology', true);
// mongoose.set('useFindAndModify', false);
// mongoose.set('useUnifiedTopology', true);
const dotenv = require('dotenv');
dotenv.config()
class Database {

    constructor() {
        this.connect();
    }

    connect() {
        mongoose.connect(process.env.CONNECTIONSTRING)
            .then(() => {
                console.log('database connection established')
            })
            .catch((err) => {
                console.log('database connection error' + err)
            })
    }
}

module.exports = new Database();