const functions = require("firebase-functions");

const admin = require("firebase-admin");
admin.initializeApp();

exports.verifyCNPJ = functions.https.onCall((data, context) => {
    if(!context.auth)
    {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'Usuário não autenticado'
        );
    }

    const cnpj = data.cnpj;

    if
        (
            cnpj == "00000000000000" ||
            cnpj == "11111111111111" ||
            cnpj == "22222222222222" ||
            cnpj == "33333333333333" ||
            cnpj == "44444444444444" ||
            cnpj == "55555555555555" ||
            cnpj == "66666666666666" ||
            cnpj == "77777777777777" ||
            cnpj == "88888888888888" ||
            cnpj == "99999999999999"
        )
            return false;
        var tamanho = cnpj.length - 2;
        var numeros = cnpj.substring(0, tamanho);
        var digitos = cnpj.substring(tamanho);
        var soma = 0;
        var pos = tamanho - 7;
        for(i = tamanho; i >= 1; i--)
        {
            soma += numeros.charAt(tamanho - i) * pos--;
            if(pos < 2)
                pos = 9;
        }
        resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if(resultado != digitos.charAt(0))
            return false;
        tamanho = tamanho + 1;
        numeros = cnpj.substring(0, tamanho);
        soma = 0;
        pos = tamanho - 7;
        for(i = tamanho; i >= 1; i--)
        {
            soma += numeros.charAt(tamanho - i) * pos--;
            if(pos < 2)
                pos = 9;
        }
        resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if(resultado != digitos.charAt(1))
            return false;
        return true;
});

exports.verifyDateBirth = functions.https.onCall((data, context) => {
    if(!context.auth)
    {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'Usuário não autenticado'
        );
    }
    
    var dateBirth = data.dateBirth;
    
    dateBirth = dateBirth.replace(/\//g, "-");
    var date_array = dateBirth.split("-");

    if(date_array[0].length != 4)
    {
        dateBirth = `${date_array[2]}-${date_array[1]}-${date_array[0]}`;
    }

    var today = new Date();
    var birth = new Date(dateBirth);

    var age = today.getFullYear() - birth.getFullYear();
    var month = today.getMonth() - birth.getMonth();

    if(month < 0 || (month === 0 && today.getDate() < birth.getDate()))
        age--;
    if(age < 18)
        return false;
    if(age >= 18)
        return true;
});

exports.verifyDate = functions.https.onCall((data, context) => {
    if(!context.auth)
    {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'Usuário não autenticado'
        );
    }

    var daySelected = data.selectedDay;
    var monthSelected = data.selectedMonth;
    var yearSelected = data.selectedYear;

    var dateSelect = new Date(yearSelected, monthSelected, daySelected);

    var d = new Date();
    var dayToday = d.getDate();
    var monthToday = d.getMonth();
    var yearToday = d.getFullYear();
        
    var today = new Date(yearToday, monthToday, dayToday);

    if(today > dateSelect)
    {
        return false;
    }
    return true
});

exports.verifyHourPeriod = functions.https.onCall((data, context) => {
    if(!context.auth)
    {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'Usuário não autenticado'
        );
    }

    var hour = new Date();
    var hoursToday = hour.getHours();

    var daySelected = data.selectedDay;
    var monthSelected = data.selectedMonth;
    var yearSelected = data.selectedYear;
    var hourSelected = data.selectedHour;

    var dateSelect = new Date(yearSelected, monthSelected, daySelected);

    var d = new Date();
    var dayToday = d.getDate();
    var monthToday = d.getMonth();
    var yearToday = d.getFullYear();
        
    var today = new Date(yearToday, monthToday, dayToday);

    if(dateSelect > today)
    {
        return true;
    }
    for(let i = 0; i < hourSelected.length; i++)
    {
        var hourSelection = parseInt(hourSelected[i]);
        if(hoursToday < hourSelection)
        {
            return true;
        }
    }
    return false;
});

exports.verifyHourAppointment = functions.https.onCall((data, context) => {
    if(!context.auth)
    {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'Usuário não autenticado'
        );
    }

    var hour = new Date();
    var hoursToday = hour.getHours();

    var daySelected = data.selectedDay;
    var monthSelected = data.selectedMonth;
    var yearSelected = data.selectedYear;
    var hourSelected = data.selectedHour;

    var dateSelect = new Date(yearSelected, monthSelected, daySelected);

    var d = new Date();
    var dayToday = d.getDate();
    var monthToday = d.getMonth();
    var yearToday = d.getFullYear();
        
    var today = new Date(yearToday, monthToday, dayToday);

    if(dateSelect > today)
    {
        return true;
    }
    var hourSelection = parseInt(hourSelected);
    if(hoursToday < hourSelection)
    {
        return true;
    }
    return false;
});

exports.cancelNotification = functions.firestore.document('notificacoes/{id}').onCreate((snap, context) => {
    const data = snap.data();
    const token = data.token;

    const message = {
        notification: {
            title: data.titulo,
            body: data.body,
        },
        token: token
    }

    admin.messaging().send(message)
})