/// <reference path="jquery-ui-1.11.4.js" />
/// <reference path="jquery-ui.js" />
// Author: W. Kerkmeijer
// Implemented the following pattern:
// (Namespaced) Revealing Prototype pattern (with 'call'):

// Set the namespace
var uwvBravo = uwvBravo || {};

//  constructor
uwvBravo.Document = function (jQObj, options) {
    this.jqObject = jQObj;
    this.bravoElement = jQObj[0] ? document.getElementById(jQObj[0].id) : null;
    this.options = options || {}; // options is always an object literal

    // Get/set the defaults:
    this.regenerateButtonId = options.regenerateButtonId || "regenerateDoc_";
    this.regenerateReportUrl = "../WordHtmlConverter/RegenerateReport";
    this.previewButtonId = options.previewButtonId || "previewDoc_";
    this.previewReportUrlBase = "../WordHtmlConverter/ShowFile?pdcProcessId=";

    this.saveBravoDocumentUrlBase = "../WordHtmlConverter/SaveMainDocument";
    this.UpdateDocumentForPreviewUrlBase = "../WordHtmlConverter/UpdateDocumentForPreview";

    this.signButtonId = options.signButtonId || "signDoc_";
    this.counterSignButtonId = options.counterSignButtonId || "counterSignDoc_";

    this.saveButtonId = options.saveButtonId || "saveDoc_";
    this.modalDialogsClass = options.modalDialogsClass || ".bravo-modal-dialog";
    this.caseId = options.caseId;
    this.processId = options.processId;
    this.isPdcDocument = options.isPdcDocument != undefined ? options.isPdcDocument : true; // default is a PDC document

    this.documentTypeId = options.documentTypeId;
    this.title = options.title;
    this.type = options.type || "report";
    this.rerenderReport = false;
    this.canEdit = Boolean(options.canEdit) || false;
    this.lockOverlay = undefined;
    this.finalize = false;
    this.aosCode = "";
    this.derivedTemplateId = "";
    this.saveAndClose = "false";
    this.panelOptions = {}; // todo: check if this needs to be included as a prop of either BRAVO_Document or TabManager...
    //this.subDocuments = []; // for now, not going to maintain this collection since the Controllers return Html and not json; retrieve selected(Sub)Documents from view elements...
    //Instead, passing a parentProcessId is enough to know if this 'isMainReport'

    //specific for Popups (aka fml or ts or subdocuments)
    this.selectedSubDocument = {};
    this.selectedSubDocument.dialogOptions = {};
    this.selectedSubDocument.jqSourceObject = {};
    this.parentProcessId = options.parentProcessId; // If document has parentProcessId, it is the active subDocument
    this.parentObject = options.parentDocument || undefined;

    this.fmlRapportageUrl = options.fmlRapportageUrl || "../WordHtmlConverter/OpenPopup?";
    this.GeneratePopupUrl = "../WordHtmlConverter/GeneratePopupText"; //?popupId=
    this.closeFmlRapportageUrl = options.closeFmlRapportageUrl || "../WordHtmlConverter/ClosePopup";

    this.MyAutosave = null;

    // Computed properties, namely with boolean properies
    this.isMainReport = function () {
        if (!this.parentProcessId) {
            return true;
        }
        return false;
    };

    this.previewReportUrl = function () {
        if (this.processId) {
            return this.previewReportUrlBase + this.processId;
        }
        return "";
    };

    this.UpdateDocumentForPreviewUrl = function () {
        if (this.processId) {
            return this.UpdateDocumentForPreviewUrlBase + this.processId;
        }
        return "";
    };

    this.documentCkeditorInstances = [];
    this.tableInputElementsPrefixes = ["tb_", "td_"];

    //todo: these only work since we know that the ui is ready when Document is created; refactor, computed properties?
    this.documentElement = $("#D_" + this.processId);
    this.documentFormElement = $("#F_" + this.processId);

    this.contentChanged = false;
    this.DocumentInPdcUpdated = true;

    //search in document options
    this.searchOptions = {
        character: "#",
        hashtagIndex: 0,
        textNodes: [],
        hashtagPos: 0,
        textNodeIndex: -1,
        step: 1,
        moveNext: false,
    }

    //child components

    //jstree
    this.jstreeObj = $("#T_" + this.processId);
    this.treeviewOptions = {
        jqObj: this.jstreeObj,
        linkedDocument: this,
        isMainReport: this.isMainReport(),
        pdcProcessId: this.processId,
        treeState: "visible",
        switchPurposeReadyButtonId: this.isMainReport() ? this.regenerateButtonId : undefined
        //,
        //requesturl: (this.isMainReport() ? this.renderTreeviewUrl : this.renderTreeviewPopupUrl) + this.processId
    };
    this.linkedTreeview = undefined; // this prop is public and is set from outside; this prop holds a reference to the treeview that goes with this document in the report(tab)

    //vtBibliotheekManager
    this.uwvModalDialog = undefined;
    this.vtBibliotheekManager = undefined;


    //TextEditorManager
    this.textEditorOptions = {
        parentObject: this,
        readOnly: !this.canEdit
    };
    this.textEditorManager = new uwvBravo.TextEditor(this.textEditorOptions);



    // custom events

    this.reportRegeneratedEvent = document.createEvent("CustomEvent");
    this.reportRegeneratedEvent.initCustomEvent("reportRegeneratedEvent", true, true, this);
    this.documentFinalizedEvent = document.createEvent("CustomEvent");
    this.documentFinalizedEvent.initCustomEvent("documentFinalizedEvent", true, true, this);
    this.subDocumentProcessIdRetrievedEvent = document.createEvent("CustomEvent");
    this.subDocumentProcessIdRetrievedEvent.initCustomEvent("subDocumentProcessIdRetrievedEvent", true, true, this);

    this.derivedReportRegeneratedEvent = document.createEvent("CustomEvent");
    this.derivedReportRegeneratedEvent.initCustomEvent("derivedReportRegeneratedEvent", true, true, this);

    //Autosave
    this.documentAutoSaveEvent = document.createEvent("CustomEvent");
    this.documentAutoSaveEvent.initCustomEvent("documentAutoSaveEvent", true, true, this);
};

