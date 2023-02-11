// @ts-nocheck
sap.ui.define([
    "sap/ui/core/UIComponent",
    "logaligroup/invoices/model/Models",
    "sap/ui/model/resource/ResourceModel",
    "./controller/HelloDialog", /** se usa ./ porque lo definimos en el resourceroots del index.html  */
    "sap/ui/Device"
],
    /**
    * @param {typeof sap.ui.core.UIComponent} UIComponent
    * @param {typeof sap.ui.model.resource.ResourceModel} ResourceModel
    * @param {typeof sap.ui.Device} Device
    */

    function (UIComponent, Models, ResourceModel, HelloDialog, Device) {

        return UIComponent.extend("logaligroup.invoices.Component", {

            metadata: {
                manifest: "json"
            },

            init: function () {
                //call init function of the parent
                UIComponent.prototype.init.apply(this, arguments);

                //set data model on the view
                this.setModel(Models.createRecipient());

                //set device model
                this.setModel(Models.createDeviceModel(), "device");

                this._helloDialog = new HelloDialog(this.getRootControl());

                //create the views based on the url/hash
                this.getRouter().initialize();
            },

            exit: function () {
                this._helloDialog.destroy();
                delete this._helloDialog;
            },

            openHelloDialog: function () {
                this._helloDialog.open();
            },

            getContentDensityClass: function(){
                if(!Device.support.touch){
                    this._sContentDensityClass = "sapUiSizeCompact";
                }else{
                    this._sContentDensityClass = "sapUiSizeCozy";
                };
                return this._sContentDensityClass;
            }
        });
    });