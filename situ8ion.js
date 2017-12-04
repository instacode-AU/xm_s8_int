/*
 * StatusPage Shared Library
 *
 *  This shared library is for interacting with StatusPage.io to create, update and resolve Incidents from xMatters notifications. 
 * 
 *  Exposed methods:
 *    createStatusPageIncident - Creates a new StatusPage Incident
 *       incidentNumber - String - Unique identifier for the Incident
 *       message - String - The message to include in the Incident
 *
 *    updateStatusPageIncident - Updates an existing StatusPage Incident
 *       incidentNumber - String - Unique identifier for the Incident
 *       update - String - One of "update" or "resolve". "update" will update the Incident, "resolve" will set the status of the Incident to "resolved".
 *       annotation - String - If `update` is "update`, this will add an update to the Incident. Otherwise, this parameter is ignored. 
 *
 *    getStatusPageIncident    - Get an existing StatusPage Incident, or null if an Incident with the `incidentNumber` does not exist.
 *       incidentNumber - String - Unique identifier for the Incident
 *
 *  Usage:
 *  
    // Import the StatusPage shared library. Note this assumes the name of the Shared Library is `StatusPage`.
    var StatusPage = require( 'StatusPage' );

    // If the user responded with 'create statuspage.io incident', then create a new StatusPage Incident using the
    // callback.eventProperties.number value as the Incident Number and add a message of "A new issue has been detected."
    if( callback.response.toLowerCase() == 'create statuspage.io incident' ) {
        var statusPageData = StatusPage.createStatusPageIncident( callback.eventProperties.number, "A new issue has been detected.");
    }
 *
 */


exports.createStatusPageIncident = function( incidentNumber, message) {
    
        console.log("**** Creating Situ8ion incident for  '" + incidentNumber + "'" );
        var statusPageData = this.getStatusPageIncident( incidentNumber );
        
        
        if( statusPageData !== null){
            
            console.log ("StatusPage.io Already Exists for  '" + incidentNumber + "'" );
            return statusPageData;
        }   
        else {
             // Prepare the HTTP request
            var spRequest = http.request({
            'endpoint': 'StatusPage',
            'method': 'POST',
            'path': '/incidents',
            'headers': {
                'Content-Type': 'application/json',
                'x-cachet-token': +  constants["Status Page Token"]
                     }
            });
             // Define incident
            var incident = {};
            incident.name = incidentNumber;
            incident.message = message;
            incident.status = 1;
            incident.visible = 1;
           
      
    
            var spJson = {}
            spJson.incident = incident;
        
            spResponse = spRequest.write( spJson );
            console.log( 'CreateStatusPage Response: ' + spResponse.body );
            
            return JSON.parse( spResponse.body );
        }
    }
    
    ////////////////////////////////////////////////////
    //
    //Update StatusPage.io incident
    //
    ////////////////////////////////////////////////////
    exports.updateStatusPageIncident = function( incidentNumber, update, annotation ){
    
        console.log( "**** Update Situ8ion for '" + incidentNumber + "'" );
        var statusPageData = this.getStatusPageIncident( incidentNumber );
        if( statusPageData === null ) {
          console.log( 'No StatusPage found. Returning.' );
          return;
        }
        var sincidentNumber = statusPageData.name;
        console.log( "******** Situ8ion Incident Number" + sincidentNumber + '. ID: ' + statusPageData.id );
        
    
        // Prepare the HTTP request
        var spRequest = http.request({
            'endpoint': 'StatusPage',
            'method': 'PUT',
            'path': '/incidents/' + statusPageData.id,
            'headers': {
                'Content-Type': 'application/json',
                'x-cachet-token': +  constants["Status Page Token"]
            }
        });
        
        var incident = {};
        // Define incident
        if (update == "update"){
            incident.message = annotation;
            incident.status = 2
        }
        else if (update == "resolve"){
            incident.status = "4";
            incident.message =  annotation;
        }
    
        var spJson = {}
        spJson.incident = incident;
        
        spResponse = spRequest.write(spJson);
        console.log(JSON.stringify(spResponse)); 
    }
    
    
    
    ////////////////////////////////////////////////////
    //
    //Get Situ8ion incident number
    //
    ////////////////////////////////////////////////////
    exports.getStatusPageIncident = function( incidentNumber ){
    
        console.log("**** Get Situ8ion for '" + incidentNumber );
        // Prepare the HTTP request
        var spRequest = http.request({
            'endpoint': 'StatusPage',
            'method': 'Get',
            'path': '/incidents',
            'headers': {
                'Content-Type': 'application/json',
                'x-cachet-token': + constants["Status Page Token"]
            }
        });
        
        // Define incident
    
    
        spResponse = spRequest.write();
        console.log( 'spResponse: ' + JSON.stringify( spResponse, null, 2 ) ); 
        
        var statusJson = JSON.parse( spResponse.body );
        
        var Id = null;
        for (i = 0; i < statusJson.length; i++) {
            if ( statusJson[i].name == incidentNumber ) {
                
                Id = statusJson[i].id;
                console.log("*********" + incidentNumber + Id );
                link = statusJson[i].shortlink
                console.log("*********Setting Link: " + link );
                return statusJson[i];
            }
        }
        
        // If it gets here, none found
        return null;
    }
    
    