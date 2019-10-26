// Implemented the following pattern:
// (Namespaced) Revealing Prototype pattern (with 'call'):
// This component handles all calculation actions that are performed on MaatManLoon and PraktischeVerdienCapaciteit:
// - Get / extend data from services
// - Save data in Bravo database

// - Preselect / determine indexCijfers 




// Set the namespace
var uwvBravo = uwvBravo || {};

// bravoClaculation constructor
uwvBravo.Calculation = function (options) {

    this.options = options || {}; // options is always an object literal
    this.parentObject = options.parentObject || undefined;

    //Enums
	this.TypeInkomstenVerhoudingSetEnum = { "MaatManLoon": 1, "PraktischeVerdienCapaciteit": 2 };

	this.codeHerkomstInkomstenVerhoudingEnum = { "Onbekend": 0, "Handmatig": 1, "Automatisch": 2, "ExtraRefertePeriode": 3 };

    // Get/set the defaults:
    this.typeInkomstenVerhoudingSet = options.typeInkomstenVerhoudingSet;

    this.typeIkvSet = this.TypeInkomstenVerhoudingSetEnum[this.typeInkomstenVerhoudingSet];
    this.parentContainerName = options.parentContainerName;

    this.peilDatumName = options.peilDatum;
    //PeilDatum referte periode
    this.peilDatumERPName = options.peilDatumERP;
    this.RowId = -1;


    this.calculationData = {};
    this.calculationResultElement = options.calculationResultElement ? $("#" + options.calculationResultElement) : undefined;
    this.calculationHasResult = function () {
        if ($(this.calculationResultElement.selector)) {
            return parseNumber($(this.calculationResultElement.selector).text()) > 0;
        }
        return false;
    }

    // Get/set the defaults:
    this.saveButtonId = options.saveButtonId || "regenerateDoc_";

    this.getInkomstenVerhoudingenUrl = "../Services/GetInkomstenVerhoudingen";
    this.deleteIkvUrl = "../Calculation/DeleteIkv";
    this.deleteIkvByTypeUrl = "../Calculation/DeleteIkvByType";
    this.saveIkvSetUrl = "../Services/SaveInkomstenVerhoudingenSet";
    this.autoSelectIkvSet = "../Services/AutoSelectIkvSet";
    this.refreshIkvSetWithUpdatedIkv = "../Services/refreshIkvSetWithUpdatedIkv";

	this.ValidateCalculationUrl = "../Services/ValidateCodeTijdvakken";
	this.calculationUrl = this.typeIkvSet === this.TypeInkomstenVerhoudingSetEnum.MaatManLoon ? "../Services/CalculateMaatmanLoon" : "../Services/CalculatePraktischeVerdienCapaciteit";


    //html elements Id's
    this.formContainerName = this.typeInkomstenVerhoudingSet != undefined ? this.typeInkomstenVerhoudingSet + "form" : undefined;

    this.formContainerElement = function () {
        return this.formContainerName != undefined ? $("#" + this.formContainerName) : undefined;
    };

    this.formSerialized = function () {

        if (this.formContainerName == undefined)
            return undefined;

        var disabledFlds = $("#" + this.formContainerName).find("input[type='checkbox']:disabled, select:disabled");
        disabledFlds.removeAttr("disabled");
        var json = $("#" + this.formContainerName).serialize();
        disabledFlds.attr("disabled", true);

        return json;
    };


    this.gridContainerName = this.typeInkomstenVerhoudingSet != undefined ? this.typeInkomstenVerhoudingSet + "grid" : undefined;
    this.gridContainerElement = this.gridContainerName != undefined ? $("#" + this.gridContainerName) : undefined;

    this.parentContainerElement = this.parentContainerName != undefined ? $("#" + this.parentContainerName) : undefined;

    //PeilDatums elements
    this.peilDatumElement = this.peilDatumName != undefined ? $("#" + this.peilDatumName) : undefined;
    this.peilDatumERPElement = this.peilDatumERPName != undefined ? $("#" + this.peilDatumERPName) : undefined;


    //Declare components objects

    //WebGrid : show nested grid
    var werkgeverGridOptions = {
        parentGridName: $(this.gridContainerName).selector,
        indexCijfer: this.typeIkvSet === this.TypeInkomstenVerhoudingSetEnum.MaatManLoon
    };
    this.webGridObject = new uwvBravo.WerkgeverGrid($(this.gridContainerElement), werkgeverGridOptions);



    //Modal: handmatige inkomstenVerhoudingen
    //this.handmatigIkvModalManager = {};
    this.handmatigIkvManager = {};


    // declare events
    this.CalculationInitializedEvent = document.createEvent("CustomEvent");
    this.CalculationInitializedEvent.initCustomEvent("CalculationInitializedEvent", true, true, this);


    this.CalculationRefreshEvent = document.createEvent("CustomEvent");
    this.CalculationRefreshEvent.initCustomEvent("CalculationRefreshEvent", true, true, this);

};

