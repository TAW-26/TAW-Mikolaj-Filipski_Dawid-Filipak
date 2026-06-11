const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');

const ADMIN_EMAIL = 'admin@gmail.com';
const ADMIN_PASSWORD = 'admin'; 

async function seedAdmin() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/twoja_baza_danych';
  
  try {
    console.log('Próba połączenia z MongoDB...');
    await mongoose.connect(mongoUri);
    console.log(' Sukces: Połączono z bazą danych.');

    const existingUser = await User.findOne({ email: ADMIN_EMAIL });
    if (existingUser) {
      console.log(`[!] Informacja: Użytkownik ${ADMIN_EMAIL} już istnieje w bazie danych.`);
      process.exit(0);
    }

    console.log('Generowanie bezpiecznego hasła...');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, saltRounds);

    const adminUser = new User({
      email: ADMIN_EMAIL,
      haslo: hashedPassword,
      rola: 'admin'
    });

    await adminUser.save();
    
    console.log('\n==================================================');
    console.log('  KONTO ADMINISTRATORA UTWORZONE POMYŚLNIE! ');
    console.log('==================================================');
    console.log(` Email (login): ${ADMIN_EMAIL}`);
    console.log(` Hasło:         ${ADMIN_PASSWORD}`);
    console.log('==================================================\n');

  } catch (error) {
    console.error(' X Błąd podczas dodawania administratora:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedAdmin();