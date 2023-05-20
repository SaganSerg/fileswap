exports.pageElements = (dictionary, varList) => {
    return {
        appName:varList.appName,
        lang: varList.lang,
        langPath: varList.langPath,
        MessageNoScript: dictionary.MessageNoScript,
        OurTagline: dictionary.OurTagline,
        logoAppName:dictionary.logoAppName,


        pageMark: varList.pageMark,
        currentUrl: varList.currentUrl,
        
        
        
        mainNav: [
            {
                content:dictionary.home,
                class: varList.mainNav.classHome,
                url: '/'
            },
            {
                content: dictionary.aboutUs,
                class : varList.mainNav.classAboutUs,
                url: '/about-us'
            }
        ],
        langNav: [
            {
                content: dictionary.enLang,
                class: varList.langNav.classEnLang,
                url: 'en',
                idLang: 'idEn'
            },
            {
                content: dictionary.ruLang,
                class: varList.langNav.classRuLang,
                url: 'ru',
                idLang: 'idRu'
            }
        ],
        cookiesAgree: {
            We_use_cookies : dictionary.We_use_cookies,
            class: varList.cookiesAgree.classCookiesAgree,
            By_continuing_to_use_the_site_you_agree_to_the_terms_of_use_of_cookies: dictionary.By_continuing_to_use_the_site_you_agree_to_the_terms_of_use_of_cookies,
            agree: dictionary.agree
        }
    }
}