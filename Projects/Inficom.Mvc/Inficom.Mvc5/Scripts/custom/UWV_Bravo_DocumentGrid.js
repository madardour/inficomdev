// Author: W. Kerkmeijer
// Implemented the following pattern:
// (Namespaced) Revealing Prototype pattern (with 'call'):
// This component is a BRAVO wrapper for the WebGrid controls used for ActiveDocuments and FinalizedDocuments


// Set the namespace
var uwvBravo = uwvBravo || {};

// bravoJsTree constructor
uwvBravo.DocumentGrid = function (gridContainer, options) {
    this.gridParentElement = options.gridParentElement;
    this.gridContainer = gridContainer;
    this.options = options || {}; // options is always an object literal

    // Get/set the defaults:
    this.WebGridObject = options.WebGridObject;
    this.triggerId = gridContainer[0].id;

    this.gridType = options.gridType;

    //html elements Id's
    this.gridContainerElement = this.gridType != undefined ? $("#" + this.gridType + "Grid") : undefined;

    //Url's
    this.refreshUrl = this.gridType === "ActiveDocuments" ? "../Case/ActiveDocumentsPartial" : "../Case/FinalizedDocumentsPartial";
    this.finalizedReportUrl = "../WordHtmlConverter/ShowFile?processState=2&pdcProcessId=";


    // todo WK: These links have to be reset after each 'previous' or 'next' gridbutton action; the gridContainer selector ensures that the links are set for the correct DocumentGrid instance
    this.contextMenuInfoLinkElements = options.contextMenuInfoLinkElements || this.gridContainer.find('.docInfoLink');
    this.previousLinkElement = options.previousLinkElement || this.gridContainer.find(".gridtable-footer").find("a:contains('<')");
    this.nextLinkElement = options.nextLinkElement || this.gridContainer.find(".gridtable-footer").find("a:contains('>')");

    this.selectedDocument = {
        processId: "",
        title: "",
        type: "",
        documentTypeId: "",
        canCreate: "False",
        canView: "False",
        canEdit: "False",
        canDelete: "False",
        canClone: "False",
        viewOnly: false
    };
    this.caseId = options.caseId;
    this.gridData = "";

    // todo WK: maintain a collection of activeDocuments (not only the visible ones but all gridDocuments)
    this.conceptDocuments = [];
    this.contextMenu = {};

    //
    this.modalTemplatesManager = undefined;


    // declare events
    this.documentGridInitializedEvent = document.createEvent('CustomEvent');
    this.documentGridInitializedEvent.initCustomEvent('documentGridInitializedEvent', true, true, this);

    this.documentInfoLoadedEvent = document.createEvent('CustomEvent');
    this.documentInfoLoadedEvent.initCustomEvent('documentInfoLoadedEvent', true, true, this);

    this.documentEditEvent = document.createEvent('CustomEvent');
    this.documentEditEvent.initCustomEvent('documentEditEvent', true, true, this);

    this.documentDeletedEvent = document.createEvent('CustomEvent');
    this.documentDeletedEvent.initCustomEvent('documentDeletedEvent', true, true, this);

    this.clonedReportEvent = document.createEvent('CustomEvent');
    this.clonedReportEvent.initCustomEvent('clonedReportEvent', true, true, this);

    //this.detailInkomstenGridEvent = document.createEvent('CustomEvent');
    //this.detailInkomstenGridEvent.initCustomEvent('detailInkomstenGridEvent', true, true, this);

};

