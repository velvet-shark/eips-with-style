import os
import requests
import markdown
from bs4 import BeautifulSoup
from supabase import create_client, Client
from dotenv import load_dotenv
import re
from datetime import datetime, timezone, date
import argparse
import json
from postgrest.exceptions import APIError

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

# GitHub API endpoints
GITHUB_API_BASE = "https://api.github.com/repos"
EIP_REPO = f"{GITHUB_API_BASE}/ethereum/EIPs/contents/EIPS"
ERC_REPO = f"{GITHUB_API_BASE}/ethereum/ERCs/contents/ERCS"
CAIP_REPO = f"{GITHUB_API_BASE}/ChainAgnostic/CAIPs/contents/CAIPs"
RIP_REPO = f"{GITHUB_API_BASE}/ethereum/RIPs/contents/RIPS"

# Local storage for downloaded files
LOCAL_STORAGE = "downloaded_proposals"

def get_files_from_github(repo_url):
    response = requests.get(repo_url)
    return [file for file in response.json() if file['name'].endswith('.md')]

def download_file_content(file_url):
    response = requests.get(file_url)
    return response.text

def parse_markdown(content):
    # Split the content into front matter and body
    parts = content.split('---', 2)
    if len(parts) < 3:
        print(f"Warning: Malformed content, couldn't find front matter.")
        return {'metadata': {}, 'content': content}

    front_matter = parts[1].strip()
    body = parts[2].strip()

    # Parse the front matter
    metadata = {}
    for line in front_matter.split('\n'):
        if ':' in line:
            key, value = line.split(':', 1)
            key = key.strip().lower()
            value = value.strip()
            if key in ['author', 'authors']:
                # Handle author field separately
                authors = re.findall(r'\[([^\]]+)\]', value)
                if authors:
                    value = ', '.join(authors)
                else:
                    value = value.strip('[]')
            metadata[key] = value

    # Ensure critical fields are present
    if 'status' not in metadata:
        print(f"Warning: 'status' field missing in front matter.")
        # You might want to set a default status or handle this case differently

    # Map the fields
    mapped_metadata = {
        'number': int(re.search(r'^(eip|caip|rip): (\d+)', content, re.IGNORECASE | re.MULTILINE).group(2)) if re.search(r'^(eip|caip|rip): (\d+)', content, re.IGNORECASE | re.MULTILINE) else None,
        'title': metadata.get('title'),
        'description': metadata.get('description'),
        'authors': metadata.get('author'),
        'discussion_url': metadata.get('discussions-to'),
        'status': metadata.get('status'),
        'type': metadata.get('type'),
        'category': metadata.get('category'),
        'created_at': metadata.get('created'),
        'requires': metadata.get('requires')
    }

    # If number is still None, try to extract it from the file name
    if mapped_metadata['number'] is None and 'name' in metadata:
        match = re.search(r'(\d+)', metadata['name'])
        if match:
            mapped_metadata['number'] = int(match.group(1))

    return {
        'metadata': mapped_metadata,
        'content': body
    }

