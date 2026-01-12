"""
Proposal Enrichment Script
Updates title_descriptive and why_important fields in Supabase.

Usage:
    python enrich_proposals.py <json_file> [--dry-run]

JSON format:
{
    "enrichments": [
        {
            "proposal_type": "EIP",
            "number": 1559,
            "title_descriptive": "...",
            "why_important": "..."
        }
    ]
}
"""

import os
import json
import argparse
from supabase import create_client, Client
from dotenv import load_dotenv
from datetime import datetime, timezone
from postgrest.exceptions import APIError

load_dotenv()

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)


def load_enrichment_data(json_path: str) -> dict:
    """Load enrichment data from JSON file."""
    with open(json_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def validate_enrichment_item(item: dict) -> tuple:
    """Validate a single enrichment item. Returns (is_valid, message)."""
    required_fields = ['proposal_type', 'number']
    content_fields = ['title_descriptive', 'why_important']

    for field in required_fields:
        if field not in item:
            return False, f"Missing required field: {field}"

    if item['proposal_type'] not in ['EIP', 'ERC', 'CAIP', 'RIP']:
        return False, f"Invalid proposal_type: {item['proposal_type']}"

    if not isinstance(item['number'], int):
        return False, f"Number must be an integer, got: {type(item['number'])}"

    has_content = any(field in item and item[field] for field in content_fields)
    if not has_content:
        return False, "At least one of title_descriptive or why_important must be provided"

    return True, "OK"


def update_proposal(proposal_type: str, number: int,
                   title_descriptive: str = None,
                   why_important: str = None,
                   dry_run: bool = False) -> bool:
    """Update a single proposal in Supabase."""

    # Build update data
    update_data = {'updated_at': datetime.now(timezone.utc).isoformat()}
    if title_descriptive:
        update_data['title_descriptive'] = title_descriptive
    if why_important:
        update_data['why_important'] = why_important

    if dry_run:
        print(f"[DRY RUN] Would update {proposal_type}-{number}:")
        if title_descriptive:
            preview = title_descriptive[:80] + "..." if len(title_descriptive) > 80 else title_descriptive
            print(f"  title_descriptive: {preview}")
        if why_important:
            preview = why_important[:80] + "..." if len(why_important) > 80 else why_important
            print(f"  why_important: {preview}")
        return True

    try:
        result = supabase.table('proposals').update(update_data)\
            .eq('proposal_type', proposal_type)\
            .eq('number', number)\
            .execute()

        if result.data:
            print(f"Updated {proposal_type}-{number}")
            return True
        else:
            print(f"Warning: No matching proposal found for {proposal_type}-{number}")
            return False

    except APIError as e:
        print(f"Error updating {proposal_type}-{number}: {e}")
        return False


def main(json_path: str, dry_run: bool = False):
    """Main entry point."""
    data = load_enrichment_data(json_path)
    enrichments = data.get('enrichments', [])

    print(f"Processing {len(enrichments)} enrichments...")
    if dry_run:
        print("(DRY RUN - no changes will be made)\n")
    else:
        print()

    success_count = 0
    error_count = 0

    for item in enrichments:
        is_valid, message = validate_enrichment_item(item)
        if not is_valid:
            print(f"Skipping invalid item: {message}")
            print(f"  Item: {item}")
            error_count += 1
            continue

        success = update_proposal(
            proposal_type=item['proposal_type'],
            number=item['number'],
            title_descriptive=item.get('title_descriptive'),
            why_important=item.get('why_important'),
            dry_run=dry_run
        )

        if success:
            success_count += 1
        else:
            error_count += 1

    print()
    print(f"Complete: {success_count} successful, {error_count} errors")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Update proposal enrichments in Supabase")
    parser.add_argument('json_file', help='Path to JSON file with enrichment data')
    parser.add_argument('--dry-run', action='store_true', help='Preview changes without updating database')
    args = parser.parse_args()

    main(args.json_file, args.dry_run)
