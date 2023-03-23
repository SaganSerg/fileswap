exports.pageElements = (dictionary, varList) => {
    return {
        login: dictionary['login'],
        currentUrl: varList.currentUrl,
        buttonValue: dictionary['send'],
        customer: varList.customer 
    }
}