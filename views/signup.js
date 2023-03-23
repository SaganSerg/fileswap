exports.pageElements = (dictionary, varList) => {
    return {
        signUp: dictionary['signUp'],
        buttonValue: dictionary['send'],
        You_are_not_agreed_with_cookie: dictionary['You_are_not_agreed_with_cookie'],
        cookieMessageForForm: varList.cookieMessageForForm,
        enterButtonActive: varList.enterButtonActive,
        currentUrl: varList.currentUrl
    }
}