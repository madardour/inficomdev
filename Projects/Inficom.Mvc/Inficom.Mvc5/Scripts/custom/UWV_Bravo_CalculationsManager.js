// Author: R. El Bali
// Implemented the following pattern:
// (Namespaced) Revealing Prototype pattern:
//This component initialize calculations components, handles some DOM elements events from calcution tab
// Set the namespace
var uwvBravo = uwvBravo || {};
// bravoModalDialog constructor
uwvBravo.CalculationsManager = function (options) {
    // Usually, variables are stored here to keep track of the state.
    this.container = options.container || undefined;
    this.arbeidsVerledenIscollected = undefined;
    this.mml_CalculationManager = undefined;
    this.herindexeringIsCollected = undefined;
    this.zonderIndexeringIsCollected = undefined;
    this.tvcIsCollected = undefined;
    this.pvc_CalculationManager = undefined;

    this.himCalculationResultElement = $("#HasHimMaatmanResultaat");
    this.mmlCalculationResultElement = $("#HasMaatmanloonResultaat");
    this.pvcCalculationResultElement = $("#HasPvcMaatmanloonResultaat");
	this.geactualiseerdeMmlResultElement = $("#HasGeactualiseerdeMMLResultaat");

    this.himCalculationHasResult = function () {
        if (this.himCalculationResultElement && $(this.himCalculationResultElement.selector)) {
			var stringValue = $(this.himCalculationResultElement.selector)[0].value;
            if (stringValue) {
                return stringValue.toLowerCase() == 'true' ? true : false;
            }
        }
        return false;
    }
    
    this.mmlCalculationHasResult = function () {
        if (this.mmlCalculationResultElement && $(this.mmlCalculationResultElement.selector)) {
            var stringValue = $(this.mmlCalculationResultElement.selector)[0].value
            if (stringValue) {
                return stringValue.toLowerCase() == 'true' ? true : false;
            }
        }
        return false;
    }

	this.geactualiseerdeMmlHasResult = function () {
		if (this.geactualiseerdeMmlResultElement && $(this.geactualiseerdeMmlResultElement.selector)) {
			var stringValue = $(this.geactualiseerdeMmlResultElement.selector)[0].value
			if (stringValue) {
				return stringValue.toLowerCase() == 'true' ? true : false;
			}
		}
		return false;
	}

    this.pvcCalculationHasResult = function () {
        if (this.pvcCalculationResultElement && $(this.pvcCalculationResultElement.selector)) {
            var stringValue = $(this.pvcCalculationResultElement.selector)[0].value
            if (stringValue) {
                return stringValue.toLowerCase() == 'true' ? true : false;
            }
        }
        return false;
    }

};

