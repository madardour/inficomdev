// Set the namespace
var uwvBravo = uwvBravo || {};

// bravoClaculation constructor
uwvBravo.HandmatigIkv = function (options) {
    this.options = options || {}; // options is always an object literal
    this.parentObject = options.parentObject || undefined;
    this.editMode = options.editMode || false;
    this.title = options.title || "Handmatige inkomstenverhouding";
    this.triggerId = options.triggerId || undefined;
    this.ikvId = options.ikvId || undefined;
    this.formContainerId = "#formHandmatigeIkv";
    this.typeInkomstenVerhoudingSet = this.parentObject ? this.parentObject.typeInkomstenVerhoudingSet : undefined;

    this.newHandmatigIkvUrl = "../Services/HandmatigIKV?caseId=" + window.tabManager.caseId + "&typeInkomstenVerhoudingSet=" + this.typeInkomstenVerhoudingSet;
    this.editHandmatigIkvUrl = "../Services/GetHandmatigIkv?caseId=" + window.tabManager.caseId + "&typeInkomstenVerhoudingSet=" + this.typeInkomstenVerhoudingSet + "&ikvId=";

    this.url = this.editMode ? this.editHandmatigIkvUrl + this.ikvId : this.newHandmatigIkvUrl;

    this.SaveNewIkvUrl = "../Services/SaveHandmatigIkv";

    this.modalIkvManager = {};

    this.formContainerElement = function () {
        return $("#formHandmatigeIkv");
    };

    this.formContainerElement = function () {
        return this.formContainerId != undefined ? $(this.formContainerId) : undefined;
    };


    //#region Custom Events buttons actions 
    this.HandmatigIkvSavedEvent = document.createEvent("CustomEvent");
    this.HandmatigIkvSavedEvent.initCustomEvent("HandmatigIkvSavedEvent", true, true, this);
    //#endregion

}

