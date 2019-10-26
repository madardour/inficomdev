//NEEDED FOR CLIENT SIDE VALIDATION OF NUMBERS
(function ($) {

    $.validator.methods.number = function (value, element) {
        return this.optional(element) || /^-?(?:\d+|\d{1,3}(?:[\s\,]\d{3})+)(?:[\,]\d+)?$/.test(value);
    }


    $.validator.setDefaults({
        ignore: ":hidden" // force to ignore hidden fields elements
    });

})(jQuery);



//Additional Implemented Attributes
//Comparison – Validates that the property meets the comparison with the specified other property
//GreaterThan
//GreaterThanEqualTo
//LessThan
//LessThanEqualTo
//RequiredIf – Causes the property to be required if the specified other property is not null
//RequiredIfValue – Causes the property to be required if the specified other property is equal to the specified other value
//RequiredIfAnyValue – Causes the property to be required if the specified other property is equal to any of the specified other values
//RequiredIfEmpty – Causes the property to be required if the specified other property is empty(whitespace is considered empty)
(function ($) {

    var mvcvalidationextensions = function () {
        var init = function () {
            var greaterThanEqual = 'greaterthanequalto',
                greaterThan = 'greaterthan',
                lessThanEqual = 'lessthanequalto',
                lessThan = 'lessthan',
                requiredIf = 'requiredif',
                requiredIfValue = 'requiredifvalue',
                requiredIfAnyValue = 'requiredifanyvalue',
                requiredIfEmpty = 'requiredifempty',
                compareValidation = 'comparevalidation';
            var comparisonParams = ['otherproperty'];
            var comparisonOtherPropertyValueParams = ['otherproperty', 'othervalue'];
            var comparisonValueParams = ['othervalue', 'comparison'];


            var CustomValidationExtentionss = [
                { type: greaterThanEqual, params: comparisonParams },
                { type: greaterThan, params: comparisonParams },
                { type: lessThanEqual, params: comparisonParams },
                { type: lessThan, params: comparisonParams },
                { type: requiredIf, params: comparisonParams },
                { type: requiredIfValue, params: comparisonOtherPropertyValueParams },
                { type: requiredIfAnyValue, params: comparisonOtherPropertyValueParams },
                { type: requiredIfEmpty, params: comparisonParams },
                { type: compareValidation, params: comparisonValueParams }
            ];

            // Taken from jquery.validate.unobtrusive because this was better than what we were originally doing.
            var getModelPrefix = function (fieldName) {
                if (fieldName.indexOf('.') == -1) return fieldName;
                return fieldName.substr(0, fieldName.lastIndexOf('.') + 1);
            };

            var appendModelPrefix = function (value, prefix) {
                if (value.indexOf('*.') === 0) {
                    value = value.replace('*.', prefix);
                }
                return value;
            };

            var escapeAttributeValue = function (value) {
                // As mentioned on http://api.jquery.com/category/selectors/
                return value.replace(/([!"#$%&'()*+,./:;<=>?@\[\\\]^`{|}~])/g, '\\$1');
            };

            var setValidationValues = function (options, ruleName, value) {
                options.rules[ruleName] = value;
                if (options.message) {
                    options.messages[ruleName] = options.message;
                }
            };
            // Thanks jquery.validate.unobtrusive

            var getObjectFromElement = function (element) {
                return $(element).is(':radio') || $(element).is(':checkbox') ? $('input[name=' + escapeIdForJSF(element.name) + ']:checked') : $(element);
            };

            var compare = function (obj, otherObj, comparisonType) {
                switch (comparisonType) {
                    case greaterThanEqual:
                        return obj >= otherObj;

                    case greaterThan:
                        return obj > otherObj;

                    case lessThanEqual:
                        return obj <= otherObj;

                    case lessThan:
                        return obj < otherObj;

                    default:
                        return false;
                }
            };

            var validateComparison = function (element, parameter, comparisonType, other_Value) {
                var obj = $(element);

                if (obj.is(':not([data-val-required])') && (obj.val() == null || obj.val() == '')) {
                    return true;
                }

                var otherValue = undefined;

                if (parameter != undefined) {
                    var otherObj = $(parameter);
                    otherValue = otherObj.val();
                } else if (other_Value != undefined)
                {
                    otherValue = other_Value;
                }

                if (otherValue == undefined) return true;

                // date compare
                if (obj.attr('data-val-date') != null) {
                    var date = Date.parse(obj.val());
                    var otherDate = Date.parse(otherValue);

                    if (!(isNaN(date) || isNaN(otherDate))) {
                        return compare(date, otherDate, comparisonType);
                    }

                    return false;
                }

                // numeric compare
                if (!(isNaN(parseFloat(obj.val())) || parseFloat(isNaN(otherValue)))) {
                    return compare(parseFloat(obj.val().replace(',', '.')), parseFloat(otherValue), comparisonType);
                }

                return false;
            };

            var validateRequiredIf = function (element, parameter) {
                var obj = $(element);
                var otherObj = getObjectFromElement(parameter);

                if (otherObj.val() == null || otherObj.val() == undefined || otherObj.val() === '') {
                    return true;
                }

                return (obj.val() != null && obj.val() != undefined && obj.val() !== '');
            };

            var validateRequiredIfValue = function (element, params) {
                var obj = $(element);
                var otherObj = getObjectFromElement(params.element);

                if (otherObj.val() == null || otherObj.val() == undefined || otherObj.val() === '') {
                    return true;
                }

                return params.othervalue === otherObj.val() ?
                    obj.val() != null && obj.val() != undefined && obj.val() !== '' : true;
            };

            var validateRequiredIfAnyValue = function (element, params) {
                var obj = $(element);
                var otherObj = getObjectFromElement(params.element);

                if (otherObj.val() == null || otherObj.val() == undefined || otherObj.val() === '') {
                    return true;
                }

                return $.inArray(otherObj.val(), JSON.parse(params.othervalue)) >= 0 ?
                    obj.val() != null && obj.val() != undefined && obj.val() !== '' : true;
            };

            var validateRequiredIfEmpty = function (element, parameter) {
                var obj = $(element);
                var otherObj = getObjectFromElement(parameter);

                return (otherObj.val() == null || otherObj.val() == undefined || otherObj.val().trim() === '') ? (obj.val() != null && obj.val() != undefined && obj.val() !== '') : true;
            };


            // setup our comparison adapters
            for (var i = 0; i < CustomValidationExtentionss.length; i++) {
                $.validator.unobtrusive.adapters.add(CustomValidationExtentionss[i].type, CustomValidationExtentionss[i].params,
                    (function (i) {
                        return function (options) {

                            var otherproperty = options.params.otherproperty;
                            var otherValue = options.params.othervalue;

                            if (otherproperty != undefined) {
                                var prefix = getModelPrefix(options.element.name),
                                    otherProperty = otherproperty,
                                    fullOtherName = appendModelPrefix(otherProperty, prefix),
                                    element = $(options.form).find(':input').filter("[name='" + escapeAttributeValue(fullOtherName) + "']")[0];

                                if ($(element).is(':hidden') && options.message != null) {
                                    options.message = options.message.replace(otherProperty, $(element).val());
                                }

                                setValidationValues(options, CustomValidationExtentionss[i].type, CustomValidationExtentionss[i].params.length == 1 ? element : { element: element, othervalue: options.params.othervalue });
                            } else if (otherValue != undefined) {
                                setValidationValues(options, CustomValidationExtentionss[i].type, options.params);
                            }
                        };
                    }(i)));
            }

            $.validator.addMethod(greaterThanEqual, function (value, element, params) {
                return validateComparison(element, params, greaterThanEqual);
            });

            $.validator.addMethod(greaterThan, function (value, element, params) {
                return validateComparison(element, params, greaterThan);
            });

            $.validator.addMethod(lessThanEqual, function (value, element, params) {
                return validateComparison(element, params, lessThanEqual);
            });

            $.validator.addMethod(lessThan, function (value, element, params) {
                return validateComparison(element, params, lessThan);
            });

            $.validator.addMethod(requiredIf, function (value, element, params) {
                return validateRequiredIf(element, params);
            });

            $.validator.addMethod(requiredIfValue, function (value, element, params) {
                return validateRequiredIfValue(element, params);
            });

            $.validator.addMethod(requiredIfAnyValue, function (value, element, params) {
                return validateRequiredIfAnyValue(element, params);
            });

            $.validator.addMethod(requiredIfEmpty, function (value, element, params) {
                return validateRequiredIfEmpty(element, params);
            });

            $.validator.addMethod(compareValidation, function (value, element, params) {
                var otherValue = params.othervalue;
                var comparison = params.comparison;
                return validateComparison(element, undefined, comparison, otherValue);
            });
        };

        return {
            init: init
        };
    }();

    mvcvalidationextensions.init();

})(jQuery);


