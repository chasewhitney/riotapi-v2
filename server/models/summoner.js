var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// Mongoose Schema
var SummonerSchema = new Schema({
    name: {type: String, required: true},
    id: {type: String, required: true},
    dateUpdated: {type: Object, required: true},
    matches: {type: Array, required: true}
});


module.exports = mongoose.model('Summoner', SummonerSchema);
