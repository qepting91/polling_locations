function fetchPollingLocations() {
    var apiKey = 'YOUR_API_KEY_HERE';
    
    // Track the script's start time
    var scriptStartTime = new Date().getTime();
    
    // Open the spreadsheet and access the sheets
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sourceSheet = ss.getSheetByName('school_location');
    var targetSheet = ss.getSheetByName('polling_location') || ss.insertSheet('polling_location');
    
    if (!sourceSheet) {
      Logger.log("The sheet 'school_location' was not found.");
      return;
    }
  
    // Initialize or get the last processed row
    var properties = PropertiesService.getScriptProperties();
    var lastProcessedRow = parseInt(properties.getProperty('lastProcessedRow')) || 1;
    
    if (lastProcessedRow === 1) {
      targetSheet.clear();
      var headers = ['address', 'Location Name', 'Line 1', 'City', 'State', 'ZIP', 'Polling Hours', 'Latitude', 'Longitude', 'Start Date', 'End Date', 'Source Name', 'Official'];
      targetSheet.appendRow(headers);
    }
  
    var data = sourceSheet.getDataRange().getValues();
    var totalRows = data.length;
  
    for (var i = lastProcessedRow; i < totalRows; i++) {
      var row = data[i];
      var formattedAddress = formatAddress(row);
      var pollingLocations = getPollingLocation(formattedAddress, apiKey);
  
      if (pollingLocations) {
        for (var j = 0; j < pollingLocations.length; j++) {
          var details = extractDetails(pollingLocations[j]);
          details.unshift(formattedAddress);
          targetSheet.appendRow(details);
        }
      } else {
        targetSheet.appendRow([formattedAddress, '', '', '', '', '', '', '', '', '', '', '', '']);
      }
  
      // Save the current state
      properties.setProperty('lastProcessedRow', i + 1);
  
      // Check execution time and stop if near limit
      if ((new Date().getTime() - scriptStartTime) > (5 * 60 * 1000)) { // 5 minutes
        ScriptApp.newTrigger('fetchPollingLocations')
          .timeBased()
          .everyMinutes(1)
          .create();
        return;
      }
    }
  
    // Clear the property when done
    properties.deleteProperty('lastProcessedRow');
    Logger.log('Polling locations have been saved to the "polling_location" sheet');
  }
  
  function formatAddress(row) {
    var address = row[0];
    var city = row[1];
    var state = row[2];
    var zip = row[3];
    return address + ', ' + city + ', ' + state + ' ' + zip;
  }
  
  function getPollingLocation(address, apiKey) {
    var url = 'https://www.googleapis.com/civicinfo/v2/voterinfo?key=' + apiKey + '&address=' + encodeURIComponent(address);
    var response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    
    if (response.getResponseCode() === 200) {
      var json = JSON.parse(response.getContentText());
      return json.pollingLocations || [];
    } else {
      Logger.log('Error: ' + response.getContentText());
      return null;
    }
  }
  
  function extractDetails(location) {
    var address = location.address || {};
    var sources = location.sources ? location.sources[0] : {};
  
    return [
      address.locationName || '',
      address.line1 || '',
      address.city || '',
      address.state || '',
      address.zip || '',
      location.pollingHours || '',
      location.latitude || '',
      location.longitude || '',
      location.startDate || '',
      location.endDate || '',
      sources.name || '',
      sources.official || ''
    ];
  }
  