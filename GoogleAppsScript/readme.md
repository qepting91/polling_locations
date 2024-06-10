# Polling Location Finder Using Google Apps Script

## Overview
This guide will help you set up a Google Apps Script to fetch polling locations based on school addresses stored in a Google Sheets document. You will import a CSV file into Google Sheets, configure the script, and run it to generate the polling locations.

A copy of this project can be found here: https://docs.google.com/spreadsheets/d/1dakxN4yYCYHyzlzt59Ix8SgVNKJxrnb1aMKEC_ftWrI/edit?usp=sharing

## Prerequisites
- A Google account

- A CSV file named master_school_address.csv containing the school addresses with the columns: Address, City, State, ZIP.

- Access to Google Sheets.

- A mouse jiggler, or other type of download (I had to run the scripts over a several hour span for all of the data, if this was the entire dataset it would have taken much longer, so to keep your computer active a mouse jiggler will keep it going (I am sure another workaround exists, but this worked for me))

# Step-by-Step Instructions

## Step 1: Import the CSV File into Google Sheets

- Open Google Sheets:

Go to Google Sheets and log in with your Google account.

- Create a New Spreadsheet:

Click on the + Blank button to create a new spreadsheet.

- Import the CSV File:

In the new spreadsheet, go to File > Import.
Select the Upload tab and drag your master_school_address.csv file into the window, or click Select a file from your device to choose the file manually.

- Choose Replace current sheet in the import settings and click Import data.

- Rename the Sheet:

By default, the imported data will be in a sheet named "Sheet1". Rename this sheet to school_location by right-clicking on the sheet tab at the bottom, selecting Rename, and typing school_location.

## Step 2: Open the Google Apps Script Editor

- Open Apps Script:
In your Google Sheets document, click on Extensions in the top menu.

Select Apps Script from the dropdown menu. This will open the Google Apps Script editor in a new tab.

## Step 3: Add the Address Builder Script
Delete Existing Code:

If there is any default code in the script editor, delete it.

Copy and Paste the Script from address_builder.js into the script editor.

This script will format the second sheet "polling_location" and the address in column A for the api calls.

## Step 4: Add the Polling Location Script
Delete Existing Code:

Copy and Paste the Script from polling_location.js into the script editor.

This script will make the API call to the Google Civic Information API.

## Step 5: Add your API key
In the script you will see var apiKey = 'INSERT API KEY HERE';. Replace INSERT API KEY HERE with your actual Google Civic Information API key.

## Step 6: Run the Script
I have taken care of timeouts and rate limiting for you, so you don't have to worry about that. The script will run and generate the polling locations in the sheet named "Polling Locations". The returned results will appear at the bottom of the sheet. Currently most locations do not have a return for voter location. This script also takes a long time to run.