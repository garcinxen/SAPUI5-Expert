//@ts-nocheck
sap.ui.define([
    "sap/ui/core/util/MockServer",
    "sap/ui/model/json/JSONModel",
    "sap/base/util/UriParameters",
    "sap/base/Log"
], 
    
/**
 * @param { typeof sap.ui.core.util.MockServer } MockServer
 * @param { typeof sap.model.json.JSONModel } JSONModel
 * @param { typeof sap.base.util.UriParameters} UriParameters
 * @param { typeof sap.base.Log } Log
 */
function(MockServer,JSONModel, UriParameters, Log){
    "use-strict";

    var oMockServer,
        _sAppPath = "logaligroup/invoices/",
        _sJsonFilesPath = _sAppPath + "localService/mockdata";

    var oMockServerInterface = {
        /**
         * Initializes the mockserver asynchronously
         * @protected
         * @param {object} oOptionsParameter 
         * @returns {Promise} a promise that is resolved when the mockserver has been started 
         */        
        init: function(oOptionsParameter){
            var oOptions = oOptionsParameter || {};

            return new Promise(function(fnResolve, fnReject){
                var sManifestUrl = sap.ui.require.toUrl(_sAppPath + "manifest.json"),
                    oManifestModel = new JSONModel(sManifestUrl);

                oManifestModel.attachRequestCompleted(function(){
                    var oUriParameters = new UriParameters(window.location.href);

                    //Parse manifest for local metadata URI
                    var sJsonFilesUrl = sap.ui.require.toUrl(_sJsonFilesPath);
                    var oMainDataSource = oManifestModel.getProperty("/sap.app/dataSources/mainService");
                    var sMetaDataURl = sap.ui.require.toUrl(_sAppPath + oMainDataSource.settings.localUri);

                    //Ensure there is a trailing slash
                    var sMockServerUrl = oMainDataSource.uri && new URI(oMainDataSource.uri).absoluteTo(sap.ui.require.toUrl(_sAppPath)).toString();

                    //create a mockserver instance or stop the existing one to reinitialize
                    if(!oMockServer){
                        oMockServer = new MockServer({
                            rootUri: sMockServerUrl
                        });
                    } else {
                        oMockServer.stop();
                    }

                    //Configure mockserver with the given options or a default delay of 0.5s
                    MockServer.config({
                        autoRespond: true,
                        autoRespondAfter: (oOptions.delay ||oUriParameters.get("serverDelay") || 500)
                    });

                    //simulate all requests using mock data
                    oMockServer.simulate(sMetaDataURl, {
                        sMockDataBaseUrl: sJsonFilesUrl,
                        bgenerateMissingMockData: true
                    });
                    
                    var aRequests = oMockServer.getRequests();

                    //compose an error response for each request
                    var fnResponse = function(iErrorCode, sMessage, aRequest){
                        aRequest.response = function(oXhr){
                            oXhr.respond(iErrorCode, {"Content-Type" : "text/plain;charset=utf-8", sMessage});
                        };
                    };

                    //simulate metadata errors
                    if(oOptions.metadataError || oUriParameters.get("metadataError")){
                        aRequests.forEach(function(aEntry){
                            if(aEntry.path.toString().indexOf("$metadata") > -1){
                                fnResponse(500, "metadata Error", aEntry);
                            };
                        });
                    };

                    //simulate request errors
                    var sErrorParam = oOptions.errorType || oUriParameters.get("errorType");
                    var iErrorCode = sErrorParam === "badRequest" ? 400 : 500;

                    if(sErrorParam){
                        aRequests.forEach(function(aEntry){
                            fnResponse(iErrorCode, sErrorParam, aEntry);
                        });
                    };

                    //set request and start the server
                    oMockServer.setRequests(aRequests);
                    oMockServer.start();

                    Log.info("Running the app with mock data");
                    fnResolve();
                });

                oManifestModel.attachRequestFailed(function(){
                    var sError = "Fail to load the application manifest";

                    Log.error(sError);
                    fnReject(new Error(sError));
                });
            });
        }
    };

    return oMockServerInterface;
});