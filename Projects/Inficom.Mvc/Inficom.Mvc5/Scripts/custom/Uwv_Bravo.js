

var uwvBravo = uwvBravo || {};

// Todo: refactoren; Dit is nu een vergaarbak voor als je nog geen definitieve plaats hebt voor je JavaScript.

//#region Ckeditor functions //todo: there is a new control for this: uwvBravo.ckEditorManager. Remove this regio after all dependent code is using that control...

//Update the ckeditor textarea to serialize the form content
function createCkeditorInstances(divId, personalLibrary, isReadOnly) {

    $("div[id=" + divId + "]").find("textarea").each(function () {
        var instance = CKEDITOR.instances[$(this).attr("id")];
        if (!instance) {
            CKEDITOR.inline(this,
                {
                    removeButtons: personalLibrary ? "variableHistory,personalLibrary" : "",
                    //removePlugins: isReadOnly ? 'toolbar' : "",

                    on: {
                        instanceReady: function (evt) {
                            ckeditorInstanceReady(evt, isReadOnly);
                                                            
                        }
                    }

                }
            ).on("change", function (ev) {
                document.getElementById(ev.editor.name).textContent = ev.editor.getData();
                document.getElementById(ev.editor.name).value = ev.editor.getData();
            });
        }
    });

};

function updateCkeditorInstances(divId) {
    //update all textarea from ckeditor control
    $("div[id=" + divId + "]").find('textarea').each(function () {
        var thiz = $(this);
        var element = CKEDITOR.dom.element.get(this);
        if (element.getEditor()) {
            var ckelement = element.getEditor();
            $(thiz).html(ckelement.getData());
            ckelement.updateElement();
        }
    });
};


var ckeditorInstanceReady = function (evt, isReadOnly) {
    var oEditor = evt.editor;
    oEditor.updateElement();
    var data = oEditor.getData();
    var ckeTextArea = document.getElementById(oEditor.name);
    if (ckeTextArea) ckeTextArea.textContent = data;
    $(evt.editor.element.$).removeAttr("title");
    oEditor.setReadOnly(isReadOnly);
}

function deleteCkeditorInstances(divId) {
    $("div[id=" + divId + "]").find('textarea').each(function () {
        var instance = CKEDITOR.instances[$(this).attr("id")];
        if (instance) {
            instance.destroy(true);
        }
    });
};
//#endregion

//#region AutoGrow
var autogrowInit = function (containerId) {
    $(containerId).find('input:text').each(function () {
        $(this).autoGrowInput({ minWidth: 30, comfortZone: 5 });
        // get initial value
        var valueInit = $(this).val();
        // on focus
        $(this).focus(function () {
            $(this).removeClass('inputted');
        });
        // on blur
        $(this).change(function () {
            var valueCur = $(this).val();
            if (valueCur === '') {
                $(this).val(valueInit);
            } else {
                $(this).addClass('inputted');
            }
        });
    });
};

//#endregion

//#region SideBarAndAccordion
function expandSidebar(menuId) {

    //toggle the div container class
    $('#' + menuId).toggleClass("toggled-2").toggleClass("toggled-1");

    //select the trigger anchor span with header text
    var spanTrigger = $('#' + menuId + ' a[title="Menu invouwen/uitvouwen"] span.headerlink');
    //set the toggled text
    $(spanTrigger).text($(spanTrigger).text() == 'Menu invouwen' ? 'Menu uitvouwen' : 'Menu invouwen');

    //toggle the glyphicon
    $('#' + menuId + ' i.toggle-arrow-uwv').toggleClass("glyphicon-arrow-right").toggleClass("glyphicon-arrow-left pull-right");

    //collapse/expand the accordion 
    $('#' + menuId + ' div.collapse').toggleClass("collapse in").toggleClass("collapse");
}

//#endregion


function InsertPlInDocument(textblockId) {
    //Grab the selected text
    //update the ckeditor textarea (vt_)
    var vtSection = window.personalTextLibraryManager.vtSection;

    if (vtSection) {
        var editor = CKEDITOR.instances[vtSection];
        if (editor) {
            var selectedText = $("#ctb_" + textblockId).html();
            editor.fire("insert", selectedText);
        }
    }
}

