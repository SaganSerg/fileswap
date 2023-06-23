exports.pageElements = (dictionary, varList) => {

    const statuses = {
        'paid': dictionary.paid,
        'being_done': dictionary.being_done,
        'unpaid': dictionary.unpaid,
        'done': dictionary.done
    }
    
    varList.orderStatus[0].customer_order_status = statuses[varList.orderStatus[0].customer_order_status]
    varList.orderStatus[0].customer_order_date = Intl.DateTimeFormat("en-US").format(new Date(varList.orderStatus[0].customer_order_date))
    return {
        currentUrl: varList.currentUrl,
        orderStatus: varList.orderStatus[0],
        serviceName: varList.serviceName,
        messages: varList.messages.map((elem) => {
            elem.message_date = Intl.DateTimeFormat("en-US").format(new Date(elem.message_date))
            if (elem.message_seen) {
                delete elem.message_seen
            }
            return elem
        }),
        orderData: varList.orderData.map((elem) => {
            const vehicle_type = {
                'car': dictionary.car,
                'truck': dictionary.truck,
                'morine': dictionary.morine,
            }
            const orderDataName = {
                'vehicle_type': dictionary.vehicle_type,
                'vehicle_brand': dictionary.vehicle_brand,
                'vehicle_model': dictionary.vehicle_model,
                'ecu': dictionary.ecu,
                'reading_device': dictionary.reading_device,
                'plate_vehicle': dictionary.plate_vehicle,
                'vin': dictionary.vin
            }
            if (elem.customer_order_data_name == 'vehicle_type') {
                elem.customer_order_data_value = vehicle_type[elem.customer_order_data_value]
            }
            elem.customer_order_data_name = orderDataName[elem.customer_order_data_name]
            return {
                customer_order_data_name: elem.customer_order_data_name ,
                customer_order_data_value: elem.customer_order_data_value
            }
        }),
        showPayButton: varList.showPayButton,
        showNoEnoughtMoney: varList.showNoEnoughtMoney,
        showDownloadFileLink: varList.showDownloadFileLink
    }
}