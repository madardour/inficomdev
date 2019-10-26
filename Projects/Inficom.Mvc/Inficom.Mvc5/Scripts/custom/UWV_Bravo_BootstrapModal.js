// This is the js file for the bravo BootstrapModal (Bootstrap's Modal (dialog))

// Set the namespace
var uwvBravo = uwvBravo || {};

// bravoBootstrapModal constructor
uwvBravo.BootstrapModal = function (jqSourceObject, options) {
    this.jqSourceObject = jqSourceObject; // this is the element that triggers the opening of the dialog when clicked
    this.bravoElement = document.getElementById(jqSourceObject[0].id);
    this.bravoElementId = this.bravoElement.id;
    this.isDraggable = options.isDraggable;
    this.cssClass = options.cssClass || undefined;
    this.title = this.fmlBundle = options.title;
    this.vtSection = options.vtSection || undefined;
    this.processId = options.processId || undefined;
    this.tsprocessId = options.tsprocessId || undefined;
    this.isPdcDocument = options.isPdcDocument != undefined ? options.isPdcDocument : true; // default is a PDC document

    this.ckeditorTrigger = options.ckeditorTrigger || undefined;

    this.closing = false;
    this.extendtedModal = options.extendtedModal || false;
    this.calculationIkvEditMode = options.calculationIkvEditMode || false;
    this.calculationIkvId = options.calculationIkvId || undefined;

    this.contentIsLoaded = false;

    this.disableOkBtn = options.disableOkBtn || false;
    this.OkBtnText = options.OkBtnText || "OK";

    this.disableAnnuleerBtn = options.disableAnnuleerBtn || false;
    this.AnnuleerBtnText = options.AnnuleerBtnText || "Annuleer";

    this.disableToonTekstBtn = options.disableToonTekstBtn || false;
    this.ToonTekstBtnText = options.ToonTekstBtnText || "Toon Tekst";

    this.PersonalLibraryMode = "manage";
    this.parentObject = options.parentObject || undefined;

    this.sourceTemplatesSelector = "#sourceTemplates";

    // The following template is the 'next best' approach; for a bigger application I suggest a template library(like moustache.js or the like...), along with grunt html converter...
    this.htmlTemplate = [
        '<div id="bravoPopup" class="modal modalResizable fade bs-example-modal-lg" data-backdrop="false" data-keyboard="false" role="dialog" >',
        '<div class="modal-dialog modal-lg" >',
        '<div class="modal-content">',
        '<div class="modal-header">',
        '<button id="closeButton" name="close" type="button" class="close" aria-hidden="true">&times;</button>',
        '<h4 id="modalheader" class="modal-title">Voorbeeld titel</h4>',
        '</div>',
        '<div id="bravoPopup_Content" class="modal-body">',
        '@*dynamically loaded*@',
        '</div>',
        '<div id="footerContent" class="modal-footer">',


        '<button id="cancelButton" name="cancel" class="btn btn-default btn-custom">' + this.AnnuleerBtnText + '</button>'
        + (!this.disableToonTekstBtn ?
            '<button id = "toonTekstButton" name="toontekst" class= "btn btn-default btn-custom" >' + this.ToonTekstBtnText + '</button >'
            : "")
        + (!this.disableOkBtn ? '<button name="ok" id="confirmButton" class="btn btn-primary btn-custom" data-dismiss="modal" data-backdrop="false"> ' + this.OkBtnText + "</button>" : ""),

        '</div>',

        '</div>',
        '</div>',
        '</div>'
    ].join("\n");
    this.templateId = "modal_" + this.bravoElementId;
    this.instance = $('#' + this.templateId);               // element is not created/ renamed yet...reset after initializing.
    this.templateContentId = "content_" + this.bravoElementId;
    this.templateContent = $('#' + this.templateContentId); // element is not created/ renamed yet...reset after initializing.
    this.templateheaderId = "header_" + this.bravoElementId;
    this.closeButtonId = "closeBtn_" + this.bravoElementId;
    this.toonTekstButtonId = "toonTekstBtn_" + this.bravoElementId;
    this.cancelButtonId = "cancelBtn_" + this.bravoElementId;
    this.confirmButtonId = "confirmBtn_" + this.bravoElementId;

    this.contentUrl = options.contentUrl;
    this.closeFmlRapportageUrl = options.closeFmlRapportageUrl; // only used to be able to free memory on external source

    //#region Custom Events Modal actions

    this.modalWindowInitializedEvent = document.createEvent('CustomEvent');
    this.modalWindowInitializedEvent.initCustomEvent('modalWindowInitializedEvent', true, true, this);

    this.modalWindowContentLoadedEvent = document.createEvent('CustomEvent');
    this.modalWindowContentLoadedEvent.initCustomEvent('modalWindowContentLoadedEvent', true, true, this);

    this.modalWindowClosedEvent = document.createEvent('CustomEvent');
    this.modalWindowClosedEvent.initCustomEvent('modalWindowClosedEvent', true, true, this);

    this.modalWindowBeforeClosedEvent = document.createEvent('CustomEvent');
    this.modalWindowBeforeClosedEvent.initCustomEvent('modalWindowBeforeClosedEvent', true, true, this);

    this.modalWindowToonTekstEvent = document.createEvent('CustomEvent');
    this.modalWindowToonTekstEvent.initCustomEvent('modalWindowToonTekstEvent', true, true, this);

    //#endregion


    //#region Custom Calculations Events  
    this.modalExtendedWindowContentLoadedEvent = document.createEvent("CustomEvent");
    this.modalExtendedWindowContentLoadedEvent.initCustomEvent("modalExtendedWindowContentLoadedEvent", true, true, this);

    this.shownBsModalEvent = document.createEvent("CustomEvent");
    this.shownBsModalEvent.initCustomEvent("shownBsModalEvent", true, true, this);

    this.modalWindowContentPostLoaded = document.createEvent("CustomEvent");
    this.modalWindowContentPostLoaded.initCustomEvent("modalWindowContentPostLoaded", true, true, this);

    this.modalInsertResultInParentDocument = document.createEvent("CustomEvent");
    this.modalInsertResultInParentDocument.initCustomEvent("modalInsertResultInParentDocument", true, true, this);


    //#endregion

    var thiz = this;
};