function addTextfragment(fragmentteller) {
    if (fragmentteller > 200) {
        $('#adNewLink').attr('disabled', true);
        $.messager.alert({
            title: 'BRaVo',
            msg: '<span class="text-danger">Er mogen maar 200 fragmenten worden toegevoegd.</span>',
            icon: 'info',
            width: 400,
            style: {
                right: '',
                top: document.body.scrollTop + document.documentElement.scrollTop + 2 * $('div.container').height(),
                bottom: ''
            }
        });
        return false;

    } else {
        $('#mainPersonalLibrary').toggleClass("hideAddNewpanel showAddNewpanel");
        $('#addnewPanel').toggleClass("hideAddNewpanel showAddNewpanel");
        $('#adNewLink').attr('disabled', false);
        var url = "../PersonalLibrary/CreateNew";
        $.post(url)
            .done(function (returnData) {
                $('#newPersonalLibraryDiv').html(returnData);
                createCkeditorInstances("CustomTextBlockCreate", true, false);
            }).fail(function (xhr, textStatus, errorThrown) {
                $.messager.alert('BraVo', xhr.responseText, 'error');
            });
    }
    return false;
}


function persoonlijkebibliotheekInit(selectie) {
    window.personalTextLibraryManager.PersonalLibraryMode = selectie;
    window.personalTextLibraryManager.reloadcontent();
    window.personalTextLibraryManager.show();
};


function closeAdnewTab(typeTab) {

    switch (typeTab) {
        case "personalLibrary":

            $('#mainPersonalLibrary').toggleClass("hideAddNewpanel showAddNewpanel");
            $('#addnewPanel').toggleClass("hideAddNewpanel showAddNewpanel");

            deleteCkeditorInstances("CustomTextBlockCreate");
            break;
        case "privateAutocorrectList":

            $('#mainPrivateAutocorrectList').toggleClass("hideAddNewpanel showAddNewpanel");
            $('#addnewPanelPrivateAutocorrectList').toggleClass("hideAddNewpanel showAddNewpanel");
    }

}
function savePersonalLibrary(action, customTextBlockId) {

    if (!customTextBlockId) customTextBlockId = "new";

    var customtextTitle = $('#plTitle_' + customTextBlockId).val();
    var customtext = $('#plUserText_' + customTextBlockId).val().replace(/(\r\n|\n|\r|\t|&lrm;)/gm, ""); //replaces all 3 types of line breaks with a space and tabs charachters

    var url = "", data = {};

    switch (action) {
        case "editmode":
            data = { textBlockId: customTextBlockId, textBlockName: customtextTitle, customTextBlock: customtext };
            data = addRequestVerificationToken(data);
            url = "../PersonalLibrary/Edit";
            break;
        case "addNewmode":
            data = { textBlockName: customtextTitle, customTextBlock: customtext };
            data = addRequestVerificationToken(data);
            url = "../PersonalLibrary/Create";
    }

    if (url != "") {
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
                    }
                    else {
                        switch (action) {
                            case "editmode":
                                deleteCkeditorInstances('tabPersonalLibrary');
                                //personalTextLibraryManager.reloadcontent();
                                break;
                            case "addNewmode":
                                $('#addnewPanel').toggleClass("hideAddNewpanel showAddNewpanel");
                                $('#mainPersonalLibrary').toggleClass("hideAddNewpanel showAddNewpanel");
                                deleteCkeditorInstances('tabPersonalLibrary');
                            //personalTextLibraryManager.reloadcontent();

                        }
                        $("div[id=PersonalLibraryContent]").html(returnData);
                        PersonalLibraryGrid.initialize();
                    }
                }
            })
            .fail(function (xhr, textStatus, errorThrown) {
                $('#textblockeditor').html(xhr.responseText);
            })
            .always(function () {
                if (SearchListPeronalLibrary)
                    SearchListPeronalLibrary.RefreshList();
            });
    }
}

