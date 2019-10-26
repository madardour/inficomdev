// Author:Dennis
// Implemented the following pattern:
// (Namespaced) Revealing Prototype pattern:
// This component: contains a full list of autocorection elements which is saved in the serverside database.
// The list is a key value pair list


// Set the namespace
var uwvBravo = uwvBravo || {};

// bravoJsTree constructor
uwvBravo.AutocorrectList = function () {
    this._fullList = [];
};

// Methods
uwvBravo.AutocorrectList.prototype = function () {
    //Private functions
  
    //Refreshes the clientside autocorrectlist
    var refreshList = function () {
        var url = "../PrivateAutocorrectList/GetPrivateList";
        // Huidige lijst leegmaken
        this._fullList = null;
        me = this;

        window.progressOverlay.overlayText = "Uw autocorrectielijst wordt opgehaald.";
        
        $.get(url)
            .done(function(returnData) {
                if (returnData !== undefined && returnData !== null) {
                    if (!returnData.succes) {

                        $.messager.alert({
                            title: 'BraVo',
                            msg: '<span class="text-danger">' + returnData.errorMessage + '.</span>',
                            icon: 'error',
                            width: 500,
                            height: "auto"
                        });
                    } else {
                        /*Merge public and private dictionaries*/
                        me._fullList = jQuery.extend(true, {}, uwvBravo.autocorrectPublic);
                        me._fullList = jQuery.extend(true, me._fullList, returnData.contents);
                    }
                }
            })
            .fail(function(xhr, textStatus, errorThrown) {

                $.messager.alert({
                    title: 'BraVo',
                    msg: '<span class="text-danger State: ">' +
                        textStatus +
                        " Error message: " +
                        errorThrown +
                        '.</span>',
                    icon: 'error',
                    width: 500,
                    height: "auto"
                });
            });



    };

  
    //Make private functions public
    return {
        RefreshList: refreshList
    };
}();
