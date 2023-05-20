exports.pageElements = (dictionary, varList) => {
    return {
        For_registered_user: dictionary.For_registered_user,
        password: dictionary.password,
        email: dictionary.email,
        login: dictionary.login,
        signUp: dictionary.signUp,
        currentUrl: varList.currentUrl,
        Remember_password: dictionary.Remember_password,
        You_must_give_your_consent_to_the_use_of_cookies: dictionary.You_must_give_your_consent_to_the_use_of_cookies,
        Incorrect_login_or_password: dictionary.Incorrect_login_or_password
    }
}