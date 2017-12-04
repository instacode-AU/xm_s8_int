
var StatusPage = require( 'StatusPage' );

var callback = JSON.parse(request.body);
console.log('Executing outbound integration for xMatters event ID: ' + callback.eventIdentifier + '. Response: ' + callback.response.toLowerCase() );

// Convert list of event properties to an eventProperties object
if (callback.eventProperties && Array.isArray(callback.eventProperties)) {
    var eventProperties = callback.eventProperties;
    callback.eventProperties = {};

    for (var i = 0; i < eventProperties.length; i++) {
        var eventProperty = eventProperties[i];
        var key = Object.keys(eventProperty)[0];
        callback.eventProperties[key] = eventProperty[key];
    }
}

//Handle responses without annotations
if (callback.annotation == "null") {
    callback.annotation = null;
}


if( callback.response.toLowerCase() == 'create situ8ion incident' ) {
    var statusPageData = StatusPage.createStatusPageIncident(callback.eventProperties["Incident Number"], "Fault: " + callback.eventProperties["Problem Statement"]  + "<BR> Impact on nbn services: " + callback.eventProperties["Impact Statement"] + "<br> Latest Update: " + callback.eventProperties["Current Actions"]);

    console.log( 'StatusPage data: ' + JSON.stringify( statusPageData ) );
    var msg = 'StatusPage.io Incident Created: [code]<a target="_blank" href="' + statusPageData.shortlink + '">' + statusPageData.name + '</a>[/code]';

    // If it is desired to send a link to the StatusPage Incident back to anywhere (such as a ticketing system), then add the code here.
    // Note that the format of msg might need to be updated depending on what the target system supports. (markdown, html, plain text, etc)
}


else if( callback.response.toLowerCase() == 'update situ8ion incident with comment' ) {
    if( callback.annotation === null ) {
        console.log( 'Skipping update to Situ8ion as no annotation was provided' );
        return;
    }
    
    StatusPage.updateStatusPageIncident(callback.eventProperties["Incident Number"], "update", callback.eventProperties["Current Actions"]);

}

else if( callback.response.toLowerCase() == 'resolve situ8ion incident' ) {
    StatusPage.updateStatusPageIncident(callback.eventProperties["Incident Number"], "resolve", callback.eventProperties["Current Actions"] );

}
