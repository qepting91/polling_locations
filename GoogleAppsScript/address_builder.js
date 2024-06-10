function createAndFormatAddresses() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sourceSheet = ss.getSheetByName('school_location');
    var targetSheet = ss.getSheetByName('polling_location') || ss.insertSheet('polling_location');
    
    if (!sourceSheet) {
        Logger.log("The sheet 'school_location' was not found.");
        return;
    }
  
    // Clear the target sheet and set headers if starting from scratch
    var properties = PropertiesService.getScriptProperties();
    var lastProcessedRow = parseInt(properties.getProperty('lastProcessedRow')) || 1;
    
    // Always ensure headers are set at the top
    if (targetSheet.getLastRow() === 0) {
        targetSheet.clear();
        var headers = ['address', 'Location Name', 'Line 1', 'City', 'State', 'ZIP', 'Polling Hours', 'Latitude', 'Longitude', 'Start Date', 'End Date', 'Source Name', 'Official'];
        targetSheet.appendRow(headers);
    }
  
    var data = sourceSheet.getDataRange().getValues();
    var totalRows = data.length;
    var maxRowsPerExecution = 500; // Adjust as needed

    var endRow = Math.min(lastProcessedRow + maxRowsPerExecution, totalRows);

    for (var i = lastProcessedRow; i < endRow; i++) { // Skip header row
        var row = data[i];
        var formattedAddress = formatAddress(row);
        targetSheet.appendRow([formattedAddress]);
    }

    if (endRow < totalRows) {
        properties.setProperty('lastProcessedRow', endRow);
        deleteExistingTriggers();
        ScriptApp.newTrigger('createAndFormatAddresses')
            .timeBased()
            .after(15 * 1000) // 15 seconds
            .create();
        Logger.log('Paused script execution to process next chunk');
    } else {
        properties.deleteProperty('lastProcessedRow');
        Logger.log('Formatted addresses have been saved to the "polling_location" sheet');
    }
}

function formatAddress(row) {
    var address = row[0];
    var city = row[1];
    var state = row[2];
    var zip = row[3];
    return address + ', ' + city + ', ' + state + ' ' + zip;
}

function deleteExistingTriggers() {
    var triggers = ScriptApp.getProjectTriggers();
    for (var i = 0; i < triggers.length; i++) {
        ScriptApp.deleteTrigger(triggers[i]);
    }
}
