// Author: W. Kerkmeijer
// Implemented the following pattern:
// (Namespaced) Revealing Prototype pattern (with 'call'):
// This component is a BRAVO wrapper for the WebGrid controls used for ActiveDocuments and FinalizedDocuments


// Set the namespace
var uwvBravo = uwvBravo || {};

// bravoJsTree constructor
uwvBravo.WerkgeverGrid = function (gridContainer, options) {
    this.gridContainer = gridContainer;
    this.parentGridName = options.parentGridName;

    this.indexCijfer = options.indexCijfer || false;

    this.options = options || {}; // options is always an object literal

    // Get/set the defaults:
    this.WebGridObject = options.WebGridObject;
    this.gridSortingOptions = {
        dir: "",
        col: "",
        header: ""
    };
    this.gridType = options.gridType;
    this.gridData = "";

    this.contextMenu = {};

    this.parentGridElement = function () {
        if (this.parentGridName) return $("#" + this.parentGridName);
        return undefined;
    }

    this.popoverElements = function () {
        if (this.parentGridElement()) return $('#' + this.parentGridName + " a[data-toggle='popover']");
        return undefined;
    }

    this.caseId = function () {
        var caseId = window.tabManager.caseId || null; //todo: refactor this 'tight coupling' (get from constructor params)
        return caseId;
    };

    this.header = undefined;
    this.nestedTableCount = 0;

    this.IndexCijfersManager = {};

    this.selectedRowId = undefined;
    this.selectedIkv = {
        ikvId: '',
        datumBegin: '',
        datumEinde: '',
        naam: '',
        loonheffingenNummer: '',
        ongeindexeerdMml: '',
        maatmanloon: '',
        maatmanOmvang: '',
        indexCijfers: {
            indexCijferAanvangRefertePeriode: {
                baseJaar: '',
                indexCijfer: '',
                jaar: '',
                maand: ''
            },
            indexCijferHuidig: {
                baseJaar: '',
                indexCijfer: '',
                jaar: '',
                maand: ''
            }
        },
        bron: ''
    };

    //Maatgevend ikv / iko
    this.selectedRowsCount = function (rowId) {
        if (this.parentGridElement == undefined) return 0;
        var selector;
        if (rowId == undefined) {
            selector = this.parentGridElement().find('input[type="checkbox"]:checked');            
        } else {
            selector = this.parentGridElement().find("table[name=inkomstenopgaven_" + rowId + "]").find('input[type="checkbox"]:checked');
        }
        return selector != undefined ? selector.length : 0;
    }

    // declare events
    this.werkgeverGridInitializedEvent = document.createEvent('CustomEvent');
    this.werkgeverGridInitializedEvent.initCustomEvent('werkgeverGridInitializedEvent', true, true, this);


    this.werkgeverGridDeleteIkvEvent = document.createEvent("CustomEvent");
    this.werkgeverGridDeleteIkvEvent.initCustomEvent("DeleteIkvEvent", true, true, this);

    this.werkgeverGridEditIkvEvent = document.createEvent("CustomEvent");
    this.werkgeverGridEditIkvEvent.initCustomEvent("EditIkvEvent", true, true, this);

};

