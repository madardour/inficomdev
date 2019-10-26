// Set the namespace
var uwvBravo = uwvBravo || {};

// bravoClaculation constructor
uwvBravo.Base = function (options) {

    //region properties

    this.options = options || {}; // options is always an object literal
    this.caseId = options.caseId || undefined;
    this.upaServiceOffline = options.upaServiceOffline || undefined;
    this.userWithMultipleRole = options.userWithMultipleRole || undefined;

    this.homePageRefresh = false;
    this.sessionTimeOut = false;
    this.observerBusy = false;

    //#endregion
    //Create global tabManager instance
    var tabManagerOptions = { border: true, narrow: false, caseId: this.caseId };
    window.tabManager = new uwvBravo.TabManager($('#tt'), tabManagerOptions); // no var declaration on purpose: tabManager is global
    //Create global progressOverlay instance
    var overlayOptions = { jqContainer: $('#progressContainer'), typeOfOverlay: 'progress' };
    window.progressOverlay = new uwvBravo.CustomOverlay(overlayOptions);
}

uwvBravo.Base.prototype = function () {

    //#region private methodes


    //#region ajax calls 
    var LogOff = function () {
        //close the opened tabs
        CloseAllTab.call(this);
        //unbind windows events
        $(window).off("beforeunload");
        $(window).off("unload");
        //stop Overlay
        window.progressOverlay.ShowOverlay(false);
        var location = getBaseUrl();
        if (this.sessionTimeOut) {
            //Redirect to SessionTime Contoller
            location += "/Error/SessionTimeout";
            window.location.href = location;
            //window.location.href = BASE_URL + "Error/SessionTimeout";
        }
        else {
            //Redirect to Account / logOut Contoller
            location += "/Account/LogOff";
            window.location.href = location;
            //window.location.href = BASE_URL + "Account/LogOff";
        }
    };

    var CloseDocument = function (processId, readOnly) {
        var url = "..//WordHtmlConverter/CloseDocument";
        var data = { pdcProcessId: processId, viewOnly: readOnly };
        $.ajax({
            url: url,
            data: data,
            type: 'POST',
            contentType: 'application/x-www-form-urlencoded; charset=utf-8',
            cache: 'false',
            success: function (result) {
                //alert('process is closed');
            },
            error: function (jqXhr, textStatus, errorThrown) {
                console.log(JSON.stringify(jqXhr));
                console.log("AJAX error: " + textStatus + ' : ' + errorThrown);
            }
        });
    }

    //#endregion


    //#region tabs functions
    function CloseAllTab() {
        var tabManager = window.tabManager;
        if (tabManager) {
            if (tabManager.tabDocuments) {
                for (var i = 0; i < tabManager.tabDocuments.length; i++) {
                    var readOnly = (tabManager.tabDocuments[i].options.canEdit) ? tabManager.tabDocuments[i].options.canEdit.toUpperCase() != "TRUE" : true;
                    CloseDocument(tabManager.tabDocuments[i].options.processId, readOnly);
                }
            }
        }
    };

    //#endregion


    // Refresh (active and finalized) document grids
    var refreshDocumentGrids = function () {
        activeDocumentsGrid.refreshDocumentGrid();
        finalizedDocumentGrid.refreshDocumentGrid();
        //activeDocumentsGrid init button has to be rebound as well
        activeDocumentsGrid.bindAddDocumentLinkClickedEvent.call(activeDocumentsGrid);
    };

    // Select/ add the tab for the chosen process
    var selectOrAddTab = function (tabOptions) {
        //processId, title, type
        if (window.tabManager.exists(tabOptions.title)) {
            window.tabManager.select(tabOptions.title);
            return;
        }
        window.tabManager.add(tabOptions);
    };


    var setActivePersonalLibraryTab = function (mode) {
        switch (mode) {
            case "manage":
                $('#tabPersonalLibrary').tabs('disableTab', 1);
                $('#tabPersonalLibrary').tabs('select', 0);
                break;
            case "insert":
                //select tab 1
                $('#tabPersonalLibrary').tabs('enableTab', 1);
                $('#tabPersonalLibrary').tabs('select', 1);
                break;
            case "autoCorrectie":
                //select tab 2
                $('#tabPersonalLibrary').tabs('disableTab', 1);
                $('#tabPersonalLibrary').tabs('select', 2);
                break;

        }
    }

    /* Message  Upa-GegevensNatuurlijkPersoon*/
    var displayUpaServiceOfflineMessage = function (message) {
        if (message) {
            $.messager.alert({
                title: 'BraVo',
                msg: '<div style="width:400px"><span class="text-danger"><strong>Let op: Ophalen van Client persoonsgegevens is mislukt.</strong></span> </br> <span>' + message + '</span></div>',
                icon: 'error',
                width: 400
            });
        }
    }

    /* Message  Upa-GegevensNatuurlijkPersoon*/
    var displayMultipleRoleMessage = function (message) {
        if (message) {
            $.messager.alert({
                title: 'BRaVo',
                msg: '<div style="width:480px"><span>Er zijn meerdere rollen gevonden in Active Directory.</span> </br> <span>' + message + '</span></div>',
                icon: 'info'
            });

            this.userWithMultipleRole = undefined;
        }
    }


    // Attach the event keypress to exclude the F5 refresh
    var HandlekeyPressEvent = function (e) {
        var thiz = this;
        if (e == undefined) return false;
        if ((e.which || e.keyCode) === 116) {
            thiz.homePageRefresh = true;
        }
    };
    //#endregion 

    //#region catch dispatched events from nestedComponents
    var bindDispatchedEvents = function () {
        //Initialize current object
        var thiz = this;

        //#region global ajax
        $(document).ajaxSend(function (evt, xhr, settings) {
            if (settings.url.indexOf("ClientIsConnected") == -1) {
                window.progressOverlay.ShowOverlay(true);
            }
        });

        // invoked when sending ajax completed
        $(document).ajaxComplete(function (evt, xhr, settings) {
            //progressOverlay.ShowOverlay(false);
        });

        //To fix the same caching problem when using jQuery
        $.ajaxSetup({
            cache: false
        });

        $(document).ajaxStop(function (evt, xhr, settings) {
            window.progressOverlay.ShowOverlay(false);
        });

        $(document).ajaxError(function (event, jqxhr, settings, thrownError) {
            var msg = (jqxhr.responseText) ? jqxhr.responseText : "Niet gespecificeerde error";
            var jsonMessage;
            var message = msg;
            try {
                jsonMessage = JSON.parse(msg);
                if (jsonMessage) {
                    if (jsonMessage.message) {
                        message = jsonMessage.message;
                    }
                }

            } catch (ex) {
                //message cannot be parsed for infopath error
                message = (jqxhr.statusText) ? jqxhr.statusText : thrownError;
            }

            $.messager.alert({
                title: "BraVo",
                msg:
                    "<div class='message-container'> " +
                    "<div class='message-title'>" +
                    "<span>Onderstaande fout is opgetreden, neem contact op met de servicedesk als dit probleem blijft bestaan.</span>" +
                    "</div>" +
                    "<div class='message-body text-justify alert-danger'>" +
                    "<span>" + message + "</span>" +
                    "</div>" +
                    " </div>"
                ,
                icon: "error",
                fn: function () {
                    if (jqxhr.status === 502) {
                        $(window).off("beforeunload");
                        $(window).off("unload");
                        window.location.href = "";
                    }
                    if (jqxhr.status === 504) {
                        thiz.sessionTimeOut = true;
                        LogOff.call(thiz);
                    }
                }
            });

        });

        //#endregion


        //bind logOff click event
        $('#logOff').bind('click', function (e) {
            LogOff.call(thiz);
        });
        //Orchestrate component events


        //#region Catch Refresh and close Browser

        $(window).on("keydown", function (evt) {
            HandlekeyPressEvent.call(thiz, evt);
        });

        $(window).bind('beforeunload', function (evt) {
            return "BraVo \n" + "Wilt u deze site verlaten? Wijzigingen die u hebt aangebracht worden mogelijk niet opgeslagen.";
        });

        $(window).bind('unload', function (evt) {
            if (!thiz.homePageRefresh) {
                LogOff.call(thiz);
            } else {
                CloseAllTab.call(thiz);
            }
        });

        //endregion

        $(window).on("documentDeletedEvent", function (e, data) {
            $(e.originalEvent.detail.gridParentElement).html(e.originalEvent.detail.gridData);
            window.activeDocumentsGrid.initialize();
            window.activeDocumentsGrid.bindAddDocumentLinkClickedEvent.call(window.activeDocumentsGrid);
        });

        $(window).on("documentEditEvent", function (e, data) {
            var pdcProcessId = e.originalEvent.detail.selectedDocument.processId;
            var title = e.originalEvent.detail.selectedDocument.title;
            var type = e.originalEvent.detail.selectedDocument.type;
            var documentTypeId = e.originalEvent.detail.selectedDocument.documentTypeId;
            var canEdit = e.originalEvent.detail.selectedDocument.canEdit;
            var viewOnly = e.originalEvent.detail.selectedDocument.viewOnly;

            var tabOptions = {
                pdcProcessId: pdcProcessId,
                title: title,
                type: type,
                documentTypeId: documentTypeId,
                canEdit: canEdit,
                viewOnly: viewOnly,
                removeLock: false
            };
            selectOrAddTab(tabOptions);
        });

        // event for initializing a new Document instance
        $(window).on("tabManagerTabUpdatedEvent", function (e, data) {

            var selectedTabTitle = e.originalEvent.detail.selectedPanelsettings.title;

            switch (selectedTabTitle) {
                case "Documenten": //Home tab

                    // Create activeDocumentsGrid instance
                    var activeDocumentsOptions = {
                        gridType: 'ActiveDocuments', caseId: thiz.caseId, gridParentElement: $("#activeDocuments")
                    };

                    window.activeDocumentsGrid = new uwvBravo.DocumentGrid($('#ActiveDocumentDiv'), activeDocumentsOptions); // no var declaration on purpose: grid is global
                    window.activeDocumentsGrid.initialize();

                    // Create finalizedDocumentGrid instance
                    var finalizedDocumentsOptions = { gridType: 'FinalizedDocuments', caseId: thiz.caseId };
                    window.finalizedDocumentGrid = new uwvBravo.DocumentGrid($('#FinalizedDocumentDiv'), finalizedDocumentsOptions); // no var declaration on purpose: grid is global
                    window.finalizedDocumentGrid.initialize();

                    // todo WK: convert into component... Create personalTextblockManager
                    window.CombinedAutocorrectList = new uwvBravo.AutocorrectList();
                    window.CombinedAutocorrectList.RefreshList();

                    window.SearchListPeronalLibrary = new uwvBravo.PersonalLibraryTitleList();
                    window.SearchListPeronalLibrary.RefreshList();

                    var personalLibraryOptions = {
                        title: 'Persoonlijke bibliotheek',
                        contentUrl: "../PersonalLibrary/Index",
                        isDraggable: false,
                        disableOkBtn: true,
                        disableToonTekstBtn: true,
                        AnnuleerBtnText: "Afsluiten"
                    };

                    window.personalTextLibraryManager = new uwvBravo.BootstrapModal($('#personalLibrary'), personalLibraryOptions); // todo: change jqObject

                    break;

                case "Alle gegevens":
                    return false;
                    break;

                case "Beoordelingsgegevens":
                    var calculationsManagerOptions = { container: "#calculation" };
                    window.calculationsManager = new uwvBravo.CalculationsManager(calculationsManagerOptions);
                    window.calculationsManager.initialize();

                    break;
            }


        });

        // event for initializing a new Document instance
        $(window).on("tabManagerTabContentLoadedEvent", function (e, data) {

            //refresh the activeDocumentsGrid
            window.activeDocumentsGrid.refreshDocumentGrid();
            //refresh the activeDocumentsGrid binding
            window.activeDocumentsGrid.bindAddDocumentLinkClickedEvent.call(window.activeDocumentsGrid);

        });

        $(window).on("documentInitializedEvent", function (e, data) {
            //alert("id of button Klaar: " + tabManager.selectedTabDocument.regenerateButtonId);
            //create a reference to this button from the Bravo_jstree component
        });

        // event tabManagerTabClosedEvent
        $(window).on("tabManagerTabClosedEvent", function (e, data) {
            window.activeDocumentsGrid.refreshDocumentGrid();
        });

        $(window).on("documentFinalizedEvent", function (e, data) {

            $.when($.ajax(window.tabManager.close.call(window.tabManager, e.originalEvent.detail.title, true))).then(function () {

                if (typeof (lockOverlay) != "undefined") {
                    lockOverlay.ShowOverlay(false, 'lock');
                }
                refreshDocumentGrids();
                //export Document Metadata
                //e.originalEvent.detail.exportDocumentMetaData(e.originalEvent.detail);
            });
        });

        $(window).on("reportRegeneratedEvent", function (e, data) {
            var currentDocument = e.originalEvent.detail;
            if (!currentDocument.isMainReport()) return false;
            if (currentDocument.saveAndClose !== "true") return false;

            window.tabManager.close.call(window.tabManager, currentDocument.title, true);
            if (typeof currentDocument.parentProcessId == "undefined" && !currentDocument.finalize) {
                $.messager.show({
                    msg: 'De wijzigingen zijn in het document opgeslagen:</br> <span class="text-info">' + currentDocument.title + "</span>",
                    timeout: 2000,
                    showType: "slide"
                });
            }
        });


        $(window).on("derivedReportRegeneratedEvent clonedReportEvent", function (e, data) {
            refreshDocumentGrids();
        });

        $(window).on("modalWindowClosedEvent", function (e, data) {

            if (e.originalEvent.detail.tsprocessId) {
                window.tabManager.selectedTabDocument.selectedSubDocument = {};
            }
        });

        $(window).on("modalWindowBeforeClosedEvent", function (e, data) {

            switch (e.originalEvent.detail.bravoElementId) {
                case 'personalLibrary':
                    deleteCkeditorInstances("tabPersonalLibrary");
                    break;
                case 'vtBibliotheek':
                    deleteCkeditorInstances("content_vtBibliotheek");
                    break;
                default:
                    console.log('modalWindowBeforeClosedEvent default.');
            }

        });

        $(window).on("modalWindowInitializedEvent", function (e) {
            e.originalEvent.detail.reloadcontent();
        });

        $(window).on("modalWindowContentLoadedEvent", function (e) {

            switch (e.originalEvent.detail.bravoElementId) {
                case 'personalLibrary':
                    var optionsPlTab = { border: true, narrow: false };
                    window.tabManagerPL = new uwvBravo.TabManager($('#tabPersonalLibrary'), optionsPlTab); // no var declaration on purpose: tabManager is global
                    window.tabManagerPL.initialize();

                    setActivePersonalLibraryTab(e.originalEvent.detail.PersonalLibraryMode);

                    var personalLibraryGridOptions = { gridType: 'PersonalLibrary' };
                    window.PersonalLibraryGrid = new uwvBravo.PersonalLibrary($('#PersonalLibraryDiv'), personalLibraryGridOptions); // todo: change jqObject
                    window.PersonalLibraryGrid.initialize();

                    var personalLibraryGridSelectOptions = { gridType: 'PersonalLibrarySelect' };
                    window.PersonalLibrarySelectGrid = new uwvBravo.PersonalLibrary($('#PersonalLibrarySelectDiv'), personalLibraryGridSelectOptions); // no var declaration on purpose: grid is global

                    window.PersonalLibrarySelectGrid.initialize();

                    // Added for autocorrect maintenance
                    var privateAutocorrectListGridOptions = {
                        gridType: 'PrivateAutocorrectList',
                        gridName: 'PrivateAutocorrectListGrid'
                    };
                    window.PrivateAutocorrectListGrid = new uwvBravo.AutocorrectGrid($('#PrivateAutocorrectListDiv'), privateAutocorrectListGridOptions); // no var declaration on purpose: grid is global
                    window.PrivateAutocorrectListGrid.initialize();

                    console.log('personalLibrary.');
                    break;


                case 'ds_diagnosecode':
                    InitDiagnosecodesPopup();
                    console.log('ds_diagnosecode.');
                    break;


                case 'vtBibliotheek':
                    createCkeditorInstances('content_vtBibliotheek', false, true);
                    console.log('vtBibliotheek.');
                    break;


                default:

                    //in case of ts popup (subdocument) check first if tsprocessId exist
                    if (e.originalEvent.detail.tsprocessId) {
                        var parentDocument = window.tabManager.selectedTabDocument;

                        autogrowInit("#D_" + e.originalEvent.detail.tsprocessId);
                        //Add the Document
                        var selectedSubDocumentOptions = {
                            regenerateButtonId: "regenerateDoc_ts",
                            saveButtonId: "saveDoc_ts",
                            parentProcessId: e.originalEvent.detail.processId,
                            processId: e.originalEvent.detail.tsprocessId,
                            isPdcDocument: e.originalEvent.detail.isPdcDocument,
                            title: e.originalEvent.detail.title,
                            parentDocument: parentDocument,
                            type: 'subreport'
                        }

                        parentDocument.selectedSubDocument = new uwvBravo.Document($("#D_" + e.originalEvent.detail.tsprocessId), selectedSubDocumentOptions);
                        parentDocument.selectedSubDocument.initialize();
                    }

            }
        });
    }

    // https://developer.mozilla.org/nl/docs/Web/API/MutationObserver
    var bindDomListner = function (checkInterval) {
        var thiz = this;
        var minInterval = 10000;
        $('base').attr('timestamp', new Date().getTime());
        MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
        checkInterval = parseInt(checkInterval, 10) || 0;

        if (checkInterval == 0) {
            return;
        }

        checkInterval = checkInterval < minInterval ? minInterval : checkInterval;
        var observer = new MutationObserver(function (mutations) {
            if (thiz.observerBusy) {
                return;
            }
            thiz.observerBusy = true;

            var timeDif = new Date().getTime() - $('base').attr('timestamp');
            if (timeDif > checkInterval) {

                $('base').attr('timestamp', new Date().getTime());

                $.ajax({
                    url: "../Home/ClientIsConnected",
                    type: 'GET',
                    contentType: 'application/json',
                    cache: false,
                    async: true
                }).done(function (data, textStatus, jqXHR) {
                    // Client is connected
                    thiz.observerBusy = false;
                }).fail(function (jqXhr, textStatus, errorThrown) {
                    if (jqXhr.status != 504) {
                        jqXhr.responseText = null;
                        jqXhr.status = 502;
                        jqXhr.statusText = "Uw computer is de verbinding met de Bravo server kwijtgeraakt. Eventuele wijzigingen kunnen niet meer worden opgeslagen. </br>Start Bravo opnieuw vanuit de aanroepende applicatie. Neem contact op met de Service Desk als dit probleem blijft bestaan."
                    }
                });
            }
            else {
                thiz.observerBusy = false;
            }
        });

        observer.observe($(".mainContainer")[0], {
            subtree: true,
            attributes: true,
            attributeFilter: ["class"]
        });
    }
    //#endregion


    //#region private function
    function nth_occurrence(string, char, nth) {
        var first_index = string.indexOf(char);
        var length_up_to_first_index = first_index + 1;

        if (nth == 1) {
            return first_index;
        } else {
            var string_after_first_occurrence = string.slice(length_up_to_first_index);
            var next_occurrence = nth_occurrence(string_after_first_occurrence, char, nth - 1);

            if (next_occurrence === -1) {
                return -1;
            } else {
                return length_up_to_first_index + next_occurrence;
            }
        }
    }

    function getBaseUrl() {
        var url = location.href;

        var start = 0;

        var end = nth_occurrence(url, '/', 5);
        if (end < 0) end = url.length - start;

        var baseUrl = url.substring(start, end);
        return baseUrl;
    }


    //#endregion


    //#region initialisation component

    var initialize = function () {


        bindDispatchedEvents.call(this);

        //tabManager
        window.tabManager.initialize();

        //Message
        displayUpaServiceOfflineMessage(this.upaServiceOffline);
        displayMultipleRoleMessage(this.userWithMultipleRole);

        // fired when a mutation occurs
        bindDomListner.call(this, CONN_INTERVAL);

        //Create user settings
        //var userSettingsOptions = { title: 'Gebruikers instellingen', contentUrl: "../Account/GetUserSettings", isDraggable: false };
        //userSettingsPopup = new uwvBravo.BootstrapModal($("#userPreferences"),userSettingsOptions);

    };

    //#endregion initialisation component


    //#region public members
    return {
        initialize: initialize
    };

    //#endregion public members
}();