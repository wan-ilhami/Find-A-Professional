const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const chatSchema = new Schema(
  {
    booking:  {
      type:Schema.Types.ObjectId,
      ref:'Book'
    },
    message: {
      type: String
    },
    user: {
      type: Schema.Types.ObjectId,
      ref:'User'
    },
    pro: {
      type: Schema.Types.ObjectId,
      ref:'Pro'
    }
  },
  {
    timestamps: true
  }
);

let Message = mongoose.model("Message", chatSchema);

module.exports = Message;
