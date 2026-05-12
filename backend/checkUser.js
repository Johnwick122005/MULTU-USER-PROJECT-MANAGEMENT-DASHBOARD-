const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite'  // root
});

const User = sequelize.define('User', {
  username: DataTypes.STRING,
  email: DataTypes.STRING,
  password: DataTypes.STRING,
  role: {
    type: DataTypes.STRING,
    defaultValue: 'user'
  }
});

async function checkUser() {
  await sequelize.authenticate();
  const user = await User.findOne({ where: { email: 'test@example.com' } });
  if (user) {
    console.log('User found in root db:', user.toJSON());
  } else {
    console.log('User not found in root db');
  }
  await sequelize.close();
}

checkUser();