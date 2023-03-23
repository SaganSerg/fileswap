exports.pageElements = (dictionary, varList) => {
    return {
        login: dictionary['login'],
        buttonValue: dictionary['send'],
        You_are_not_agreed_with_cookie: dictionary['You_are_not_agreed_with_cookie'],
        cookieMessageForForm: varList.cookieMessageForForm,
        enterButtonActive: varList.enterButtonActive,
        currentUrl: varList.currentUrl
    }
}