function deletePersonalLibrary(id) {
    var url = "../PersonalLibrary/Delete";
    $.get(url, { customTextBlockId: id }, function (result) {
        deleteCkeditorInstances("tabPersonalLibrary");
        personalTextLibraryManager.reloadcontent();
        SearchListPeronalLibrary.RefreshList();
    });
    if (SearchListPeronalLibrary)
        SearchListPeronalLibrary.RefreshList();
};

function searchPersonalLibrary() {
    var criteria = $('#searchCriteria').val();
    var url = "../PersonalLibrary/Filter";
    $.get(url, { searchCriteria: criteria }, function (result) {
        if (result) {
            deleteCkeditorInstances('PersonalLibraryDiv');
            $('#PersonalLibraryContent').html(result);
            PersonalLibraryGrid.initialize();
        }
    });
}

function searchPersonalLibrarySelect() {
    var criteria = $('#searchCriteria2').val();
    var url = "../PersonalLibrary/FilterSelect";
    $.get(url, { searchCriteria: criteria }, function (result) {
        if (result) {
            deleteCkeditorInstances('PersonalLibrarySelectDiv');
            $('#PersonalLibrarySelectContent').html(result);
            PersonalLibrarySelectGrid.initialize();
        }
    });
}

function filterTextBlocks(chk) {
    if (chk.checked) {
        $("#variablehistory > table[data-toggle='0']").hide();
        if ($("#variablehistory > table[data-toggle='1']").length == 0) {
            $("#NoDataFound").show();
        }
    }
    else {
        $("#variablehistory > table[data-toggle='0']").show();
        $("#NoDataFound").hide();
    }
}

function addRequestVerificationToken(data) {
    data.__RequestVerificationToken = $('input[name=__RequestVerificationToken]').val();
    return data;
}

