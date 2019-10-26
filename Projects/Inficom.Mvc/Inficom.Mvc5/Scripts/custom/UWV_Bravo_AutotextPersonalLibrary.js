// Author: Peter / Dennis / Rachid
// Implemented the following pattern:
// (Namespaced) Revealing Prototype pattern:
// This component: 

// Set the namespace
var uwvBravo = uwvBravo || {};

//Persoonlijke Bibliotheek
uwvBravo.PersonalLibraryTitleList = function () {
    this._fullList = [];
}

uwvBravo.PersonalLibraryTitleList.prototype = function () {

    var refreshList = function () {
        var thiz = this;
        var url = "../PersonalLibrary/GetPersonalLibraryItems"

        // Huidige lijst leegmaken
        thiz._fullList = null;

        $.get(url)
            .done(function (returnData) {
                if (returnData !== undefined && returnData !== null) {
                    if (!returnData.succes) {

                        $.messager.alert({
                            title: 'BraVo',
                            msg: '<span class="text-danger">' + returnData.errorMessage + '.</span>',
                            icon: 'error',
                            width: 500,
                            height: "auto"
                        });
                    }
                    else {
                        //example result: [{id: 1,name: 'aa'},{id: 2,name: 'bb'},....]
                        if (returnData.contents != "") {
                            thiz._fullList = returnData.contents;
                        }
                    }
                }
            })
    }

    return {
        RefreshList: refreshList
    };
}();
