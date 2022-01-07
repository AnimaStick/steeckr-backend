module.exports = {
    validateEmail: (email) => {
        return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email);
    },
    validateBirthDate: (birthday) => {
        let minimumAge = new Date();
        minimumAge.setFullYear(minimumAge.getFullYear() - 18);
        let dateFields = birthday.split("-");
        let birthDayDate = new Date(dateFields[0], dateFields[1], dateFields[2]);
        if (!birthday || birthDayDate > minimumAge)
            return false;
        return true;
    }
}