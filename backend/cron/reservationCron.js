const cron = require('node-cron');
const Rezerwacja = require('../models/Rezerwacja');

cron.schedule('* * * * *', async () => {
    try {
        const teraz = new Date();

        await Rezerwacja.updateMany(
            {
                status: 'aktywna',
                dataDo: { $lt: teraz }
            },
            {
                $set: { status: 'zakonczona' }
            }
        );

        console.log('Zaktualizowano wygasłe rezerwacje');
    } catch (err) {
        console.error('Cron error:', err);
    }
});