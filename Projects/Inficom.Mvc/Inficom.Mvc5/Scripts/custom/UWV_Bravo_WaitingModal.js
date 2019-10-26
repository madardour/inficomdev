/**
 * Module for displaying "Waiting for..." dialog using Bootstrap
 *
 */
// Set the namespace
var uwvBravo = uwvBravo || {};

uwvBravo.waitingDialog = function ($) {

    'use strict';

    // Creating modal dialog's DOM
    var $dialog = $(
		'<div id ="waitingDialog" class="modal fade bd-example-modal-sm" data-dismiss="modal" data-backdrop="false" data-keyboard="false" tabindex="-1" role="dialog" aria-hidden="true" style="z-index:10000; padding-top:15%;">' +
		    //'<div class="modal-dialog">' +
		    //     '<div class="modal-content">' +
			        //'<div class="modal-header"><h3 style="margin:0;"></h3></div>' +
			 //       '<div class="modal-body">' +
                     //' <div  style="width: 100px; height: 100px; position: relative; top: 50%; left: 50%; text-align: center; z-index: 2; overflow: auto; margin-left: -50px; margin-top: -100px;">' + 
                     //   '<img id="loading" src="../Content/Images/Loader.gif" alt="Laden..." />' +
                     //'</div>' +
                      ' <div class="loader"/>' +
                      //'<h2 style="margin:0; text-align:center;"></h2>' +
                      '</div>' +
                      
				        //'<div class="progress progress-striped active" style="margin-bottom:0;">' + 
                        //    '<div class="progress-bar" style="width: 100%"></div>'+ 
                        //'</div>' +
			   //     '</div>' +
		       // '</div>' + 
            //'</div>' +
        '</div>');

    return {
        /**
		 * Opens our dialog
		 * @param message Custom message
		 * @param options Custom options:
		 * 				  options.dialogSize - bootstrap postfix for dialog size, e.g. "sm", "m";
		 * 				  options.progressType - bootstrap postfix for progress bar type, e.g. "success", "warning".
		 */
        show: function (message, options) {
            // Assigning defaults
            if (typeof options === 'undefined') {
                options = {};
            }
            if (typeof message === 'undefined') {
                message = 'Loading';
            }
            var settings = $.extend({
                dialogSize: 'm',
                progressType: '',
                onHide: null // This callback runs after the dialog was hidden
            }, options);

            // Configuring dialog
            $dialog.find('.modal-dialog').attr('class', 'modal-dialog').addClass('modal-' + settings.dialogSize);
            $dialog.find('.progress-bar').attr('class', 'progress-bar');
            if (settings.progressType) {
                $dialog.find('.progress-bar').addClass('progress-bar-' + settings.progressType);
            }
            $dialog.find('h2').text(message);
            // Adding callbacks
            if (typeof settings.onHide === 'function') {
                $dialog.off('hidden.bs.modal').on('hidden.bs.modal', function (e) {
                    settings.onHide.call($dialog);
                });
            }
            // Opening dialog
            $dialog.modal();
        },
        /**
		 * Closes dialog
		 */
        hide: function () {
            $dialog.modal('hide');
            //$('body').removeClass('modal-open');
            //$('.modal-backdrop').remove();
            delete $dialog.instance;
            $("#waitingDialog").remove();

            //$(".modal").each(function () {
            //    if (this !== 'curModal') {
            //        $(this).modal("hide");
            //    }
            //});

            //var visible_modal = jQuery('.modal.in').attr('id'); // modalID or undefined
            //if (visible_modal) { // modal is active
            //    jQuery('#' + visible_modal).modal('hide'); // close modal
            //}


            //$('body').removeClass('modal-open'); //de backdrop laten verdwijnen zonder de originele scrollbars te verliezen...
            //$('.modal-backdrop').remove();


        }
    };

}(jQuery);
