"use strict";

angular.module('SmartAdmin.Forms').directive('smartDatepicker', function () {
    return {
        restrict: 'A',
        compile: function (element, attributes) {
            element.removeAttr('smartDatepicker');

            var onSelectCallbacks = [];
            if (attributes.minRestrict) {
                onSelectCallbacks.push(function (selectedDate) {
                    $(attributes.minRestrict).datepicker('option', 'minDate', selectedDate);
                });
            }
            if (attributes.maxRestrict) {
                onSelectCallbacks.push(function (selectedDate) {
                    $(attributes.maxRestrict).datepicker('option', 'maxDate', selectedDate);
                });
            }

            //Let others know about changes to the data field
            onSelectCallbacks.push(function (selectedDate) {
                //CVB - 07/14/2015 - Update the scope with the selected value
                element.triggerHandler("change");

                //CVB - 07/17/2015 - Update Bootstrap Validator
                var form = element.closest('form');

                if(typeof form.bootstrapValidator == 'function')
                    form.bootstrapValidator('revalidateField', element.attr('name'));
            });

            var options = {
                prevText: '<i class="fa fa-chevron-left"></i>',
                nextText: '<i class="fa fa-chevron-right"></i>',
                dateFormat: 'yy-mm-dd',//日期格式
                yearSuffix: '年', //年的后缀
                showMonthAfterYear:true,//是否把月放在年的后面
                monthNames: ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'],
                dayNames: ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'],
                dayNamesShort: ['周日','周一','周二','周三','周四','周五','周六'],
                dayNamesMin: ['日','一','二','三','四','五','六'],
                onSelect: function (selectedDate) {
                    angular.forEach(onSelectCallbacks, function (callback) {
                        callback.call(this, selectedDate)
                    })
                }
            };


            if (attributes.numberOfMonths) options.numberOfMonths = parseInt(attributes.numberOfMonths);

            if (attributes.dateFormat) options.dateFormat = attributes.dateFormat;

            if (attributes.defaultDate) options.defaultDate = attributes.defaultDate;

            if (attributes.changeMonth) options.changeMonth = attributes.changeMonth == "true";


            element.datepicker(options)
        }
    }
});