"use strict";
const wrongUrl = 'http://simple.loc:3000/wrong'
const fileIsNotUpload = 'http://simple.loc:3000/fileisnotupload'
function makeReq(url, fun, method = 'GET' ) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
        fun(this)
    }
    };
    xhr.open(method, url, true);
    xhr.send();
}
const processRequest = async (url, fun, catchFun, method) => {
    try {
        const res = await fetch(url, {method: method})
        await fun(res)
    } catch(e){
        catchFun(e)
    }
    
}
function fileDownloadinChecksumProvider()
{
    if ($elem = document.getElementById('downloading-file')) {
        $elem.addEventListener('change', function() {
            var file = this.files[0];
            var reader = new FileReader();
            reader.readAsArrayBuffer(file);
            reader.onload = function () {
                var result = reader.result;
                var view = new Uint8Array(result);
                let checksumOnServer = document.getElementById('downloading-file-checksum').textContent;
                let checksumOnClient = crc16MODBUS(view);
                if (checksumOnServer === 'No file') {
                    document.getElementById('downloading-file-no-file').classList.remove('hide');
                } else if (checksumOnServer == checksumOnClient) {
                    document.getElementById('downloading-file-checksum-message-ok').classList.remove('hide');
                } else {
                    document.getElementById('downloading-file-checksum-message-trouble').classList.remove('hide');
                }
            }
        });
    }
}
function crc16MODBUS(string){
    var CrcTable = [
        0X0000, 0XC0C1, 0XC181, 0X0140, 0XC301, 0X03C0, 0X0280, 0XC241,
        0XC601, 0X06C0, 0X0780, 0XC741, 0X0500, 0XC5C1, 0XC481, 0X0440,
        0XCC01, 0X0CC0, 0X0D80, 0XCD41, 0X0F00, 0XCFC1, 0XCE81, 0X0E40,
        0X0A00, 0XCAC1, 0XCB81, 0X0B40, 0XC901, 0X09C0, 0X0880, 0XC841,
        0XD801, 0X18C0, 0X1980, 0XD941, 0X1B00, 0XDBC1, 0XDA81, 0X1A40,
        0X1E00, 0XDEC1, 0XDF81, 0X1F40, 0XDD01, 0X1DC0, 0X1C80, 0XDC41,
        0X1400, 0XD4C1, 0XD581, 0X1540, 0XD701, 0X17C0, 0X1680, 0XD641,
        0XD201, 0X12C0, 0X1380, 0XD341, 0X1100, 0XD1C1, 0XD081, 0X1040,
        0XF001, 0X30C0, 0X3180, 0XF141, 0X3300, 0XF3C1, 0XF281, 0X3240,
        0X3600, 0XF6C1, 0XF781, 0X3740, 0XF501, 0X35C0, 0X3480, 0XF441,
        0X3C00, 0XFCC1, 0XFD81, 0X3D40, 0XFF01, 0X3FC0, 0X3E80, 0XFE41,
        0XFA01, 0X3AC0, 0X3B80, 0XFB41, 0X3900, 0XF9C1, 0XF881, 0X3840,
        0X2800, 0XE8C1, 0XE981, 0X2940, 0XEB01, 0X2BC0, 0X2A80, 0XEA41,
        0XEE01, 0X2EC0, 0X2F80, 0XEF41, 0X2D00, 0XEDC1, 0XEC81, 0X2C40,
        0XE401, 0X24C0, 0X2580, 0XE541, 0X2700, 0XE7C1, 0XE681, 0X2640,
        0X2200, 0XE2C1, 0XE381, 0X2340, 0XE101, 0X21C0, 0X2080, 0XE041,
        0XA001, 0X60C0, 0X6180, 0XA141, 0X6300, 0XA3C1, 0XA281, 0X6240,
        0X6600, 0XA6C1, 0XA781, 0X6740, 0XA501, 0X65C0, 0X6480, 0XA441,
        0X6C00, 0XACC1, 0XAD81, 0X6D40, 0XAF01, 0X6FC0, 0X6E80, 0XAE41,
        0XAA01, 0X6AC0, 0X6B80, 0XAB41, 0X6900, 0XA9C1, 0XA881, 0X6840,
        0X7800, 0XB8C1, 0XB981, 0X7940, 0XBB01, 0X7BC0, 0X7A80, 0XBA41,
        0XBE01, 0X7EC0, 0X7F80, 0XBF41, 0X7D00, 0XBDC1, 0XBC81, 0X7C40,
        0XB401, 0X74C0, 0X7580, 0XB541, 0X7700, 0XB7C1, 0XB681, 0X7640,
        0X7200, 0XB2C1, 0XB381, 0X7340, 0XB101, 0X71C0, 0X7080, 0XB041,
        0X5000, 0X90C1, 0X9181, 0X5140, 0X9301, 0X53C0, 0X5280, 0X9241,
        0X9601, 0X56C0, 0X5780, 0X9741, 0X5500, 0X95C1, 0X9481, 0X5440,
        0X9C01, 0X5CC0, 0X5D80, 0X9D41, 0X5F00, 0X9FC1, 0X9E81, 0X5E40,
        0X5A00, 0X9AC1, 0X9B81, 0X5B40, 0X9901, 0X59C0, 0X5880, 0X9841,
        0X8801, 0X48C0, 0X4980, 0X8941, 0X4B00, 0X8BC1, 0X8A81, 0X4A40,
        0X4E00, 0X8EC1, 0X8F81, 0X4F40, 0X8D01, 0X4DC0, 0X4C80, 0X8C41,
        0X4400, 0X84C1, 0X8581, 0X4540, 0X8701, 0X47C0, 0X4680, 0X8641,
        0X8201, 0X42C0, 0X4380, 0X8341, 0X4100, 0X81C1, 0X8081, 0X4040
    ];

    var crc = 0xFFFF;

    for(var i = 0, l = string.length ; i < l; i++){
        crc = ((crc >> 8) ^ CrcTable[(crc ^ string[i]) & 0xFF]);
        
    };
    return crc.toString(16);
}

