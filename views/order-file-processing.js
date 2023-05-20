exports.pageElements = (dictionary, varList) => {
    varList.vehicle_type.forEach(element => {
        element.title = dictionary[element.value]
    });
    return {
        currentUrl: varList.currentUrl,
        vehicle_type_title: dictionary.vehicle_type_title,
        vehicle_brand_title: dictionary.vehicle_brand_title,
        vehicle_model_title: dictionary.vehicle_model_title,
        selected_ECU_title: dictionary.selected_ECU_title,
        select_vehicle_type: dictionary.select_vehicle_type,
        vehicle_type: varList.vehicle_type,
        
        not_selected: dictionary.not_selected,
        further: dictionary.further,
        you_didnt_choose_anything: dictionary.you_didnt_choose_anything
    }
}