//@ts-nocheck
sap.ui.define([
    "logaligroup/invoices/model/InvoicesFormatter",
    "sap/ui/model/resource/ResourceModel"
], 
/**
 * @param {typeof sap.ui.model.resource.ResourceModel} ResourceModel
 */
function(InvoicesFormatter, ResourceModel){
    QUnit.module("Qnvoices Status", {
        beforeEach: function(){
            this._oResourceModel = new ResourceModel({
                bundleUrl: sap.ui.require.toUrl("logaligroup/invoices") + "/i18n/i18n.properties"
            });
        },

        afterEach: function(){
            this._oResourceModel.destroy();
        }
    });

    QUnit.test("Should return the invoice status", function(assert){
        let oModel = this.stub();
        oModel.withArgs("i18n").returns(this._oResourceModel);

        let oViewStub = {
            getModel: oModel
        };

        let oControllerStub = {
            getView: this.stub().returns(oViewStub)
        };

        let fnIsolatedFormatter = InvoicesFormatter.invoiceStatus.bind(oControllerStub);

        //Assert
        assert.strictEqual(fnIsolatedFormatter("A"), "Nueva", "The invoice status for A is correct");
        assert.strictEqual(fnIsolatedFormatter("B"), "En curso", "The invoice status for B is correct");
        assert.strictEqual(fnIsolatedFormatter("C"), "Finalizada", "The invoice status for C is correct");
    });
});