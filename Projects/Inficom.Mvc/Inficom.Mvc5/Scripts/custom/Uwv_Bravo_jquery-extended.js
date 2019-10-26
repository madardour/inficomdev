$.fn.autoGrowInput = function (o) {
    o = $.extend({
        maxWidth: 1000,
        minWidth: 0,
        comfortZone: 70
    }, o);

    this.filter('input:text').each(function () {
        var minWidth = o.minWidth || $(this).width(),
            val = '',
            input = $(this),
            autoGrowSubject = $('<autogrow/>').css({
                position: 'absolute',
                top: -9999,
                left: -9999,
                width: 'auto',
                fontSize: input.css('fontSize'),
                fontFamily: input.css('fontFamily'),
                fontWeight: input.css('fontWeight'),
                letterSpacing: input.css('letterSpacing'),
                whiteSpace: 'nowrap'
            }),
            check = function () {

                if (val === (val = input.val())) {
                    return;
                };

                // Enter new content into testSubject
                var escaped = val.replace(/&/g, '&amp;').replace(/\s/g, '&nbsp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                autoGrowSubject.html(escaped);

                // Calculate new width + whether to change
                var autoGrowWidth = autoGrowSubject.width(),
                    newWidth = (autoGrowWidth + o.comfortZone) >= minWidth ? autoGrowWidth + o.comfortZone : minWidth,
                    currentWidth = input.width(),
                    isValidWidthChange = (newWidth < currentWidth && newWidth >= minWidth)
                        || (newWidth > minWidth && newWidth < o.maxWidth);

                // Animate width
                if (isValidWidthChange) {
                    input.width(newWidth);
                }
            };

        autoGrowSubject.insertAfter(input);

        $(this).bind('keyup keydown blur update', check);

        check();
    });
    return this;
};

//Serialize the form inclusief the data attributes
$.fn.serializeObjectData = function (tableInputElementsPrefixes) {
    var thiz = this;

    //N.B.: $('form').serialize() not picking previously disabled fields.
    var arrayData = this.serializeArray();
    var group_to_values = arrayData.reduce(function (obj, item) {
        if (obj != undefined) {
            if (obj.hasOwnProperty(item.name) || hasTablePrefixe(item.name, tableInputElementsPrefixes)) {
                //modify object value to array
                if (!$.isArray(obj[item.name])) obj[item.name] = [];
                obj[item.name].push(item.value);
            }
            else {
                obj[item.name] = item.value;
            }
        }
        else if (hasTablePrefixe(item.name, tableInputElementsPrefixes)) {
            obj[item.name] = [obj[item.name]];
            obj[item.name].push(item.value);
        }

        return obj;
    }, {});

    var groups = Object.keys(group_to_values).map(function (key) {
        var varObject = {
            name: key,
            value: "",
            dataLink: ""
        };

        inputVarValue = group_to_values[key];
        var inputVar = $(thiz).find("input[name=" + escapeIdForJSF(key) + "]");
        // in case of textarea 
        if (inputVar.length === 0) {
            inputVar = $(thiz).find("textarea[name=" + escapeIdForJSF(key) + "]");
            //in case of textarea get the name of textarea/ckeditor indentifier (processid:variableName)
            if ((key).indexOf(":") > 0) {
                inputVarName = (key.split(":"))[1];

                //remove weired extra character that chrome sometimes adss
                inputVarValue = inputVarValue.replace("&#8203;", "");
                inputVarValue = (inputVarValue === "") ? "<p>#</p>" : inputVarValue;
            }
        }

        //data-attributes to save in xml
        var link = $(inputVar).data("link");
        var attribute = $(inputVar).data("attribute");
        var dataLink = (link && attribute) ? link + "." + attribute : "";

        varObject.dataLink = dataLink;
        varObject.value = $.isArray(inputVarValue) ? inputVarValue : inputVarValue.replace(/(\r\n|\n|\r|\t|&lrm;)/gm, ""); //replaces all 3 types of line breaks with a space and tabs charachters;
        return varObject;
    });

    return groups;

};

//Checking if ALL form inputs are empty
$.fn.isBlank = function () {
    var fields = $(this).serializeArray();

    for (var i = 0; i < fields.length; i++) {
        if (fields[i].value) {
            return false;
        }
    }

    return true;
};

$.fn.getTextNodes = function (documentObject, element) {
    var children = element.getChildren(),
        child;

    for (var i = 0; i < children.count(); i++) {
        child = children.getItem(i);
        if (child.type == CKEDITOR.NODE_ELEMENT)
            $.fn.getTextNodes(documentObject, child);
        else if (child.type == CKEDITOR.NODE_TEXT)
            documentObject.searchOptions.textNodes.push(child);
    }
}

$.fn.checkFocus = function (documentObject, elements) {
    var focusedEl = $(".cke_focus");
    if (focusedEl.length == 0 && !$(document.activeElement).is("input"))
        return;

    var focusIndex = $(document.activeElement).is("input") ? $(elements).index($(document.activeElement)) : $(elements).index(focusedEl[0]);
    if (focusIndex != documentObject.searchOptions.hashtagIndex) {
        documentObject.searchOptions.hashtagIndex = focusIndex;

        if (focusedEl.length != 0 && documentObject.searchOptions.step == -1) {
            var ckeditor = $(focusedEl).attr("aria-label").split(',')[1].trim();
            var editor = CKEDITOR.instances[ckeditor];
            var sel = editor.getSelection();
            documentObject.searchOptions.textNodes = [];
            $.fn.getTextNodes(documentObject, sel.root);

            documentObject.searchOptions.hashtagPos = documentObject.searchOptions.textNodes.length - 1;
            documentObject.searchOptions.textNodeIndex = 9999;
        }
        else {
            documentObject.searchOptions.hashtagPos = 0;
            documentObject.searchOptions.textNodeIndex = -1;
        }
    }
}

$.fn.selectHashtag = function (documentObject) {
    var e = $(this)[0];
    if (!e) return;
    else if ($(e).is('input')) {
        var start = $(e).val().indexOf(documentObject.searchOptions.character);
        e.focus(); e.setSelectionRange(start, start + 1);
        documentObject.searchOptions.moveNext = true;
    }
    else if ($(e).is('div')) {
        var sel = CKEDITOR.currentInstance.getSelection();
        $.fn.getTextNodes(documentObject, sel.root);
        if (documentObject.searchOptions.step == -1 && documentObject.searchOptions.moveNext == true) {
            documentObject.searchOptions.hashtagPos = documentObject.searchOptions.textNodes.length - 1;
        }
        var start = -1;
        documentObject.searchOptions.moveNext = false;
        while (!documentObject.searchOptions.moveNext) {
            if (documentObject.searchOptions.step == -1 && documentObject.searchOptions.textNodeIndex == -1) {
                documentObject.searchOptions.textNodeIndex = 9999;
            }
            var child = documentObject.searchOptions.textNodes[documentObject.searchOptions.hashtagPos];
            if (child != undefined && child.type == CKEDITOR.NODE_TEXT) {
                var range = CKEDITOR.currentInstance.createRange();
                start = -1;
                documentObject.searchOptions.textNodeIndex += documentObject.searchOptions.step;
                if (documentObject.searchOptions.step == 1) {
                    start = child.getText().indexOf(documentObject.searchOptions.character, documentObject.searchOptions.textNodeIndex);
                } else {
                    start = child.getText().substring(0, documentObject.searchOptions.textNodeIndex + 1).lastIndexOf(documentObject.searchOptions.character, documentObject.searchOptions.textNodeIndex);
                }
                documentObject.searchOptions.textNodeIndex = start;
                if (start != -1) {
                    range.setStart(child, start);
                    range.setEnd(child, start + 1);
                    sel.selectRanges([range]);
                    break;
                }
                else {
                    documentObject.searchOptions.hashtagPos += documentObject.searchOptions.step;
                    documentObject.searchOptions.textNodeIndex = -1;
                }
            }
            documentObject.searchOptions.moveNext = (documentObject.searchOptions.hashtagPos < 0 || documentObject.searchOptions.textNodes.length <= documentObject.searchOptions.hashtagPos);
            if (documentObject.searchOptions.moveNext) {
                documentObject.searchOptions.hashtagPos = 0;
                documentObject.searchOptions.textNodeIndex = -1;
            }
        }
    }
};


var getFileMime = function (url) {

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function () {
        if (this.status === 200) {
            var filename = getFileName(xhr);
            var type = xhr.getResponseHeader('Content-Type');

            var blob = typeof File === 'function'
                ? new File([this.response], filename, {
                    type: type
                })
                : new Blob([this.response], {
                    type: type
                });
            if (typeof window.navigator.msSaveBlob !== 'undefined') {
                // IE workaround for "HTML7007: One or more blob URLs were revoked by closing the blob for which they were created.
                //These URLs will no longer resolve as the data backing the URL has been freed."
                window.navigator.msSaveBlob(blob, filename);
            } else {
                var URL = window.URL || window.webkitURL;
                var downloadUrl = URL.createObjectURL(blob);

                if (filename) {
                    // use HTML5 a[download] attribute to specify filename
                    var a = document.createElement("a");
                    // safari doesn't support this yet
                    if (typeof a.download === 'undefined') {
                        window.location = downloadUrl;
                    } else {
                        a.href = downloadUrl;
                        a.download = filename;
                        document.body.appendChild(a);
                        a.click();
                    }
                } else {
                    window.location = downloadUrl;
                }

                setTimeout(function () {
                    URL.revokeObjectURL(downloadUrl);
                }, 100); // cleanup
            }
        } else {
            var errormessage = xhr.getResponseHeader('Exception');
            $.messager.alert({
                title: "BraVo",
                msg:
                    "<div class='message-container'> " +
                    "<div class='message-title'>" +
                    "<span>Onderstaande fout is opgetreden, neem contact op met de servicedesk als dit probleem blijft bestaan.</span>" +
                    "</div>" +
                    "<div class='message-body text-justify alert-danger'>" +
                    "<span>" + errormessage + "</span>" +
                    "</div>" +
                    " </div>"
                ,
                icon: "error"
            });

        }
    };
    //xhr.onerror = function () { alert('Error'); };
    //xhr.ontimeout = function () { alert('Timeout'); };
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.send();
}

var getFileName = function (xhr) {
    var filename = "";
    var disposition = xhr.getResponseHeader('Content-Disposition');
    if (disposition && disposition.indexOf('attachment') !== -1) {
        var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        var matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) {
            filename = matches[1].replace(/['"]/g, '');
        }
    }
    return filename;
}



//extend String prototype

//The following function takes care of escaping these characters of the ID string:
function escapeIdForJSF(id) {
    return id.replace(/(:|\.|\[|\]|,|=|@)/g, "\\$1");
}

function hasTablePrefixe(item, prefixesArray) {
    var matches = prefixesArray.filter(function (prefixValue) {
        if (prefixValue) {
            return item.startsWith(prefixValue);
        }
    });
    return matches && matches.length !== 0 ? true : false;
}





//  Checks that string starts with the specific string
if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (str) {
        return this.slice(0, str.length) == str;
    };
}

//  Checks that string ends with the specific string...
if (typeof String.prototype.endsWith != 'function') {
    String.prototype.endsWith = function (str) {
        return this.slice(-str.length) == str;
    };
}

