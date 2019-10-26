// Author: R. EL BALI
// Implemented the following pattern:
// (Namespaced) Revealing Prototype pattern (with 'call'):
// The namespace , a.o., prevents polluting the global scope
// The constructor keeps track of the state
// The prototype holds the functions, both private and public, and can be extended
// The prototype reveals the public functions for use outside of the scope
// By using the '[function].call' function when calling other (private or public) functions one is able to pass the scope of the original caller of the function. So now it's safe to use 'this' inside the prototype functions and no special parameter has to be passed around to keep track of 'this'

// Afterwards, this library can be extended by defining a new prototype elsewhere (or overwrite) and then call it on the specific instance (Created with the constructor).

// Set the namespace
var uwvBravo = uwvBravo || {};

// bravoJsTree constructor
uwvBravo.JsTree.Popup = function (jQObj, options) {
    this.jqObject = jQObj;
    this.options = options || {}; // options is always an object literal
    // Get/set the defaults:
    this.requesturl = "../WordHtmlConverter/RenderTreeviewPopup";
    this.selectedNodeId = options.selectedNodeId || null;
    this.selectedNodeText = options.selectedNodeText || null;
    this.selectedNodeFirstChild = options.selectedNodeFirstChild || null;
    this.pdcProcessId = options.pdcProcessId;
    //for now, pass info from view ('though this should be handled internally in this control to prevent runtime error if pdcProcessId is null or undefined (computed props?) )
    this.switchPurposeCheckbox = options.switchPurposeCheckbox || $('#navigationCheck_' + this.pdcProcessId);
    this.switchPurposeLabel = options.switchPurposeLabel || $('#navigationLabel_' + this.pdcProcessId);
    this.switchPurposeReadyButtonId = options.switchPurposeReadyButtonId || ('regenerateDoc_' + this.pdcProcessId); // This is the 'Klaar' button that should kick of the structure changes in the Bravo_Document component
    this.stateChanged = false;

    this.documentElement = $("#D_" + this.pdcProcessId);
    this.linkedDocument = options.linkedDocument || undefined; // in case of a subDocument-treeview (in modal popup) this should contain the parent Document...
    this.selectedChildNodes = function () {
        var jsTree = this.jqObject;
        var jsonTree = jsTree.jstree().get_json('#', { flat: true, no_data: true });
        for (i = 0; i < jsonTree.length; i++) {
            delete jsonTree[i].li_attr;
            delete jsonTree[i].a_attr;
            delete jsonTree[i].data;
            delete jsonTree[i].icon;
            delete jsonTree[i].text;
            delete jsonTree[i].type;
        }
        
        return jsonTree;
    };

    this.postData = {
        popupId: this.pdcProcessId,
        parentPdcProcessId: this.linkedDocument.parentProcessId
    }



    this.jsTreeRequestCompletedEvent = document.createEvent("CustomEvent"); //todo: check if still in use
    this.jsTreeRequestCompletedEvent.initCustomEvent("jsTreeRequestCompletedEvent", true, true, this);

    this.jsTreeChangePurposeEvent = document.createEvent("CustomEvent");
    this.jsTreeChangePurposeEvent.initCustomEvent("jsTreeChangePurposeEvent", true, true, this);
};

