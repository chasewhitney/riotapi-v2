var mongoose = require('mongoose');
var Schema = mongoose.Schema;


// Mongoose Schema
var ChampSchema = new Schema({
    name: {type: String, required: true},
    data: {type: Object, required: true}
});


module.exports = mongoose.model('Champ', ChampSchema);
