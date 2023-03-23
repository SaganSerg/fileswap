exports.pageElements = (dictionary, varList) => {
    return {
        cabinet: dictionary['cabinet'],
        customer: varList['customer'],
        logout: dictionary['logout'],
        currentUrl: varList['currentUrl']
    }
}