// Create prototype
uwvBravo.CalculationsManager.prototype = function () {
    //#region initialisation
    var initialize = function () {
        storeElementsLastVal.call();
        bindCalculationAccordionExpandEvent.call(this);
        bindAndInitCalculationToDatePicker.call();
        bindPeildatumChangeEvent.call();
        bindIndicatieHerbeoordelingEvent.call(this);
        bindBeoordelingZiektewetEvent.call(this);
        bindIndPassendeArbeid.call(this);
        bindButtonsClickedEvent.call();
        bindArbeidsverledenInputChangeEvent.call();
        bindNieuweFunctieSaveEvent.call();
        bindMaatgevendeSaveEvent.call();
        bindFormValidator.call();
        bindDispatchedEvents.call(this);
    };
    //#endregion
    //#region Ajax calls
    var SaveEerstAoDagAndDatumEWT = function (eersteAoDagValue, datumEwtValue) {
        var postData = { caseId: window.tabManager.caseId, eersteAoDag: eersteAoDagValue, datumEWTValue: datumEwtValue };
        var url = "../Case/SaveEerstAoDagAndDatumEWT";
        var message = "Datum Eerste Ao Dag is met succes opgeslagen.";
        if (datumEwtValue != null && eersteAoDagValue != null) {
            message = "Datum Eerste Ao Dag en datum Einde Wachttijd zijn met succes opgeslagen.";
        }
        else if (datumEwtValue != null) {
            message = "Datum Einde Wachttijd is met succes opgeslagen.";
        }
        $.post(url, postData)
            .done(function (result) {
                if (result) {
                    $.messager.show({
                        msg: message,
                        timeout: 2000,
                        showType: "slide"
                    });
                    //add save attrinbute to peildatum
                    $("#EersteAoDag").data("saved", "True");
                    $("#DatumEWT").data("saved", "True");
                    return false;
                }
                return false;
            });
    };
    var getSavedArbeidsverleden = function () {
        var urlSavedArbeidsverleden = "../Services/GetSavedArbeidsverleden";
        $.get(urlSavedArbeidsverleden, { caseId: window.tabManager.caseId }).done(function (data) {
            if (data !== "") {
                $("#arbeidsverleden_container").html(data);
                $.validator.unobtrusive.parse($('#frmArbeidsverleden'));
                bindArbeidsverledenInputChangeEvent.call(); //to enable/disable button on form valid/invalid
                bindArbeidsverledenSelectButton.call();
            }
        });
    }
    var getTheoVerdienCapaciteit = function () {
        var urlTheoVerdienCapaciteit = "../Calculation/TvcIndex";
        $.get(urlTheoVerdienCapaciteit, { caseId: window.tabManager.caseId }).done(function (data) {
            if (data !== "") {
                $('#TheoretischeVerdienCapaciteitDiv').html(data);
                $.validator.unobtrusive.parse($('#frmTheoretischeVerdienCapaciteit'));
                bindTvcInputChangeEvent.call();
            }
        });
    }
    var getMaatmanHistoricalData = function () {
        var calcObj = this;
        var urlGetMaatmanHistoricalData = "../Calculation/GetMaatmanHistoricalData";
        $.get(urlGetMaatmanHistoricalData, { caseId: window.tabManager.caseId }).done(function (data) {
            if (data !== "") {
                $("#herindexering_container").html(data);
                createInstanceIndexCijfersManager.call();
                $.validator.unobtrusive.parse($('#frmHerindexeringMaatman'));
                //bind related events
                bindHimInputChangeEvent.call();
                bindHimSaveEvent.call(calcObj);
                bindHimDeleteEvent.call(calcObj);
            }
        });
    }
    var getArbeidsVerledenfromUpa = function () {
        var urlInkomstenVerhoudingen = "../Services/GetArbeidsVerleden";
        $.get(urlInkomstenVerhoudingen, { caseId: window.tabManager.caseId, peilDatumStr: $("#PeildatumArbeidsVerleden").val() }
        ).done(function (data) {
            if (data !== "") {
                if (typeof (data) == "object") {
                    if (data.Result === false) {
                        $.messager.alert({
                            title: "BraVo",
                            msg: data.Message,
                            icon: "error",
                            width: "auto",
                            height: "auto"
                        });
                    }
                }
                else {
                    $("#arbeidsverleden_container").html(data);
                    $.validator.unobtrusive.parse($('#frmArbeidsverleden'));
                    bindArbeidsverledenInputChangeEvent.call();
                    bindArbeidsverledenSelectButton.call();
                    $.messager.show({
                        msg: "Arbeidsverleden is bijgewerkt",
                        timeout: 2000,
                        showType: "slide"
                    });
                }
            }
        });
    }
    var getMaatmanZonderIndexering = function () {
        var calcObj = this;
        var urlGetMaatmanZonderIndexering = "../Calculation/GetMaatmanZonderIndexering";
        $.get(urlGetMaatmanZonderIndexering, { caseId: window.tabManager.caseId }).done(function (data) {
            if (data !== "") {
                $("#zonderindexering_container").html(data);
                $.validator.unobtrusive.parse($('#frmZonderindexeringMaatman'));
                //bind related events
                bindZimSaveEvent.call(calcObj);
                bindZimDeleteEvent.call(calcObj);
            }
        });
    }
    var UpdateSbcCodeFunctieNaam = function (codeFieldNr, sbcCodeVal) {
        if ($("#frmTheoretischeVerdienCapaciteit").valid()) {
            //get value from db.
            var updateElement = "#CbbsResultsList_" + codeFieldNr + "__JobDescription";
            $.ajax(
                {
                    url: "../Services/GetFunctieFromSbcCode?sbcCode=" + sbcCodeVal,
                    type: "GET",
                    contentType: "application/json; charset=utf-8",
                    success: function (result) {
                        $(updateElement).val(result.Message);
                    },
                    error: function () {
                        $.messager.alert({
                            title: "BraVo",
                            msg: "Fout opgetreden bij het ophalen van de Functienaam",
                            icon: "error",
                            width: "auto",
                            height: "auto"
                        });
                    }
                });
        }
    }
    var SaveNieuweFunctie = function () {
        var prev = $(this).data("lastVal");
        var current = $(this).val();
        if (prev !== current) {
            $("#NaamNieuweFunctie").data("lastVal", current);
            if ($("#frmPeildatumPVC").valid()) {
                var url = "../Calculation/SaveNieuweFunctie";
                var postData = { naamNieuweFunctie: $("#NaamNieuweFunctie").val(), caseId: window.tabManager.caseId };
                $.ajax(
                    {
                        url: url,
                        type: "POST",
                        data: postData,
                        async: false,
                        contentType: 'application/x-www-form-urlencoded; charset=utf-8',
                        success: function (returnData) {
                            if (returnData.state == true) {
                                ShowResponseMessage(returnData.message);
                            }
                            else {
                                ShowErrorMessage(returnData.message);
                            }
                        },
                        error: function () {
                            //
                        }
                    });
            }
        }
    };

    function saveIndicatieHerbeoordeling(selectedValue) {
        var calcManagerObject = this;
        var caseId = window.tabManager.caseId;
        var message = "";
        var pvcIsLoaded = typeof calcManagerObject.pvc_CalculationManager != "undefined";
        var url = "../Services/SaveIndicatieHerbeoordeling";
        $.get(url, { caseId: caseId, selectedValue: selectedValue, pvcIsLoaded: pvcIsLoaded }
        ).done(function (data) {
            if (data == true) {
                $.messager.show({
                    msg: message + '<span class="text-info">Indicatie herbeoordeling succesvol opgeslagen</span>',
                    timeout: 2000,
                    showType: "slide"
                });
            }
        });
    }
    function SaveBeoordelingZiektewet(selectedValue) {
        var caseId = window.tabManager.caseId;
        var message = "";
        var url = "../Services/SaveBeoordelingZiektewet";
        $.get(url, { caseId: caseId, selectedValue: selectedValue }
        ).done(function (data) {
            if (data !== "") {
                $.messager.show({
                    msg: message + '<span class="text-info"> Beoordeling Ziektewet is succesvol opgeslagen</span>',
                    timeout: 2000,
                    showType: "slide"
                });
            }
        });
    }
    function SaveIndPassendeArbeid(selectedValue) {
        var caseId = window.tabManager.caseId;
        var message = "";
        var url = "../Services/SaveIndPassendeArbeid";
        $.get(url, { caseId: caseId, selectedValue: selectedValue }
        ).done(function (data) {
            if (data !== "") {
                $.messager.show({
                    msg: message + '<span class="text-info"> Indicatie Passende Arbeid is succesvol opgeslagen</span>',
                    timeout: 2000,
                    showType: "slide"
                });
            }
        });
    }
    //#endregion Ajax calls
    //#region private
    var reload = function () { };
    var storeElementsLastVal = function () {
        //save old value
        $("#EersteAoDag").data("lastVal", $("#EersteAoDag").val() || "");
        $("#DatumEWT").data("lastVal", $("#DatumEWT").val() || "");
        $("#MaatgevendeFunctie").data("lastVal", $("#MaatgevendeFunctie").val() || "");
        $("#NaamNieuweFunctie").data("lastVal", $("#NaamNieuweFunctie").val() || "");
        $("#PeildatumPVC").data("lastVal", $("#PeildatumPVC").val() || "");
        $("#Peildatum_ERP").data("lastVal", $("#Peildatum_ERP").val() || "");
        $("#PeildatumArbeidsVerleden").data("lastVal", $("#PeildatumArbeidsVerleden").val() || "");
        $("#MaatgevendeNaamWerkgever").data("lastVal", $("#MaatgevendeNaamWerkgever").val() || "");
    }
    var ShowResponseMessage = function (message) {
        $.messager.show({
            msg: '<span class="text-info">' + message + "</span>",
            icon: "error",
            timeout: 2000,
            showType: "slide"
        });
    }
    var ShowErrorMessage = function (message) {
        $.messager.alert({
            title: "BRaVo",
            msg: "<span class=\"text-danger\">" + message + "</span>",
            icon: "error"
        });
    }
    //set Datum einde wachttijd based on Datum Eerste AO dag
    var setDatumEwt = function (eersteAoDagValue) {
        var datumEwtValue = new Date(toStandardDateFormat(eersteAoDagValue));
        // Wachttijd = 104 weken * 7 dagen = 728 -1 dag = 727 dagen
        datumEwtValue.setDate(datumEwtValue.getDate() + 727);
        $("#DatumEWT").datepicker("setDate", datumEwtValue);
        //set format
        datumEwtValue = $("#DatumEWT").val();
        $("#DatumEWT").data("lastVal", datumEwtValue);
        return datumEwtValue;
    };
    //set lastVal and save Case peildaums
    var setAndSaveNewDate = function (peildatumElement, curValue, savedInDbDirectly) {
        $(peildatumElement).data("lastVal", curValue);
        disableAssociatedButtons($(peildatumElement)[0].id, false);
        if (savedInDbDirectly) {
            if (peildatumElement[0].id === "EersteAoDag") {
                var datumEwtValue = setDatumEwt(curValue);
                SaveEerstAoDagAndDatumEWT(curValue, datumEwtValue);
            } else {
                SaveEerstAoDagAndDatumEWT(null, curValue);
            }
        }
        else {
            var message = "Peildatum is met succes veranderd.";
            $.messager.show({
                msg: message,
                timeout: 2000,
                showType: "slide"
            });
        }
    }
    var createInstanceIndexCijfersManager = function () {
        var indexCijfersOptions = { parentContainerName: "himIndexcijfer" };
        var himIndexCijfersManager = new uwvBravo.IndexCijfers(indexCijfersOptions);
        himIndexCijfersManager.initialize();
    }
    function warningPeildatum(peildatumValue, messageContainerId) {
        var parsedPeildatum = toStandardDateFormat(peildatumValue);
        parsedPeildatum = new Date(parsedPeildatum);
        var msgPeildatum = "";
        var jan2006 = new Date("2006-01-01");
        var jan2008 = new Date("2008-01-01");
        if (parsedPeildatum < jan2006) {
            msgPeildatum = "De Polisadministratie bevat geen gegevens van voor 1 januari 2006. Pas de Peildatum aan naar een datum op of na 1 januari 2008.";
        } else if (parsedPeildatum < jan2008) {
            msgPeildatum = "De peildatum ligt voor 1 januari 2008. De Polisadministratie bevat geen gegevens van voor 1 januari 2006.";
        }
        $("#" + messageContainerId).html(msgPeildatum);
    }
    function validateDate(date, messageContainerId) {
        //validate a date from date-picker
        var peildatum = $(date).val();
        //validate date
        try {
            var timestamp = $.datepicker.parseDate("dd-mm-yy", peildatum);
            if (timestamp == null) return false;
        } catch (e) {
            return false;
        }
        if (messageContainerId) {
            warningPeildatum(peildatum, messageContainerId);
        }
        return true;
    }
    //#endregion private
    //#region input format
    function toStandardDateFormat(dateString) {
        if (!dateString) return dateString;
        var regEx = /^\d{4}-\d{2}-\d{2}$/;
        if (dateString.match(regEx)) return dateString; //already standard date
        var from = dateString.split("-");
        //bugfix in IE11 , cannot convert 1-1-2015 to date. 
        if (from[0].length < 2) {
            from[0] = "0" + from[0];
        }
        if (from[1].length < 2) {
            from[1] = "0" + from[1];
        }
        return from.reverse().join("-");
    }
    //    function parseNumber(numberStr) {
    //        if (numberStr == undefined || numberStr === "") return numberStr;
    //        return parseFloat((numberStr).replace(/\./g, '').replace(',', '.'));
    //    }
    //    function parseDate(str) {
    //    if (str == undefined || str === "") {
    //        return false;
    //    }
    //    var m = str.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    //    return (m) ? false : true;
    //}
    //#endregion input format
    //#region Events
    var bindPeildatumChangeEvent = function () {
        $(".calc-date-picker").on("change", function () {
            var peildatumElement = $(this);
            var savedInDbDirectly = peildatumElement.hasClass("save-in-db");
            var messagecontainer = peildatumElement.data("messagecontainer");
            var prev = $(this).data("lastVal");
            var current = $(this).val();
            var title = $(this)[0].title;
            var savedInDatabase = $(this).data("saved");
            var isAlreadySaved = (savedInDatabase === "true" || savedInDatabase === "True") ? true : false;
            if (prev !== current) {
                if ($(this).val() === "") {
                    //set old value back
                    $(this).val(prev);
                    return;
                }
                if (!validateDate($(this), messagecontainer)) {
                    disableAssociatedButtons($(peildatumElement)[0].id, true);
                }
                else {
                    if (prev === "") {
                        setAndSaveNewDate(peildatumElement, current, savedInDbDirectly);
                    }
                    else {
                        if (isAlreadySaved) {
                            if (messagecontainer === "msgPeildatumArbeidsVerleden") {
                                var warning =
                                    "Let op: Eerder opgehaald arbeidsverleden en vastgelegde informatie in de velden Functie en Uren per week gaan dan bij nogmaals ophalen verloren.";
                            }
                            else {
                                var warning =
                                    "Let op: Als u deze datum aanpast dan moet u ook de onderstaande berekeningen controleren en eventueel opnieuw uitvoeren.";
                            }
                            var message = "Wilt u de " +
                                title +
                                ': <span class="text-info"> ' +
                                prev +
                                ' </span> overschrijven met <span class="text-info">' +
                                current +
                                '?</span></br><span class="text-warning">' +
                                warning +
                                '</span>';
                            var dialog = $.messager.confirm({
                                title: "BraVo",
                                msg: message,
                                icon: "warning",
                                width: "auto",
                                height: "auto",
                                buttons: [
                                    {
                                        text: "Ja",
                                        onClick: function () {
                                            setAndSaveNewDate(peildatumElement, current, savedInDbDirectly);
                                            dialog.dialog("destroy");
                                        }
                                    }, {
                                        text: "Nee",
                                        onClick: function () {
                                            //set old value back
                                            $(peildatumElement).val(prev);
                                            dialog.dialog("destroy");
                                        }
                                    }
                                ]
                            });
                        }
                        else {
                            //save if needed to database
                            setAndSaveNewDate(peildatumElement, current, savedInDbDirectly);
                        }
                    }
                };
            }
        });
    };
    var disableAssociatedButtons = function (trigger, disable) {
        $("div[id='calculation']").find("button[data-trigger= " + trigger + "]").each(function () {
            $(this).prop("disabled", disable);
        });
    }
    var bindTvcInputChangeEvent = function () {
        $("#frmTheoretischeVerdienCapaciteit").unbind("change").bind("change", function (event) {
            if (event.srcElement) {
                var inputIsValid = $(event.srcElement).valid();
                $("#saveButtonTVC").prop("disabled", !inputIsValid);
            }
        });
        $("[id^='CbbsResultsList_'][id$='__Code']").on("change", function () {
            var codeFieldNr = this.id.replace("CbbsResultsList_", "").replace("__Code", "");
            var sbcCodeVal = this.value;
            UpdateSbcCodeFunctieNaam(codeFieldNr, sbcCodeVal);
        })
    }
    var bindButtonsClickedEvent = function () {
        bindArbeidsverleden();
    }
    var bindArbeidsverledenInputChangeEvent = function () {
        $("#frmArbeidsverleden").unbind("change").bind("change", function (event) {
            if (event.srcElement) {
                var inputIsValid = $(event.srcElement).valid();
                $("#saveButton").prop("disabled", !inputIsValid);
            }
        });
    }
    var bindArbeidsverledenSelectButton = function () {
        $("#selectArbeidsverleden").on("click", function (e) {
            var selectAll = "Alles selecteren";
            var deselectAll = "Alles deselecteren";
            var checkBoxes = $("#arbeidsverleden_container input[type=CheckBox][name*=Selected]");

            if ($(this).text().trim() == selectAll) {
                checkBoxes.prop('checked', true);
                $(this).text(deselectAll);
            }
            else {
                checkBoxes.prop('checked', false);
                $(this).text(selectAll);
            }
        });
    }

    var bindHimInputChangeEvent = function () {
        $("#frmHerindexeringMaatman").unbind("change").bind("change", function (event) {
            if (event.srcElement) {
                var inputIsValid = $(event.srcElement).valid();
                $("#calculateButtonHIM").prop("disabled", !inputIsValid);
            }
        });
    }

    var bindHimSaveEvent = function () {
        var calcObj = this;
        $("#calculateButtonHIM").on("click", function (e) {
			if (calcObj.himCalculationHasResult() || calcObj.mmlCalculationHasResult() || calcObj.geactualiseerdeMmlHasResult()) {
                var dlg = $.messager.confirm({
                    title: 'BraVo',
                    msg: '<div>Weet je zeker dat je een nieuwe berekening wilt uitvoeren?</div><span class="text-danger">Let op: Als je een nieuwe berekening uitvoert dan worden de resultaten van eerdere berekeningen ook verwijderd.</span>',
                    buttons: [
                        {
                            text: 'Ja',
                            id: 'btn-ja',
                            onClick: function () {
                                dlg.dialog('destroy');
                                saveHim.call(calcObj);
                            }
                        },
                        {
                            text: 'Nee',
                            id: 'btn-nee',
                            onClick: function () {
                                dlg.dialog('destroy');
                            }
                        }
                    ]
                });
            }
            else {
                saveHim.call(calcObj);
            }
        });
    }

    var bindHimDeleteEvent = function () {
        var calcObj = this;
        $("#verwijderButtonHIM").on("click", function (e) {
            var dlg = $.messager.confirm({
                title: 'BraVo',
                msg: '<div>Weet je zeker dat je deze gegevens wilt verwijderen?</div><span class="text-danger">Let op: Als je deze verwijdert dan worden de resultaten van eerdere berekeningen ook verwijderd.</span>',
                buttons: [
                    {
                        text: 'Ja',
                        id: 'btn-ja',
                        onClick: function () {
                            dlg.dialog('destroy');
                            deleteHim.call(calcObj);
                        }
                    },
                    {
                        text: 'Nee',
                        id: 'btn-nee',
                        onClick: function () {
                            dlg.dialog('destroy');
                        }
                    }
                ]
            });
        });
    }

	var bindZimSaveEvent = function () {
		var calcObj = this;
		$("#calculateButtonZIM").on("click", function (e) {
			if (calcObj.himCalculationHasResult() || calcObj.mmlCalculationHasResult() || calcObj.geactualiseerdeMmlHasResult()) {
				var dlg = $.messager.confirm({
					title: 'BraVo',
					msg: '<div>Weet u zeker dat u deze gegevens wilt opslaan?</div><span class="text-danger"> Let op: Als u deze gegevens opslaat dan worden de resultaten van eerdere berekeningen verwijderd.</span>',
					buttons: [
						{
							text: 'Ja',
							id: 'btn-ja',
							onClick: function () {
								dlg.dialog('destroy');
								saveZim.call(calcObj);
							}
						},
						{
							text: 'Nee',
							id: 'btn-nee',
							onClick: function () {
								dlg.dialog('destroy');
							}
						}
					]
				});
			}
			else {
				saveZim.call(calcObj);
			}
		});
	};

	var bindZimDeleteEvent = function () {
		var calcObj = this;
		$("#verwijderButtonZIM").on("click", function (e) {
			var dlg = $.messager.confirm({
				title: 'BraVo',
				msg: '<div>Weet je zeker dat je deze gegevens wilt verwijderen?</div><span class="text-danger">Let op: Als je deze verwijdert dan worden de resultaten van eerdere berekeningen ook verwijderd.</span>',
				buttons: [
					{
						text: 'Ja',
						id: 'btn-ja',
						onClick: function () {
							dlg.dialog('destroy');
							deleteZim.call(calcObj);
						}
					},
					{
						text: 'Nee',
						id: 'btn-nee',
						onClick: function () {
							dlg.dialog('destroy');
						}
					}
				]
			});
		});
	};

	var saveHim = function () {
		var calcObj = this;
		var frm = $("#frmHerindexeringMaatman");
		//form validation
		if (frm) {
			if (!frm.valid()) {
				return false;
			}
		}
		//serialize current form
		var formSerialized = frm.serialize();
		$.post("../Calculation/SaveHim", formSerialized)
			.done(function (returnData) {
				if (returnData) {
					$("#resultHim").html(returnData);
					DisplayActionSucceededMessage("Gegevens opgeslagen");

					//set hidden field
					$(calcObj.himCalculationResultElement).val(true);
					$(calcObj.mmlCalculationResultElement).val(false);
					$(calcObj.geactualiseerdeMmlResultElement).val(false);
					$(calcObj.pvcCalculationResultElement).val(false);

					//refresh
					refreshCalculation.call(calcObj);
				}
			});
	};

	var deleteHim = function () {
		var calcObj = this;

		//delete HerindexeringMaatmanLoon
		var caseId = window.tabManager.caseId;
		$.post("../Calculation/DeleteHim", { caseId: caseId })
			.done(function (returnData) {
				if (returnData) {

					//refresh maatmanloon herindexering 
					getMaatmanHistoricalData.call(calcObj);

					//refresh pvc
					if (typeof calcObj.pvc_CalculationManager != "undefined") {
						calcObj.pvc_CalculationManager.initialize();
					}

					//set hidden field
					$(calcObj.himCalculationResultElement).val(false);
				}
			});
	};

	var saveZim = function () {
		var calcObj = this;
		var frm = $("#frmZonderindexeringMaatman");
		//form validation
		if (frm) {
			if (!frm.valid()) {
				return false;
			}
		}
		//serialize current form
		var formSerialized = frm.serialize();
		$.post("../Calculation/SaveZim", formSerialized)
			.done(function (returnData) {
				if (returnData) {
					DisplayActionSucceededMessage("Gegevens opgeslagen");

					//set hidden field
					$(calcObj.geactualiseerdeMmlResultElement).val(true);
					$(calcObj.himCalculationResultElement).val(false);
					$(calcObj.mmlCalculationResultElement).val(false);
					$(calcObj.pvcCalculationResultElement).val(false);

					//refresh
					refreshCalculation.call(calcObj);

				}
			});
	};

    var deleteZim = function () {
        var calcObj = this;

        //delete HerindexeringMaatmanLoon
        var caseId = window.tabManager.caseId;
        $.post("../Calculation/DeleteZim", { caseId: caseId })
            .done(function (returnData) {
                if (returnData) {

                    //refresh maatmanloon zonder indexeren 
                    getMaatmanZonderIndexering.call(calcObj);

                    //refresh pvc
                    if (typeof calcObj.pvc_CalculationManager != "undefined") {
                        calcObj.pvc_CalculationManager.initialize();
					}

					//set hidden field has Geactualiseerde MML
					$(calcObj.geactualiseerdeMmlResultElement).val(false);
                }
            });
    }

    var refreshCalculation = function() {
        var calcObj = this;

        ////refresh maatmaanloon
        //if (calcObj.himCalculationResultElement) {
        //    $(calcObj.himCalculationResultElement).val(true);
        //}

        ////refresh has calculation result indicator
        //if (calcObj.mmlCalculationResultElement) {
        //    $(calcObj.mmlCalculationResultElement).val(true);
        //}
        //if (calcObj.pvcCalculationResultElement) {
        //    $(calcObj.pvcCalculationResultElement).val(true);
        //}

        //refresh maatmaanloon
        if (typeof calcObj.mml_CalculationManager != "undefined") {
            calcObj.mml_CalculationManager.initialize();

            //refresh peilDatumERPElement
            $(calcObj.mml_CalculationManager.peilDatumERPElement).val("");
        }

        if (calcObj.herindexeringIsCollected) {
            getMaatmanZonderIndexering.call(calcObj);
        }
        if (calcObj.zonderIndexeringIsCollected) {
            getMaatmanHistoricalData.call(calcObj);
        }

        //refresh pvc
        if (typeof calcObj.pvc_CalculationManager != "undefined") {
            calcObj.pvc_CalculationManager.initialize();
        }
    }

    var bindDispatchedEvents = function () {
        var thiz = this;
        //save event is finished 
        $(window).on("CalculationRefreshEvent", function (e, data) {

            var calcObject = e.originalEvent.detail;
            //refreshed is triggerd from Calculation MML 
            if (calcObject.typeIkvSet == calcObject.TypeInkomstenVerhoudingSetEnum.MaatManLoon) {
                
                //refresh pvc
                if (typeof thiz.pvc_CalculationManager != "undefined") {
                    thiz.pvc_CalculationManager.initialize();
                }
                //Refresh Herindexering
                if (typeof thiz.herindexeringIsCollected != "undefined") {
                    getMaatmanHistoricalData.call(thiz);                

                    //refresh him calc Result
                    if (thiz.himCalculationResultElement) {
                        $(thiz.himCalculationResultElement.selector)[0].value = false;
                    }
                }

                //Refresh geactualiseerde maatman
                if (typeof thiz.zonderIndexeringIsCollected != "undefined") {
                    getMaatmanZonderIndexering.call(thiz);
                }
            }
            else if (calcObject.typeIkvSet == calcObject.TypeInkomstenVerhoudingSetEnum.PraktischeVerdienCapaciteit) {
                //refresh pvc
                if (typeof thiz.pvc_CalculationManager != "undefined") {
                    thiz.pvc_CalculationManager.initialize();
                }
            }



        });
    }
    var bindArbeidsverleden = function () {
        $("#ophalenArbeidsverleden").on("click", function (e) {
            var aantal = $('#arbeidsVerledenGrid tbody tr').length;
            //if there is arbeidsverleden already?
            if (aantal > 0) {
                var dlg = $.messager.confirm({
                    title: 'BraVo',
                    msg:
                        '<div>Weet u zeker dat u het arbeidsverleden opnieuw wilt ophalen?</div>' +
                        '<div class="text-warning">Let op: Eerder vastgelegde informatie gaat dan verloren.</div>',
                    width: "auto",
                    buttons: [
                        {
                            text: 'Ja',
                            id: 'btn-ja',
                            onClick: function () {
                                dlg.dialog('destroy');
                                getArbeidsVerledenfromUpa();
                            }
                        }, {
                            text: 'Nee',
                            id: 'btn-nee',
                            onClick: function () {
                                dlg.dialog('destroy');
                            }
                        }
                    ]
                });
            } else {
                getArbeidsVerledenfromUpa();
            }
        });
    }

    var bindCalculationAccordionExpandEvent = function () {

        $("#calculationaccordion").on("show.bs.collapse", { calcObj: this }, function (e) {
            switch (e.target.id) {
                case "mml_accordionpanel":
                    // Create CalculationManager instance
                    if (typeof e.data.calcObj.mml_CalculationManager === "undefined") {
                        var mmlCalculationOptions = {
                            typeInkomstenVerhoudingSet: "MaatManLoon",
                            parentContainerName: "mml_container",
                            peilDatum: "EersteAoDag",
                            peilDatumERP: "Peildatum_ERP",
                            calculationResultElement: "SamengesteldMaatManLoonPerUur",
                            parentObject: e.data.calcObj
                        };
                        e.data.calcObj.mml_CalculationManager = new uwvBravo.Calculation(mmlCalculationOptions);
                        e.data.calcObj.mml_CalculationManager.initialize();
                    }
                    break;
                case "pvc_accordionpanel":
                    // Create CalculationManager instance
                    if (typeof e.data.calcObj.pvc_CalculationManager === "undefined") {
                        var pvccalculationOptions = {
                            typeInkomstenVerhoudingSet: "PraktischeVerdienCapaciteit",
                            parentContainerName: "pvc_container",
                            peilDatum: "PeildatumPVC",
                            calculationResultElement: "BedrRvcPerUurZonderReductie",
                            parentObject: e.data.calcObj
                        };
                        e.data.calcObj.pvc_CalculationManager = new uwvBravo.Calculation(pvccalculationOptions);
                        e.data.calcObj.pvc_CalculationManager.initialize();
                    }
                    break;
                case "arbeidsverleden_accordionpanel":
                    if (e.data.calcObj.arbeidsVerledenIscollected == undefined) {
                        getSavedArbeidsverleden();
                        e.data.calcObj.arbeidsVerledenIscollected = true;
                    }
                    break;
                case "HerindexeringMaatman":
                    if (e.data.calcObj.herindexeringIsCollected == undefined) {
                        getMaatmanHistoricalData.call(e.data.calcObj);
                        e.data.calcObj.herindexeringIsCollected = true;
                    }
                    break;
                case "ZonderIndexeringMaatman":
                    if (e.data.calcObj.zonderIndexeringIsCollected == undefined) {
                        getMaatmanZonderIndexering.call(e.data.calcObj);
                        e.data.calcObj.zonderIndexeringIsCollected = true;
                    }
                    break;
                case "TheoretischeVerdiencapaciteit":
                    if (e.data.calcObj.tvcIsCollected == undefined) {
                        getTheoVerdienCapaciteit();
                        e.data.calcObj.tvcIsCollected = true;
                    }
                    break;
            }
        });
    };
    var bindAndInitCalculationToDatePicker = function () {
        //PeilDatum datepicker init
        var dateToday = new Date();
        var yearRange = "2006:" + (dateToday.getFullYear() + 3);
        $(function ($) {
            $.validator.addMethod('date',
                function (value, element) {
                    if (this.optional(element)) {
                        return true;
                    }
                    var ok = true;
                    try {
                        $.datepicker.parseDate('dd-mm-yy', value);
                    }
                    catch (err) {
                        ok = false;
                    }
                    return ok;
                });
        });
        $(".calc-date-picker").datepicker({
            dateFormat: "dd-mm-yy",
            changeYear: true,
            defaultDate: new Date(),
            yearRange: yearRange,
            onSelect: function (curDate, instance) {
                if (curDate !== instance.lastVal) {
                    $(this).change().valid();
                }
            }
        });
        //show warning if needed
        if ($("#EersteAoDag").val() !== "") {
            var eersteAoDag = $("#EersteAoDag").val();
            warningPeildatum(eersteAoDag, "msgPeildatumMml");
        }
        if ($("#PeildatumPVC").val() !== "") {
            var peildatumPvc = $("#PeildatumPVC").val();
            warningPeildatum(peildatumPvc, "msgPeildatumPvc");
        }
        if ($("#PeildatumArbeidsVerleden").val() !== "") {
            var peildatumArbeidsVerleden = $("#PeildatumArbeidsVerleden").val();
            warningPeildatum(peildatumArbeidsVerleden, "msgPeildatumArbeidsVerleden");
        }
    };
    var bindIndicatieHerbeoordelingEvent = function () {
        var rdButtonTrueElement = $("#IndicatieHerbeoordelingTrue");
        var rdButtonFalseElement = $("#IndicatieHerbeoordelingFalse");
        $(rdButtonTrueElement).on("change", { calcObj: this }, function (e) {
            saveIndicatieHerbeoordeling(true);
        });
        $(rdButtonFalseElement).on("change", { calcObj: this }, function (e) {
            saveIndicatieHerbeoordeling(false);
        });
    }

    var bindBeoordelingZiektewetEvent = function () {
        var thiz = this;
        $(':radio[name=BeoordelingZiektewet]').change(function () {
            var value = $(this).val();
            if (value != undefined) SaveBeoordelingZiektewet.call(thiz, value);
        });
    };
    var bindNieuweFunctieSaveEvent = function () {
        var thiz = this;
        $("#NaamNieuweFunctie").unbind("blur").bind("blur", function () {
            SaveNieuweFunctie.call(this);
        })
        //prevent form submitting on ENTER
        $('#frmPeildatumPVC').on('keyup keypress', function (e) {
            var keyCode = e.keyCode || e.which;
            if (keyCode === 13) {
                e.preventDefault();
                return false;
            }
        });
    };
    var bindMaatgevendeSaveEvent = function () {
        var formContainer = $("#frmMaatgevend");
        if (formContainer) {
            $(formContainer).unbind("change").bind("change", function (event) {
                if (event.srcElement) {
                    var inputIsValid = $(event.srcElement).valid();
                    if (inputIsValid) {
                        var description = $(event.srcElement)[0].attributes['data-description'].nodeValue;
                        //serialize current form
                        var postData = formContainer.serialize() + "&caseId=" + window.tabManager.caseId;
                        $.ajax({
                            url: "../Case/SaveMaatgevendeArbeid",
                            data: postData,
                            type: "POST",
                            async: false,
                            contentType: 'application/x-www-form-urlencoded; charset=utf-8',
                            cache: "false"
                        }).done(function (returnData) {
                            if (returnData.state == true) {
                                $.messager.show({
                                    msg: '<span class="text-info">' + description + ' is succesvol opgeslagen</span>',
                                    timeout: 2000,
                                    showType: "slide"
                                });
                            }
                            else {
                                $.messager.alert({
                                    title: 'BraVo',
                                    msg: "<span class='text-danger'><strong>Let op: Opslaan van " + description + " is mislukt.</strong></span> </br> <span>" + message + "</span>",
                                    icon: 'error',
                                    width: 400
                                });
                            }
                        });
                    }
                }
            });
        }
    }
    var bindIndPassendeArbeid = function () {
        var thiz = this;
        $(':radio[name=IndPassendeArbeid]').change(function () {
            var value = $(this).val();
            if (value != undefined) SaveIndPassendeArbeid.call(thiz, value);
        });
    };
    var bindFormValidator = function () {
        $('#basisgegevens form').each(function () {
            $.validator.unobtrusive.parse(this);
        })
        $.validator.unobtrusive.parse($('#frmPeildatumArbeidsVerleden'));
        $.validator.unobtrusive.parse($('#frmPeildatum_ERP'));
        $.validator.unobtrusive.parse($('#frmPeildatumPVC'));
    }
    //#endregion Events
    //public members
    return {
        initialize: initialize,
        reload: reload
    };
}();