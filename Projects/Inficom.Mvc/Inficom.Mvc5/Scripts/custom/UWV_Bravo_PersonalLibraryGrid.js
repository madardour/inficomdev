// Author: W. Kerkmeijer
// Implemented the following pattern:
// (Namespaced) Revealing Prototype pattern (with 'call'):
// This component is a BRAVO wrapper for the WebGrid controls used for PersonalLibrary grids

// Set the namespace
var uwvBravo = uwvBravo || {};

// PersonalLibrary constructor
uwvBravo.PersonalLibrary = function (gridContainer, options) {
    this.gridParentElement = options.gridParentElement;
    this.gridContainer = gridContainer;
    this.options = options || {}; // options is always an object literal

    // Get/set the defaults:
    this.WebGridObject = options.WebGridObject;

    this.gridType = options.gridType;

    //html elements Id's
    this.gridContainerElement = $("#PersonalLibraryGrid");

    //Url's
    this.refreshUrl = this.gridType === "PersonalLibrary" ? "../PersonalLibrary/PersonalLibraryGrid" : "../PersonalLibrary/Select";

    this.previousLinkElement = options.previousLinkElement || this.gridContainer.find(".gridtable-footer").find("a:contains('<')");
    this.nextLinkElement = options.nextLinkElement || this.gridContainer.find(".gridtable-footer").find("a:contains('>')");

    this.gridData = "";

    // declare events
    this.PersonalLibraryInitializedEvent = document.createEvent('CustomEvent');
    this.PersonalLibraryInitializedEvent.initCustomEvent('PersonalLibraryInitializedEvent', true, true, this);
};


// Create prototype
uwvBravo.PersonalLibrary.prototype = function () {
    //private members
    var initialize = function () {
        if (this.gridType === 'PersonalLibrary') {
            setSortAndPagingHref.call(this, this.refreshUrl);
            initPersonalLibraryGrid.call(this);
        } else if (this.gridType === 'PersonalLibrarySelect') {
            setSortAndPagingHref.call(this, this.refreshUrl);
            initPersonalLibrarySelectGrid.call(this);
        }
    };


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


    var bindPersonalLibraryGridClickAndHoverEvent = function () {
        var gridName;
        if (this.gridType === 'PersonalLibrary') {
            gridName = "PersonalLibraryGrid";
        } else if (this.gridType === 'PersonalLibrarySelect') {
            gridName = "PersonalLibrarySelectGrid";
        }

        $("#" + gridName + " > tbody > tr > td.hoverEff").on('click', { gridObj: this }, function (e, data) {
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
    }

    var bindPersonalLibraryGridSortPagingClickedEvent = function () {
        $('#PersonalLibraryGrid a[data-swhglnk="true"]').on('click', { gridObj: this }, function (e, data) {
            deleteCkeditorInstances('tabPersonalLibrary');
        });
    };

    var initPersonalLibraryGrid = function () {
        webGridDetailRowInit("PersonalLibraryGrid", "CustomTextBlockEdit", "div");
        bindPersonalLibraryGridSortPagingClickedEvent.call(this);
        createCkeditorInstances("tabPersonalLibrary", true, false);
        bindPersonalLibraryGridClickAndHoverEvent.call(this);
    }

    var initPersonalLibrarySelectGrid = function () {
        webGridDetailRowInit("PersonalLibrarySelectGrid", "PersonalLibrarySelect", "div");
        bindPersonalLibraryGridClickAndHoverEvent.call(this);
    }

    var webGridDetailRowInit = function (gridName, subgridName, type) {
        var size = $("#" + gridName + " > thead > tr > th").size(); // get total column
        $("#" + gridName + " > thead > tr > th").last().remove(); // remove last column header
        //add new row and move last column content to the new  row
        $("#" + gridName + " > tbody > tr").each(function (i, el) {
            //mark the parent Row  
            $(this).addClass("parentRow");
            //Now get sub table from last column and add this to the next new added row
            var table = $(type + "[id=" + subgridName + "]", this).parent().html();
            //add new row with this subtable
            $(this).after("<tr class='childRow' style='display:none;'><td style='padding:15px; margin:0px;' colspan='" + (size - 1) + "'>" + table + "</td></tr>");
            $(type + "[id=" + subgridName + "]", this).parent().remove();
        });

    }

    //public members
    return {
        initialize: initialize

    };
}
    ();