// Create prototype
uwvBravo.Calculation.prototype = function () {

    //#region private members

    //#region Ajax calls

    //save ikvSet
	var saveInkomstenVerhoudingenSet = function () {
		var thiz = this;
		var frm = this.formContainerElement();

		if (!frm.valid()) {
			return;
		}

        if (this.calculationHasResult() || this.parentObject.geactualiseerdeMmlHasResult() || (this.parentObject.himCalculationHasResult() && (this.typeIkvSet === this.TypeInkomstenVerhoudingSetEnum.MaatManLoon))) {
			var dlg = $.messager.confirm({
				title: 'BraVo',
				msg:
					'<div>Weet u zeker dat u deze gegevens wilt opslaan?</div><span class="text-danger"> Let op: Als u deze gegevens opslaat dan worden de resultaten van eerdere berekeningen verwijderd.</span>',
				buttons: [
					{
						text: 'Ja',
						id: 'btn-ja',
						onClick: function () {
							dlg.dialog('destroy');
							saveInkomstenVerhoudingenSetRequest(thiz);
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
			saveInkomstenVerhoudingenSetRequest(thiz);
		}
	};

    var saveInkomstenVerhoudingenSetRequest = function (calcObj) {

        //set Peildatums in current form (from MainPage)
        var peilDatum = toStandardDateFormat(calcObj.peilDatumElement.val());

        $("#" + calcObj.typeInkomstenVerhoudingSet + "_PeilDatum").val(peilDatum);

        if (calcObj.peilDatumERPElement) {
            var peilDatumExtraRefertePeriode = toStandardDateFormat(calcObj.peilDatumERPElement.val());
            $("#" + calcObj.typeInkomstenVerhoudingSet + "_PeilDatumERP").val(peilDatumExtraRefertePeriode);
        }

        $.ajax({
            url: calcObj.saveIkvSetUrl,
            data: calcObj.formSerialized(),
            type: "POST",
            dataType: "html",
            traditional: true,
            cache: "false"
        }).done(function (data) {
            var message = "Er is een fout opgetreden bij het opslaan van inkomstenVerhoudingen gegevens";
            if (data != null && data !== "") {
                var html = $.parseHTML(data);
                //return object is html or json
                if (html != null && html.length > 1) {
                    if (data) {
                        var message = "De " + calcObj.typeInkomstenVerhoudingSet + " gegevens zijn met succes opgeslagen";
                        reloadContent.call(calcObj, data, message);
                            $("#" + calcObj.parentContainerName)[0].dispatchEvent(calcObj.CalculationRefreshEvent);
                        }
                } else {
                    message = JSON.parse(data);
                    $.messager.alert({
                        title: "BraVo",
                        msg: message,
                        icon: "error"
                    });
                }
            }

            else {

                $.messager.alert({
                    title: "BraVo",
                    msg: message,
                    icon: "error"
                });
            }
        });
    }

    //Delete IKVSet from service
    var deleteInkomstenVerhoudingen = function (codeHerkomstIkv) {
        var thiz = this;

        dlg = $.messager.confirm({
            title: 'BraVo',
            msg: '<div>'
                + '<div>Weet je zeker dat je deze gegevens wilt verwijderen?</div>'
                + '<div><span class="text-danger">Let op: Als je deze verwijdert dan worden de resultaten van eerdere berekeningen ook verwijderd.</span></div>'
                + '</div>',
            width: 400,
            buttons: [{
                text: 'Ja',
                onClick: function () {
                    dlg.dialog('destroy');
                    deleteIkvs.call(thiz, codeHerkomstIkv);
                }
            }, {
                text: 'Nee',
                onClick: function () {
                    dlg.dialog('destroy');
                }
            }]
        });
       
    }

    var deleteIkvs = function (codeHerkomstIkv) {
        var thiz = this;

        //serialize current form
        var postData = thiz.formSerialized();
        if (postData == "") return false;
        postData += "&codeHerkomstIkv=" + codeHerkomstIkv + "&typeIkvSet=" + this.typeIkvSet;

        var jqxhr = $.ajax({
            url: this.deleteIkvByTypeUrl,
            data: postData,
            type: 'Post',
            cache: false,
            traditional: true,
            dataType: 'html'
        });

        if (jqxhr) {
            jqxhr.done(function (data) {
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
                        reloadContent.call(thiz, data);
                        if (thiz.typeIkvSet === thiz.TypeInkomstenVerhoudingSetEnum.MaatManLoon) {
                            $("#" + thiz.parentContainerName)[0].dispatchEvent(thiz.CalculationRefreshEvent);
						}

						if (thiz.typeIkvSet === thiz.TypeInkomstenVerhoudingSetEnum.MaatManLoon) {
							//delete has MML element
							$("#HasMaatmanloonResultaat").val(false);
						}
						else {
							//delete has PVC element
							$("#HasPvcMaatmanloonResultaat").val(false);
						}
                    }

                }
            })
        }
    }

    //Get IKVSet from service
    var getInkomstenVerhoudingen = function (codeHerkomstIkv) {

        //ikv set
        //'maatmanpanel', 'werkgeverGridMml' --> MaatManLoon
        // 'PraktischeVerdiencapaciteit', 'werkgeverGridPvc' --> PraktischeVerdiencapaciteit

        var thiz = this;

        //set calculation results to zero 
        this.parentContainerElement.find("div[id='calculationResult'] label").text("0");

        var postData = undefined;
        var jqxhr = undefined;

        if ($("#" + this.formContainerName).length == 0) {   // in case of not yet existing InkomstenVerhoudingSetViewModel, create json object

            //create inkomstenVerhoudingenSet
            var InkomstenVerhoudingSetViewModel = {
                CaseId: window.tabManager.caseId,
                PeilDatum: toStandardDateFormat(this.peilDatumElement.val()),
                TypeInkomstenVerhoudingSet: this.typeIkvSet,
            }

            if (this.peilDatumERPElement) {
                var peilDatumExtraRefertePeriode = toStandardDateFormat(this.peilDatumERPElement.val());
                $.extend(InkomstenVerhoudingSetViewModel, { PeilDatumExtraRefertePeriode: peilDatumExtraRefertePeriode });
            }


            postData = JSON.stringify({ ikvSetViewModel: InkomstenVerhoudingSetViewModel, codeHerKomstIkv: codeHerkomstIkv });

            jqxhr = $.ajax({
                url: this.getInkomstenVerhoudingenUrl,
                data: postData,
                type: 'Post',
                cache: false,
                traditional: true,
                contentType: 'application/json; charset=utf-8'
            });


        } else {  // Model is al filled, use form serialise 

            //set Peildatums in current form (from MainPage)
            var peilDatum = toStandardDateFormat(this.peilDatumElement.val());

            $("#" + this.typeInkomstenVerhoudingSet + "_PeilDatum").val(peilDatum);

            if (this.peilDatumERPElement) {
                var peilDatumExtraRefertePeriode = toStandardDateFormat(this.peilDatumERPElement.val());
                $("#" + this.typeInkomstenVerhoudingSet + "_PeilDatumERP").val(peilDatumExtraRefertePeriode);
            }

            //serialize current form
            postData = this.formSerialized() + "&codeHerKomstIkv=" + codeHerkomstIkv;

            jqxhr = $.ajax({
                url: this.getInkomstenVerhoudingenUrl,
                data: postData,
                type: 'Post',
                cache: false,
                traditional: true
            });


        }

        if (jqxhr) {
            jqxhr.done(function (data, textStatus, jqXHR) {

                if (jqXHR.responseJSON) {// handle JSON
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
                }
                else { // handle html
                    reloadContent.call(thiz, data);
                }

            })
        }
    };

    //Get saved IKVSet from database
    var getSavedInkomstenVerhoudingen = function () {

        var thiz = this;
        //Validation passes so get the data........
        var urlInkomstenVerhoudingen = "../Services/GetSavedInkomstenVerhoudingen";

        $.get(urlInkomstenVerhoudingen, { caseId: window.tabManager.caseId, typeInkomstenVerhoudingSet: thiz.typeInkomstenVerhoudingSet }
        ).done(function (data) {

            if (data !== "") {
                reloadContent.call(thiz, data);
            }
            else {
                $("#" + thiz.parentContainerName).html("");
            }
        });
    }

    //Refresh ikvHandmatig in IkvSet 
    var RefreshIkvSetWithUpdatedIkv = function (ikvId) {
        var thiz = this;

        //serialize current form
        postData = thiz.formSerialized();

        if (postData != "") {

            postData = postData + "&updatedIkvId=" + ikvId;

            var jqxhr = $.ajax({
                url: this.refreshIkvSetWithUpdatedIkv,
                data: postData,
                type: 'Post',
                cache: false,
                traditional: true,
                dataType: 'html'
            });

            if (jqxhr) {
                jqxhr.done(function (data) {
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
                            reloadContent.call(thiz, data);
                        }

                    }
                })
            }
        } else {
            getSavedInkomstenVerhoudingen.call(thiz);
        }
    }

    //select IKO inside refertePeriode
    var autoSelectIkvSet = function (selectedRowId) {

        var thiz = this;
        if (this.webGridObject.selectedRowsCount(selectedRowId) != undefined && this.webGridObject.selectedRowsCount(selectedRowId) > 0) {

            dlg = $.messager.confirm({
                title: 'BraVo',
                msg: '<div>'
                    + '<div>Weet u zeker dat u inkomstenverhoudingen en inkomstenopgaven default aangevinkt wilt hebben?</div>'
                    + '<div><span class="text-danger">Let op: Eventueel eerder vastgelegde selecties gaan dan verloren.</span></div>'
                    + '</div>',
                width: 400,
                buttons: [{
                    text: 'Ja',
                    onClick: function () {
                        dlg.dialog('destroy');
                        autoSelectIkvSetRequest(thiz, selectedRowId);

                    }
                }, {
                    text: 'Nee',
                    onClick: function () {
                        dlg.dialog('destroy');
                    }
                }]
            });
        } else {
            autoSelectIkvSetRequest(thiz, selectedRowId);
        }

    };


    var autoSelectIkvSetRequest = function (calcObj, selectedRowId) {

        var postData = undefined;
        var jqxhr = undefined;

        //set Peildatums in current form (from MainPage)
        var peilDatum = toStandardDateFormat(calcObj.peilDatumElement.val());

        $("#" + calcObj.typeInkomstenVerhoudingSet + "_PeilDatum").val(peilDatum);

        if (calcObj.peilDatumERPElement) {
            var peilDatumExtraRefertePeriode = toStandardDateFormat(calcObj.peilDatumERPElement.val());
            $("#" + calcObj.typeInkomstenVerhoudingSet + "_PeilDatumERP").val(peilDatumExtraRefertePeriode);
        }

        //serialize current form
        postData = calcObj.formSerialized() + "&selectedRowId=" + selectedRowId;
        //postData = calcObj.formSerialized();

        jqxhr = $.ajax({
            url: calcObj.autoSelectIkvSet,
            data: postData,
            type: 'Post',
            cache: false,
            traditional: true,
        });

        jqxhr.done(function (data) {
            if (data !== "") {
                if (typeof (data) == "object") {
                    if (data.Result === false) {
                        $.messager.alert({
                            title: "BraVo",
                            msg: data.Message,
                            icon: "error",
                        });
                    }
                }
                else {
                    var message = calcObj.typeInkomstenVerhoudingSet + " is bijgewerkt";
                    reloadContent.call(calcObj, data, message);
                    $("#" + calcObj.parentContainerName).find("#expandRow_" + selectedRowId).trigger("click");
                }

            }
        })
    }

	var calculateConfirm = function (calcObj) {

		if (calcObj.calculationHasResult() || calcObj.parentObject.geactualiseerdeMmlHasResult() || (calcObj.parentObject.himCalculationHasResult()  && (calcObj.typeIkvSet === calcObj.TypeInkomstenVerhoudingSetEnum.MaatManLoon))) {

			var dlg = $.messager.confirm({
				title: 'BraVo',
				msg: '<div>Weet je zeker dat je een nieuwe berekening wilt uitvoeren?</div><span class="text-danger">Let op: Als je een nieuwe berekening uitvoert dan worden de resultaten van eerdere berekeningen ook verwijderd.</span>',
				buttons: [
					{
						text: 'Ja',
						id: 'btn-ja',
						onClick: function () {
							dlg.dialog('destroy');
							calculate.call(calcObj);
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
			calculate.call(calcObj);
		}
	};

    //calculate maatmanloon / PraktischeVerdienCapaciteit
	var calculate = function () {
		var calcObj = this;

		//check all checkboxes (to simulate the calculation button is clicked) to enable the validation!
		$(".isCalculationButtonClicked").prop("checked", true);

		var frm = this.formContainerElement();

		if (!frm.valid()) {
			//uncheck all checkboxes disable the validation!
			$(".isCalculationButtonClicked").removeAttr("checked");

			return;
		}
		else {
			$(".isCalculationButtonClicked").removeAttr("checked");
		}

		var postData = frm.serialize();

		$.post(calcObj.ValidateCalculationUrl, postData).done(function (data) {

			if (data.Result === false) {
				var dialog = $.messager.confirm({
					title: "BraVo",
					msg: data.Message,
					icon: "info",
					buttons: [
						{
							text: "Ja",
							onClick: function () {

								calculateMMLPVC(calcObj, frm.serialize());
								dialog.dialog("destroy");
							}
						}, {
							text: "Nee",
							onClick: function () {
								dialog.dialog("destroy");
							}
						}
					]
				});
			}
			else if (data.Result === true) {
				calculateMMLPVC(calcObj, frm.serialize());
			}

		});
	};

	var calculateMMLPVC = function (calcObj, postData) {

		$.post(calcObj.calculationUrl, postData).done(function (data) {
				if (data !== "") {
					if (typeof (data) == "object") {
						if (data.Result === false) {
							$.messager.alert({
								title: "BraVo",
								msg: data.Message,
								icon: "error"
							});
						}
					}
					else {

                    var message = calcObj.typeInkomstenVerhoudingSet + " is bijgewerkt";
                    reloadContent.call(calcObj, data, message);

                    //refresh has calculation result indicator
                    if (calcObj.typeIkvSet === calcObj.TypeInkomstenVerhoudingSetEnum.MaatManLoon) {
						
						$(calcObj.parentObject.himCalculationResultElement).val(false);
						$(calcObj.parentObject.mmlCalculationResultElement).val(true);
						$(calcObj.parentObject.geactualiseerdeMmlResultElement).val(false);
						$(calcObj.parentObject.pvcCalculationResultElement).val(false);

                    } else {

						$(calcObj.parentObject.pvcCalculationResultElement).val(true);
                    }

                    $("#" + calcObj.parentContainerName)[0].dispatchEvent(calcObj.CalculationRefreshEvent);
				}
            }
			});
		}


    //#endregion Ajax calls



    //#region manuallyAddIkv


    // HandmatigIkv popup handling
    var createInstanceHandmatigIkvManager = function (triggerId, title, editMode, ikvId) {

        var options = {
            parentObject: this,
            editMode: editMode,
            ikvId: ikvId,
            triggerId: triggerId
        }

        this.handmatigIkvManager = new uwvBravo.HandmatigIkv(options);
        this.handmatigIkvManager.initialize();
    }

    var deleteIkv = function (ikvId) {
        var thiz = this;
        var url = this.deleteIkvUrl;

        //todo:
        var caseId = window.tabManager.caseId;
        $.post(url, { ikvId: ikvId, caseId: caseId, typeIkvSet: this.typeInkomstenVerhoudingSet }).done(function (data) {
            RefreshIkvSetWithUpdatedIkv.call(thiz, ikvId);
            $("#" + thiz.parentContainerName)[0].dispatchEvent(thiz.CalculationRefreshEvent);
        });
    };

    //#region catch dispatched events from nestedComponents
    var bindDispatchedEvents = function () {

        //edit button event from werkgever webGrid
        $("#" + this.parentContainerName).unbind("EditIkvEvent").on("EditIkvEvent", { calcObj: this }, function (e, data) {
            var trigger = e.originalEvent.detail;
            if (trigger && trigger.selectedIkv.ikvId) {
                var ikvId = trigger.selectedIkv.ikvId;
                var title = "Wijzig inkomstenverhouding";
                createInstanceHandmatigIkvManager.call(e.data.calcObj, e.originalEvent.detail.parentGridName, title, true, ikvId);
            }
        });

        //DeleteIkvEvent button event from werkgever webGrid
        $("#" + this.parentContainerName).unbind("DeleteIkvEvent").on("DeleteIkvEvent", { calcObj: this }, function (e, data) {
            var trigger = e.originalEvent.detail;
            if (trigger && trigger.selectedRowId) {
                var ikvId = trigger.selectedRowId;
                deleteIkv.call(e.data.calcObj, ikvId);
            }
        });

        //save event from handmatig ikv popup  
        $("#" + this.parentContainerName).unbind("HandmatigIkvSavedEvent").on("HandmatigIkvSavedEvent", function (e, data) {
            RefreshIkvSetWithUpdatedIkv.call(e.originalEvent.detail.parentObject, e.originalEvent.detail.ikvId);
            //destroy the current handmatigIkvManager.
            e.originalEvent.detail.parentObject.handmatigIkvManager = {};
        });
    }



    //#endregion

    //#endregion Manually IKV

    //#region Button Events
    //switch is based on data-reference attribute
    var bindButtonsClickedEvent = function () {

        this.parentContainerElement.parent().find(":button").unbind("click").on("click",
            { calcObj: this },
            function (e, data) {

                if (this.dataset.reference) {
                    switch (this.dataset.reference) {
                        case "OphalenInkomstenverhoudingen":
                            getInkomstenVerhoudingen.call(e.data.calcObj, e.data.calcObj.codeHerkomstInkomstenVerhoudingEnum.Automatisch);
                            break;

                        case "VerwijderenInkomstenverhoudingen":
                            deleteInkomstenVerhoudingen.call(e.data.calcObj, e.data.calcObj.codeHerkomstInkomstenVerhoudingEnum.Automatisch);
                            break;

                        case "HandmatigToevoegenInkomstenverhouding":
                            var title = "Handmatig toevoegen inkomstenverhouding";
                            createInstanceHandmatigIkvManager.call(e.data.calcObj, this.id, title);
                            break;

                        case "ToevoegenExtraReferentieperiode":
                            getInkomstenVerhoudingen.call(e.data.calcObj, e.data.calcObj.codeHerkomstInkomstenVerhoudingEnum.ExtraRefertePeriode);
                            break;

                        case "VerwijderenExtraReferentieperiode":
                            deleteInkomstenVerhoudingen.call(e.data.calcObj, e.data.calcObj.codeHerkomstInkomstenVerhoudingEnum.ExtraRefertePeriode);
                            break;

                        case "BepaalIndexcijfers":
                            e.data.calcObj.webGridObject.bepaalIndexcijfers.call(e.data.calcObj.webGridObject);
                            break;

                        case "Opslaan":

                            saveInkomstenVerhoudingenSet.call(e.data.calcObj);
                            break;

						case "Bereken":
							calculateConfirm(e.data.calcObj);
                            break;

                        case "AutoSelectie":
                            autoSelectIkvSet.call(e.data.calcObj, this.id.split('_')[1]);
                            break;
                    }
                }
            });
    };

    var bindFormsChangeEvent = function () {
        var formContainer = this.formContainerElement();
        if (formContainer) {
            $(formContainer).unbind("change").bind("change", function (event) {
                if (event.srcElement) {
                    //afterwards added to perform and trigger again the related elements validation
					$("[data-val-requiredifvalue-otherproperty='" + event.srcElement.name + "']").each(function () {
						$(this).valid();
                    });
                }
            });
        }
    };

    //#endregion


    //#region initialisation component
    var initCalculation = function () {
        if ($(this.gridContainerElement).length === 0) {
            getSavedInkomstenVerhoudingen.call(this);
        }
    }

    var initialize = function () {
        initCalculation.call(this);
        bindButtonsClickedEvent.call(this);
        bindDispatchedEvents.call(this);
    };

    //#endregion initialisation component

    var reloadContent = function (data, message) {

        var insertNewHtml = $(this.parentContainerElement).html(data);
        var initWebGrid = this.webGridObject.initialize();

        var thiz = this;

        $.when.apply(insertNewHtml, initWebGrid).done(function () {
            bindFormsChangeEvent.call(thiz);
            bindButtonsClickedEvent.call(thiz);

            $.validator.unobtrusive.parse(thiz.formContainerElement());

            if (message) {
                $.messager.show({
                    msg: message,
                    timeout: 2000,
                    showType: "slide"
                });
            }
        });

    }

    //#endregion private members

    //#region public members
    return {
        initialize: initialize,
        getSavedInkomstenVerhoudingen: getSavedInkomstenVerhoudingen,
        getInkomstenVerhoudingen: getInkomstenVerhoudingen,
        reloadContent: reloadContent
    };

    //#endregion public members
}();