// Create prototype
uwvBravo.BootstrapModal.prototype = function () {
    //private members
    var setDialogDraggable = function (draggable) {
        if (this.instance && draggable) {
            this.instance.draggable({
                handle: ".modal-header"
            });
            return true;
        } else if (this.instance && !draggable) {
            this.instance.draggable({
                disabled: true
            });
            return false;
        }
        else {
            return false;
        }
    };

    var bindInputToDatepicker = function () {

        $(this.templateContent).find(".date-picker").datepicker({
            dateFormat: "dd-mm-yy",
            changeYear: true,
            defaultDate: new Date(),
            onSelect: function (curDate, instance) {
                if (curDate !== instance.lastVal) {
                    $(this).change().valid();
                }
            }
        });
    };

    var reloadSucces = function () {
        return function (data, textStatus, jqXHR) {
            this.contentIsLoaded = true;
            this.templateContent.html(data);
            this.tsprocessId = $("#FMLPDC_ProcessID").val();
            this.isPdcDocument = ($("#FMLPDC_IsPdcDocument").length != 0 && $("#FMLPDC_IsPdcDocument").val().toLowerCase() === "false") ? false : true;
        };
    };

    var reloadError = function () {
        return function (data, textStatus, jqXHR) {
            $.messager.alert({
                title: 'BraVo',
                msg: '<span class="text-danger"> Some ajax error accurred... ' + textStatus + ": " + jqXHR.error + '.</span>',
                icon: 'error'
            });

        };
    };

    var reloadComplete = function () {
        return function (data, textStatus, jqXHR) {
            if (this.instance) {
                ready.call(this);
                //dispatch event to index page
                if (this.extendtedModal && this.parentObject) {
                    if (this.parentObject.triggerId) $("#" + this.parentObject.triggerId)[0].dispatchEvent(this.modalExtendedWindowContentLoadedEvent);
                }
                else {
                    window.dispatchEvent(this.modalWindowContentLoadedEvent);
                    //in case of document
                    if (this.bravoElementId == "vtBibliotheek") {
                        var parentContainerId = this.parentObject.bravoElement.id;
                        if (parentContainerId) {
                            $("#" + parentContainerId)[0].dispatchEvent(this.modalWindowContentPostLoaded);
                        }
                    }
                }
            }
        }
    };


    var reloadContent = function () {
        var processData = null;
        if (this.vtSection) {
            processData = { bundleName: this.title, popupId: this.tsprocessId, parentPdcProcessId: this.processId };
        }

        return $.ajax({
            context: this,
            type: "get",
            url: this.contentUrl,
            data: processData,
            success: reloadSucces.call(this),
            //error: reloadError.call(this),
            complete: reloadComplete.call(this)

        });
    };

    var ready = function () {
        if (this.extendtedModal) {
            bindInputToDatepicker.call(this);
        }
    }

    var initialize = function () {
        var thiz = this;

        //this.templateId
        if (!$("#bravoPopup").length) {

            $("body").append(this.htmlTemplate);
            $("#bravoPopup")[0].id = this.templateId;      // Replace the template id's with specific id's for this instance...
            this.instance = $('#' + this.templateId);      // Reset now that the Template's Html is appended to get the actual element
            $("#bravoPopup_Content")[0].id = this.templateContentId;
            if (this.templateContent.children().length == 0) {
                this.templateContent = $('#' + this.templateContentId); // Reset now that the Template's Html is appended to get the actual element
                this.templateContent.html(null);
            }
            else {
                $('#' + this.templateContentId).html(this.templateContent);
            }
            $("#modalheader")[0].id = this.templateheaderId;
            $("#closeButton")[0].id = this.closeButtonId;
            $("#cancelButton")[0].id = this.cancelButtonId;

            //check first if button exist
            if ($("#toonTekstButton").length !== 0) {
                $("#toonTekstButton")[0].id = this.toonTekstButtonId;
            }
               
            //check first if button exist
            if ($("#confirmButton").length !== 0) {
                $("#confirmButton")[0].id = this.confirmButtonId;
            }


            //DrgonSpeech: WorkArround to force set focus to select template list
            $("#" + this.templateId).on("shown.bs.modal", function () {
                if (thiz.parentObject != undefined && thiz.parentObject.triggerId != undefined) {
                    if (thiz.parentObject) $("#" + thiz.parentObject.triggerId)[0].dispatchEvent(thiz.shownBsModalEvent);
                }

            });

            //bugfix for ckeditor get focus inside modal
            if (thiz.bravoElementId === "personalLibrary" || thiz.bravoElementId === "vtBibliotheek") {
                $.fn.modal.Constructor.prototype.enforceFocus = function () {
                };
            }

        }

        this.isDraggable === true ? this.setDialogDraggable(true) : this.setDialogDraggable(false);

        $("#" + this.templateheaderId).empty();
        $("#" + this.templateheaderId).append(this.title);

        $("#" + this.confirmButtonId).one("click", { thiz: this }, (function (event, data) {
            confirm.call(event.data.thiz);
        }));

        $("#" + this.closeButtonId).one("click", { thiz: this }, (function (event, data) {
            close.call(event.data.thiz);
        }));

        $("#" + this.toonTekstButtonId).unbind("click").bind("click", { thiz: this }, (function (event, data) {
            toonTekst.call(event.data.thiz);
        }));

        $("#" + this.cancelButtonId).one("click", { thiz: this }, (function (event, data) {
            close.call(event.data.thiz);
        }));

        $(".modal-dialog").addClass(this.cssClass);
    };

    var show = function () {
        initialize.call(this);
        this.instance.modal("show");
    };

    var close = function () {

        if (this.tsprocessId && this.isPdcDocument) {
            $(this).load(this.closeFmlRapportageUrl, { popupId: this.tsprocessId, title: this.fmlBundle + "-" + this.processId, parentPdcProcessId: this.processId });
        }

        var thiz = this;

        $.when(this.bravoElement.dispatchEvent(this.modalWindowBeforeClosedEvent)).done(function () {

            thiz.instance.modal("hide");
            $(thiz.instance).remove();
            $("body").removeClass("modal-open"); //de backdrop laten verdwijnen zonder de originele scrollbars te verliezen...
            $(".modal-backdrop").remove(); // Manually remove the backdrop div
            thiz.bravoElement.dispatchEvent(thiz.modalWindowClosedEvent);
            resetModalOptions.call(thiz);
        });

    };


    var toonTekst = function () {
        var parentContainerId = this.parentObject.bravoElement.id;
        if (parentContainerId) {
            $("#" + parentContainerId)[0].dispatchEvent(this.modalWindowToonTekstEvent);
        }
    }

    var confirm = function () {

        switch (this.bravoElementId) {
            case 'personalLibrary':
                break;
            case 'vtBibliotheek':
                break;
            case 'ds_diagnosecode':
                procesDiagnoseCodesToDocument.call(this);
                close.call(this);
                break;
            default:
                if (this.vtSection) {
                    this.closing = true;
                    var parentContainerId = this.parentObject.bravoElement.id;
                    if (parentContainerId) {
                        $("#" + parentContainerId)[0].dispatchEvent(this.modalInsertResultInParentDocument);
                    }
                }
        }

        if (this.extendtedModal) {
            window.activeDocumentsGrid.addDocument()
            close.call(this);
        }

    };

    var resetModalOptions = function () {
        this.title = undefined;
        this.vtSection = undefined;
        this.processId = undefined;
        this.tsprocessId = undefined;
    };


    function procesDiagnoseCodesToDocument() {
        var $target = $(window.tabManager.selectedTabDocument.bravoElement).find("Input[name='td_oorzaak']:first-child").closest("table");

        //remove all rows except the first row 
        $target.find("tbody").find("tr:gt(0)").remove();

        //set '#' as default value
        $target.find("tbody tr:first").find("input[type=text]").each(function () {
            $(this).val("#");
        });

        //remove input autogrow class
        $target.find("autogrow").remove();

        $("#diagnoseTableBody > tr").each(function () {
            var $inputs = $(this).find("input");
            addDiagnoseRowToDocument($target.find("tbody"), $inputs, "#");
        });

        //add input autogrow class
        autogrowInit($target.find("tbody"));
    };

    //public members
    return {
        setDialogDraggable: setDialogDraggable,
        show: show,
        reloadcontent: reloadContent,
        close: close,
        closing: this.closing
    };
}();
