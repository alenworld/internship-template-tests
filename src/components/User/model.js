const { Schema } = require('mongoose');
const connections = require('../../config/connection');

const UserSchema = new Schema(
  {
    fullName: {
      type: String,
      trim: true,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
  },
  {
    collection: 'usermodel',
    versionKey: false,
  },
);

module.exports = connections.model('UserModel', UserSchema);