// Create prototype
uwvBravo.JsTree.Popup.prototype = function () {
    //private members
    var initialize = function () {

        this.jqObject.jstree({
            "checkbox": {
                "whole_node": true,
                "three_state": false
            },
            "types": {
                "standard": {
                    "icon": "glyphicon glyphicon-minus"
                },
                "textblock": {
                    "icon": "glyphicon glyphicon-text-size"
                },
                'selectable': {
                    //'icon': ''
                },
                'default': {
                    //'icon': ''
                }
            },
            'core': {
                'check_callback': true,
                'expand_selected_onload': false,
                'dblclick_toggle': false,
                "animation": 0
            },
            "search": {
                "case_insensitive": false,
                "show_only_matches": true
            },

            "ui": {
                "select_limit": 1
            },

            'plugins': ["checkbox", "types", "search", "html_data", "themes", "ui", "crrm", "changed"]
        });

        bindTreeviewSearchEvent.call(this);

    };

    var bindTreeChangedEvent = function () {
        this.jqObject.on("changed.jstree", { treeObj: this }, function (event, data) {
            if (data && (data.action === "select_node" || data.action === "deselect_node")) {
                event.data.treeObj.selectedNodeId = (data.node !== null ? data.node.id : null);
                event.data.treeObj.selectedNodeText = (data.node !== null ? data.node.text : null);
                var childNodes = data.node.children;
                event.data.treeObj.selectedNodeFirstChild = (childNodes.length > 0 ? childNodes[0] : null);

                event.data.treeObj.stateChanged = true;
                var scrollPosition = event.data.treeObj.jqObject.scrollTop();
                if (event.data.treeObj.linkedDocument.isPdcDocument) {
                    $.extend(event.data.treeObj.postData, { selectedNodeId: event.data.treeObj.selectedNodeId });
                    fetchData.call(event.data.treeObj, scrollPosition);
                }
            }
        });
    };

    var bindTreeviewSearchEvent = function () {
        var thiz = this;
        $("#S_" + this.pdcProcessId)
            .unbind("keyup")
            .keyup(function () { //beware, unbind hides why bindTreeviewSearchEvent is bound multiple times (but does the job of preventing executing multiple times)
                var searchString = $(this).val();
                thiz.jqObject.jstree("search", searchString);
            });
    };

    var bindTreeviewClickEvent = function () {
        
        this.jqObject.bind("open_node.jstree", function (event, data) {
            var obj = data.instance.get_node(data.node, true);
            if (obj) {
                obj.find(".jstree-node").each(function () { data.instance.open_node(this, 0); });

                if (data.instance.get_parent(obj) === "#") {
                    obj.siblings(".jstree-open").each(function () {
                        data.instance.close_node(this, 0);
                    });
                }
            }
        });
  
        if (!this.linkedDocument.isPdcDocument) {
            this.jqObject.bind("activate_node.jstree", function (event, data) {
                var obj = data.instance.get_node(data.node, true);
                if (obj) {
                    changeNodeState(obj, data);

                    if (data.instance.is_selected(obj))
                        setParentsState(obj, data);

                    // check if group is radiobuttons
                    var parentId = data.instance.get_parent(obj);
                    var parentNode = data.instance.get_node(parentId, true)
                    var rootGroupTypeIsRadio = false;

                    //Get the grouptype of the first children, they have no parent :(
                    if (parentId == "#" && obj.attr("rootGroupType") == "radio")
                        rootGroupTypeIsRadio =true

                    if (parentNode.attr("groupType") == "radio" || rootGroupTypeIsRadio) {
                        obj.siblings(".jstree-node").each(function () {
                            var thisObj = data.instance.get_node(this, true);
                            data.instance.deselect_node(thisObj, 0);
                            changeNodeState(thisObj, data);
                        });

                        if (data.instance.is_selected(obj)) {
                            data.instance.open_node(obj, 0);
                        }
                    }
                }
            });            
        }
    };

    var changeNodeState = function (obj, data) {
        if (!data.instance.is_selected(obj)) {
            data.instance.open_node(obj, 0);
            obj.find(".jstree-node").not(".jstree-leaf").each(function () { data.instance.disable_node(this); });
            obj.find(".jstree-leaf").each(function () { data.instance.disable_node(this); });
            data.instance.close_node(obj, 0);
        }
        else {
            data.instance.open_node(obj, 0);
            if (data.instance.is_parent(obj)) { data.instance.select_node(obj) };
            obj.find(".jstree-node").not(".jstree-leaf").each(function () { data.instance.open_node(this); data.instance.enable_node(this); });
            obj.find(".jstree-leaf").each(function () { data.instance.enable_node(this); });
        }
    };

    var setParentsState = function (obj, data) {
        var parentId = data.instance.get_parent(obj);
        if (parentId === "#")
            return;

        var parentNode = data.instance.get_node(parentId, true);
        if (!data.instance.is_selected(parentNode))
            data.instance.select_node(parentNode)

        setParentsState(parentNode, data);
    };

    var bindTreeContextMenuShow = function () {
        if (this.linkedDocument.isPdcDocument) {
            this.jqObject.on("show_contextmenu.jstree", { treeObj: this }, function (event, data) {

                var $menu = $('.vakata-context').first();
                var menuTop = data.y;
                var menuLeft = data.x;

                $menu.offset({ left: menuLeft, top: menuTop });

            });
        }
    };


    var show = function () {
        initialize.call(this);
        bindTreeChangedEvent.call(this);
        bindTreeContextMenuShow.call(this);
        bindTreeviewClickEvent.call(this);
    };

    var fetchData = function (scrollPosition) {
        var thisTreeObj = this;
        $.ajax({
            url: thisTreeObj.requesturl,
            data: thisTreeObj.postData,
            contentType: 'application/x-www-form-urlencoded; charset=utf-8',
            type: 'POST',
            cache: 'false',
            dataType: "html",
            beforeSend: function () {
            },

            success: function (newData) {
                thisTreeObj.jqObject.jstree('destroy');
                thisTreeObj.jqObject.html(newData);
                show.call(thisTreeObj);
            },

            complete: function (data) {
                resizeTreeView(thisTreeObj, scrollPosition);
            },

            error: function (jqXhr, textStatus, errorThrown) {
                console.log(JSON.stringify(jqXhr));
                console.log("AJAX error: " + textStatus + ' : ' + errorThrown);
            }
        });

    };

    var resizeTreeView = function (treeObject, scrollPosition) {

        if (treeObject.selectedNodeId) {
            var thisNode = $(treeObject.jqObject.selector).jstree("get_node", treeObject.selectedNodeId);

            // Only open node if checked AND haschildren (and only one level deep)
            if (thisNode.data.jstree.selected === true && treeObject.selectedNodeFirstChild !== null) {
                $(treeObject.jqObject.selector).jstree(true)._open_to(treeObject.selectedNodeFirstChild);
            }
            else {
                $(treeObject.jqObject.selector).jstree(true)._open_to(treeObject.selectedNodeId);
            };

            //$(treeObject.jqObject[0]).scrollTop = scrollPosition;
            $(treeObject.jqObject[0]).animate({
                scrollTop: scrollPosition
            }, 5);


        }

    }


    //public members
    return {
        initialize: initialize,
        show: show,
        fetchData: fetchData
    };

}();