def datetime_to_iso(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    elif isinstance(obj, date):
        return obj.isoformat()
    return obj  # Return the object as is if it's not a datetime or date

def update_database(proposal_type, data):
    # Convert datetime objects to ISO format strings
    serialized_data = {key: datetime_to_iso(value) for key, value in data.items()}

    # Check if the proposal number is None
    if serialized_data['number'] is None:
        print(f"Skipping proposal with no number: {serialized_data['title']}")
        return

    # Check if the proposal already exists
    result = supabase.table('proposals').select('id', 'sha').eq('proposal_type', proposal_type).eq('number', serialized_data['number']).execute()

    try:
        if result.data:
            # Update existing proposal
            serialized_data['updated_at'] = datetime_to_iso(datetime.now(timezone.utc))
            supabase.table('proposals').update(serialized_data).eq('id', result.data[0]['id']).execute()
            print(f"Updated proposal {serialized_data['number']}")
        else:
            # Create new proposal
            supabase.table('proposals').insert(serialized_data).execute()
            print(f"Inserted new proposal {serialized_data['number']}")
    except APIError as e:
        print(f"Error updating database for proposal {serialized_data['number']}: {e}")
        print(f"Error details: {e.details}")
        print(f"Problematic data: {json.dumps(serialized_data, default=str)}")
        
        if 'violates row-level security policy' in str(e):
            print("This error is likely due to row-level security policies. Please check your Supabase RLS settings.")
        
        # You might want to add more error handling here, such as skipping the problematic proposal
        # or attempting to update/insert without certain fields

def delete_proposal(proposal_type, number):
    try:
        result = supabase.table('proposals').delete().eq('proposal_type', proposal_type).eq('number', number).execute()
        if result.data:
            print(f"Deleted {proposal_type} proposal {number}")
        else:
            print(f"No {proposal_type} proposal {number} found to delete")
    except APIError as e:
        print(f"Error deleting {proposal_type} proposal {number}: {e}")

def ensure_sha_column_exists():
    try:
        # Try to select the 'sha' column
        supabase.table('proposals').select('sha').limit(1).execute()
    except APIError as e:
        if 'column proposals.sha does not exist' in str(e):
            print("'sha' column doesn't exist. Adding it to the 'proposals' table.")
            # Add the 'sha' column
            supabase.table('proposals').alter().add('sha', 'text').execute()
            print("'sha' column added successfully.")
        else:
            raise e

def process_proposals(repo_url, proposal_type, download=True):
    proposal_dir = os.path.join(LOCAL_STORAGE, proposal_type)
    os.makedirs(proposal_dir, exist_ok=True)
    print(f"Processing {proposal_type} proposals")

    if download:
        print(f"Checking for updates from {repo_url}")
        files = get_files_from_github(repo_url)
        for file in files:
            file_name = file['name']
            file_sha = file['sha']
            
            # Check if the proposal exists
            result = supabase.table('proposals').select('id', 'sha').eq('proposal_type', proposal_type).eq('number', int(file_name.split('-')[1].split('.')[0])).execute()
            
            if not result.data or 'sha' not in result.data[0] or file_sha != result.data[0]['sha']:
                print(f"Downloading {file_name}")
                content = download_file_content(file['download_url'])
                file_path = os.path.join(proposal_dir, file_name)
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Saved {file_name} to {file_path}")
                file_info = {
                    'name': file_name,
                    'html_url': file['html_url'],
                    'download_url': file['download_url'],
                    'sha': file_sha
                }
                info_path = os.path.join(proposal_dir, f"{file_name}.json")
                with open(info_path, 'w') as f:
                    json.dump(file_info, f)
                print(f"Saved file info to {info_path}")
            else:
                print(f"Skipping {file_name} - no updates")

    # Process all .md files in the directory
    md_files = [f for f in os.listdir(proposal_dir) if f.endswith('.md')]
    print(f"Found {len(md_files)} files to process")

    for file_name in md_files:
        file_path = os.path.join(proposal_dir, file_name)
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        info_path = os.path.join(proposal_dir, f"{file_name}.json")
        with open(info_path, 'r') as f:
            file_info = json.load(f)

        parsed_data = parse_markdown(content)

        # Check if the status is 'Moved'
        if parsed_data['metadata'].get('status', '').lower() == 'moved':
            print(f"Skipped {file_name} due to 'Moved' status")
            continue

        current_time = datetime.now(timezone.utc)
        created_at = parsed_data['metadata'].get('created_at')
        if isinstance(created_at, str):
            try:
                created_at = datetime.fromisoformat(created_at.replace('Z', '+00:00'))
            except ValueError:
                # If it's just a date without time
                created_at = datetime.strptime(created_at, '%Y-%m-%d').replace(tzinfo=timezone.utc)
        elif isinstance(created_at, date):
            created_at = datetime.combine(created_at, datetime.min.time()).replace(tzinfo=timezone.utc)

        data = {
            'proposal_type': proposal_type,
            'number': parsed_data['metadata'].get('number'),
            'slug': f"{proposal_type.lower()}-{parsed_data['metadata'].get('number')}",
            'category': parsed_data['metadata'].get('category'),
            'title': parsed_data['metadata'].get('title', ''),
            'description': parsed_data['metadata'].get('description'),
            'status': parsed_data['metadata'].get('status', ''),
            'type': parsed_data['metadata'].get('type', ''),
            'authors': parsed_data['metadata'].get('authors', ''),
            'github_url': file_info['html_url'],
            'discussion_url': parsed_data['metadata'].get('discussion_url'),
            'requires': parsed_data['metadata'].get('requires', ''),
            'created_at': created_at or current_time,
            'updated_at': current_time,
            'content': parsed_data['content'],
            'sha': file_info['sha']
        }

        update_database(proposal_type, data)
        print(f"Processed {file_name}")

    print(f"Finished processing {proposal_type} proposals")

def main(download):
    ensure_sha_column_exists()
    process_proposals(EIP_REPO, 'EIP', download)
    process_proposals(ERC_REPO, 'ERC', download)
    process_proposals(CAIP_REPO, 'CAIP', download)
    process_proposals(RIP_REPO, 'RIP', download)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Update proposal database with option to download files.")
    parser.add_argument('--download', action='store_true', help='Download files before updating database')
    args = parser.parse_args()

    main(args.download)