function InitDiagnosecodesPopup() {

    procesDiagnoseCodesFromDocument();

    $('#btnToevoegen').attr('disabled', true);

    $("#txt_directeInvoer").on("input propertychange", function () {
        setFormState();
    }).focus();

    $("#ddl_diagnoseCodeSections").change(function () {
        var selectedDiagnosecode = $("#ddl_diagnoseCodeSections").val();
        setFormState();

        if (selectedDiagnosecode === "") selectedDiagnosecode = 0;
        $("#ddl_diagnoseCode").load('../DiagnoseCode/GetDiagnosecodes?selectedDiagnosecode=' + selectedDiagnosecode);
    });

    $("#ddl_oorzaakCodes").change(function () {
        setFormState();
    });

    $("#ddl_diagnoseCode").change(function () {
        setFormState();
    });


    $("#btnToevoegen").click(function () {

        var frm = $("#frmVindDiagnoseCode");
        frm.validate();
        if (!frm.valid())
            return;

        var searchCode = $("#txt_directeInvoer").val().trim();

        if (searchCode != "") {
            var url = "..//DiagnoseCode/GetDiagnosecode";
            var data = { searchCode: searchCode };
            $.ajax({
                url: url,
                data: data,
                type: 'POST',
                contentType: 'application/x-www-form-urlencoded; charset=utf-8',
                cache: 'false',
                success: function (result) {
                    if (result.succes) {
                        addDiagnoseToTable(result.obj.Id, result.obj.Code, result.obj.Omschrijving);
                    } else {
                        $.messager.alert({
                            title: "BRaVo",
                            msg: result.errorMessage,
                            icon: "error",
                            fn: function () { setFormState('error'); }
                        });   
                    }
                },
                error: function (jqXhr, textStatus, errorThrown) {
                    $.messager.alert({
                        title: "BRaVo",
                        msg: errorThrown,
                        icon: "error",
                        fn: function () { setFormState('error'); }
                    });   
                }
            });
        } else {
            var oorzaakCode = $("#ddl_oorzaakCodes").val();
            var diagnoseCode = $("#ddl_diagnoseCode").val();
            var diagnoseCodeText = $("#ddl_diagnoseCode option:selected").text();
            var diagnoseText = diagnoseCodeText.substring(4, diagnoseCodeText.length).trim();
            addDiagnoseToTable(oorzaakCode, diagnoseCode, diagnoseText);
        }

        return false;
    });

    $("#diagnoseresultaat").on('click', '.remCF', function () {
        $(this).parent().parent().remove();
    });

    function setFormState(event) {

        var selectionIsTxt = ($("#txt_directeInvoer").val().trim() != "");
        var oorzaakCodes = $("#ddl_oorzaakCodes").val();
        var diagnoseCodeSections = $("#ddl_diagnoseCodeSections").val();
        var diagnoseCodes = $("#ddl_diagnoseCode").val();

        var ddlSelected = ((oorzaakCodes != "") || (diagnoseCodeSections != "") || (diagnoseCodes != ""));
        var selectionIsDdl = ((oorzaakCodes != "") && (diagnoseCodeSections != "") && (diagnoseCodes != ""));
        var ddlPanel = $('#formDropdowns');
        var txtPanel = $("#formTextbox");

        if (selectionIsTxt && event == 'error') {
            $("#txt_directeInvoer").focus();
        } else if (selectionIsTxt && event == 'success') {            
            $("#txt_directeInvoer").val("").focus();
            ddlPanel.find("label").removeClass("disabled");
            ddlPanel.find("select").attr("disabled", false);            
        } else if (selectionIsTxt) {
            ddlPanel.find("label").addClass("disabled");
            ddlPanel.find("select option:first-child").attr("selected", "selected");
            ddlPanel.find("select").attr("disabled", true);
        }
        else if (ddlSelected) {
            txtPanel.find("label").addClass("disabled");
            txtPanel.find("input").attr("disabled", true);                    
        } else {
            txtPanel.find("label").removeClass("disabled");
            txtPanel.find("input").attr("disabled", false);
            ddlPanel.find("label").removeClass("disabled");
            ddlPanel.find("select").attr("disabled", false);
        }

        $('#btnToevoegen').attr('disabled', !(selectionIsDdl || selectionIsTxt));

        return;
    }

    function addDiagnoseToTable(oorzaakCode, diagnoseCode, diagnoseText) {
        var chosenCodes = [];
        var $trNew;
        var $chosenCodestable = $("#resultfields tbody tr");
        var $trLast = $("#resultfields tr:last");

        if ($chosenCodestable.length === 10) {
            $.messager.alert({
                title: "BRaVo",
                msg: "<span class=\"text-danger\">Er mogen maximaal 10 diagnose codes toegevoegd worden.</span>",
                icon: "info",
                fn: function () { setFormState('error'); }
            });
            setFormState('error');
            return false;
        };

        chosenCodes.push(oorzaakCode);
        chosenCodes.push(diagnoseCode);
        chosenCodes.push(diagnoseText);

        var flag;

        //check if just codediagnose already exists
        $("#resultfields tbody tr").each(function (row, tr) {

            var value = $(tr).find("td:eq(2) input").val();

            if (value === chosenCodes[1]) {
                flag = true;
                return false;
            }

        });

        if (flag) {
            $.messager.alert({
                title: "BRaVo",
                msg: "<span class=\"text-danger\">Deze diagnosecode is al ingevoegd.</span>",
                icon: "info",
                fn: function () { setFormState('error'); }
            });            
            return false;
        }

        var rowCount = $chosenCodestable.length;
        if (rowCount === 1 && $trLast.find("input").val() === "#") {
            $trNew = $trLast;
        } else {
            $trNew = $trLast.clone();
            $trLast.after($trNew);
            rowCount = $chosenCodestable.length;
            $trNew.attr("id", "addr" + rowCount);
            $trNew.find("a[id^='MoveUp_addr']").attr("id", 'MoveUp_addr' + rowCount);
            $trNew.find("a[id^='MoveDown_addr']").attr("id", 'MoveDown_addr' + rowCount);

            bindDiagnoseCodesArrows();
        }

        var index;
        var inputs = $trNew.find("input");
        for (index = 0; index < inputs.length; ++index) {
            // deal with inputs[index] element.
            $(inputs[index]).attr({
                'value': chosenCodes[index]
            });
        }

        // reset form controls
        $("#ddl_oorzaakCodes").val($('#ddl_oorzaakCodes').prop('defaultSelected'));
        $('#ddl_diagnoseCodeSections').val($('#ddl_diagnoseCodeSections').prop('defaultSelected'));
        $('#ddl_diagnoseCode').val($('#ddl_diagnoseCode').prop('defaultSelected'));        
        setFormState('success');
    }

    bindDiagnoseCodesArrows();
}