uwvBravo.HandmatigIkv.prototype = function () {

    //save new (handamtig) ikv 
    var procesSaveHandmatigIkv = function () {
        var thiz = this;
        if (!this.modalIkvManager) return false;
        var frm = this.formContainerElement();
        //form validation
        if (frm) {
            if (!frm.valid()) {
                return false;
            }
        }

        //serialize current form
        var formSerialized = $(this.formContainerId).serialize();

        $.post(this.SaveNewIkvUrl, formSerialized)
            .done(function (returnData) {
                if (returnData) {
                    if (returnData.state != undefined && !returnData.state) {
                        $.messager.alert({
                            title: "BraVo",
                            msg: "<div>Er is een fout opgetreden tijdens het opslaan van de Handmatige inkomstenverhouding</div> <span class='text-danger'>" + returnData.message + "</span>",
                            icon: "error",
                            style: {
                                right: "",
                                top: document.body.scrollTop + document.documentElement.scrollTop + 2 * $("div.container").height(),
                                bottom: ""
                            }
                        });

                        return false;

                    }
                    else if (returnData.savedIkvId != undefined) {
                        //store insertOrUpdated ikvId to update form
                        thiz.ikvId = returnData.savedIkvId;
                    }
                }
                               
                if (thiz.modalIkvManager !== {}) {
                    //close de popup
                    thiz.modalIkvManager.close();
                    //destroy the current handmatigIkvManager.
                    thiz.modalIkvManager = {};
                }
                                                             
                //dispatch event to parent 
                $("#" + thiz.parentObject.parentContainerName)[0].dispatchEvent(thiz.HandmatigIkvSavedEvent);

                return true;
            })
    }

    var saveHandmatigIkv = function () {
        var ikvHandmatigObj = this;

        if (ikvHandmatigObj.parentObject.calculationHasResult()) {
                var dlg = $.messager.confirm({
                    title: 'BraVo',
                    msg: '<div>Weet u zeker dat u deze gegevens wilt opslaan?</div><span class="text-danger"> Let op: Als u deze gegevens opslaat dan worden de resultaten van eerdere berekeningen verwijderd.</span>',
                    buttons: [
                        {
                            text: 'Ja',
                            id: 'btn-ja',
                            onClick: function () {
                                dlg.dialog('destroy');
                                procesSaveHandmatigIkv.call(ikvHandmatigObj);
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
                procesSaveHandmatigIkv.call(ikvHandmatigObj);
            }
        
    }

       



    //serialise handamtig ikv data
    function getHandmatigIkv() {
        var thiz = this;

        //werkgeverGegevens
        var werkgeverGegevens = {
            LoonHeffingenNummer: $("#hikvLoonheffingennr").val(),
            Naam: $("#hikvNaam").val()
        };

        if (thiz.editMode) $.extend(werkgeverGegevens,
            { Id: $("div[name='werkgeverContainer']") ? parseNumber($("div[name='werkgeverContainer']")[0].id) : "" });


        //loop through InkomstenOpgaven with date validation
        var inkomstenOpgaven = [];

        $(this.modalIkvManager.templateContent).find("table[id^='iko_'] > tbody > tr").each(function () {
            var validIko = true;
            var beginDatum = $(this).find("input[name*=BeginDate]").val();
            var endDatum = $(this).find("input[name*=EndDate]").val();

            if (beginDatum === "" || endDatum === "") {
                validIko = false;
            }

            if (validIko === true) {
                var iko = getRowItems.call(thiz, this);
                inkomstenOpgaven.push(iko);
            }
        });



        //Create IKV JSon object
        var inkomstenVerhouding = {
            WerkgeverGegevens: werkgeverGegevens,
            DatumBegin: toStandardDateFormat($("#hikvDatB").val()),
            DatumEinde: toStandardDateFormat($("#hikvDatE").val()),
            CodeHerKomst: "Handmatig"
        };

        if (thiz.ikvId) $.extend(inkomstenVerhouding, { InkomstenVerhoudingId: thiz.ikvId });

        //extend inkomstenVerhouding object
        if (inkomstenOpgaven.length !== 0) {

            $.extend(inkomstenVerhouding, { InkomstenOpgaven: inkomstenOpgaven });
        }


        //if thiz.typeInkomstenVerhoudingSet ?

        //MaatManLoon
        var mmlOngeindexeerd = $("#hikvMMLO") ? ($("#hikvMMLO").val() !== "0" ? true : false) : false;
        var maatManOmvang = $("#hikvMMOVPW") ? ($("#hikvMMOVPW").val() !== "0" ? true : false) : false;

        if (mmlOngeindexeerd || maatManOmvang) {
            var maatManLoon = {
                OngeindexeerdMaatManLoonPerUur: $("#hikvMMLO").val() !== "" ? parseNumber($("#hikvMMLO").val()) : 0,
                MaatManOmvangPerWeek: $("#hikvMMOVPW").val() !== "" ? parseNumber($("#hikvMMOVPW").val()) : 0,
                MaatManLoonPerUur: 0
            };

            if (thiz.editMode) {
                var maatMaanContainer = $("div[name='maatmaanloonContainer']");
                var maatManLoonId = maatMaanContainer ? ($(maatMaanContainer)[0].id ? parseNumber($(maatMaanContainer)[0].id) : undefined) : undefined;
                if (maatManLoonId) $.extend(maatManLoon, { MaatManLoonId: maatManLoonId });
            }

            //extend with MaatmanLoon
            $.extend(inkomstenVerhouding, { MaatManLoon: maatManLoon });

        }


        return inkomstenVerhouding;
    }

    //select row items
    function getRowItems(currentRow) {
        var thiz = this;
        var item = {};
        $(currentRow).find("input").each(function () {

            var elementName = $(this)[0].name.split('.');

            if (elementName.length > 0) {
                var itemName = elementName[elementName.length - 1];

                var ikoType = $(this)[0].getAttribute("data-type");

                switch (ikoType) {
                    case "checkbox":
                        item[itemName] = $(this)[0].checked;
                        break;
                    case "date":
                        item[itemName] = toStandardDateFormat($(this)[0].value);
                        break;
                    case "number":
                        item[itemName] = $(this)[0].value !== "" ? parseNumber($(this)[0].value) : "";
                        break;
                    case "text":
                        item[itemName] = $(this)[0].value;
                        break;
                }


                if (thiz.editMode && itemName.toLowerCase() === "id") {

                    if ($(this)[0].value !== "") {
                        item[itemName] = parseNumber($(this)[0].value);
                    }
                    item["InkomstenVerhoudingId"] = thiz.ikvId;
                }
            }

        });
        return item;
    }


    var createInstanceHandmatigIkvManager = function () {

        var inkomstenverhoudingOptions = {
            title: this.title,
            contentUrl: this.url,
            isDraggable: false,
            extendtedModal: true,
            calculationIkvEditMode: this.editMode || false,
            calculationIkvId: this.ikvId,
            disableOkBtn: true,
            AnnuleerBtnText: "Annuleer",
            disableToonTekstBtn: true,
            parentObject: this
        };

        this.modalIkvManager = new uwvBravo.BootstrapModal($("#" + this.triggerId), inkomstenverhoudingOptions);
        this.modalIkvManager.reloadcontent();
        this.modalIkvManager.show();
    }


    //#region catch dispatched events from nestedComponents
    var bindDispatchedEvents = function () {
                 
        //Initialize current object
        var thiz = this;

        //save button event is clicked
        $("#" + this.triggerId).unbind("modalExtendedWindowContentLoadedEvent").on("modalExtendedWindowContentLoadedEvent", function (e, data) {
            var modalObject = e.originalEvent.detail;

            //activate validation
            $.validator.unobtrusive.parse(thiz.formContainerElement());

            bindFormsChangeEvent.call(thiz);

            e.originalEvent.detail.templateContent.find("[data-reference]").unbind("click").on("click", { modalObj: modalObject }, function (e, data) {
                if (this.dataset.reference) {
                    switch (this.dataset.reference) {
                        case "OpslaanNieuwIkv":
                            saveHandmatigIkv.call(e.data.modalObj.parentObject);
                            break;
                        case "DeleteIko":
                            var selectedRow = $(this).closest("tr")[0];
                            if (selectedRow) {
                                $(selectedRow).find("input:not([type=hidden])").each(function () {
                                    if (this.type === "checkbox") {
                                        $(this).prop("checked", false);
                                    } else {
                                        $(this).attr({ 'value': "" });
                                    }
                                });
                            }
                            break;
                    }
                }
            });

        });

    }
    //#endregion


    var bindFormsChangeEvent = function () {
        var formContainer = this.formContainerElement();
        if (formContainer) {
            $(formContainer).unbind("change").bind("change", function (event) {
                if (event.srcElement) {
                    var inputIsValid = $(event.srcElement).valid();
                    $(formContainer).find("button[data-reference='OpslaanNieuwIkv']").prop("disabled", !inputIsValid);
                }
            });
        }
    };


    //#region initialisation component
    var initHandmatigIkv = function () {
        createInstanceHandmatigIkvManager.call(this);
        bindDispatchedEvents.call(this);
    }

    var initialize = function () {
        initHandmatigIkv.call(this);

    };

    //#endregion initialisation component


    //#region public members
    return {
        initialize: initialize
    };

    //#endregion public members
}();