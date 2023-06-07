const mongoose = require("mongoose");

class Database {

    constructor() {
        this.connect();
    }

    connect() {
        mongoose.connect("mongodb+srv://admin:adminpass1@twitterclonecluster.h6nq0sl.mongodb.net/?retryWrites=true&w=majority")
            .then(() => {
                console.log('database connection established')
            })
            .catch((err) => {
                console.log('database connection error' + err)
            })
    }
}

module.exports = new Database();