// Author: Rachid EL Bali
// Implemented the following pattern:
// (Namespaced) Revealing Prototype pattern:
// This component: 

// Set the namespace
var uwvBravo = uwvBravo || {};

//HTML editor
uwvBravo.TextEditor = function (options) {
    this.parentObject = options.parentObject || undefined; // this is the element that triggers the initialisation   
    this.readOnly = options.readOnly;

    //vtBibliotheekManager
    this.vtBibliotheekManager = undefined;

    //instances created
    this.documentCkeditorInstances = [];
}

uwvBravo.TextEditor.prototype = function () {

    //#region Ckeditor instances

    //ckeditor inline document textarea 
    var replaceTextareaWithInlineEditor = function () {
        var txtEditorObj = this;
        this.documentCkeditorInstances = [];

        $(this.parentObject.documentElement).find("textarea").each(function () {
            var elementId = $(this).attr("id") + "_toolbar";
            var instance = CKEDITOR.instances[$(this).attr("id")];

            var link = $(this).data('link');
            var attribute = $(this).data('attribute');

            if (!instance) {
                // We need to turn off the automatic editor creation first.
                CKEDITOR.disableAutoInline = true;
                CKEDITOR.inline(this,
                    {
                        on: {
                            instanceReady: function (evt) {
                                ckeditorInstanceReady.call(txtEditorObj, evt, link, attribute);
                            }
                        },
                        sharedSpaces: {
                            top: elementId
                        }
                    }
                );
                    //.on("change",
                    //function (ev) {
                    //    if (ev.editor.checkDirty()) {
                    //        var editorValue = ev.editor.getData();
                    //        if (editorValue) {
                    //            document.getElementById(ev.editor.name).textContent = editorValue;
                    //            document.getElementById(ev.editor.name).value = editorValue;
                    //        }
                    //        else if (editorValue === "") {
                    //            document.getElementById(ev.editor.name).textContent = "#";
                    //            document.getElementById(ev.editor.name).value = "#";
                    //        }
                    //        //Document state is changed
                    //        txtEditorObj.parentObject.contentChanged = true;
                    //        txtEditorObj.parentObject.DocumentInPdcUpdated = false;
                    //    }
                    //});
            }
        });
    };

    //save init data when ckeditor instance is ready
    var ckeditorInstanceReady = function (evt, link, attribute) {
        var txtEditorObj = this;
        var oEditor = evt.editor;
        oEditor.setReadOnly(txtEditorObj.readOnly);
        if (!txtEditorObj.readOnly) {
            oEditor.element.data('link', link);
            oEditor.element.data('attribute', attribute);
            bindCkeditorCustomEvents.call(txtEditorObj, oEditor);
        }
        //Textarea array replaced with inline ckeditor
        txtEditorObj.documentCkeditorInstances.push({
            id: oEditor.name,
            spelchecked: false
        });
    }

    //delete/dispose Document textarea from inline ckeditor
    var deleteInlineCkeditorInstances = function () {
        var txtEditorObj = this;
        $.each(txtEditorObj.documentCkeditorInstances, function (index, value) {
            var instance = CKEDITOR.instances[value.id];
            if (instance) {
                instance.destroy(true);
            }
        });
    };

    //#endregion Ckeditor instances

    //#region CutomEvents
    var bindCkeditorCustomEvents = function (editor) {
        var txtEditorObj = this;

        editor.on("change", function (ev) {
            if (ev.editor.checkDirty()) {
                ev.editor.updateElement();
                $(ev.editor.element.$).trigger('change')
            }
        });

        //add listener to custom events
        editor.on("vtBibliotheek", function (evt) {
            vtBibliotheekInit.call(txtEditorObj, editor);
        });
        editor.on("insert", function (evt) {
            var text = evt.data;
            if (text == undefined) return false;
            if (editor.getData().trim() == "<p>#</p>") {
                editor.setData(text);
            }
            else { editor.insertHtml(text); }
            $.messager.show({
                msg: "Nieuwe tekst wordt toegevoegd aan het document.",
                timeout: 2000,
                showType: "slide"
            });
        });
        editor.on("personalLibraryInsert", function (evt) {
            var textId = evt.data;
            insertFromPersonalLibrary.call(txtEditorObj, editor, textId);
        });
        editor.on("wscDialogClosedEvent", function (evt) {
            var nextEditor = getNextCkeditor.call(txtEditorObj, editor.name);
            if (nextEditor) {
                nextEditor.focus();
                nextEditor.execCommand("checkspell");
            }
        });
        editor.once('focus', function (e) {
            autoCompleteInit.call(txtEditorObj, editor);
        });

    }


    //#endregion CutomEvents



    //#region Ajax Calls

    var vtBibliotheekInit = function (editor) {
        if (editor == null || editor == undefined) return false;
        if (this.parentObject == undefined) return false;

        //Parent Metada
        var curPdcProcess = this.parentObject.processId;
        var caseId = window.tabManager.caseId;

        //Editor attribute
        var link = editor.element.data('link');
        var attribute = editor.element.data('attribute');

        var contentUrl = "../DocumentVariable/DocumentVariableResult?vtDocumentVariable=true&casusId=" + caseId + "&dataLink=" + link + "&elementName=" + attribute + "&pdcProcessId=" + curPdcProcess;

        var vtBibliotheekOptions = {
            title: 'Herbruikbare teksten',
            contentUrl: contentUrl,
            isDraggable: false,
            disableOkBtn: true,
            disableToonTekstBtn: true,
            AnnuleerBtnText: "Afsluiten",
            parentObject: this.parentObject,
            ckeditorTrigger: editor
        };
        this.vtBibliotheekManager = new uwvBravo.BootstrapModal($('#vtBibliotheek'), vtBibliotheekOptions);
        this.vtBibliotheekManager.reloadcontent();
        this.vtBibliotheekManager.show();

    };


    var insertFromPersonalLibrary = function (editor, textId) {
        if (editor == null || editor == undefined) return false;
        var postData = { id: textId };
        $.ajax({
            url: "../PersonalLibrary/GetById",
            type: 'POST',
            //contentType: 'application/json',
            cache: 'false',
            async: false,
            data: postData
        }).done(function (succes, textStatus, jqXHR) {
            if (!succes.succes) {
                $.messager.alert({
                    title: 'BraVo',
                    msg: succes.errorMessage,
                    icon: 'error'
                });
                return false;
            }
            else {

                if (editor.getData().trim() == "<p>#</p>") {
                    editor.setData(succes.replacement);
                }
                else { editor.insertHtml(succes.replacement); }
            }
        });


    };

    var GetPersonalCustomTextBlock = function (editor, seletedItem) {
        var postData = { id: seletedItem.id };
        $.ajax({
            url: "../PersonalLibrary/GetById",
            type: 'GET',
            cache: 'false',
            async: false,
            data: postData
        }).done(function (succes, textStatus, jqXHR) {
            if (!succes.succes) {
                $.messager.alert({
                    title: 'BraVo',
                    msg: succes.errorMessage,
                    icon: 'error'
                });
                return false;
            }
            else {
                seletedItem.content = succes.replacement;
                return editor.outputTemplate.output(seletedItem);
            }
        });
    };

    //#endregion Ajax Calls

    //#region  dispatched events

    var bindDispatchedEvents = function () {

        if (this.parentObject != undefined && this.parentObject.bravoElement != undefined) {
            var txtEditorObj = this;
            //BootstrapModal Events
            //loaded after modal content load event
            $("#" + this.parentObject.bravoElement.id).unbind("modalWindowContentPostLoaded").on("modalWindowContentPostLoaded", function (e, data) {
                if (e.originalEvent.detail != undefined && e.originalEvent.detail.templateContentId != undefined) {
                    //modal container element id
                    var modalContainer = "#" + e.originalEvent.detail.templateContentId;
                    var ckEditorTrigger = e.originalEvent.detail.ckeditorTrigger;
                    //bind action buttons with specified data-attribute (vtBibliotheek)
                    $(modalContainer + " :button[data-identifier]").unbind("click").on("click", { editorTargetObj: ckEditorTrigger }, function (e, data) {
                        var targetName = e.originalEvent.currentTarget.attributes['data-identifier'].nodeValue;
                        if (targetName != undefined) {
                            var popupCkEditor = CKEDITOR.instances[targetName];
                            if (popupCkEditor != undefined) {
                                //get seleted textarea content
                                var editorValue = popupCkEditor.getData();
                                if (editorValue) {
                                    //initialize aand trigger custom event 
                                    e.data.editorTargetObj.fire("insert", editorValue);
                                }
                            }
                        }
                        //trigger close modal
                        txtEditorObj.vtBibliotheekManager.close();
                    });
                }
            });
        }
    }


    //#endregion  dispatched events

    //#region private 


    //loopt throug document ckeditor instances
    var getNextCkeditor = function (currentEditorId) {
        var thiz = this;
        var nextEditor = undefined;
        var nextEditorIndex = -1;
        var breakLoop = false;

        //find next/first not checked editor
        $.each(thiz.documentCkeditorInstances, function (index, ckeObj) {
            if (ckeObj.spelchecked === false) {

                //mark current editor as checked
                if (ckeObj.id === currentEditorId) {
                    thiz.documentCkeditorInstances[index].spelchecked = true;
                }
                else {

                    var editor = CKEDITOR.instances[ckeObj.id];
                    if (editor.container.getText() !== "#") {
                        //check if spell problems exist in nextEditor, other case continue
                        var scaytMisspellWords = editor.container.find(".scayt-misspell-word");
                        if (scaytMisspellWords.length !== 0) {
                            nextEditor = editor;
                            breakLoop = true;
                            nextEditorIndex = index;
                        }
                        else {
                            ckeObj.spelchecked = true;
                        }
                    }
                    else {
                        ckeObj.spelchecked = true;
                    }
                }
            }

            if (breakLoop === true) return false;
        });

        if (nextEditorIndex === -1 && nextEditor == undefined) {
            //reset spelchecked documentCkeditorInstances collectie to false
            $.each(thiz.documentCkeditorInstances, function (i, ckeObj) {
                thiz.documentCkeditorInstances[i].spelchecked = false;
            });
        }
        return nextEditor;
    };

    //#region autoComplete plugin

    var autoCompleteInit = function (editor) {

        var itemTemplate = '<li data-id="{id}" class="list-group-item">' +
            '<div><strong class="item-name">{name}</strong></div>' +
            '</li>',
            outputTemplate = '[[{name}]]<span>&nbsp;</span>';

        var autocomplete = new CKEDITOR.plugins.autocomplete(editor, {
            textTestCallback: textTestCallback,
            dataCallback: dataCallback,
            itemTemplate: itemTemplate,
            outputTemplate: outputTemplate
        });

        // Override default getHtmlToInsert to enable rich content output.
        autocomplete.getHtmlToInsert = function (item) {
            return GetPersonalCustomTextBlock(this, item);
        }
    }

    function textTestCallback(range) {
        if (!range.collapsed) {
            return null;
        }
        return CKEDITOR.plugins.textMatch.match(range, matchCallback);
    }

    function matchCallback(text, offset) {
        var pattern = /\[{2}([a-z,A-Z,0-9]|\])*$/, match = text.slice(0, offset).match(pattern);
        if (!match) { return null; }
        return { start: match.index, end: offset };
    }

    function dataCallback(matchInfo, callback) {
        var data = window.SearchListPeronalLibrary._fullList.filter(function (item) {
            var itemName = '[[' + item.name + ']]';
            return itemName.toLowerCase().indexOf(matchInfo.query.toLowerCase()) > - 1;
        });

        callback(data);
    }


    //#endregion autoComplete plugin

    //#endregion private 

    var reload = function () {
        var txtEditorObj = this;
        $.when(deleteInlineCkeditorInstances.call(this)).then(function () {
            initialize.call(txtEditorObj);
        });

    }

    var initialize = function () {
        replaceTextareaWithInlineEditor.call(this);
        bindDispatchedEvents.call(this);
    }


    return {
        initialize: initialize,
        reload: reload,
        replaceTextareaWithInlineEditor: replaceTextareaWithInlineEditor,
        deleteInlineCkeditorInstances: deleteInlineCkeditorInstances
    };
}();
