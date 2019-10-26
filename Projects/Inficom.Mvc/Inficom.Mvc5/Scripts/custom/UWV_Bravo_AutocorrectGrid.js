// Author:Dennis
// Implemented the following pattern:
// (Namespaced) Revealing Prototype pattern:
// This component: 


// Set the namespace
var uwvBravo = uwvBravo || {};


// AutocorrectGrid constructor
uwvBravo.AutocorrectGrid = function (gridContainer, options) {
    this.gridParentElement = options.gridParentElement;
    this.gridContainer = gridContainer;
    this.options = options || {}; // options is always an object literal


    // Get/set the defaults:
    this.WebGridObject = options.WebGridObject;

   this.gridType = options.gridType;
    this.gridName = options.gridName;

    //html elements Id's
    this.gridContainerElement = $("#PrivateAutocorrectListGrid");

    //Url's
    this.refreshUrl = "../PrivateAutocorrectList/PrivateAutocorrectListGrid";
    
    this.previousLinkElement = options.previousLinkElement || this.gridContainer.find(".gridtable-footer").find("a:contains('<')");
    this.nextLinkElement = options.nextLinkElement || this.gridContainer.find(".gridtable-footer").find("a:contains('>')");

    this.gridData = "";

    // declare events
    this.CustomGridEvent = document.createEvent('CustomEvent');
    this.CustomGridEvent.initCustomEvent(this.gridName + 'InitializedEvent', true, true, this);

};

// Create prototype
uwvBravo.AutocorrectGrid.prototype = function () {
    //private members
    var initialize = function () {

        initGrid.call(this);
        // window.dispatchEvent(this.PersonalLibraryInitializedEvent);
    };

    var initGrid = function () {

        setSortAndPagingHref.call(this, this.refreshUrl);
        webGridDetailRowInit("PrivateAutocorrectListGrid", "privateAutoCorrectWord", "div");

        if (this.doSort)
            bindGridSortPagingClickedEvent.call(this);

        createCkeditorInstances("tabPrivateAutoCorrect", true, false);
        bindGridClickAndHoverEvent.call(this);
        //bindGridDetailRowClickedEvent.call(this);

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

    var bindGridClickAndHoverEvent = function () {
        var gridName = this.gridName;
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

    };


    //var bindGridDetailRowClickedEvent = function () {

    //    gridName = this.gridName;

    //    $("#" + gridName + " > tbody > tr td.hoverEff").on('click', {
    //        gridObj: this
    //    }, function (e, data) {
    //        $(this).parent().closest("tr").next().slideToggle(100);
    //        $(this).toggleClass("expanded collapsed");
    //    });
    //};


    var bindGridSortPagingClickedEvent = function () {
        $('#PersonalLibraryGrid a[data-swhglnk="true"]').on('click', {
            gridObj: this
        }, function (e, data) {
            deleteCkeditorInstances('tabPersonalLibrary');
        });
    };

    // calls the Create new action which should return a create new screen
    var addAutocorrectfragment = function () {
        $('#mainPrivateAutocorrectList').toggleClass("hideAddNewpanel showAddNewpanel");
        $('#addnewPanelPrivateAutocorrectList').toggleClass("hideAddNewpanel showAddNewpanel");
        $('#adNewAutocorrectfragmentLink').attr('disabled', false);

        var url = "../PrivateAutocorrectList/CreateNew";

        $.post(url)
                .done(function (returnData) {
                    $("div[id=newPrivateAutocorrectListDiv]").html(returnData);

                }).fail(function (xhr, textStatus, errorThrown) {
                    $.messager.alert('BraVo', xhr.responseText, 'error');
                });

    }

    // Calls the save create action
    var createPrivateAutocorrectList = function () {
        var autocorrectKeyWord = $('#paKeyword_new').val().toLowerCase();
        var autocorrect = $('#paValue_new').val();
        var data = { keyword: autocorrectKeyWord, value: autocorrect };
        postToAutocorrectList.call(this, "../PrivateAutocorrectList/Create", data, "CREATE");
    }

    // Calls the save edit action
    var updatePrivateAutocorrectList = function (wordId) {
        var autocorrectKeyWord = $('#paKeyword_' + wordId).val().toLowerCase();
        var autocorrect = $('#paValue_' + wordId).val();
        var data = { id: wordId, keyword: autocorrectKeyWord, value: autocorrect };
        postToAutocorrectList.call(this, "../PrivateAutocorrectList/Edit", data, "UPDATE");
    }

    // Calls the delete action with given Id
    var deleteAutocorrectfragment = function (id) {
        var url = "../PrivateAutocorrectList/Delete";
        $.post(url, { id: id }, function (returnData) {
            $("div[id=PrivateWordListContent]").html(returnData);
            PrivateAutocorrectListGrid.initialize();

            if (CombinedAutocorrectList)
                CombinedAutocorrectList.RefreshList();
        });
    };

    var postToAutocorrectList = function (url, data, modus) {
        data = addRequestVerificationToken(data);

        $.post(url, data)
                   .done(function (returnData) {
                       if (returnData !== undefined && returnData !== null) {
                           if (returnData.state !== undefined && returnData.state !== null) {

                               $.messager.alert({
                                   title: 'BraVo',
                                   msg: '<span class="text-danger">' + returnData.message + '.</span>',
                                   icon: 'error',
                                   width: 500,
                                   height: "auto"
                               });

                           } else {
                               if (modus == "CREATE") {
                                   $('#mainPrivateAutocorrectList').toggleClass("hideAddNewpanel showAddNewpanel");
                                   $('#addnewPanelPrivateAutocorrectList').toggleClass("hideAddNewpanel showAddNewpanel");
                               }

                               $("div[id=PrivateWordListContent]").html(returnData);
                               PrivateAutocorrectListGrid.initialize();
                           }
                       }
                   })
                   .fail(function (xhr, textStatus, errorThrown) {
                       $('#textblockeditor').html(xhr.responseText);
                   })
                     .always(function () {
                         if (CombinedAutocorrectList)
                             CombinedAutocorrectList.RefreshList();
                     });
    };

    //public members
    return {
        initialize: initialize,
        DeleteAutocorrectfragment: deleteAutocorrectfragment,
        AddAutocorrectfragment: addAutocorrectfragment,
        CreatePrivateAutocorrectList: createPrivateAutocorrectList,
        UpdatePrivateAutocorrectList: updatePrivateAutocorrectList
    };
}
();