// Create prototype
uwvBravo.Document.prototype = function () {
    //private members

    //#region initialize
    var initialize = function () {
        bindSaveButtonClickedEvent.call(this);
        if (this.isMainReport()) {
            bindSaveButtonKeystrokeEvent.call(this);
            bindSignButtonClickedEvent.call(this);
            bindCounterSignButtonClickedEvent.call(this);
            bindPreviewButtonClickedEvent.call(this);
            textEditorManagerInit.call(this);
            bindSidebarEvents.call(this);
            if (this.canEdit === true) {
                bindDocumentTableToContextMenu.call(this);
                bindBravoModalDialogClickEvent.call(this);
                documentClientDataRefresh.call(this);
                bindAutosavedEvent.call(this);
                bindFormsChangeEvent.call(this);
                bindInputInitialisationEvent.call(this);
            }
            else
            {
                bindDisableContentEvent.call(this);
            }
        }
        else { //Popups
            bindGeneratePopupTextButtonClickedEvent.call(this, $("#" + this.regenerateButtonId));
        }

        initializeLinkedTreeview.call(this);
        bindDispatchedEvents.call(this);

        // show on hover, hide on hover-off
        $(".form-control-static").hover(function () {
            $(this).children("a.input_editable").removeClass("input_hidden");
        }, function () {
            $(this).children("a.input_editable").addClass("input_hidden");
        });
        // window.dispatchEvent(this.documentInitializedEvent);//??
    };
    //#endregion

    //#region Autosave

    var bindAutosavedEvent = function () {
        // Story BRV-1104: (temporary) disable AutoSave due to performance issues
        if (this.MyAutosave == null && this.canEdit === true) {
            var documentObject = this;
            this.MyAutosave = setInterval(function () { saveDocumentDataToBravoDb(documentObject); }, AUTOSAVE_INTERVAL);
        }
    };

    var unbindAutosavedEvent = function () {
        //hotfix
        if (this.MyAutosave != null) {
            window.clearInterval(this.MyAutosave);    //Stop autosave event
            this.MyAutosave = null;
        }
    };

    //#endregion

    var bindDisableContentEvent = function () {
        $("div[id=" + this.documentElement.attr("id") + "] input").prop("readonly", true);
    }

    //#region Sign/CounterSign
    var bindSignButtonClickedEvent = function () {
        $("#" + this.signButtonId).on("click", { docObj: this }, function (e) {

            if (e.data.docObj.processId != undefined || e.data.docObj.processId !== "") {

                var message = '<div class="message-question">Wilt u het document ondertekenen? </div>' +
                    '<div class="message-body"><span class="text-info">' +
                    e.data.docObj.title +
                    " </span></div>";


                $.messager.confirm({
                    title: "BraVo",
                    msg: message,
                    fn: function (confirmed) {
                        if (confirmed) {
                            e.data.docObj.unbindAutosavedEvent();
                            var mayFinalize = document.getElementById("MayFinalize_" + e.data.docObj.processId).value;
                            e.data.docObj.finalize = mayFinalize;
                            //save the document during finalizing 

                            signDocument.call(this, e.data.docObj);
                        }
                    }
                });
            }
        });
    }

    var bindCounterSignButtonClickedEvent = function () {
        $("#" + this.counterSignButtonId).on("click", { docObj: this }, function (e) {

            if (e.data.docObj.processId != undefined || e.data.docObj.processId !== "") {
                var message = '<div class="message-question">Wilt u het document contrasigneren? </div>' +
                    '<div class="message-body"><span class="text-info">' +
                    e.data.docObj.title +
                    " </span></div>";

                $.messager.confirm({
                    title: "BraVo",
                    msg: message,
                    fn: function (confirmed) {
                        if (confirmed) {
                            e.data.docObj.unbindAutosavedEvent();
                            e.data.docObj.finalize = true;
                            //save the document during finalizing 
                            counterSignDocument.call(this, e.data.docObj);
                        }
                    }
                });
            }
        });
    }
    //#endregion

    var bindRegenerateButtonClickedEvent = function (regenerateButton) {
        regenerateButton.on("click", { docObj: this }, function (e) {

            var docObj = e.data.docObj;


            if (docObj.isMainReport() === false) {
                docObj.rerenderReport = true;
                regenerateReport.call(this, docObj);

                docObj.linkedTreeview = new uwvBravo.JsTree(docObj.jstreeObj, docObj.treeviewOptions);
                docObj.linkedTreeview.fetchData();
                window.dispatchEvent(docObj.reportRegeneratedEvent);

            } else {

                if (docObj.linkedTreeview.stateChanged === true) {
                    docObj.rerenderReport = true;
                    regenerateReport.call(this, docObj);

                } else {
                    //remove lockOverlay if applicable
                    if (typeof (docObj.lockOverlay) != "undefined") {
                        docObj.lockOverlay.ShowOverlay(false, 'lock');
                    }
                    toggleSidebarMenu.call(docObj, $(docObj.jqObject).find("#btnContentMenu"));
                }
            }
        });
    };

    var bindGeneratePopupTextButtonClickedEvent = function (regenerateButton) {
        regenerateButton.on("click", { docObj: this }, function (e) {
            e.data.docObj.rerenderReport = true;
            generatePopupText.call(this, e.data.docObj);
            window.dispatchEvent(e.data.docObj.reportRegeneratedEvent);
        });
    };

    var bindPreviewButtonClickedEvent = function () {
        $('#' + this.previewButtonId).on('click', { docObj: this }, function (e, data) {
            var docObj = e.data.docObj;
            UpdateDocumentForPreview.call(docObj);

        });
    };

    //#region SaveDocumentdata to Bravo Db
    var saveDocumentDataToBravoDb = function (documentObject) {

        if (!documentObject.contentChanged && typeof this.document != "undefined")
            return;

        var url = documentObject.saveBravoDocumentUrlBase;
        var jlstDataArray = $(documentObject.documentFormElement.selector).serializeObjectData(documentObject.tableInputElementsPrefixes);
        var jlstData = jlstDataArray.length !== 0 ? JSON.stringify(jlstDataArray) : "";

        var data = {
            pdcProcessId: documentObject.processId,
            strjlstDataSetExtented: jlstData,
            saveAndClose: documentObject.saveAndClose
        };

        $.post(url, data)
            .done(function (response) {
                if (typeof documentObject.parentProcessId == "undefined" && !documentObject.finalize) {
                    $.messager.show({
                        msg: 'De wijzigingen zijn in het document opgeslagen:</br> <span class="text-info">' + documentObject.title + "</span>",
                        timeout: 2000,
                        showType: "slide"
                    });

                    documentObject.contentChanged = false;
                }
            });
    };

    var bindSaveButtonClickedEvent = function () {
        $("#" + this.saveButtonId).on("click", { docObj: this }, function (e, data) {
            saveDocumentDataToBravoDb.call(this, e.data.docObj);
        });
    };

    var bindSaveButtonKeystrokeEvent = function () {
        // set focus on document
        $(this.jqObject).find("a[id^='saveDoc']").focus();

        $(this.jqObject).on("keydown", { docObj: this }, function (e) {
            if (e.ctrlKey && e.keyCode === 83) {
                e.preventDefault();
                e.stopPropagation();
                saveDocumentDataToBravoDb.call(this, e.data.docObj);
            }
            //catch keydown F9
            else if (e.shiftKey && e.keyCode === 120) {
                e.preventDefault();
                e.stopPropagation();
                e.data.docObj.searchOptions.step = -1;
                FindHashtag.call(this, e.data.docObj);
            } else if (e.keyCode === 120) {
                e.preventDefault();
                e.stopPropagation();
                e.data.docObj.searchOptions.step = 1;
                FindHashtag.call(this, e.data.docObj);
            }

            //Hide popover
            $('[data-toggle="popover"], [data-table-toggle="popover"] ').each(function () {
                //the 'is' for buttons that trigger popups
                //the 'has' for icons within a button that triggers a popup
                if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $(".popover").has(e.target).length === 0) {
                    $(this).popover("hide");
                }
            });

        });
    };
    //#endregion

    var bindDocumentTableToContextMenu = function () {

        $("#" + this.documentElement.attr("id") + " table").each(function () {
            var thiz = $(this);
            if ($(this).find("tr:first").find("input[name^='tb_']").length > 0) {
                $(thiz).addClass("context-menu-table");
            }

            //Mark diagnoseCode table
            if ($(this).find("tr:first").find("input[name^='td_']").length > 0) {
                $(thiz).find("tbody").addClass("diagnoseCode");
            }

        });

        bindTableToContextMenu.call(this);
    };

    var bindInputInitialisationEvent = function () {
        bindPopOverEvents.call(this);
        bindTablePopOverEvents.call(this);

        var container = "#" + this.documentElement.attr("id");
        autogrowInit(container);
    };

    var bindBravoModalDialogClickEvent = function () {
        $(this.modalDialogsClass).unbind("click").on("click", { docObj: this }, function (e, data) {
            var dialogOptions = {};
            var vtSection = this.getAttribute("data-vtSection");

            if (vtSection) {

                var jqSourceObject = $(this);
                var processId = vtSection.split(":")[0];
                var fmlBundle = this.getAttribute("data-fmlBundle");

                dialogOptions = {
                    title: fmlBundle,
                    contentUrl: e.data.docObj.fmlRapportageUrl,
                    closeFmlRapportageUrl: e.data.docObj.closeFmlRapportageUrl, //either delete OR close...
                    isDraggable: true,
                    vtSection: vtSection,
                    processId: "" + processId + "",
                    isPdcDocument: true,
                    parentObject: e.data.docObj,
                    AnnuleerBtnText: "Afsluiten",
                    disableToonTekstBtn: false,
                    OkBtnText: "Invoegen"
                };
                e.data.docObj.selectedSubDocument.jqSourceObject = jqSourceObject;
            }
            else {

                dialogOptions = {
                    title: "Diagnosecodes",
                    contentUrl: "../DiagnoseCode/Index",
                    isDraggable: true,
                    disableToonTekstBtn: true
                };

                e.data.docObj.selectedSubDocument.jqSourceObject = $("#ds_diagnosecode"); //todo: id?
            }

            e.data.docObj.uwvModalDialog = new uwvBravo.BootstrapModal(e.data.docObj.selectedSubDocument.jqSourceObject, dialogOptions);
            e.data.docObj.uwvModalDialog.reloadcontent();
            e.data.docObj.uwvModalDialog.show();


        });
    };

    var regenerateReport = function (documentObject) {
        var jlstDataArray = $(documentObject.documentFormElement.selector).serializeObjectData(documentObject.tableInputElementsPrefixes);

        //Get a comples list of inputs controls, , result Array name - value ([values]) - pdc data attribute (data-link , data-attribute)
        var jlstData = jlstDataArray.length !== 0 ? JSON.stringify(jlstDataArray) : "";
        var regUrl = documentObject.regenerateReportUrl; //+ '&rerenderReport=' + documentObject.rerenderReport + '&finalize=' + documentObject.finalize;

        var data = {
            pdcProcessId: documentObject.processId,
            rerenderReport: documentObject.rerenderReport,
            strjlstDataSetExtented: jlstData
        };

        //remove lockOverlay if applicable
        if (typeof (documentObject.lockOverlay) != "undefined") {
            documentObject.lockOverlay.ShowOverlay(false, 'lock');
        }

        callDocumentServerAction(documentObject, regUrl, data);
        //Refresh documents grid only after tab close (the status in pdc is locked as should be, but for the current enduser session it should remain clickable)
    };

    var generatePopupText = function (documentObject) {
        var selectedNode = documentObject.linkedTreeview.selectedChildNodes();
        var jlstData = selectedNode.length !== 0 ? JSON.stringify(selectedNode) : "";
        var postData = {
            popupId: documentObject.processId,
            parentPdcProcessId: documentObject.parentProcessId,
            nodeIds: jlstData
        };
        callDocumentServerAction(documentObject, documentObject.GeneratePopupUrl, postData);
        // Refresh documents grid only after tab close (the status in pdc is locked as should be, but for the current enduser session it should remain clickable)
    };

    var UpdateDocumentForPreview = function () {
        var docObj = this;
        var jlstDataArray = $(this.documentFormElement.selector).serializeObjectData(this.tableInputElementsPrefixes);
        //Get a comples list of inputs controls, , result Array name - value ([values]) - pdc data attribute (data-link , data-attribute)
        var jlstData = jlstDataArray.length !== 0 ? JSON.stringify(jlstDataArray) : "";
        this.rerenderReport = false;
        var data = {
            pdcProcessId: this.processId,
            strjlstDataSetExtented: jlstData
        };

        $.post(docObj.UpdateDocumentForPreviewUrlBase, data)
            .done(function (returnData) {
                if (returnData) {

                    getFileMime(docObj.previewReportUrl());

                    $.messager.show({
                        msg: 'Het afdrukvoorbeeld wordt aangemaakt: </br><span class="text-info">' + docObj.title + "</span>",
                        timeout: 2000,
                        showType: "slide"
                    });
                }
            });

    };

    var callDocumentServerAction = function (docObj, url, data, preview) {

        $.ajax({
            url: url,
            data: data,
            type: "POST",
            contentType: "application/x-www-form-urlencoded; charset=utf-8",
            cache: "false",
            beforeSend: function () {
                if (typeof docObj.parentProcessId == "undefined" && docObj.saveAndClose !== "true") {
                    docObj.unbindAutosavedEvent();
                }
                if (docObj.rerenderReport && docObj.isMainReport()) {
                    //reset linkedTreeview state
                    docObj.linkedTreeview.stateChanged = false;
                    toggleSidebarMenu.call(docObj, $(docObj.jqObject).find("#btnContentMenu"));
                }
            },
            success: function (response) {
                if (docObj.saveAndClose !== "true") {
                    $(docObj.documentElement).html(response);
                    docObj.DocumentInPdcUpdated = true;
                }
            },
            complete: function (response) {
                if (docObj.isMainReport()) {
                    if (docObj.saveAndClose !== "true" && !docObj.finalize) {
                        if (docObj.rerenderReport) {
                            reload.call(docObj);
                        }
                    }
                    //trigger event to listener (base)
                    window.dispatchEvent(docObj.reportRegeneratedEvent);
                }
                else
                {
                    //case documentObject is subdocument
                    if (docObj.parentObject == undefined) return false;
                    if (docObj.parentObject.uwvModalDialog.closing === true) {
                        setModalResult.call(docObj.parentObject);
                    } else {
                        autogrowInit(docObj.bravoElement);
                    }
                }
            }
        });
    };

    var signDocument = function (documentObject) {

        var jlstDataArray = $(documentObject.documentFormElement.selector).serializeObjectData(documentObject.tableInputElementsPrefixes);
        //Get a comples list of inputs controls, , result Array name - value ([values]) - pdc data attribute (data-link , data-attribute)
        var jlstData = jlstDataArray.length !== 0 ? JSON.stringify(jlstDataArray) : "";

        var postData = {
            aosCode: documentObject.aosCode,
            strjlstDataSetExtented: jlstData,
            pdcProcessId: documentObject.processId
        };
        var url = "../WordHtmlConverter/SignDocument";
        $.post(url, postData)
            .done(function (data, textStatus, jqXHR) {
                if (data) {
                    if (data.Result && data.Result !== false) {

                        $.messager.show({
                            msg: data.Message,
                            timeout: 2000,
                            showType: "slide"
                        });
                        window.dispatchEvent(documentObject.documentFinalizedEvent);

                        if (data.TreeWarning != null && data.TreeWarning != "" ) {
                            $.messager.alert({
                                title: 'BraVo',
                                msg: data.TreeWarning,
                                icon: 'warning',
                                width: 500,
                                height: "auto"
                            });
                        }
                    }
                    else {
                        $.messager.alert({
                            title: "BraVo",
                            msg: data.Message,
                            icon: "error",
                            style: {
                                right: "",
                                top: document.body.scrollTop + document.documentElement.scrollTop + 2 * $("div.container").height(),
                                bottom: ""
                            }
                        });
                    }
                }
            });
    };

    var counterSignDocument = function (documentObject) {
        var jlstDataArray = $(documentObject.documentFormElement.selector).serializeObjectData(documentObject.tableInputElementsPrefixes);
        //Get a comples list of inputs controls, , result Array name - value ([values]) - pdc data attribute (data-link , data-attribute)
        var jlstData = jlstDataArray.length != 0 ? JSON.stringify(jlstDataArray) : "";
        var data = {
            aosCode: documentObject.aosCode,
            strjlstDataSetExtented: jlstData,
            pdcProcessId: documentObject.processId
        };
        var url = "../WordHtmlConverter/CounterSignDocument";
        $.post(url, data)
            .done(function (data, textStatus, jqXHR) {
                if (data) {
                    if (data.Result && data.Result != false) {
                        $.messager.show({
                            msg: data.Message,
                            timeout: 2000,
                            showType: "slide"
                        });
                        window.dispatchEvent(documentObject.documentFinalizedEvent);
                    }
                    else {
                        $.messager.alert({
                            title: 'BraVo',
                            msg: data.Message,
                            icon: 'error',
                            style: {
                                right: '',
                                top: document.body.scrollTop + document.documentElement.scrollTop + 2 * $('div.container').height(),
                                bottom: ''
                            }
                        });
                    }
                }
            });
    }

    var bindFormsChangeEvent = function () {
        if (this.documentFormElement) {
            //only input type text, textarea change event is already cached from ckeditor with replaceTextareaWithInlineEditor
            $(this.documentFormElement).find("input[type=text], textarea").unbind("change").bind("change", { docObj: this }, function (e, data) {
                e.data.docObj.contentChanged = true;
                e.data.docObj.DocumentInPdcUpdated = false;
            });
        }
    };

    var documentClientDataRefresh = function () {

        var updateClientData = $("#section1_" + this.processId + " input[name=UpdateClientData]");

        if (typeof (updateClientData) != "undefined") {

            if (updateClientData.val().toLowerCase() === "true")
                $.messager.alert({
                    title: "BraVo",
                    msg: '<span class="text-warning">Let op: De persoonsgegevens van de klant zijn gewijzigd,\n raadpleeg het gegevens tabblad voor de meest actuele gegevens en corrigeer deze daar waar nodig in uw document.</span>',
                    icon: "warning",
                    width: 400
                });
        }
    };

    //#region jquery popover functions
    var bindPopOverEvents = function () {

        //Show the documentVariable popover
        $("#" + this.documentElement[0].id + " a[data-toggle=popover]").click(function (evt) {
            evt.preventDefault();
            evt.stopPropagation();
            $("[data-toggle=popover]").not(this).popover("hide");

            var caseId = window.tabManager.caseId;
            var curPdcProcess = window.tabManager.selectedTabDocument.processId;

            var el = $(this);
            var url = "../DocumentVariable/DocumentVariableResult";

            var inputTextTarget = this.getAttribute("data-target");
            var link = $("input[id=" + inputTextTarget + "]").data("link");
            var attribute = $("input[id=" + inputTextTarget + "]").data("attribute");

            if (link && attribute) {

                $.get(url, {
                    dataLink: link,
                    elementName: attribute,
                    casusId: caseId,
                    pdcProcessId: curPdcProcess
                }, function (response) {

                    el.unbind("click").popover("destroy").popover({
                        title: inputTextTarget,
                        html: true,
                        container: "body",
                        placement: "bottom",
                        content: response,

                        template: '<div class="popover">' +
                            '<div class="arrow"></div>' +
                            ' <h3 class="popover-title"></h3>' +
                            '<div class="popover-content"></div>' +
                            '<div class="popover-footer">' +
                            '<button id="popover-btn-cancel" type="button" class="btn btn-default btn-custom">Annuleren</button>' +
                            '<button id="popover-btn-ok" type="button" class="btn btn-primary btn-custom">OK</button>' +
                            "</div>" +
                            "</div>"

                    }).popover("show")
                        .on("shown.bs.popover", function (shownEvent) {

                            if (shownEvent.result == undefined) {
                                shownEvent.preventDefault();
                                shownEvent.stopPropagation();
                            }

                            var $popup = $("#" + $(shownEvent.target).attr("aria-describedby"));

                            $popup.find("#popover-btn-cancel").click(function (e) {
                                $popup.popover("hide");

                            });

                            $popup.find("#popover-btn-ok").click(function (e) {

                                var newValue = null;
                                $("#DocumentVariableTable input[name=btSelectItem]:checked").each(function () {
                                    var row = $(this).closest("tr");
                                    //newValue = $(row).find("input[name=elementName]").val();
                                    //N.B.: OpgeslagenGegevens is specified in the query to get the result from DB, see DocumentVariableContoller
                                    newValue = $(row).find("span[name=documentVariableValue]").html();
                                    return false;
                                });

                                if (newValue != null && newValue !== el.val()) {
                                    $("input[id='" + inputTextTarget + "']").val(newValue);
                                }
                                $popup.popover("hide");
                            });
                        });
                });
                //if  link + attribute not found
            } else {
                el.unbind("click").popover({
                    content: "<span style=\"color:red;\" >Data niet gevonden</span>",
                    title: name,
                    html: true,
                    container: "body",
                    placement: "bottom",
                    trigger: "focus",
                    delay: {
                        show: 500,
                        hide: 100
                    }
                }).popover("show");
            }
        });

    };

    var bindSidebarEvents = function () {
        var thiz = this;
        $(this.jqObject).find(".sidebar-menu > a").bind("click", function () {
            toggleSidebarMenu.call(thiz, this);
        });

        if (!this.canEdit) {
            $(this.jqObject).find('#btnContentMenu').addClass('disabled disableClick').unbind("click").bind("click", function () {
                return false;
            });
        }
    };

    var toggleSidebarMenu = function (e) {

        if (this.linkedTreeview != undefined && this.linkedTreeview.stateChanged === true) {
            return;
        }

        var container = $(this.jqObject);
        var menuItem = $(e);
        var showMenu = $(menuItem[0].firstChild).hasClass("glyphicon-triangle-right");
        var sectionId = menuItem.attr("for");
        var showTreeview = sectionId == "sidebar_content";

        var sidebar = container.find("#sidebar");
        var section = container.find("#" + sectionId);

        container.find("div[id^=sidebar_]").hide();
        container.find(".sidebar-menu > a > span").removeClass("glyphicon-triangle-bottom").addClass("glyphicon-triangle-right");

        if (showMenu) {
            section.show();
            sidebar.addClass("sidebar-open");
            $(menuItem[0].firstChild).removeClass("glyphicon-triangle-right").addClass("glyphicon-triangle-bottom");

            if (showTreeview) {

                if (this.linkedTreeview == undefined) {
                    this.linkedTreeview = new uwvBravo.JsTree(this.jstreeObj, this.treeviewOptions);
                    this.linkedTreeview.loadContent();
                    bindRegenerateButtonClickedEvent.call(this, $("#" + this.linkedTreeview.switchPurposeReadyButtonId));
                }

                this.linkedTreeview.treeState = "visible";
                $(this.documentElement)[0].dispatchEvent(this.linkedTreeview.jsTreeChangeState);
            }
        }
        else {
            sidebar.removeClass("sidebar-open");
            this.linkedTreeview.treeState = "hidden";
            $(this.documentElement)[0].dispatchEvent(this.linkedTreeview.jsTreeChangeState);
        }
    };

    var bindTablePopOverEvents = function () {

        //Show document table variable popover
        $("#" + this.documentElement[0].id + " img[data-table-toggle=popover]").click(function (evt) {
            evt.preventDefault();
            evt.stopPropagation();

            $("[data-table-toggle=popover]").not(this).popover("hide");

            $(this).popover({
                html: false,
                container: "body",
                placement: "auto",
                animation: false,
                content: function () {
                    return $(this).siblings("input").val();
                },
                template: '<div class="popover" style="width : auto; min-width: 100px;">' +
                    '<div class="arrow"></div>' +
                    '<div class="popover-content"></div>' +
                    "</div>"

            }).popover("show");

        });
    }

    var bindTableToContextMenu = function () {
        var thiz = this;

        $.contextMenu({
            selector: ".context-menu-table tr",
            delay: 300,
            build: function ($trigger, e) {
                var options = {
                    callback: function (key, options) {
                        switch (key) {
                            case "addAbove":
                                insertTableRow.call(thiz, $trigger, 1);
                                break;
                            case "addUnder":
                                insertTableRow.call(thiz, $trigger, 2);
                                break;

                            case "delete":
                                if ($trigger.parent().find("tr").length === 1 && $trigger.find("input:first").val() !== "#") {
                                    $trigger.find("input").each(function () {
                                        $(this).attr({
                                            'value': "#"
                                        });
                                    });
                                } else {
                                    $trigger.remove();
                                }

                                //Document state is changed
                                thiz.contentChanged = true;
                                thiz.DocumentInPdcUpdated = false;
                                //refresh table popoverbinding
                                bindTablePopOverEvents.call(thiz);

                                break;
                            case "moveUp":
                                moveTableRow.call(this, key);
                                break;
                            case "moveDown":
                                moveTableRow.call(this, key);
                                break;
                            default:
                                return true;
                        }
                    },
                    items: {}
                };
                if ($trigger.parent().hasClass("diagnoseCode")) {
                    options.items = {
                        "moveUp": { name: "Omhoog", icon: "up", disabled: function () { return false; } },
                        "moveDown": { name: "Omlaag", icon: "down", disabled: function () { return false; } },
                        "delete": { name: "Verwijderen", icon: "delete", disabled: disableContextMenuItem($trigger) },
                        "sep1": "---------",
                        "Annuleren": { name: "Annuleren", icon: function () { return "context-menu-icon context-menu-icon-quit"; } }
                    }                   
                }
                else {
                    options.items = {
                        "addAbove": { name: "Rij boven toevoegen", icon: "paste", disabled: function () { return false; } },
                        "addUnder": { name: "Rij onder toevoegen", icon: "paste", disabled: function () { return false; } },
                        "delete": { name: "Verwijderen", icon: "delete", disabled: disableContextMenuItem($trigger) },
                        "sep1": "---------",
                        "Annuleren": { name: "Annuleren", icon: function () { return "context-menu-icon context-menu-icon-quit"; } }
                    }
                }
                return options;
            }
        });
    };

    var moveTableRow = function (key) {
        var row = this;
        if (key == "moveUp") {
            row.insertBefore(row.prev());
        }
        else {
            row.insertAfter(row.next());
        }
    }

    function disableContextMenuItem($trigger) {
        var len = $trigger.parent().find("tr").length;
        if (len === 1) {
            if ($trigger.find("input:first").val() !== "#") {
                return false;
            } else {
                return true;
            }
        }
        else {
            return false;
        }
    };

    var insertTableRow = function ($trigger, position) {
        var docObj = this;
        var $trNew = $trigger.clone(); //N.B. context-menu-active class is also cloned
        $trNew.find("input").each(function () {
            $(this).attr({
                'value': "#"
            });
        });

        switch (position) {
            case 1:
                $trigger.before($trNew);
                break;
            case 2:
                $trigger.after($trNew);
                break;
            default:
                return false;
        }
        //remove context-menu-active class to show context menu again on the new tr.
        $trNew.removeClass("context-menu-active");
        autogrowInit($trNew);
        //Document state is changed
        docObj.contentChanged = true;
        docObj.DocumentInPdcUpdated = false;
        //refresh table popoverbinding
        bindTablePopOverEvents.call(docObj);

    }

    //#region Document texteditor
    var textEditorManagerInit = function () {
        this.textEditorManager.initialize();
                }

    //update the ckeditor textarea (vt_)
    var setModalResult = function () {
        if (this.uwvModalDialog.closing === true) {
            var editor = CKEDITOR.instances[this.uwvModalDialog.vtSection];
            if (editor) {
                var modalContainer = "#D_" + this.uwvModalDialog.tsprocessId;
                $(modalContainer).find("autogrow").remove();
                //replace input type text tag with [] for palceholder format in ckeditor
                $(modalContainer + " :input").each(function () {
                    var input = $(this);
                    input.replaceWith("[" + input.attr("value") + "]");
                });
                //get html content
                var modalResult = document.getElementById("D_" + this.uwvModalDialog.tsprocessId).innerHTML;
                //initialize aand trigger custom event 
                editor.fire("insert", modalResult);
            }

            //trigger close modal
            this.uwvModalDialog.close.call(this.uwvModalDialog);
        }
    };

    //#endregion Document texteditor

    var initializeLinkedTreeview = function () {

        if (!this.isMainReport()) {

            this.linkedTreeview = new uwvBravo.JsTree.Popup(this.jstreeObj, this.treeviewOptions);
            this.linkedTreeview.show();
        }
    }

    var bindDispatchedEvents = function () {

        //Jstree Events
        $(this.documentElement).unbind("jsTreeChangeState").on("jsTreeChangeState", { docObj: this }, function (e, data) {

            var newTreeState = e.originalEvent.detail.treeState;
            var parentDocument = e.data.docObj;

            if (newTreeState === "visible") {
                //create new lockOverlay instance if not exists
                if (parentDocument.lockOverlay === undefined || parentDocument.lockOverlay === null) {
                    //add overlay
                    var overlayOptions = {
                        jqContainer: parentDocument.jqObject,
                        typeOfOverlay: "lock",
                        overlayText: "Document kan pas bewerkt worden <br/> wanneer de huidige actie is afgerond.",
                        topPosition: "14vh",
                        bottomPosition: "200px",
                        leftPosition: "30px",
                        rightPosition: "30px",
                        width: "auto"
                    };
                    parentDocument.lockOverlay = new uwvBravo.CustomOverlay(overlayOptions);
                }
                parentDocument.lockOverlay.ShowOverlay(true);
            }
            else {
                //hide and remove overlay
                if (parentDocument.lockOverlay !== undefined && parentDocument.lockOverlay !== null) {
                    parentDocument.lockOverlay.ShowOverlay(false);
                }
            }

            parentDocument.treeviewOptions.treeState = newTreeState;
        });

        //loaded after confirm modal event
        $("#" + this.bravoElement.id).unbind("modalInsertResultInParentDocument").on("modalInsertResultInParentDocument", { docObj: this }, function (e, data) {
            if (e.data.docObj.selectedSubDocument.linkedTreeview.stateChanged === true || document.getElementById("D_" + e.data.docObj.selectedSubDocument.processId).innerText === "") {
                e.data.docObj.selectedSubDocument.rerenderReport = true;
                e.data.docObj.selectedSubDocument.generatePopupText(e.data.docObj.selectedSubDocument);
            }
            else {
                setModalResult.call(e.data.docObj);
            }

        });

        $("#" + this.bravoElement.id).unbind("modalWindowToonTekstEvent").on("modalWindowToonTekstEvent", { docObj: this }, function (e, data) {
            e.data.docObj.selectedSubDocument.rerenderReport = true;
            e.data.docObj.selectedSubDocument.generatePopupText(e.data.docObj.selectedSubDocument);
        });

    };


    //  # finder
    var FindHashtag = function (documentObject) {
        var documentElm = $("#" + documentObject.documentElement.attr("id"));
        var allInputs = $(documentElm).find("div.cke_textarea_inline[contenteditable=true], input[type=text]:not([readonly],[disabled])");
        var hashtagFound = false;

        $.fn.checkFocus(documentObject, allInputs);

        for (i = 0; i < allInputs.length; i++) {

            documentObject.searchOptions.textNodes = [];

            if (documentObject.searchOptions.moveNext) { documentObject.searchOptions.hashtagIndex += documentObject.searchOptions.step; }
            if (documentObject.searchOptions.hashtagIndex >= allInputs.length) { documentObject.searchOptions.hashtagIndex = 0; }
            if (documentObject.searchOptions.hashtagIndex < 0) { documentObject.searchOptions.hashtagIndex = allInputs.length - 1; }

            var docInput = allInputs[documentObject.searchOptions.hashtagIndex];
            var text = $(docInput).val() + $(docInput).text();
            hashtagFound = text.indexOf(documentObject.searchOptions.character) != -1;

            if (hashtagFound) {
                $(docInput).focus().selectHashtag(documentObject);
                if (!documentObject.searchOptions.moveNext || $(docInput).is('input'))
                    break;
            }
            else {
                documentObject.searchOptions.moveNext = true;
                documentObject.searchOptions.hashtagPos = 0;
                documentObject.searchOptions.textNodeIndex = -1;
            }
        }

        if (!hashtagFound) {
            var message = "Het doorzoeken van het document is voltooid. Er zijn geen hashtags meer gevonden."
            if (allInputs.length == 0) { message = "Kan het document niet doorzoeken. Het document is in leesmodus geopend." }
            $.messager.show({
                msg: message,
                timeout: 2000,
                showType: "slide"
            });
        }
    }
    // End functions # finder

    var close = function () {
        this.textEditorManager.deleteInlineCkeditorInstances();
        unbindAutosavedEvent.call(this);
    };

    var reload = function () {
        this.textEditorManager.reload.call(this.textEditorManager);
        //(de)activate the edit button for the editable input text area
        $(".form-control-static").hover(function () {
            $(this).children("a.input_editable").removeClass("input_hidden");
        }, function () {
            $(this).children("a.input_editable").addClass("input_hidden");
        });
        bindBravoModalDialogClickEvent.call(this);
        bindInputInitialisationEvent.call(this);
        bindDocumentTableToContextMenu.call(this);
        bindAutosavedEvent.call(this);
    }


    //#endregion

    //public members
    return {
        initialize: initialize,
        bindRegenerateButtonClickedEvent: bindRegenerateButtonClickedEvent,
        regenerateReport: regenerateReport,
        unbindAutosavedEvent: unbindAutosavedEvent,
        bindAutosavedEvent: bindAutosavedEvent,
        signDocument: signDocument,
        counterSignDocument: counterSignDocument,
        generatePopupText: generatePopupText,
        bindGeneratePopupTextButtonClickedEvent: bindGeneratePopupTextButtonClickedEvent,
        close: close,
        saveDocumentDataToBravoDb: saveDocumentDataToBravoDb,
        toggleSidebarMenu: toggleSidebarMenu
    };
}();