function bindDiagnoseCodesArrows() {
    $("a[id^='Move']").unbind("click").bind("click", function () {
        var row = $(this).closest("tr");
        if (this.id.indexOf("MoveUp") != -1) {
            row.insertBefore(row.prev());
        }
        else {
            row.insertAfter(row.next());
        }
    });
}

function procesDiagnoseCodesFromDocument() {
    var $target = $(tabManager.selectedTabDocument.bravoElement).find("Input[name='td_oorzaak']:first-child").closest("table");
    $target.find("tbody").find("tr").each(function () {
        var $inputs = $(this).find("input");
        addDiagnoseRowToDocument($("#diagnoseTableBody"), $inputs, "");
    });
}

function addDiagnoseRowToDocument($documentTable, inputArray, defaultValue) {
    //todo: check if $documentTable length already more of less then 10 rows?
    var $trLast = $documentTable.find("tr:last-child");
    var $trNew;
    if ($documentTable.length === 1 && $trLast.find("input").val() === defaultValue) {
        $trNew = $trLast;
    } else {
        $trNew = $trLast.clone();
        $trLast.after($trNew);
    }

    var index;
    var inputs = $trNew.find("input");
    for (index = 0; index < inputs.length; ++index) {
        // deal with inputs[index] element.
        $(inputs[index]).attr({
            'value': $(inputArray[index]).val()
        });
    }
}



Array.prototype.filterBy = function (attr, value) {
    return this.filter(function (elem) {
        if (elem[attr] != undefined) {
            return elem[attr].indexOf(value) !== -1;
        }
        return undefined;
    });
}

function parseNumber(numberStr) {

    if (numberStr == undefined || numberStr === "") return numberStr;
    return parseFloat((numberStr).replace(/\./g, '').replace(',', '.'));

}

function parseDate(str) {
    if (str == undefined || str === "") {
        return false;
    }
    var m = str.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    return (m) ? false : true;
}

$(window).bind('paste', function (e) {
    var pastedText = "Not paste tekst!";

    if (e.clipboardData && e.clipboardData.getData) {
        pastedText = e.clipboardData.getData('text/plain');
    }
    else if (window.clipboardData && window.clipboardData.getData) { // IE
        pastedText = window.clipboardData.getData('Text');
    }

    if (!uwvBravo.acceptUnicodesRegEx.test(pastedText)) {
        alert("In onderstaande tekst zitten characters die niet worden ondersteund door het Font Verdana, de tekst kan daardoor niet worden overgenomen\n" + pastedText);
        return false;
    }
});

//#region input format

function toStandardDateFormat(dateString) {

    if (!dateString) return "";

    var regEx = /^\d{4}-\d{2}-\d{2}$/;
    if (dateString.match(regEx)) return dateString; //already standard date

    var from = dateString.split("-");

    //bugfix in IE11 , cannot convert 1-1-2015 to date. 
    if (from[0].length < 2) {
        from[0] = "0" + from[0];
    }
    if (from[1].length < 2) {
        from[1] = "0" + from[1];
    }

    return from.reverse().join("-");
}

function parseNumber(numberStr) {

    if (numberStr == undefined || numberStr === "") return numberStr;
    return parseFloat((numberStr).replace(/\./g, '').replace(',', '.'));

}

function parseDate(str) {
    if (str == undefined || str === "") {
        return false;
    }
    var m = str.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
    return (m) ? false : true;
}

function SetPeildatumArbeidsVerledenSaved() {
    $("#PeildatumArbeidsVerleden").data("saved", "True");
    DisplayActionSucceededMessage("Gegevens opgeslagen");
}

//todo: global for calculations
function DisplayActionSucceededMessage(message) {
    if (message === undefined) { message = "Gegevens opgeslagen"; }
        $.messager.show({
            msg: "<span class='text-info'>" + message +"</span>",
            icon: "error",
            timeout: 2000,
            showType: "slide"
        });
}

//#endregion