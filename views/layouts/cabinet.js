exports.pageElements = (dictionary, varList) => {
    return {
        'appName':varList.appName,
        'lang': varList.lang,
        'langPath': varList['langPath'],
        'MessageNoScript': dictionary['MessageNoScript'],
        'Exit': dictionary['Exit'],
        'OurTagline': dictionary['OurTagline'],
        'login': varList.login,
        'HowCoins': dictionary['HowCoins'],
        'coins': varList.coins,
        'mainNav': [
            {
                'content':dictionary['BuyCoin'],
                'class': varList.mainNav?.classBuyCoin,
                'url': '/buy-coin'
            },
            {
                'content': dictionary['OrderFileProcessing'],
                'class' : varList.mainNav?.classOrderFileProcessing,
                'url': '/order-file-processing'
            },
            {
                'content': dictionary['Deals'],
                'class': varList.mainNav?.classDeals,
                'url': '/deals'
            },
            {
                'content': dictionary['PaymentHistory'],
                'class': varList.mainNav?.classPaymentHistory,
                'url': '/payment-history'
            },
            {
                'content': dictionary['UserData'],
                'class': varList.mainNav?.classProfile,
                'url': '/profile'
            }
        ],
        'langNav': [
            {
                'content': dictionary['enLang'],
                'class': 'lang-switcher__item_eng',
                'url': 'en',
                'idLang': 'idEn'
            },
            {
                'content': dictionary['ruLang'],
                'class': 'lang-switcher__item_rus',
                'url': 'ru',
                'idLang': 'idRu'
            }
        ]
    }
}