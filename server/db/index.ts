import * as mongoose from "mongoose";

export const connectDB = () =>
  new Promise<mongoose.Connection>((resolve, reject) => {
    if (mongoose.connection.readyState) {
      resolve(mongoose.connection);
    }

    var mongoDB = "mongodb://localhost/build-rest-toolkit";
    mongoose.connect(mongoDB);

    //Ép Mongoose sử dụng thư viện promise toàn cục
    // mongoose.Promise = global.Promise;
    //Lấy kết nối mặc định
    var db = mongoose.connection;

    db.on("error", (error) => {
      console.error("MongoDB connection error:");
      console.error(error);
      reject(error);
    });

    db.on("connected", () => {
      console.log("MongoDB connected");
      resolve(mongoose.connection);
    });
  });
