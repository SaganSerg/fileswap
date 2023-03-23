exports.pageElements = (dictionary, varList) => {
    return {
        'appName':dictionary['appName'],
        'logoAppName':dictionary['logoAppName'],
        'lang': varList['lang'],
        'langPath': varList['langPath'],
        'mainNav': [
            {
                'content':dictionary['home'],
                'class': varList.mainNav.classHome,
                'url': '/'
            },
            {
                'content': dictionary['aboutUs'],
                'class' : varList.mainNav.classAboutUs,
                'url': '/about-us'
            },
            {
                'content': dictionary['signUp'],
                'class': varList.mainNav.classSignUp,
                'url': '/signup'
            },
            {
                'content': dictionary['login'],
                'class': varList.mainNav.classLogin,
                'url': '/login'
            }   
        ],
        'langNav': [
            {
                'content': dictionary['enLang'],
                'class': varList.langNav.classEnLang,
                'url': 'en',
                'idLang': 'idEn'
            },
            {
                'content': dictionary['ruLang'],
                'class': varList.langNav.classRuLang,
                'url': 'ru',
                'idLang': 'idRu'
            }
        ],
        'cookiesAgree': {
            'content' : dictionary['cookiesAgree'],
            'class': varList.cookiesAgree.classCookiesAgree
        }
    }
}