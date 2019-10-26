// This is the bravo js file for a customizable overlay (used to protect (parts) of the window from changes)

// Set the namespace
var uwvBravo = uwvBravo || {};

// bravoBootstrapModal constructor
uwvBravo.CustomOverlay = function (options) {
    this.jqContainer = options.jqContainer; // this is the target container element that should be 'overlayed' (mandatory)
    this.jqContainerId = $(this.jqContainer)[0].id;
    this.typeOfOverlay = options.typeOfOverlay || 'progress'; // other possible types (thus far) are: 'lock' (mandatory)

    // The following template is to be placed in the container; by default it is used to block the whole window while waiting on a synchronus call
    this.htmlTemplate = [
        '<div id="overlay-background">',
        '<div id="overlay">',
            '<img id="overlayImage" src="" alt="" />',
            '<h4 id="overlayText" style="color:gray;font-weight:normal"></h4>',
        '</div>',
    '</div>'
    ].join("\n");

    this.templateId = "overlayBg_" + this.jqContainerId;
    this.instance = undefined;               // element is not created/ renamed yet...reset after this.htmlTemplate is appended.
    this.overlayId = "overlay_" + this.jqContainerId;
    this.overlayImageId = "image_" + this.jqContainerId;
    this.overlayTextId = "text_" + this.jqContainerId;

    this.overlayImageSrc = options.overlayImageSrc || undefined; // This prop may be passed thrue options; otherwise it's determined by this.typeOfOverlay
    this.overlayImageAlt = options.overlayImageAlt || undefined; // This prop may be passed thrue options; otherwise it's determined by this.typeOfOverlay    
    this.overlayText = options.overlayText || "..."; // This prop may be passed thrue options; otherwise it's determined by this.typeOfOverlay

	this.topPosition = options.topPosition || undefined; // This prop may be passed thrue options; otherwise it's determined by this.typeOfOverlay
    this.leftPosition = options.leftPosition || undefined; // This prop may be passed thrue options; otherwise it's determined by this.typeOfOverlay
    this.rightPosition = options.rightPosition || undefined;
    this.width = options.width || "100%";
    this.zIndex = options.zIndex || undefined;
    this.initialize.call(this);
};

// Create prototype
uwvBravo.CustomOverlay.prototype = function () {
    //private members

    var initialize = function () {
        if (this.instance === undefined || ($(this.jqContainer).length === 1 && this.typeOfOverlay === "progress")) { //progressContainer is only instanciated once a session
            $(this.jqContainer).append(this.htmlTemplate);
            //overwrite htmlTemplate (set unique id's)
            $("#overlay-background")[0].id = this.templateId;
            this.instance = $('#' + this.templateId);
            $("#overlay")[0].id = this.overlayId;
            $("#overlayImage")[0].id = this.overlayImageId;
            $("#overlayText")[0].id = this.overlayTextId;
        }
        switch (this.typeOfOverlay) {
            case "progress":
                //set context dependent properties (typeOfOverlay)
                this.overlayImageSrc = "../Content/Images/Loader.gif";
                this.overlayImageAlt = "Laden";
                this.overlayText = this.overlayText === "..." ? "Bezig met laden" : this.overlayText;
                this.topPosition = 0;
                this.leftPosition = 0;
                this.zIndex = 1000000;
                                
                //overwrite htmlTemplate dependent (non-style) properties (overlay)
                $("#" + this.overlayImageId).prop("src", this.overlayImageSrc);
                $("#" + this.overlayImageAlt).prop("alt", this.overlayImageAlt.toString());

                $("#" + this.overlayTextId).empty();
                $("#" + this.overlayTextId).append(this.overlayText);

                break;
            case "lock":
                //todo...
                //set context dependent properties (typeOfOverlay)
                this.overlayImageSrc = "../Content/Images/lock-icon.png";
                this.overlayImageAlt = "Locked";
                this.overlayText = this.overlayText === "..." ? "Document is gelocked" : this.overlayText;
                this.topPosition = this.topPosition;
                this.leftPosition = this.leftPosition;
				this.rightPosition = this.rightPosition;
                this.width = this.width;
                this.zIndex = 1000; // set this lower so the dialog for closing the tab remains usable

                $("#" + this.overlayImageId).prop("src", this.overlayImageSrc);
                $("#" + this.overlayImageAlt).prop("alt", this.overlayImageAlt.toString());
               
                $("#" + this.overlayTextId).empty();
                $("#" + this.overlayTextId).append(this.overlayText);


                break;
            default:
                console.log("no known typeOfOverlay is passed to constructor");
        }

        //create css
        if (this.instance != undefined) {
            this.instance.css({
                "z-index": this.zIndex,
                "display": "none",
                "position": "fixed",
                "top": this.topPosition,
				"left": this.leftPosition,
                "right": this.rightPosition,
                "background": "black",
                "width": this.width,
				"height": "100%",
				"opacity": "0.4"
            });
        }

        $("#" + this.overlayId).css({
            "width": "300px",
            "height": "200px",
            "background-color": "black",
            "text-align": "center",
            "position": "absolute",
            "left": "50%",
            "top": "50%",
            "margin-left": "-150px",
            "margin-top": "-100px",
            "opacity": "1"
		});

		if (this.overlayId.indexOf('overlay_section1') > -1) {
			this.instance.css({
                "margin-left": '31vw',
				"height": '84vh'
			});
		}

    };

    var ShowOverlay = function (doShow, customText) {

        if (this.instance != undefined) {

            this.SetMessage(customText);

            if (doShow) {
                this.instance.show();
            }
            else {
                this.HideOverlay();

            }
        }
    };

    var HideOverlay = function () {
        if (this.instance != undefined) {

            //set default text
            switch (this.typeOfOverlay) {
            case "progress":
                this.overlayText = "Bezig met laden";
                break;
            case "lock":
                this.overlayText = "Document is gelocked";
                break;
            }
            this.instance.hide();
        }
    };

    var DestroyOverlay = function () {
        if (this.instance != undefined) {
            this.instance.remove();
        }
    };


    var SetMessage = function (customText) {
        var message = (customText) ? customText : this.overlayText;
        if (message) {
            $("#" + this.overlayTextId).empty();
            $("#" + this.overlayTextId).append(message);
        }
    };

    //public members
    return {
        initialize: initialize,
        ShowOverlay: ShowOverlay,
        HideOverlay: HideOverlay,
        SetMessage: SetMessage,
        DestroyOverlay: DestroyOverlay
    };
}();
