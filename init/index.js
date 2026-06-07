const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  // await Listing.deleteMany({});
  // const dataWithOwners = initData.data.map((obj) => ({
  //   ...obj,
  //   owner: new mongoose.Types.ObjectId("69bab89893f4a0f63bf911b7"),
  // }));
  // await Listing.insertMany(dataWithOwners);
  console.log("data was initialized");
};



initDB();