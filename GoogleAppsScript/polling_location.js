function fetchPollingLocations() {
    var lock = LockService.getScriptLock();
    try {
        lock.waitLock(30000); // Attempt to acquire the lock, waiting up to 30000ms (30 seconds)
        
        var apiKey = 'INSERT API KEY HERE';
        var maxRequestsPerInterval = 125; // 125 requests per minute
        var interval = 60 * 1000; // 60 seconds interval

        var ss = SpreadsheetApp.getActiveSpreadsheet();
        var targetSheet = ss.getSheetByName('polling_location');
        
        if (!targetSheet) {
            Logger.log("The sheet 'polling_location' was not found.");
            return;
        }
    
        var properties = PropertiesService.getScriptProperties();
        var lastProcessedRow = parseInt(properties.getProperty('lastProcessedRow')) || 1;
        var data = targetSheet.getDataRange().getValues();
        var totalRows = data.length;
        
        var requestsCount = 0;

        if (lastProcessedRow === 1) {
            var headers = ['address', 'Location Name', 'Line 1', 'City', 'State', 'ZIP', 'Polling Hours', 'Latitude', 'Longitude', 'Start Date', 'End Date', 'Source Name', 'Official'];
            targetSheet.appendRow(headers);
            lastProcessedRow = 2; // Skip header row
        }

        for (var i = lastProcessedRow; i < totalRows; i++) {
            if (requestsCount >= maxRequestsPerInterval) {
                ScriptApp.newTrigger('fetchPollingLocations')
                    .timeBased()
                    .after(interval) // 60 seconds
                    .create();
                properties.setProperty('lastProcessedRow', i);
                Logger.log('Paused script execution to respect API rate limit');
                return;
            }

            var formattedAddress = data[i][0];
            if (!formattedAddress) {
                Logger.log('Skipping empty address at row ' + (i + 1));
                continue;
            }

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
            
            requestsCount++;
        }

        properties.deleteProperty('lastProcessedRow');
        Logger.log('Polling locations have been saved to the "polling_location" sheet');
    } catch (e) {
        Logger.log('Failed to acquire lock or other error: ' + e);
    } finally {
        lock.releaseLock();
    }
}

function getPollingLocation(address, apiKey) {
    try {
        var url = 'https://www.googleapis.com/civicinfo/v2/voterinfo?key=' + apiKey + '&address=' + encodeURIComponent(address);
        var response = UrlFetchApp.fetch(url, { muteHttpExceptions: true });

        if (response.getResponseCode() === 200) {
            var json = JSON.parse(response.getContentText());
            return json.pollingLocations || [];
        } else {
            Logger.log('Error: ' + response.getContentText());
            return null;
        }
    } catch (e) {
        Logger.log('API request failed for address ' + address + ': ' + e);
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
