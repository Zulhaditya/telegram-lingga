const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {});
        console.log("Terhubung ke MongoDB");
    } catch(err) {
        console.error("Terdapat error saat menghubungkan ke MongoDB!", err);
        process.exit(1);
    }
};

module.exports = connectDB;