// Create prototype
uwvBravo.DocumentGrid.prototype = function () {
    //private members
    var initialize = function () {
        if (this.gridType === 'ActiveDocuments') {
            initActiveDocumentGrid.call(this);
            setSortAndPagingHref.call(this, this.refreshUrl);
            bindAddDocumentLinkClickedEvent.call(this);
            bindDispatchedEvents.call(this);
        }
        else if (this.gridType === "FinalizedDocuments") {
            initFinalizedDocumentGrid.call(this);
            setSortAndPagingHref.call(this, this.refreshUrl);
        }
    };

    var bindAddDocumentLinkClickedEvent = function () {
        var thiz = this;

        $("body").unbind("click").on("click", "#showAllTemplates", function (e, data) { // bind to existing element and pass in name of target element, as to facilitate binding to non-existing/ generated element

            //instantie modal
            if (typeof thiz.modalTemplatesManager === "undefined") {
                var addDocOptions = {
                    extendtedModal: true,
                    title: 'Document toevoegen',
                    contentUrl: "../Case/GetAvailableTemplates?caseId=" + thiz.caseId,
                    isDraggable: false,
                    disableOkBtn: false,
                    OkBtnText: "Toevoegen",
                    AnnuleerBtnText: "Annuleren",
                    disableToonTekstBtn: true,
                    cssClass: "modal-small",
                    parentObject: thiz
                };

                thiz.modalTemplatesManager = new uwvBravo.BootstrapModal($('#showAllTemplates'), addDocOptions);
                thiz.modalTemplatesManager.reloadcontent();
                thiz.modalTemplatesManager.show();
            }
            else {
                thiz.modalTemplatesManager.title = thiz.modalTemplatesManager.fmlBundle;
                if (thiz.modalTemplatesManager.contentIsLoaded == false) { thiz.modalTemplatesManager.reloadcontent(); }
                thiz.modalTemplatesManager.show();
                disableModalButton.call(thiz);
            }
        });
    };


    //#region catch dispatched events from nestedComponents
    var bindDispatchedEvents = function () {
        var thiz = this;

        //modal event is clicked
        $("#" + this.triggerId).unbind("modalExtendedWindowContentLoadedEvent").on("modalExtendedWindowContentLoadedEvent", function (e, data) {
            disableModalButton.call(thiz);
        })

        //modal event is clicked
        $("#" + this.triggerId).unbind("shownBsModalEvent").on("shownBsModalEvent", function (e, data) {
            //DrgonSpeech: WorkArround to force set focus to select template list
            $('#sourceTemplates').focus();

        })

    }

    var disableModalButton = function () {
        var thiz = this;
        if ($(thiz.modalTemplatesManager.sourceTemplatesSelector).val() == null)
            $("#" + this.modalTemplatesManager.confirmButtonId).attr("disabled", true);

        $(this.modalTemplatesManager.sourceTemplatesSelector).click(function (e) {
            if ($(thiz.modalTemplatesManager.sourceTemplatesSelector).val() != null)
                $("#" + thiz.modalTemplatesManager.confirmButtonId).removeAttr("disabled");
        });
    }

    var setSortAndPagingHref = function (newUrl) {
        if (newUrl == undefined) return false;
        var gridElement = $("#" + this.gridContainer[0].id);
        $(gridElement).find("th a, tfoot a").each(function () {
            var urlArray = this.href.split("?");
            var urlWithoutQryString = urlArray[0];
            var urlQryString = urlArray[1];

            if (urlWithoutQryString !== newUrl) {
                var completeUrl = newUrl + "?" + urlQryString;
                $(this).attr("href", completeUrl);
            }
        });
    }


    var bindDocumentInfoClickedEvent = function () {
        $(this.gridContainer).find(".docInfoLink").on('click', { gridObj: this }, function (event, data) {
            event.data.gridObj.getDocumentInfo(this.id);
        });
    };

    var bindActiveDocumentLinkClickedEvent = function () {
        $(".activeDocumentLink").unbind("click").on("click", { gridObj: this }, function (e, data) {
            //var processId = e.srcElement.getAttribute('data-processId');            
            openDocumentTab(e);
        });
    };


    var bindFinalizedDocumentLinkClickedEvent = function () {
        var thiz = this;

        $(".finalizedDocumentLink").unbind("click").on("click", { gridObj: this }, function (e, data) {
            //var processId = e.srcElement.getAttribute('data-processId');            
            getFinalizedDocument.call(thiz, e);
        });
    };


    var bindDocumentsGridRowClickedAndHoverEvent = function () {
        $(this.gridContainerElement).find("tbody tr").on("click", { gridObj: this }, function (e, data) {
            $(this).addClass("selectrow");
            $(this.gridContainerElement).find("tr").not(this).removeClass("selectrow");
        }).hover(function () {
            $(this).toggleClass("rowhover");
        });
    };


    var bindDocumentGridRowContextMenu = function () {
        var thiz = this;
        var showContextMenu = true;
        thiz.contextMenu = $.contextMenu({
            selector: ".context-menu-grid",
            trigger: 'left',
            //delay: 50,
            events: {
                show: function (options) {
                    if (!showContextMenu) {
                        //prevent showing contextMenu 
                        this.contextMenu(false);
                        return false;
                    }
                }
            },
            build: function ($trigger, e) {
                var gridRowLink = $('a[data-processid=' + $trigger.attr('id') + ']');
                var documentTitle = gridRowLink[0].getAttribute('data-title');

                thiz.selectedDocument = {
                    processId: gridRowLink[0].getAttribute('data-processid'),
                    title: gridRowLink[0].getAttribute('data-title'),
                    type: gridRowLink[0].getAttribute('data-type'),
                    documentTypeId: gridRowLink[0].getAttribute('data-documentTypeId'),
                    canCreate: gridRowLink[0].getAttribute('data-cancreate'),
                    canView: gridRowLink[0].getAttribute('data-canview'),
                    canEdit: gridRowLink[0].getAttribute('data-canedit'),
                    canDelete: gridRowLink[0].getAttribute('data-candelete'),
                    canClone: gridRowLink[0].getAttribute('data-canclone')
                };
                //Set hidden field to keep track of pdcProcessId
                $("#pdcProcessId").val(thiz.selectedDocument.processId);
                // this callback is executed every time the menu is to be shown; its results are destroyed every time the menu is hidden
                // e is the original contextmenu event, containing e.pageX and e.pageY (amongst other data)
                var options = {
                    callback: function (key, options) {

                        switch (key) {
                            case "info":
                                thiz.getDocumentInfo(thiz.selectedDocument.processId);
                                break;
                            case "view":
                                //Business rule: in case one explicitly chooses to view (as opposed to edit) a document, the document is opened as 'readonly' (even if one also has rights to 'edit')
                                thiz.selectedDocument.viewOnly = true;
                                window.dispatchEvent(thiz.documentEditEvent);
                                break;
                            case "edit":
                                window.dispatchEvent(thiz.documentEditEvent);
                                break;
                            case "delete":
                                thiz.deleteDocument(thiz.selectedDocument.processId);
                                break;
                            case "clone":
                                thiz.getClonedDocument(thiz.selectedDocument);
                                break;
                            default:
                                $.messager.alert('BraVo', 'onbekend grid contextmenu item', 'info');
                        }

                    },
                    //DragoSpeech fix change position
                    position: function (opt, x, y) {
                        opt.$menu.position({
                            my: 'center top',
                            at: 'center bottom',
                            of: opt.$trigger
                        });
                    },
                    items: {}
                }


                //standard option
                options.items = {
                    "info": {
                        icon: function (opt, $itemElement, itemKey, item) {
                            $itemElement.html('<a class="context-menu-icon-info">Informatie</a> ' + opt.selector);
                            return true;
                        }
                    }
                }




                //finalizedDocument options
                if ($trigger.hasClass('finalizedDocument')) {
                    if (thiz.selectedDocument.canClone == "True") {
                        $.extend(
                            options.items,
                            {
                                "clone": {
                                    icon: function (opt, $itemElement, itemKey, item) {
                                        $itemElement.html('<a class="context-menu-icon-copy">Corrigeren document</a> ' + opt.selector);
                                        return true;
                                    }
                                }
                            });
                    }

                    return options;
                }

                //Case of concept Documents
                $.when(documentExist(thiz.selectedDocument.processId)).then(function (data) {
                    showContextMenu = data;
                    if (data) {

                        //View-based authorization
                        if (thiz.selectedDocument.canView == "True") {
                            $.extend(
                                options.items,
                                {
                                    "view": {
                                        icon: function (opt, $itemElement, itemKey, item) {
                                            $itemElement.html('<a class="context-menu-icon-copy">Inzien</a> ' + opt.selector);
                                            return true;
                                        }
                                    }
                                });
                        }

                        //Edit-based authorization
                        if (thiz.selectedDocument.canEdit == "True") {

                            $.extend(
                                options.items,
                                {
                                    "edit": {
                                        icon: function (opt, $itemElement, itemKey, item) {
                                            $itemElement.html('<a class="context-menu-icon-edit">Bewerken</a> ' + opt.selector);
                                            return true;
                                        }
                                    }
                                });

                        }

                        //Delete-based authorization
                        if (thiz.selectedDocument.canDelete == "True") {

                            $.extend(
                                options.items,
                                {
                                    "delete": {
                                        icon: function (opt, $itemElement, itemKey, item) {
                                            $itemElement.html('<a class="context-menu-icon-delete">Verwijderen</a> ' + opt.selector);
                                            return true;
                                        }
                                    }
                                });

                        }

                    }
                    else {
                        options.items = {
                            "test": { name: "document is verwijderd", icon: "glyphicon glyphicon-remove-circle" }
                        }

                        $.messager.alert({
                            title: 'BraVo',
                            msg: 'het volgende document bestaat niet meer binnen BraVo: </br> <span class="text-danger">' + documentTitle + '</span>',
                            icon: 'error',
                            width: 500,
                            height: "auto",
                            fn: function () {
                                thiz.refreshDocumentGrid();
                            }
                        });


                    }
                });

                return options;
            }
        });
    }

    //check if given document exists in bravo database
    var documentExist = function (processId) {

        var result = false;

        $.ajax({
            url: "../Case/CheckIfDocumentExistsInBravo/" + "?pdcProcessId=" + processId,
            type: 'GET',
            contentType: 'application/json',
            cache: false,
            async: false
        }).done(function (data, textStatus, jqXHR) {
            result = data;
        }).fail(function (jqXhr, textStatus, errorThrown) {
            console.log(JSON.stringify(jqXhr));
            result = false;
        });

        return result;

    };

    var getClonedDocument = function (selectedDocument) {
        var thiz = this;
        var url = "../Case/GetClonedDocument";
        var id = selectedDocument.processId;

        $.get(url, { pdcProcessId: id }, function (result) {
            if (result != null) {

                $.messager.show({
                    msg: 'Document kloon is aangemaakt:</br> <span class="text-info">' + result.title + ' </span>',
                    timeout: 2000,
                    showType: "slide"
                });

                if (result.TreeWarning != null && result.TreeWarning != "") {
                    $.messager.alert({
                        title: 'BraVo',
                        msg: result.TreeWarning,
                        icon: 'warning',
                        width: 500,
                        height: "auto"
                    });
                }
            } else {
                $.messager.alert({
                    title: 'BraVo',
                    msg: '<span class="text-danger">Er is een fout opgetreden tijdens het uitvoeren van deze bewerking.</span>',
                    icon: 'error',
                    width: 500,
                    height: "auto"
                });
            }
        }).done(function (data, textStatus, jqXHR) {
            window.dispatchEvent(thiz.clonedReportEvent);
        });


    }

    var getDocumentInfo = function (id) { // getDocumentInfo...
        var url = "../WordHtmlConverter/DocumentInfo/";
        $.get(url, { pdcProcessId: id }, function (result) {
            $("#documentInfo").html(result);
            $("#DocumentInformation").modal("show");
        }).done(function (data, textStatus, jqXHR) {
            //window.dispatchEvent(event.data...);
        });
    };

    var addDocument = function () {

        var gridObj = this;
        var postData = $("#documentsForm").serialize();
        var urlform = "../Home/ChosenTemplateSet";
        $.ajax({
            type: "post",
            url: urlform,
            data: postData,
            dataType: "text",
            success: function (result, textStatus) {
                if (result != null && result !== "") {

                    $.when.apply($("#activeDocuments").html(result)).done(function () {
                        initActiveDocumentGrid.call(gridObj);
                        setSortAndPagingHref.call(gridObj, gridObj.refreshUrl);
                        $.messager.show({
                            msg: "Het document op basis van het gekozen sjabloon is aangemaakt.",
                            timeout: 2000,
                            showType: "slide"
                        });
                    });
                }
                else {
                    $.messager.alert({
                        title: "BraVo",
                        msg: "Een fout is opgetreden tijdens het verwerken van deze actie.",
                        icon: "error"
                    });
                }

            }
        });

        return true;
    };

    var deleteDocument = function (processId) {
        var thiz = this;
        if (this.gridType === "ActiveDocuments") {
            $.messager.confirm({
                title: "BraVo",
                msg: '<span class="text-danger"><strong>Weet u zeker dat u het document wilt verwijderen?</strong></span>',
                fn: function (confirmed) {
                    if (confirmed) {
                        var deleteDocumentUrl = "../Case/DeleteDocument/";
                        var postData = { caseId: thiz.caseId, pdcProcessId: processId };
                        $.post(deleteDocumentUrl, postData)
                            .done(function (data) {
                                if (data.state != false) {
                                    thiz.gridData = data;
                                    window.dispatchEvent(thiz.documentDeletedEvent);
                                }
                                else {
                                    $.messager.alert({
                                        title: "BraVo",
                                        msg: data.message,
                                        icon: "error"
                                    });
                                }
                            })
                            .fail(function () {
                                console.log("verwijderen van document is niet gelukt");
                            });
                    }
                    return false;
                }
            });
        }
    };

    var refreshDocumentGrid = function () {
        var thiz = this;
        if (this.gridType === "ActiveDocuments") {

            $.get(this.refreshUrl, { caseId: this.caseId }, function (result) {
                $("#activeDocuments").html(result);
            })
                .done(function () {
                    initActiveDocumentGrid.call(thiz);
                    setSortAndPagingHref.call(thiz, thiz.refreshUrl);
                });
        }

        else if (this.gridType === "FinalizedDocuments") {

            $.get(this.refreshUrl, { caseId: this.caseId }, function (result) {
                $("#finalizedDocuments").html(result);
            })
                .done(function () {
                    initFinalizedDocumentGrid.call(thiz);
                    setSortAndPagingHref.call(thiz, thiz.refreshUrl);
                });
        };

    };


    var openDocumentTab = function (e) {
        e.data.gridObj.selectedDocument.processId = e.srcElement.getAttribute('data-processId');
        e.data.gridObj.selectedDocument.title = e.srcElement.getAttribute('data-title');
        e.data.gridObj.selectedDocument.type = e.srcElement.getAttribute('data-type');
        e.data.gridObj.selectedDocument.documentTypeId = e.srcElement.getAttribute('data-documentTypeId');
        e.data.gridObj.selectedDocument.canView = e.srcElement.getAttribute('data-canview');
        e.data.gridObj.selectedDocument.canEdit = e.srcElement.getAttribute('data-canedit');
        e.data.gridObj.selectedDocument.canDelete = e.srcElement.getAttribute('data-candelete');
        // this only counts for roles eligible for 'canView' but not for 'canEdit'; in that case the default behaviour is to open as 'readonly'
        e.data.gridObj.selectedDocument.viewOnly = (e.data.gridObj.selectedDocument.canView === "True" && e.data.gridObj.selectedDocument.canEdit === "False") ? true : false;
        window.dispatchEvent(e.data.gridObj.documentEditEvent);
    };


    var getFinalizedDocument = function (e) {

        var processId = e.srcElement.getAttribute('data-processId');
        var fileUrl = this.finalizedReportUrl + processId;
        var fileCheckUrl = fileUrl.replace('/ShowFile', '/FileIsReady');

        $.ajax({
            url: fileCheckUrl,
            type: 'GET',
            contentType: 'application/x-www-form-urlencoded; charset=utf-8',
            cache: false,
            async: false
        }).done(function (exits, textStatus, jqXHR) {
            if (exits == true) {
                window.open(fileUrl, "Gefinaliseerd Document");
            }
            else {
                var warning = "De definitieve versie van het document wordt momenteel nog samengesteld, probeer het zo nogmaals. <br/>Neem contact op met de Service Desk als dit probleem blijft bestaan."
                $.messager.alert('BraVo', warning, 'info');
            }
        })
    }


    var initActiveDocumentGrid = function () {
        bindActiveDocumentLinkClickedEvent.call(this);
        bindDocumentsGridRowClickedAndHoverEvent.call(this);
        bindDocumentGridRowContextMenu.call(this);
    };

    var initFinalizedDocumentGrid = function () {
        bindFinalizedDocumentLinkClickedEvent.call(this);
        bindDocumentsGridRowClickedAndHoverEvent.call(this);
        bindDocumentGridRowContextMenu.call(this);
    }


    //public members
    return {
        initialize: initialize,
        getDocumentInfo: getDocumentInfo,
        addDocument: addDocument,
        deleteDocument: deleteDocument,
        bindDocumentInfoClickedEvent: bindDocumentInfoClickedEvent, // todo: make private?
        refreshDocumentGrid: refreshDocumentGrid,
        getClonedDocument: getClonedDocument,
        bindAddDocumentLinkClickedEvent: bindAddDocumentLinkClickedEvent
    };
}();
