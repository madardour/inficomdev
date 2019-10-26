//http://stackoverflow.com/questions/18956257/how-to-add-an-ajax-save-button-with-loading-gif-to-ckeditor-4-2-1-working-samp
/// Author: R. el Bali
/// <reference path="~/Scripts/Uwv_Bravo.js" />
// This is a custom Bravo plugin for ckeditor


CKEDITOR.plugins.add('personalLibrary', {
    icons: 'personalLibrary',
    init: function (editor) {
        editor.addCommand('personalLibrarytoolbar', {
            exec: function (editor) {
                //closetoolbar(editor); //close the current toolbar
                showPersonalLibraryDialog(editor.name); // show the modal
            }
        });

        //add the save button to the toolbar
        editor.ui.addButton('personalLibrary', {
            label: 'Persoonlijke bibliotheek',
            command: 'personalLibrarytoolbar'
            // toolbar: 'insert'
        });
    }
});

function showPersonalLibraryDialog(vrijTekst) {
    personalTextLibraryManager.vtSection = vrijTekst;
    persoonlijkebibliotheekInit("insert");
    return;
}

function closetoolbar(e) {

    var id = "cke_" + e.name;
    var elem;
    if (document.getElementById) {
        elem = document.getElementById(id);
    } else if (document.all) {
        elem = document.all[id];
    } else if (document.layers) {
        elem = document.layers[id];
    }
    elem.style.display = 'none';
}