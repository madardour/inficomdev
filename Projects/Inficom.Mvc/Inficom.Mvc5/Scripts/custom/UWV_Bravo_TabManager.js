
// Author: W. Kerkmeijer
// This Control library builds on easyui tabs control

// Set the namespace
var uwvBravo = uwvBravo || {};

// bravoTabManager constructor
uwvBravo.TabManager = function (jQObj, settings) {
    this.jqObject = jQObj;
    this.bravoElement = jQObj[0] ? document.getElementById(jQObj[0].id) : null;
    this.caseId = settings.caseId || undefined;

    // Easyui tab panel options
    this.selectedPanelsettings = {
        id: null,
        title: 'no tab is selected',
        content: 'default',
        href: 'someUrlToLoadRemoteContent',
        cache: true,
        iconCls: null,
        width: 'auto',
        height: 'auto',
        collapsible: false,
        disabled: false,

        // Some (easyui tab) added properties
        closeable: false,
        selected: false
    }

    this.settings = settings || {}; // (TabManager) settings is always an object literal

    this.selectedTabDocument = {
        canEdit: "false",
        saveAndClose: "false"
    };
    this.tabDocuments = [];
    this.CloseDocumentUrl = this.settings.CloseDocumentUrl || "../WordHtmlConverter/CloseDocument";

    // Get/set the defaults: (for TabManager container)
    this.width = settings.width || 'auto';
    this.height = settings.height || 'auto';
    this.plain = settings.plain || false;
    this.fit = settings.fit || false;
    this.border = settings.border || true;
    this.scrollIncrement = settings.scrollIncrement || 100;
    this.scrollDuration = settings.scrollDuration || 400;
    this.tools = settings.tools || []; // (an array of objects)
    this.toolPosition = settings.toolPosition || 'right'; //(left/right)
    this.tabPosition = settings.tabPosition || 'top'; //(top/bottom/left/right)
    this.headerWidth = settings.headerWidth || 150;
    this.tabWidth = settings.tabWidth || 'auto';
    this.tabHeight = settings.tabHeight || 27;
    this.selected = settings.selected || 0; // The initialized selected tab index
    this.showHeader = settings.showHeader || true;
    this.justified = settings.justified || false;
    this.narrow = settings.narrow || false; //Remove space between tabs?
    this.pill = settings.pill || false; // Make tabstrips llok like pills?

    this.tabManagerTabContentLoadedEvent = document.createEvent('CustomEvent');
    this.tabManagerTabContentLoadedEvent.initCustomEvent('tabManagerTabContentLoadedEvent', true, true, this);

    this.tabManagerTabClosedEvent = document.createEvent('CustomEvent');
    this.tabManagerTabClosedEvent.initCustomEvent('tabManagerTabClosedEvent', true, true, this);

    this.tabManagerTabUpdatedEvent = document.createEvent("CustomEvent");
    this.tabManagerTabUpdatedEvent.initCustomEvent("tabManagerTabUpdatedEvent", true, true, this);

};