// Create prototype
uwvBravo.WerkgeverGrid.prototype = function () {

    var bindWerkgeverGridRowContextMenu = function () {
        var thiz = this;
        var showContextMenu = true;
        var selector = $("#" + thiz.parentGridName);

        $.contextMenu({
            selector: "#" + thiz.parentGridName + " .context-menu-wggrid",
            trigger: 'left',
            delay: 100,
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
                thiz.selectedIkv = {
                    ikvId: $trigger.attr('id')
                }

                var options = {
                    callback: function (key, options) {
                        switch (key) {
                            case "delete":
                                getDeleteMessager.call(thiz, thiz.selectedIkv.ikvId);
                                break;
                            case "edit":
                                thiz.parentGridElement()[0].dispatchEvent(thiz.werkgeverGridEditIkvEvent);
                                break;
                        }
                    },
                    items: {
                        "delete": {
                            icon: function (opt, $itemElement, itemKey, item) {
                                $itemElement.html('<a class="context-menu-icon-delete">Verwijderen</a> ' + opt.selector);
                                return true;
                            }
                        },

                        "edit": {
                            icon: function (opt, $itemElement, itemKey, item) {
                                $itemElement.html('<a class="context-menu-icon-edit">Bewerken</a> ' + opt.selector);
                                return true;
                            }
                        }


                    },
                    position: function (opt, x, y) {
                        opt.$menu.position({
                            my: 'center top',
                            at: 'center bottom',
                            of: opt.$trigger
                        });
                    }
                }
                return options;
            }
        });
    };

    var getDeleteMessager = function (ikvId) {
        var thiz = this;
        dlg = $.messager.confirm({
            //title: 'Weet u zeker dat u deze inkomstenverhouding wil verwijderen?',
            title: 'BraVo',
            msg: '<div>Weet u zeker dat u deze inkomstenverhouding wil verwijderen?</div><span class="text-danger"> Let op: Als u deze verwijdert dan worden de resultaten van de berekening ook verwijderd.</span>',
            width: 400,
            buttons: [{
                text: 'Ja',
                onClick: function () {
                    dlg.dialog('destroy');

                    thiz.selectedRowId = ikvId;
                    thiz.parentGridElement()[0].dispatchEvent(thiz.werkgeverGridDeleteIkvEvent);
                }
            }, {
                text: 'Nee',
                onClick: function () {
                    dlg.dialog('destroy');
                }
            }]
        });
    };


    var setGridSortingOptions = function () {
        // Set arrows for sorting 
        var dir = this.gridSortingOptions.dir;
        var col = this.gridSortingOptions.col;

        if (col === "") {
            col = "Titel";
        }

        var header = $("#" + this.gridContainer[0].id + " th a[href*=" + col + "]");

        if (col === "LastSaved") {
            col = "Laatst opgeslagen";
        }

        if (dir === "Ascending") {
            header.text(col + " ▲");
        }
        if (dir === "Descending") {
            header.text(col + " ▼");
        }
        // End Set arrows
    }

    //#region create a nested grid for each Parent Row two child grids
    var bindwerkgeverIkvGridSortPagingClickedEvent = function () {
        $("#werkgeverIKV a[data-swhglnk=\"true\"]").on("click", { gridObj: this }, function (e, data) {
            event.preventDefault();
        });
    };

    var bindInkomstenVerhoudingenGridDetailRowClickedEvent = function () {

        $("#" + this.parentGridName + " > tbody > tr > td.hoverEff").on('click', { gridObj: this }, function (e, data) {
            //find current row parent, and slideToggle alle childRows until next row with parentRow Style
            $(this).parent().nextUntil("tr.parentRow").slideToggle(20);

            //toggle the current selected row
            var $trigger = $(this).find("a[name='expandRow']");
            if ($trigger) {
                $trigger.toggleClass("expanded collapsed")
                var title = "Details weergeven";
                if ($trigger.hasClass('expanded')) {
                    title = 'Details verbergen';
                }
                $trigger.attr('title', title);

            }
        });

    };

    var bindInkomstenVerhoudingenCheckClickedEvent = function () {        
        // set view mode on checkbox click
        $("#" + this.parentGridName + " > tbody > tr > td > input[type='checkbox']").on('click', { gridObj: this }, function (e, data) {
            setViewModeIkv.call(this);
        });
    };

    var webGridDetailRowInit = function () {        

        var size = $("#" + this.parentGridName + " > thead > tr >th").length; // get count of columns

        this.nestedTableCount = $("#" + this.parentGridName + " > tbody > tr:eq(0) > td > table").length; // get count nested tables --> table[webGridDetailRowInit] deleted

        for (var a = 0; a <= this.nestedTableCount - 1; a++) {
            $("#" + this.parentGridName + " > thead > tr > th").last().remove();// remove last columns header
        }

        $("#" + this.parentGridName + " > tbody > tr").each(function (i, el) {
            //mark the parent Row en add glyphicon by rows with childs 
            $(this).addClass("parentRow");
            var thiz = $(this);
            var subgrids = $(this).find("td > table[data-isnestedgrid=\"true\"]"); //Get the nested (child) table
            //add a new row with content of nested table
            jQuery.each(subgrids.get().reverse(), function (index, item) {

                if (this.className !== "emptyChildTable")
                    thiz.after("<tr class='childRow' style='display:none;' ><td></td><td style='padding:5px; margin:0px;' colspan='" + (size - 1) + "'>" + item.outerHTML + "</td></tr>");

                //remove the old column nested table
                $("table[id=" + escapeIdForJSF(item.id) + "]", thiz).parent().remove();
            });

        });

        // set view mode on page load
        $("#" + this.parentGridName + " > tbody > tr > td > input[type='checkbox']").each(function () {
            setViewModeIkv.call(this);
        });

        $("tr#calcultionButtons").appendTo("#MaatManLoongrid > tbody");
    }
    //#region nested grid


    //create popover instances for Werkgever 
	var initWerkgeverPopover = function () {

		$(this.popoverElements()).on('click', { gridObj: this }, function (e, data) {
			$(e.data.gridObj.popoverElements()).not(this).popover("hide");

			var infoElement = $(this);
			var loonheffingnr = infoElement.data("id");

			var url = "../Case/GetWerkgeversGegevens";
			$.get(url, { loonheffingnr: loonheffingnr }
				, function (response) {
					infoElement.unbind("click").popover("destroy").popover({
						html: true,
						container: "body",
						trigger: "hover",
						content: response
					}).popover("show");

				});

		});
	};

    // disable IKO's when checkbox is unchecked.
    var setViewModeIkv = function () {
        var ikvRow = $(this).closest('tr');
        if (this.checked) {
            ikvRow.find("select").removeAttr("disabled");
            ikvRow.find("input[name$='AantalGewerkteTijdvakken'], input[name$='AantalTijdvakken']").removeAttr("readonly"); 

            ikvRow.nextUntil("tr.parentRow").find("input[type='checkbox']").removeAttr("disabled");
			ikvRow.nextUntil("tr.parentRow > table > tr > td > ").find("input[name$='Toelichting'], input[name$='WerkUren']").removeAttr("readonly");

        }
        else {            
			ikvRow.find("select").attr("disabled", true).removeClass('input-validation-error');
			ikvRow.find("input[name$='AantalGewerkteTijdvakken'], input[name$='AantalTijdvakken']").attr("readonly", true);
			ikvRow.find("input[name$='AantalGewerkteTijdvakken'], input[name$='AantalTijdvakken']").removeClass('input-validation-error');

			//remove red border if ikv is deselected
			ikvRow.find("div[class='indexcijfers accentBorderColor']").removeClass("accentBorderColor");

            ikvRow.nextUntil("tr.parentRow").find("input[type='checkbox']").attr("disabled", true);
			ikvRow.nextUntil("tr.parentRow > table > tr > td > ").find("input[name$='Toelichting'], input[name$='WerkUren']").attr("readonly", true);
		}
    };

    // IndexCijfers handling
    var createInstanceIndexCijfersManager = function () {
        var indexCijfersOptions = { parentContainerName: this.parentGridName, validateIndexCijfersDatum: true, parentObject : this };
        this.IndexCijfersManager = new uwvBravo.IndexCijfers(indexCijfersOptions);
        this.IndexCijfersManager.initialize();
    }

    var bepaalIndexcijfers = function () {
        this.IndexCijfersManager.bepaalIndexcijfers.call(this.IndexCijfersManager);
    }


    //#endregion

    var initWerkgeverGrid = function () {
        webGridDetailRowInit.call(this);
        bindInkomstenVerhoudingenGridDetailRowClickedEvent.call(this);
        bindInkomstenVerhoudingenCheckClickedEvent.call(this);
        bindwerkgeverIkvGridSortPagingClickedEvent.call(this);
        initWerkgeverPopover.call(this);
        bindWerkgeverGridRowContextMenu.call(this);
    }


    //private members
    var initialize = function () {
        initWerkgeverGrid.call(this);

        if (this.indexCijfer) {
            createInstanceIndexCijfersManager.call(this);
        }

    };

    //public members
    return {
        initialize: initialize,
        bepaalIndexcijfers: bepaalIndexcijfers,
        setViewModeIkv: setViewModeIkv
    };
}();
