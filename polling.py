import pandas as pd
import requests
import json
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Get the API key from environment variables
api_key = os.getenv('API_KEY')

# Load the CSV file from the data folder
csv_file = 'data/master_school_address.csv'
data = pd.read_csv(csv_file)

# Function to format address
def format_address(row):
    return f"{row['Address']}, {row['City']}, {row['State']} {row['ZIP']}"

# Function to call the voterInfoQuery endpoint
def get_polling_location(address, api_key):
    url = f'https://www.googleapis.com/civicinfo/v2/voterinfo?key={api_key}'
    params = {
        'address': address
    }
    response = requests.get(url, params=params)
    if response.status_code == 200:
        return response.json().get('pollingLocations', [])
    else:
        return None

# Function to extract details from the polling locations JSON
def extract_details(location):
    address = location.get('address', {})
    sources = location.get('sources', [{}])
    return {
        'Location Name': address.get('locationName', ''),
        'Line 1': address.get('line1', ''),
        'City': address.get('city', ''),
        'State': address.get('state', ''),
        'ZIP': address.get('zip', ''),
        'Polling Hours': location.get('pollingHours', ''),
        'Latitude': location.get('latitude', ''),
        'Longitude': location.get('longitude', ''),
        'Start Date': location.get('startDate', ''),
        'End Date': location.get('endDate', ''),
        'Source Name': sources[0].get('name', ''),
        'Official': sources[0].get('official', '')
    }

# Iterate through the addresses in the CSV and get polling locations
results = []
for index, row in data.iterrows():
    formatted_address = format_address(row)
    polling_locations = get_polling_location(formatted_address, api_key)
    if polling_locations:
        for location in polling_locations:
            details = extract_details(location)
            results.append({
                'address': formatted_address,
                **details
            })
    else:
        results.append({
            'address': formatted_address,
            'Location Name': '',
            'Line 1': '',
            'City': '',
            'State': '',
            'ZIP': '',
            'Polling Hours': '',
            'Latitude': '',
            'Longitude': '',
            'Start Date': '',
            'End Date': '',
            'Source Name': '',
            'Official': ''
        })

# Convert results to a DataFrame and save to a new CSV file in the data folder
results_df = pd.DataFrame(results)
results_df.to_csv('data/final_polling_locations.csv', index=False)

print("Final polling locations have been saved to 'data/final_polling_locations.csv'")