// Create prototype
uwvBravo.TabManager.prototype = function () {
    //private members
    var initialize = function () {


        var thiz = this;

        thiz.jqObject.tabs({
            width: thiz.width,
            height: thiz.height,
            plain: thiz.plain,
            fit: thiz.fit,
            border: thiz.border,
            scrollIncrement: thiz.scrollIncrement,
            scrollDuration: thiz.scrollDuration,
            tools: thiz.tools,
            toolPosition: thiz.toolPosition,
            tabPosition: thiz.tabPosition,
            headerWidth: thiz.headerWidth,
            tabWidth: thiz.tabWidth,
            tabHeight: thiz.tabHeight,
            selected: thiz.selected,
            showHeader: thiz.showHeader,
            justified: thiz.justified,
            narrow: thiz.narrow,
            pill: thiz.pill,
            onLoad: function (p) { // Fires when an ajax tab panel finishes loading remote data
                window.dispatchEvent(thiz.tabManagerTabUpdatedEvent);
            },
            onSelect: function (title, index) {
                // Fires when user selects a tab panel.
                tabManagerTabSelected.call(thiz, title);
                //alert("onSelect: " + thiz.jqObject.tabs('getSelected', index).panel('options').title);
            },
            onUnselect: function (title, index) { // Fires when user unSelects a tab panel.
                //$(window).unbind("modalWindowInitializedEvent"); //Quickfix for event firing endlessly; refactor with other javascript on this page
                //alert("onUnselect: " + title + "==> " + index);
            },
            onBeforeClose: function (title, index) { // Fires before tab panel is closed; return false to cancel this action.

                var tabId = thiz.getTab(index).panel("options").id ? thiz.getTab(index).panel("options").id : null;
                var processId = tabId ? tabId.slice(3) : "isCalculation";
                if (processId === "isCalculation") {
                    return true; // close tab without maintaining state collection
                }
                thiz.select(index); //Otherwise selected document will be closed (index can be of other document)
                var closingBravoDoument = thiz.returnMatchingTabDocumentsFromCollection(processId);
                if (closingBravoDoument != undefined && closingBravoDoument[0] != undefined) {
                    //check if document treeview is changed
                    if (closingBravoDoument[0].linkedTreeview != undefined) {
                        if (closingBravoDoument[0].linkedTreeview.stateChanged === true) {
                            $.messager.alert({
                                title: "BraVo",
                                msg:
                                    '<span class="text-danger"><strong>Let op: Structuur van het document is gewijzigd</strong></span></br> Druk eerst op de Klaar-knop om uw keuze te bevestigen',
                                icon: "error",
                                width: 400
                            });
                            return false;
                        }
                    };

                    var readOnly = (closingBravoDoument[0].options.canEdit) ? closingBravoDoument[0].options.canEdit.toUpperCase() != "TRUE" : true;
                    getCorrectMessager.call(thiz, index, tabId, processId, title, readOnly);
                };
                return false; // prevent from closing
            },
            onClose: function (title, index) { // Fires when user closed a tab panel.
                //Go to first (default tab)
                thiz.select(0); //safer than:thiz.select('Documenten');
                //window.dispatchEvent(thiz.tabManagerTabClosedEvent);
            },
            onAdd: function (title, index) { // Fires when a new tab panel is added.

                //added afterwards a title to close button
                var addedTab = thiz.getTab(index).panel("options");
                if (addedTab && addedTab.tab) {
                    $(addedTab.tab).find('a.tabs-close').prop('title', 'Document afsluiten');
                }

            },
            onUpdate: function (title, index) { //Fires when a tab panel is updated.
                //alert('onUpdate: ' + title + " = " + index);
            },
            onContextMenu: function (e, title, index) { // Fires when a tab panel is right clicked.
                e.preventDefault(); // eliminates browser contextMenu...
                //alert('onContextMenu: ' + title + " = " + index + "; " + e);
            }
        });



        //other initialization  events
        bindTabsEvents.call(this);
    };

    var getCorrectMessager = function (index, tabId, processId, title, readOnly) {
        var thiz = this;
        var dlg;
        // todo: time did not permit to optimize code; could be refactored to one instance of messager.confirm, optionally removing the 'Opslaan' button
        if (!readOnly) {
            var message = '<div class="message-question">Wilt u het document opslaan of afsluiten?</div>' +
                '<div class="message-body"><span class="text-info">' +
                title +
                " </span></div>";

            dlg = $.messager.confirm({
                title: 'BraVo',
                msg: message,
                buttons: [{
                    text: 'Opslaan',
                    onClick: function () {
                        dlg.dialog('destroy');
                        thiz.selectedTabDocument.saveAndClose = "true";
                        thiz.selectedTabDocument.saveDocumentDataToBravoDb(thiz.selectedTabDocument); // then tab close (Forced)
                        window.dispatchEvent(thiz.selectedTabDocument.reportRegeneratedEvent);
                    }
                }, {
                    text: 'Afsluiten',
                    onClick: function () {
                        dlg.dialog('destroy');
                        if (tabId && processId) {
                            // todo WK: due to new storage/sync mechanism with pdc (only sync on create, structurechange, and finalize), this call might be obsolete
                            $.post(thiz.CloseDocumentUrl, { pdcProcessId: processId, viewOnly: readOnly })
                                .done(function (data) {
                                    thiz.close.call(thiz, title, true);
                                });
                        }
                        else {
                            thiz.close.call(thiz, title, true);
                        }
                    }
                }, {
                    text: 'Annuleren',
                    onClick: function () {
                        dlg.dialog('destroy');
                    }
                }]
            });
        }
        else {
            dlg = $.messager.confirm({
                title: 'BraVo',
                msg: 'Wilt u volgend document afsluiten? </br> <span class="text-info">' + title + '</span>',
                width: 400,
                buttons: [{
                    text: 'Afsluiten',
                    onClick: function () {
                        dlg.dialog('destroy');
                        if (tabId && processId) {
                            $.post(thiz.CloseDocumentUrl, { pdcProcessId: processId, viewOnly: readOnly })
                                .done(function (data) {
                                    thiz.close.call(thiz, title, true);
                                });
                            //$(window).load(thiz.CloseDocumentUrl, { pdcProcessId: processId, date: Date.now() }); //description: this.selectedDocument.caseId
                        }
                        else {
                            thiz.close.call(thiz, title, true);
                        }
                    }
                }, {
                    text: 'Annuleren',
                    onClick: function () {
                        dlg.dialog('destroy');
                    }
                }]
            });
        }
    };

    //#region Easyui tabs methods
    var options = function () {
        return this.jqObject.tabs('options');
    };

    var tabs = function () {
        return this.jqObject.tabs('tabs');
    };

    var resize = function () {
        //?
    };

    var add = function (options) {
        var thiz = this;
        var url;
        switch (options.type) {
            case "Beoordelingsgegevens": {
                url = "../Calculation/MainPage/caseId=" + thiz.caseId;
                $.get(url, function (result) {
                    //Create the Tab
                    var panelOptions = {
                        title: options.title,
                        content: result,
                        iconCls: "glyphicon glyphicon-th",
                        selected: true
                    }
                    //tabManager.add(panelOptions);
                    thiz.jqObject.tabs("add", panelOptions);
                });
            }
                break;

            case 'report': {
                // waiting on new tab to be created...
                url = "../WordHtmlConverter/Rapportage";
                var jqXhrGetReport = getReportTab(url, thiz, options);
                $.when(jqXhrGetReport).then(window.dispatchEvent(thiz.tabManagerTabContentLoadedEvent)); // only refresh AFTER user has seen the warning (so he understand what's going on);
            }
                break;

            default: return "crapRequest";
        }
    };

    var getReportTab = function (url, tabmanager, options) {
        var thiz = tabmanager;
        return $.get(url,
            {
                pdcProcessId: options.pdcProcessId,
                title: options.title,
                documentTypeId: options.documentTypeId,
                viewOnly: options.viewOnly,
                removeLock: options.removeLock
            })
            .done(function (result, textStatus, responseJqXhr) {
                if (result !== "" && typeof (result) == "object" && result.CanOpenReport === false) {
                    if (result.ReportExists === false) {
                        $.messager.alert({ title: "BraVo", msg: result.ErrorMessage, icon: "error", width: "auto", height: "auto" });
                    }
                    else if (result.OpenInOtherSession === true) {
                        var dlg = $.messager.confirm({
                            title: 'BraVo',
                            msg: '<div>' + result.ErrorMessage + '</div>',
                            width: 400,
                            buttons: [
                                {
                                    text: 'Ja',
                                    id: 'btn-ja',
                                    onClick: function () {
                                        dlg.dialog('destroy');
                                        options.removeLock = true;
                                        getReportTab(url, thiz, options);
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
                    }
                    else {
                        $.messager.alert({ title: "BraVo", msg: result.ErrorMessage, icon: "error", width: "auto", height: "auto" });
                    }

                }
                else {
                    var resultv = result;
                    var statev = textStatus;
                    var responseJqXhrv = responseJqXhr;

                    thiz.selectedTabDocument.panelOptions = { // todo: check if this needs to be included as a prop of either BRAVO_Document or TabManager...
                        title: options.title,
                        content: result,
                        iconCls: "glyphicon glyphicon-tasks",
                        id: "tb_" + options.pdcProcessId,
                        selected: true,
                        closable: true
                    };
                    thiz.selectedTabDocument.canEdit = Boolean(options.viewOnly) === true ? !options.viewOnly : options.canEdit;
                    thiz.jqObject.tabs("add", thiz.selectedTabDocument.panelOptions);

                    tabManagerTabContentLoaded.call(thiz);
                }
            })
            .fail(function (result, textStatus, responseJqXhr) {
                var resultv = result;
                var statev = textStatus;
                var responseJqXhrv = responseJqXhr;

            });
    };

    var close = function (titleOrIndex, forcedClose) {
        if (!forcedClose) {
            //Close the tab ( in case of signDocument)
            this.jqObject.tabs("close", titleOrIndex);
        }
        else {

            //prevent confirmationmessage, so forceclose
            var opts = this.options();
            var bc = opts.onBeforeClose;
            opts.onBeforeClose = function () { };

            var closingBravoDoument = this.returnMatchingTabDocumentsFromCollectionByTitle(titleOrIndex);
            if (closingBravoDoument != undefined && closingBravoDoument[0] != undefined) {
                closingBravoDoument[0].close();

                this.removeFromTabDocumentCollection.call(this, closingBravoDoument[0]);
                if (this.selectedTabDocument.processId === closingBravoDoument[0].processId) {
                    this.selectedTabDocument = {};
                }
            }
            var thiz = this;

            $.when(this.jqObject.tabs("close", titleOrIndex)).then(function () {
                opts.onBeforeClose = bc; // restore the event function
                window.dispatchEvent(thiz.tabManagerTabClosedEvent);
            });
        }
    };

    var getTab = function (titleOrIndex) {
        return this.jqObject.tabs("getTab", titleOrIndex);
    };

    var getTabIndex = function (tab) {
        return this.jqObject.tabs("getTabIndex", tab);
    };

    var getSelected = function () {
        return this.jqObject.tabs("getSelected");
    };

    var select = function (titleOrIndex) {
        this.jqObject.tabs("select", titleOrIndex);
    };

    // todo: easyui tab: unSelect t/m hideTool

    var exists = function (titleOrIndex) {
        return this.jqObject.tabs("exists", titleOrIndex);
    };

    var update = function (tab, type, panelOptions) { // type: 'header', 'body' or 'all'
        var thiz = this;

        if (tab) {
            thiz.jqObject.tabs("update", {
                tab: tab,
                type: type,
                options: {
                    id: panelOptions.id,
                    tite: panelOptions.title,
                    href: panelOptions.href,
                    loadingMessage: "Laden...."
                }
            });

        }

    };
    //#endregion

    //#region BRaVo custom tab functions
    var returnMatchingTabDocumentsFromCollection = function (selectedTabDocumentProcessId) {
        var result = $.grep(this.tabDocuments, function (e) {
            return (e.processId && e.processId === selectedTabDocumentProcessId);
        });
        return result;
    };

    var returnMatchingTabDocumentsFromCollectionByTitle = function (selectedTabDocumentTitle) {
        var result = $.grep(this.tabDocuments, function (e) {
            return (e.title && e.title === selectedTabDocumentTitle);
        });
        return result;
    };

    var addToTabDocumentCollection = function (selectedTabDocument) { //todo(low): pass as param or retrieve from constructor?
        var matchFound = returnMatchingTabDocumentsFromCollection.call(this, selectedTabDocument.processId);
        if (matchFound.length === 0) { // add the new selectedTabDocument to the collection
            this.tabDocuments.push(selectedTabDocument);
        }
        else if (matchFound.length === 1) { // update...
            var index = this.tabDocuments.indexOf(matchFound[0]);
            this.tabDocuments[index] = selectedTabDocument;
        }
        else {
            // todo:
        }
    };

    var removeFromTabDocumentCollection = function (selectedTabDocument) {
        var matchFound = returnMatchingTabDocumentsFromCollection.call(this, selectedTabDocument.processId);
        if (matchFound.length === 0) { // not removed
            console.log('no matching document could be removed');
            return;
        }
        else if (matchFound.length === 1) { // remove...
            var index = this.tabDocuments.indexOf(matchFound[0]);
            this.tabDocuments.splice(index, 1);
        }
        else {
            // todo:
        }
    };

    var tabManagerTabContentLoaded = function () {
        var doc = this.selectedTabDocument;
        if (doc.processId != undefined) {
            var match = returnMatchingTabDocumentsFromCollection.call(this, doc.processId);
            //If document does not exist in tabCollection then create it and add to collection
            if (match.length === 0) {
                this.selectedTabDocument = new uwvBravo.Document($("#section1_" + doc.processId), {
                    isMainReport: true,
                    processId: doc.processId,
                    title: doc.title,
                    type: "report",
                    canEdit: doc.canEdit,
                    previewButtonId: "previewDoc_" + doc.processId,
                    saveButtonId: "saveDoc_" + doc.processId,
                    regenerateButtonId: "regenerateDoc_" + doc.processId,
                    signButtonId: "signDoc_" + doc.processId,
                    counterSignButtonId: "counterSignDoc_" + doc.processId
                });
                this.addToTabDocumentCollection(this.selectedTabDocument);
            };

            var tabManagerObj = this;
            // Initialize the document
            $.when(this.selectedTabDocument.initialize()).then(function () {
                window.dispatchEvent(tabManagerObj.tabManagerTabContentLoadedEvent);
            });
        }
    };

    var tabManagerTabSelected = function (selectedTabTitle) {
        var thiz = this;
        var tab = thiz.jqObject.tabs("getTab", selectedTabTitle);
        var tabId = tab ? tab[0].id : "";
        var type = "body";
        var url;
        var options;

        this.selectedPanelsettings.title = selectedTabTitle;

        switch (selectedTabTitle) {
            case "Documenten":
                {
                    if (tabId === "") {
                        url = "../Case/GetCaseOverview/?caseId=" + this.caseId;
                        options = { id: "documentenTabId", title: selectedTabTitle, href: url };
                        update.call(thiz, tab, type, options);
                    }
                }
                break;

            case "Alle gegevens":
                {
                    if (tabId === "") {
                        url = "../Case/GetCaseInfo/?caseId=" + thiz.caseId;
                        options = { id: "alleGegevensTabId", title: selectedTabTitle, href: url };
                        update.call(thiz, tab, type, options);
                    }
                }
                break;

            case "Beoordelingsgegevens":
                {
					if (tabId === "") {
						url = "../Calculation/MainPage/?caseId=" + thiz.caseId;
						options = { id: "berekeningenTabId", title: selectedTabTitle, href: url };
						update.call(thiz, tab, type, options);
					}
                }
                break;


            default: //report
                {
                    //set the 'selectedDocument' (only documentTabs get a processId and tabid)
                    //var tabId = thiz.jqObject.tabs('getSelected').panel('options').id || '';
                    if (tabId !== "") {
                        if (tabId.startsWith("tb_")) {
                            var processId = tabId.slice(3);
                            var match = thiz.returnMatchingTabDocumentsFromCollection(processId);

                            if (match.length === 0) {

                                var canEdit = thiz.selectedTabDocument.canEdit;
                                //Create new selectedTabDocument
                                var selectedTabDocumentOptions = {
                                    parentProcessId: undefined,
                                    processId: processId,
                                    title: selectedTabTitle,
                                    type: 'report',
                                    saveButtonId: 'saveDoc_' + processId,
                                    previewButtonId: 'previewDoc_' + processId,
                                    regenerateButtonId: 'regenerateDoc_' + processId,
                                    signButtonId: 'signDoc_' + processId,
                                    counterSignButtonId: 'counterSignDoc_' + processId,
                                    canEdit: canEdit
                                };
                                thiz.selectedTabDocument =
                                    new uwvBravo.Document($("#section1_" + selectedTabDocumentOptions.processId),
                                        selectedTabDocumentOptions);
                                thiz.addToTabDocumentCollection(thiz.selectedTabDocument);
                            } else if (match.length === 1) {
                                thiz.selectedTabDocument = match[0];
                            }
                        }
                    } else {
                        //current selectedTabDocument is a process, so clear/unbind? current.
                        thiz.selectedTabDocument = {};
                    }
                }

        } //end switch



    }

    //#endregion

    //#region Easyui tabs methods
    var bindTabsEvents = function () {

        //destroy al created popover
        $("html").on("click", function (e) {
            $('[data-toggle="popover"], [data-table-toggle="popover"] ').each(function () {
                //the 'is' for buttons that trigger popups
                //the 'has' for icons within a button that triggers a popup
                if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $(".popover").has(e.target).length === 0) {
                    $(this).popover("hide");
                }
            });
        });
    }

    //#endregion




    //public members
    return {
        initialize: initialize,
        addToTabDocumentCollection: addToTabDocumentCollection,
        removeFromTabDocumentCollection: removeFromTabDocumentCollection,
        returnMatchingTabDocumentsFromCollection: returnMatchingTabDocumentsFromCollection,
        returnMatchingTabDocumentsFromCollectionByTitle: returnMatchingTabDocumentsFromCollectionByTitle,
        //closeTab: closeTab,
        // Easyui tabs methods
        options: options,
        tabs: tabs,
        resize: resize,
        add: add,
        close: close,
        getTab: getTab,
        getTabIndex: getTabIndex,
        getSelected: getSelected,
        select: select,
        exists: exists,
        update: update

    };
}();
