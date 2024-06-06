import os
import csv

# Set the path to the school_data folder
school_data_folder = 'school_data'

# Create a list to store the addresses
addresses = []

# Iterate through the files in the school_data folder
for filename in os.listdir(school_data_folder):
    if filename.endswith('.csv'):
        file_path = os.path.join(school_data_folder, filename)
        
        # Open the CSV file and read its contents
        with open(file_path, 'r', encoding='utf-8') as file:
            csv_reader = csv.reader(file, delimiter=';')
            
            # Skip the header row
            next(csv_reader)
            
            # Extract the addresses from each row
            for row in csv_reader:
                address = row[5]  # Address is in the 6th column (index 5)
                if address != "BOX DOE":
                    city = row[6]   # CITY is in the 7th column (index 6)
                    state = row[7]  # STATE is in the 8th column (index 7)
                    zip_code = row[8]  # ZIP is in the 9th column (index 8)
                    zip4 = row[9]  # ZIP4 is in the 10th column (index 9)
                    addresses.append([address, city, state, zip_code, zip4])

# Create the output CSV file
output_file = 'master_school_address.csv'

# Write the addresses to the output CSV file
with open(output_file, 'w', newline='', encoding='utf-8') as file:
    csv_writer = csv.writer(file)
    csv_writer.writerow(['Address', 'City', 'State', 'ZIP', 'ZIP4'])  # Write the header row
    csv_writer.writerows(addresses)  # Write each address with additional columns as separate rows

print(f"Addresses extracted and saved to {output_file}.")