function makeInputIsActive(idArr){
    idArr.forEach(id => {
        let button;
        if (button = document.getElementById(id)) {
            button.classList.contains('disabled') && button.classList.remove('disabled') 
        }
    });
}
function putLangCookie() {
    // здесь массив id и языков на которые вешаются события установки куков
    [
        {
            id: 'idEn',
            lang: 'en'
        },
        {
            id: 'idRu',
            lang: 'ru'
        }
    ].forEach(elem => {
        let lang;
        if (lang = document.getElementById(elem.id)) {
            lang.addEventListener('click', () => {
                document.cookie = `lang=${elem.lang};path=/;samesite=lax;expires=` + new Date(Date.now() + 86400e3).toUTCString();
            })
        }
    }) 
}
function hideMessageAboutCookie(){
    if(agree = document.getElementById('noAgreeCookieMessage')) {
        agree.classList.add('hide')
    }
}
function agreeToCookie(){
    let agree, elemLangEn, elemLangRu;
    if ((agree = document.getElementById('agree')) && (elemLangEn = document.getElementById('idEn')) && (elemLangRu = document.getElementById('idRu')) ) {
        agree.addEventListener('click', () => {
            let lang = elemLangEn.classList.contains('current') ? 'en' : elemLangRu.classList.contains('current') ? 'ru' : false
            if (lang) {
                document.cookie = `lang=${lang};path=/;samesite=lax;expires=` + new Date(Date.now() + 86400e3).toUTCString();
            }
            document.cookie = "agree=yes;path=/;samesite=lax;expires=" + new Date(Date.now() + 86400e3).toUTCString();
            let agreeBlock
            if (agreeBlock = document.getElementById('agreeBlock'))
            agreeBlock.classList.contains('show') && agreeBlock.classList.remove('show'), agreeBlock.classList.add('hide')
            if (document.getElementById('enterForm')) {
                makeInputIsActive(['buttonForm', 'inputName', 'inputPass'])
                hideMessageAboutCookie()
                putLangCookie()
            }
        })
    }
}
(function(){
    try {
    window.addEventListener('load', function(){
        agreeToCookie();
        (document.cookie.indexOf('agree=yes') !== -1) && putLangCookie()
        if (document.getElementById('page_file')) {
            document.getElementById('formChecksum').addEventListener('submit', function (env) {
                env.preventDefault();
            });
            document.getElementById('submitFile').addEventListener('click', function (){
                document.getElementById('formChecksum').submit();
            });
            document.getElementById('downloadfile').addEventListener('change', function () {
                const file = this.files[0];
                const reader = new FileReader();
                reader.readAsArrayBuffer(file);
                reader.onload = function () {
                    let result = reader.result;
                    const view = new Uint8Array(result);
                    document.getElementById('checksum').value = crc16MODBUS(view);
                    document.getElementById('submitFile').classList.remove('hide');
                }
            })
        }
        if (document.querySelector('body.page_cabinet')) { // этот блок онтоситься к странице кабинет
            let hideShowButton = document.getElementById('hide-show-button'); // доступ к "бутерброду"
            let mainNav = document.getElementById('main-nav'); // доступ к сайдбару
            let mainNavHideShow = document.getElementById('main-nav-hide'); // доступ к крестику на сайдбаре
            function toggleHideShow() { // данная функция переключает у сайдабара класс, который показывает и скрывает сайдбар
                mainNav.classList.toggle('page__nav_hide-show');
            }
            function addEventHideShow (button) { // данная функция навешивает на элементы, событие по которому скрывается-показывается сайдбар
                button.addEventListener('click', toggleHideShow );
            }
            if (mainNav) { // данное условие нужно на всякий случай
                if (hideShowButton) { // данное условие нужно для подстаховки
                    addEventHideShow(hideShowButton);
                }
                if (mainNavHideShow) { // данное условие нужно для подстраховки
                    addEventHideShow(mainNavHideShow);
                }
            }
        }
        let loginForm
        if (loginForm = document.getElementById('home')) {
            let sendButton
            if (sendButton = document.getElementById('sendButton')) {
                loginForm.addEventListener('submit', function(evt) {
                    evt.preventDefault()
                    const form = evt.target
                    const body = JSON.stringify({
                        username: form.elements.username.value,
                        password: form.elements.password.value
                    })
                    const headers = {'Content-Type': 'application/json'}
                    fetch('/login/password', {method: 'POST', body, headers})
                    .then(res => res.json())
                    .then(res => {
                        let paramRes = JSON.parse(res);
                        if (paramRes.itisgood) {
                            let url = paramRes.protocol + '://' + paramRes.domen + ':' + paramRes.port + '/' + paramRes.lang + '/buy-coin'
                            location.assign(url)
                        } else if (!paramRes.itisgood){
                            paramRes.allMessages.forEach(id => {
                                let elem
                                if (elem = document.getElementById(id)) elem.classList.add('hide')
                            })
                            paramRes.messages.forEach((elem) => {
                                document.getElementById(elem).classList.remove('hide')
                            })
                            sendButton.classList.remove('wait')
                        } else {
                            location.assign(wrongUrl)
                        }
                    })
                    .catch(err => {
                        console.log(err)
                        location.assign(wrongUrl)
                    })
                    sendButton.classList.add('wait')
                })
            }
        }
        let registrationForm
        if (registrationForm = document.getElementById('registration')) {
            let submitForm
            if (submitForm = document.getElementById('sendForm')) {
                registrationForm.addEventListener('submit', function(evt) {
                    evt.preventDefault()
                    const form = evt.target
                    const body = JSON.stringify({
                        email: form.elements.email.value,
                        telephone: form.elements.telephone.value,
                        currency: form.elements.currency.value,
                        password: form.elements.password.value,
                        repeat_password: form.elements.repeat_password.value
                    })
                    const headers = { 'Content-Type': 'application/json' }
                    fetch('/registration', {method: 'POST', body, headers})
                    .then(res => res.json())
                    .then(res => {
                        let paramRes = JSON.parse(res);
                        paramRes.allMessages.forEach(id => {
                            let elem
                            if (elem = document.getElementById(id)) elem.classList.add('hide') 
                        })
                        if (paramRes.itisgood) {
                            let url = paramRes.protocol + '://' + paramRes.domen + ':' + paramRes.port + '/' + paramRes.lang + '/buy-coin'
                            location.assign(url)
                        } else if (!paramRes.itisgood){
                            paramRes.messages.forEach((elem) => {
                                document.getElementById(elem).classList.remove('hide')
                            })
                            submitForm.classList.remove('wait') 
                        } else {
                            location.assign(wrongUrl)
                        }
                    })
                    .catch(err => {
                        console.log(err)
                        location.assign(wrongUrl)
                    })
                    submitForm.classList.add('wait') 
                })
            }
        }
        // if (document.getElementById('profile')) {
        //     let form, submit, url = '/profile', 
        //     fun = (request) => {
        //         console.log(typeof request.responseText)
        //     }
        //     if ((form = document.getElementById('profile-form')) && (submit = document.getElementById('profile-form__submit'))) {
        //         form.addEventListener('submit', function (env) {
        //             env.preventDefault();
        //         });
        //         submit.addEventListener('click', () => {
        //             makeReq(url, fun, 'POST')
        //         });
        //     }
        // }
        
        if (document.getElementById('profile')) {
            let form, submit
            // fun = (res) => {
            //     console.log(res)
            // },
            // catchFun = (err) => {
            //     console.log(err)
            // }
            // console.log(document.getElementById('profile-form'))
            // console.log(document.getElementById('profile-form__submit'))

            if ((form = document.getElementById('profile-form')) && (submit = document.getElementById('profile-form__submit'))) {
                form.addEventListener('submit', function (evt) {
                    evt.preventDefault();
                    const form = evt.target
                    const body = JSON.stringify({
                        telephone: form.elements.telephone.value,
                        currency: form.elements.currency.value,
                    })
                    const headers = { 'Content-Type': 'application/json' }
                    fetch('/profile', {method: 'POST', body, headers})
                    .then(res => res.json())
                    .then(res => {
                        let paramRes = JSON.parse(res);
                        paramRes.allMessages.forEach(id => {
                            let elem
                            if (elem = document.getElementById(id)) elem.classList.add('hide') 
                        })
                        if (paramRes.itisgood) {
                            console.log('it is now')
                            let url = paramRes.protocol + '://' + paramRes.domen + ':' + paramRes.port + '/' + paramRes.lang + '/profile'
                            location.assign(url)
                        } else if (!paramRes.itisgood){
                            paramRes.messages.forEach((elem) => {
                                document.getElementById(elem).classList.remove('hide')
                            })
                            // submitForm.classList.remove('wait') 
                            let button
                            if (button = document.getElementById('profile-form__submit')) button.classList.remove('wait') 
                        } else {
                            location.assign(wrongUrl)
                        }
                    })
                    .catch(err => {
                        console.log(err)
                        location.assign(wrongUrl)
                    })
                    // submitForm.classList.add('wait') 
                    let button
                    if (button = document.getElementById('profile-form__submit')) button.classList.add('wait') 
                });
                // const data = new FormData(form);
                // console.log(data)


                // submit.addEventListener('click', () => {
                //     fetch('/profile', {method: 'POST', body: data})
                //     .then(res => res.json())
                //     .then(res => {
                //         let paramRes = JSON.parse(res);
                //         ['InTelephoneNumberIsNot11character', 'InTelephoneNumberIsNotOnlyNumeric'] // это id-шники тех сообщений о неправильный вводах
                //         .forEach(id => {
                //             let elem
                //             if (elem = document.getElementById(id)) elem.classList.add('hide') 
                //         })
                //         if (paramRes.itisgood) {
                //             let url = paramRes.protocol + '://' + paramRes.domen + ':' + paramRes.port + '/' + paramRes.lang + '/profile'
                //             location.assign(url)
                //         } else {
                //             paramRes.messages.forEach((elem) => {
                //                 document.getElementById(elem).classList.remove('hide')
                //             })
                //             let button
                //             if (button = document.getElementById('profile-form__submit')) button.classList.remove('wait') 
                //         }
                //     })
                //     .catch(err => console.log(err) )
                //     let button
                //     if (button = document.getElementById('profile-form__submit')) button.classList.add('wait') 
                // });
            }
        }
        if (document.getElementById('select-file')) {
            let formVehicle, submitVehicle, formBrand, submitBrand, formModel, submitModel, formECU, submitECU, formTreatmentFile, submitTreatmentFile, hiddenVehicleType, hiddenBrandType, hiddenModleType, hiddenECUtype, block_list_services, optionReadingDevice, optionBrand, optionModel, optionECU, selectedType, selectedBrand, selectedModel, selectedUCU, vehicleType, vehicleTypeBrand, vehicleTypeModel, vehicleBrandModel, vehicleTypeECU, vehicleBrandECU, vehicleModelECU, vehicleOriginalFile, checksum, fileNotUploaded, fileBiger, servicesNumber
            if (
                (formVehicle = document.getElementById('form-choose-vehicle')) && 
                (submitVehicle = document.getElementById('submitVehicle')) && // здесь
                (formBrand = document.getElementById('form-choose-brand')) && 
                (submitBrand = document.getElementById('submitBrand')) && 
                (formModel = document.getElementById('form-choose-model')) && 
                (submitModel = document.getElementById('submitModel')) && 
                (formECU = document.getElementById('form-choose-ecu')) && 
                (submitECU = document.getElementById('submitECU')) && 
                (formTreatmentFile = document.getElementById('form_treatment_file')) && 
                (submitTreatmentFile = document.getElementById('submit-file')) &&

                (hiddenVehicleType = document.getElementById('hiddenVehicleType')) &&
                (hiddenBrandType = document.getElementById('hiddenBrandType')) &&
                (hiddenModleType = document.getElementById('hiddenModleType')) &&
                (hiddenECUtype = document.getElementById('hiddenECUtype')) &&

                (block_list_services = document.getElementById('block_list_services')) &&
                (optionReadingDevice = document.getElementById('optionReadingDevice')) &&

                (optionBrand = document.getElementById('optionBrand')) &&
                (optionModel = document.getElementById('optionModel')) &&
                (optionECU = document.getElementById('optionECU')) &&

                (selectedType = document.getElementById('selected-type')) && 
                (selectedBrand = document.getElementById('selected-brand')) &&
                (selectedModel = document.getElementById('selected-model')) &&
                (selectedUCU = document.getElementById('selected-ecu')) &&

                (vehicleType = document.getElementById('vehicle-type')) &&

                (vehicleTypeBrand = document.getElementById('vehicle_type_brand')) &&

                (vehicleTypeModel = document.getElementById('vehicle_type_model')) &&
                (vehicleBrandModel = document.getElementById('vehicle_brand_model')) &&

                (vehicleTypeECU = document.getElementById('vehicle_type_ecu')) &&
                (vehicleBrandECU = document.getElementById('vehicle_brand_ecu')) &&
                (vehicleModelECU = document.getElementById('vehicle_model_ecu')) &&


                (vehicleOriginalFile = document.getElementById('vehicle-original-file')) &&
                (checksum = document.getElementById('checksum')) && // здесь

                (fileNotUploaded =  document.getElementById('file-not-uploaded')) && // здесь
                (fileBiger = document.getElementById('file-biger')) &&
                (servicesNumber = document.getElementById('servicesNumber'))


            ) {
                formVehicle.addEventListener('submit', function (evt) { // здесь мы отправляли type
                    evt.preventDefault();
                    const form = evt.target
                    const body = JSON.stringify({
                        vehicle_type: form.elements.vehicle_type.value
                    })
                    const headers = { 'Content-Type': 'application/json' }
                    fetch('/vehicle-type', {method: 'POST', body, headers})
                    .then(res => res.json())
                    .then(res => {
                        let paramRes = JSON.parse(res);
                        paramRes.allMessages.forEach(id => {
                            let elem
                            if (elem = document.getElementById(id)) elem.classList.add('hide') 
                        })
                        if (paramRes.itisgood) {
                            formVehicle.classList.add('hide')
                            let tegs = ''
                            paramRes.results.forEach((elem) => {
                                tegs += `<option value='${elem.data_value}'>${elem.data_value}</option>\n`
                            })
                            optionBrand.insertAdjacentHTML('afterend', tegs)
                            
                            for (let i of vehicleType.children) { // это нужно для того, чтобы "работал" перевод
                                if (i.value === form.elements.vehicle_type.value)
                                selectedType.innerHTML = i.textContent
                            }

                            hiddenVehicleType.value = vehicleTypeBrand.value = vehicleTypeModel.value = vehicleTypeECU.value = form.elements.vehicle_type.value
                            submitBrand.classList.remove('hide')
                            formBrand.classList.remove('noevents')
                            formBrand.classList.remove('opacity')

                            // ######
                            formBrand.addEventListener('submit', (evt) => { // здесь отправляем brand и type
                                evt.preventDefault()
                                const form = evt.target
                                const body = JSON.stringify({
                                    vehicle_brand: form.elements.vehicle_brand.value,
                                    vehicle_type: form.elements.vehicle_type.value
                                })
                                const headers = {'Content-Type': 'application/json'}
                                fetch('/vehicle-brand', { method: 'POST', body, headers})
                                .then(res => res.json())
                                .then(res => {
                                    let paramRes = JSON.parse(res)
                                    paramRes.allMessages.forEach(id => {
                                        let elem
                                        if (elem = document.getElementById(id)) elem.classList.add('hide')
                                    })
                                    if (paramRes.itisgood) {
                                        formBrand.classList.add('hide')
                                        let tegs = ''
                                        paramRes.results.forEach((elem) => {
                                            tegs += `<option value='${elem.data_value}'>${elem.data_value}</option>\n`
                                        })
                                        optionModel.insertAdjacentHTML('afterend', tegs)
                                        selectedBrand.innerHTML = form.elements.vehicle_brand.value
                                        hiddenBrandType.value = vehicleBrandModel.value = vehicleBrandECU.value = form.elements.vehicle_brand.value
                                        submitModel.classList.remove('hide')
                                        formModel.classList.remove('noevents')
                                        formModel.classList.remove('opacity')

                                        //#####
                                        formModel.addEventListener('submit', evt => { // здесь отправляем model brand type
                                            evt.preventDefault()
                                            const form = evt.target
                                            const body = JSON.stringify({
                                                vehicle_model: form.elements.vehicle_model.value,
                                                vehicle_brand: form.elements.vehicle_brand.value,
                                                vehicle_type: form.elements.vehicle_type.value
                                            })
                                            const headers = {'Content-Type': 'application/json'}
                                            fetch('/vehicle-model', { method: 'POST', body, headers})
                                            .then(res => res.json())
                                            .then(res => {
                                                let paramRes = JSON.parse(res)
                                                paramRes.allMessages.forEach(id => {
                                                    let elem
                                                    if (elem = document.getElementById(id)) elem.classList.add('hide')
                                                })
                                                if (paramRes.itisgood) {
                                                    formModel.classList.add('hide')
                                                    let tegs = ''
                                                    paramRes.results.forEach((elem) => {
                                                        tegs += `<option value='${elem.data_value}'>${elem.data_value}</option>\n`
                                                    })
                                                    optionECU.insertAdjacentHTML('afterend', tegs)
                                                    selectedModel.innerHTML = form.elements.vehicle_model.value
                                                    hiddenModleType.value = vehicleModelECU.value = form.elements.vehicle_model.value
                                                    submitECU.classList.remove('hide')
                                                    formECU.classList.remove('noevents')
                                                    formECU.classList.remove('opacity')
                                                    

                                                    // ######
                                                    formECU.addEventListener('submit', evt => {
                                                        evt.preventDefault()
                                                        const form = evt.target
                                                        const body = JSON.stringify({
                                                            vehicle_model: form.elements.vehicle_model.value,
                                                            vehicle_brand: form.elements.vehicle_brand.value,
                                                            vehicle_type: form.elements.vehicle_type.value,
                                                            ecu: form.elements.ecu.value
                                                        })
                                                        const headers = {'Content-Type': 'application/json'}
                                                        fetch('/ecu', { method: 'POST', body, headers})
                                                        .then(res => res.json())
                                                        .then(res => {
                                                            let paramRes = JSON.parse(res)
                                                            paramRes.allMessages.forEach(id => {
                                                                let elem
                                                                if (elem = document.getElementById(id)) elem.classList.add('hide')
                                                            })
                                                            if (paramRes.itisgood) {
                                                                formECU.classList.add('hide')
                                                                let tegsReadingDevice = ''
                                                                paramRes.results.readingDevice.forEach(elem => {
                                                                    tegsReadingDevice += `<option value='${elem.constant_value_value}'>${elem.constant_value_value}</option>\n`
                                                                })
                                                                optionReadingDevice.insertAdjacentHTML('afterend', tegsReadingDevice)
                                                                let tegsPrice = ''
                                                                let nameTag = 0
                                                                let servicesNumberValue = 0
                                                                paramRes.results.price.forEach(elem => {
                                                                    tegsPrice += `<label class='block-checkboxes__block-checkbox block-checkbox'>
                                                                        <input type='checkbox' name='serv_${++nameTag}' value='${elem.service_name}'>${elem.service_name}<span class='block-checkbox__price'>${elem.condition_service_price}</span>
                                                                    </label>`
                                                                    servicesNumberValue++
                                                                })                
                                                                servicesNumber.value = servicesNumberValue
                                                                block_list_services.insertAdjacentHTML('afterbegin', tegsPrice)
                                                                selectedUCU.innerHTML = form.elements.ecu.value
                                                                hiddenECUtype.value = form.elements.ecu.value

                                                                formTreatmentFile.classList.remove('noevents')
                                                                formTreatmentFile.classList.remove('opacity')
                                                                
                                                                formTreatmentFile.addEventListener('submit', evt => {
                                                                    evt.preventDefault()
                                                                    const body = new FormData(evt.target)
                                                                    fetch('/upload', {method: 'POST', body})
                                                                    .then(res => {
                                                                        // console.log('this is first res from upload')
                                                                        if(res.status < 200 || res.status >= 300) {
                                                                            console.log('errror 200')
                                                                            throw new Error(`Request failed with status ${res.status}`)
                                                                        }
                                                                        // console.log('it is first res after upload')
                                                                        return res.json()
                                                                    })
                                                                    .then(res => {
                                                                        // console.log('is is from second res upload')
                                                                        let paramRes = JSON.parse(res)
                                                                        // console.log('before paramRes')
                                                                        paramRes.allMessages.forEach(id => {
                                                                            let elem
                                                                            if (elem = document.getElementById(id)) elem.classList.add('hide')
                                                                        })
                                                                        // console.log('before itsigood') // cюда уж не попадает
                                                                        if (paramRes.itisgood) {
                                                                            // console.log('it is after the last request')
                                                                            let url = paramRes.protocol + '://' + paramRes.domen + ':' + paramRes.port + '/' + paramRes.lang + '/deal/' + paramRes.customerOrderId
                                                                            location.assign(url)
                                                                        } else if (paramRes.itisgood === false) {
                                                                            paramRes.messages.forEach(elem => {
                                                                                document.getElementById(elem).classList.remove('hide')
                                                                            })
                                                                            formTreatmentFile.classList.remove('wait')
                                                                            formTreatmentFile.classList.remove('opacity')
                                                                        } else {
                                                                            location.assign(wrongUrl)
                                                                        }
                                                                    })
                                                                    .catch(err => {
                                                                        // console.log(err)
                                                                        console.log('это из upload')
                                                                        // здесь должен быть переход на страницу, с сообщение об ошибке загрузки файла и предложением перейти на страницу создания сделки
                                                                        location.assign(fileIsNotUpload)
                                                                    })
                                                                    // formTreatmentFile.submit() -- это скорее всего не нужно
                                                                    formTreatmentFile.classList.add('wait')
                                                                    formTreatmentFile.classList.add('opacity')
                                                                })
                                                                // submitTreatmentFile.addEventListener('click', () => {
                                                                //     const body = new FormData(evt.target)
                                                                //     console.log(body)
                                                                //     fetch('/upload', {method: 'POST', body})
                                                                //     .then(res => {
                                                                //         if(res.status < 200 || res.status >= 300) {
                                                                //             throw new Error(`Request failed with status ${res.status}`)
                                                                //         }
                                                                //         return res.json()
                                                                //     })
                                                                //     .then(res => {
                                                                //         let paramRes = JSON.parse(res)
                                                                //         paramRes.allMessages.forEach(id => {
                                                                //             let elem
                                                                //             if (elem = document.getElementById(id)) elem.classList.add('hide')
                                                                //         })

                                                                //         if (paramRes.itisgood) {
                                                                //             let url = paramRes.protocol + '://' + paramRes.domen + ':' + paramRes.port + '/' + paramRes.lang + '/deal'
                                                                //             location.assign(url)
                                                                //         } else if (paramRes.itisgood === false) {
                                                                //             paramRes.messages.forEach(elem => {
                                                                //                 document.getElementById(elem).classList.remove('hide')
                                                                //             })
                                                                //             formTreatmentFile.classList.remove('wait')
                                                                //             formTreatmentFile.classList.remove('opacity')
                                                                //         } else {
                                                                //             location.assign(wrongUrl)
                                                                //         }
                                                                //     })
                                                                //     .catch(err => {
                                                                //         console.log(err)
                                                                //         // здесь должен быть переход на страницу, с сообщение об ошибке загрузки файла и предложением перейти на страницу создания сделки

                                                                //     })
                                                                //     // formTreatmentFile.submit() -- это скорее всего не нужно
                                                                //     formTreatmentFile.classList.add('wait')
                                                                //     formTreatmentFile.classList.add('opacity')
                                                                // })                                                                
                                                                vehicleOriginalFile.addEventListener('change', function () {
                                                                    const file = this.files[0];
                                                                    
                                                                    const reader = new FileReader();
                                                                    reader.readAsArrayBuffer(file);
                                                                    reader.onload = function () {
                                                                        let result = reader.result;
                                                                        const view = new Uint8Array(result);
                                                                        !fileBiger.classList.contains('hide') && fileBiger.classList.add('hide')  
                                                                        !submitTreatmentFile.classList.contains('hide') && submitTreatmentFile.classList.add('hide')
                                                                        if (view.byteLength > 1024*1024) {
                                                                            fileBiger.classList.remove('hide')
                                                                        } else {
                                                                            checksum.value = crc16MODBUS(view);
                                                                            submitTreatmentFile.classList.remove('hide')
                                                                        }
                                                                    }
                                                                })
                                                                let goAroundCheckboxes = function(fun) {
                                                                    const listLabels = document.getElementById('block_list_services').childNodes;
                                                                    for (let label in listLabels) {
                                                                        if (listLabels.hasOwnProperty(label)) {
                                                                            if (listLabels[label].nodeType == 1) {
                                                                                for (let elem in listLabels[label].children) {
                                                                                    let some = listLabels[label].children[elem]
                                                                                    if (some?.localName === 'input' && some?.type === 'checkbox') {
                                                                                        fun(some)
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                                let sumTotal = function () {
                                                                    let sum = 0;
                                                                    goAroundCheckboxes(function (elem) {
                                                                        if (elem.checked) {
                                                                            sum += Number(elem.nextElementSibling.textContent);
                                                                        }
                                                                    });
                                                                    document.getElementById("total-sum").innerHTML = sum;
                                                                    document.getElementById('total-sum-input').setAttribute('value', sum);
                                                                }
                                                                let addEventCheckboxes = function(elem) {
                                                                    elem.addEventListener('change', sumTotal);
                                                                }
                                                                
                                                                goAroundCheckboxes(addEventCheckboxes)
                                                            } else if (paramRes.itisgood === false){
                                                                paramRes.messages.forEach(elem => {
                                                                    document.getElementById(elem).classList.remove('hide')
                                                                })
                                                                formECU.classList.remove('wait')
                                                                formECU.classList.remove('opacity')
                                                            } else {
                                                                location.assign(wrongUrl)
                                                            }       
                                                        })
                                                        .catch(err => {
                                                            console.log(err)
                                                            location.assign(wrongUrl)
                                                        })
                                                        formECU.classList.add('wait')
                                                        formECU.classList.add('opacity')
                                                    })
                                                } else if (paramRes.itisgood === false){
                                                    paramRes.messages.forEach((elem) => {
                                                        document.getElementById(elem).classList.remove('hide') //didnt-choose-vehible-brand
                                                    })
                                                    formModel.classList.remove('wait')
                                                    formModel.classList.remove('opacity')
                                                } else {
                                                    location.assign(wrongUrl)
                                                }
                                            })
                                            .catch(err => {
                                                console.log(err)
                                                location.assign(wrongUrl)
                                            })
                                            formModel.classList.add('wait')
                                            formModel.classList.add('opacity')


                                            // #####
                                        })
                                    } else if (paramRes.itisgood === false){
                                        paramRes.messages.forEach((elem) => {
                                            document.getElementById(elem).classList.remove('hide') //didnt-choose-vehible-brand
                                        })
                                        formBrand.classList.remove('wait')
                                        formBrand.classList.remove('opacity')
                                    } else {
                                        location.assign(wrongUrl)
                                    }
                                })
                                .catch(err => {
                                    console.log(err)
                                    location.assign(wrongUrl)
                                })
                                formBrand.classList.add('wait')
                                formBrand.classList.add('opacity')

                                //######
                            })
                        } else if (paramRes.itisgood === false){
                            paramRes.messages.forEach((elem) => {
                                document.getElementById(elem).classList.remove('hide')
                            })
                            // submitForm.classList.remove('wait') 
                            formVehicle.classList.remove('wait')
                            formVehicle.classList.remove('opacity')
                        } else {
                            location.assign(wrongUrl)
                        }
                    })
                    .catch(err => {
                        console.log(err)
                        location.assign(wrongUrl)
                    })
                    // // submitForm.classList.add('wait') 
                    // let button
                    // if (button = document.getElementById('profile-form__submit')) button.classList.add('wait') 
                    formVehicle.classList.add('wait')
                    formVehicle.classList.add('opacity')
                });
            }
        }
        if (document.getElementById('deal')) {
            let status, notEnaughtCoins, pay, messages, download, sendComment, getNewMessage, coinsCoint, deal
            if (
                (status = document.getElementById('status')) && 
                (notEnaughtCoins = document.getElementById('notEnaughtCoins')) && 
                (pay = document.getElementById('pay')) && 
                (messages = document.getElementById('messages')) && 
                (download = document.getElementById('download')) &&
                (sendComment = document.getElementById('sendComment')) &&
                (getNewMessage = document.getElementById('getNewMessage')) &&
                (coinsCoint = document.getElementById('coinsCoint')) &&
                (deal = document.getElementById('deal'))
            ) {
                
                pay.addEventListener('submit', function (evt) {
                    
                    evt.preventDefault()
                    const form = evt.target
                    const body = JSON.stringify({
                        sum: form.elements.sum.value,
                        orderId: form.elements.orderId.value
                    })
                    const headers = {'Content-Type': 'application/json'}
                    fetch('/paydeal', {method: 'POST', body, headers})
                    .then(res => res.json())
                    .then(res => {
                        let paramRes = JSON.parse(res)
                        if (paramRes.paid) {
                            let statusValue
                            switch(paramRes.lang) {
                                case 'ru': statusValue = 'Оплачена';
                                break;
                                case 'en': statusValue = 'Paid';
                                break;
                            }
                            status.innerHTML = statusValue
                            coinsCoint.innerHTML = paramRes.coins
                            pay.classList.add('hide')
                            deal.classList.remove('wait')
                            deal.classList.remove('opacity')
                        } else {
                            location.assign(wrongUrl)
                        }
                    })
                    .catch(err => {
                        console.log(err)
                        console.log('this is deal err')
                        location.assign(wrongUrl)
                    })
                    deal.classList.add('wait')
                    deal.classList.add('opacity')
                })

                sendComment.addEventListener('submit', function (evt) {
                    evt.preventDefault()
                    const form = evt.target
                    const body = JSON.stringify({
                        comment: form.elements.comment.value,
                        orderId: form.elements.orderId.value
                    })
                    const headers = {'Content-Type': 'application/json'}
                    fetch('/sendcomment', {method: "POST", body, headers})
                    .then(res => {
                        console.log(res)
                        return res.json()
                    })
                    .then(res => {
                        console.log(res)
                        let paramRes = JSON.parse(res)
                        if (paramRes.itisgood) {
                            let url = paramRes.protocol + '://' + paramRes.domen + ':' + paramRes.port + '/' + paramRes.lang + '/deal/' + paramRes.orderId
                            
                            location.assign(url)
                        } else {
                            location.assign(wrongUrl)
                            
                        }
                    })
                    .catch(err => {
                        console.log(err)
                        location.assign(wrongUrl)
                    })
                })
            }
        }
        if (document.getElementById('content-provider-deal')) {
            // fileDownloadingManagementProvider();
            fileDownloadinChecksumProvider();
        }
    }

)
} catch (err) {
    console.log('hhiih')
    console.log(err)
    location.assign(wrongUrl)
}
})()