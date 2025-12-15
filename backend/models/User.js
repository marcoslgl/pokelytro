const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


const TeamSchema = new Schema({
    name: { type: String, required: true },
    pokemonIds: [{ type: Number, required: true, min: 1, max: 6 }],
    createdAt: { type: Date, default: Date.now }
});

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/.+@.+\..+/, "Por favor, introduce un email válido"]
    },
    password: {
        type: String,
        required: true,
        select: false
    },

    favoritePokemons: [{
        type: Number,
        min: 1,
        max: 1025
    }],

    teams: [TeamSchema]
}, { timestamps: true });


UserSchema.pre("save", async function (next) {
    const user = this;
    if (!user.isModified("password")) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});


UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

UserSchema.methods.generateAuthToken = function () {
    return jwt.sign({ _id: this._id, username: this.username }, process.env.JWT_SECRET || 'TuClaveSecretaMuyLarga', { expiresIn: '1d' });
};

module.exports = mongoose.model("User", UserSchema);