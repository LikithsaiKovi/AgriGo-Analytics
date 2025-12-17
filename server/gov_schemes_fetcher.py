"""
Government Schemes Data Fetcher Module

This module fetches agriculture government schemes data from the OGD Platform India
and stores it in a SQLite database for the Smart Farming Analytics application.

Author: Smart Farming Analytics Team
Date: 2025
"""

import requests
import sqlite3
import json
import logging
from datetime import datetime, date
from typing import List, Dict, Optional, Tuple
import pandas as pd
from urllib.parse import urlencode
import time
import argparse
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('gov_schemes_fetcher.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class GovernmentSchemesFetcher:
    """
    Fetches and manages government schemes data from OGD Platform India.
    """
    
    def __init__(self, db_path: str = "agriai.db"):
        """
        Initialize the fetcher with database path.
        
        Args:
            db_path (str): Path to SQLite database file
        """
        self.db_path = db_path
        self.api_base_url = "https://api.data.gov.in"
        self.api_key = "579b464db66ec23bdd000001cdd3946e44de4f064641eaf0bc5473fa"  # Current API key - may need renewal
        self.alternative_apis = [
            "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070",
            "https://api.data.gov.in/resource/agriculture-schemes",
            "https://api.data.gov.in/resource/farmer-schemes"
        ]
        
        # Initialize database
        self._init_database()
    
    def _init_database(self) -> None:
        """
        Initialize SQLite database and create gov_schemes table if it doesn't exist.
        """
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                # Create gov_schemes table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS gov_schemes (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        scheme_id TEXT UNIQUE,
                        scheme_name TEXT NOT NULL,
                        description TEXT,
                        ministry TEXT,
                        start_date DATE,
                        eligibility TEXT,
                        region TEXT,
                        last_updated DATETIME,
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
                # Create index for faster queries
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_scheme_id ON gov_schemes(scheme_id)
                """)
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_ministry ON gov_schemes(ministry)
                """)
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_region ON gov_schemes(region)
                """)
                
                conn.commit()
                logger.info("Database initialized successfully")
                
        except sqlite3.Error as e:
            logger.error(f"Database initialization failed: {e}")
            raise
    
    def _fetch_from_api(self) -> Optional[List[Dict]]:
        """
        Fetch government schemes data from OGD Platform India API.
        
        Returns:
            Optional[List[Dict]]: List of scheme records or None if fetch fails
        """
        # Try multiple API endpoints
        for api_url in self.alternative_apis:
            try:
                params = {
                    'api-key': self.api_key,
                    'format': 'json',
                    'limit': 1000,
                    'offset': 0
                }
                
                logger.info(f"Trying API endpoint: {api_url}")
                response = requests.get(api_url, params=params, timeout=30)
                
                if response.status_code == 200:
                    data = response.json()
                    
                    if 'records' in data and data['records']:
                        logger.info(f"Successfully fetched {len(data['records'])} records from {api_url}")
                        return data['records']
                    elif 'data' in data and data['data']:
                        logger.info(f"Successfully fetched {len(data['data'])} records from {api_url}")
                        return data['data']
                    else:
                        logger.warning(f"No valid data found in response from {api_url}")
                        continue
                else:
                    logger.warning(f"API endpoint {api_url} returned status {response.status_code}")
                    continue
                    
            except requests.exceptions.RequestException as e:
                logger.warning(f"Request failed for {api_url}: {e}")
                continue
            except json.JSONDecodeError as e:
                logger.warning(f"JSON parsing failed for {api_url}: {e}")
                continue
            except Exception as e:
                logger.warning(f"Unexpected error for {api_url}: {e}")
                continue
        
        logger.error("All API endpoints failed")
        return None
    
    def _fetch_from_csv_fallback(self) -> Optional[List[Dict]]:
        """
        Fallback method to fetch data from downloadable CSV if API is unavailable.
        
        Returns:
            Optional[List[Dict]]: List of scheme records or None if fetch fails
        """
        try:
            # CSV download URL (replace with actual URL)
            csv_url = "https://data.gov.in/sites/default/files/agriculture_schemes.csv"
            
            logger.info("Attempting to fetch data from CSV fallback")
            response = requests.get(csv_url, timeout=30)
            response.raise_for_status()
            
            # Read CSV data
            from io import StringIO
            csv_data = StringIO(response.text)
            df = pd.read_csv(csv_data)
            
            # Convert DataFrame to list of dictionaries
            records = df.to_dict('records')
            logger.info(f"Successfully fetched {len(records)} records from CSV")
            return records
            
        except Exception as e:
            logger.error(f"CSV fallback fetch failed: {e}")
            return None
    
    def _parse_scheme_data(self, raw_data: List[Dict]) -> List[Dict]:
        """
        Parse raw scheme data and extract required fields.
        
        Args:
            raw_data (List[Dict]): Raw data from API/CSV
            
        Returns:
            List[Dict]: Parsed scheme records
        """
        parsed_schemes = []
        
        for record in raw_data:
            try:
                # Extract and clean data fields
                scheme_id = str(record.get('scheme_id', '')).strip()
                scheme_name = str(record.get('scheme_name', '')).strip()
                description = str(record.get('description', '')).strip()
                ministry = str(record.get('implementing_ministry', '')).strip()
                
                # Parse start date
                start_date_str = record.get('start_date', '')
                start_date = None
                if start_date_str:
                    try:
                        start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
                    except ValueError:
                        try:
                            start_date = datetime.strptime(start_date_str, '%d/%m/%Y').date()
                        except ValueError:
                            logger.warning(f"Could not parse start_date: {start_date_str}")
                
                eligibility = str(record.get('eligibility_criteria', '')).strip()
                region = str(record.get('region', 'Central')).strip()
                
                # Parse last updated
                last_updated_str = record.get('last_updated', '')
                last_updated = datetime.now()
                if last_updated_str:
                    try:
                        last_updated = datetime.strptime(last_updated_str, '%Y-%m-%d %H:%M:%S')
                    except ValueError:
                        try:
                            last_updated = datetime.strptime(last_updated_str, '%d/%m/%Y')
                        except ValueError:
                            logger.warning(f"Could not parse last_updated: {last_updated_str}")
                
                # Only add if we have essential fields
                if scheme_id and scheme_name:
                    parsed_scheme = {
                        'scheme_id': scheme_id,
                        'scheme_name': scheme_name,
                        'description': description,
                        'ministry': ministry,
                        'start_date': start_date,
                        'eligibility': eligibility,
                        'region': region,
                        'last_updated': last_updated
                    }
                    parsed_schemes.append(parsed_scheme)
                else:
                    logger.warning(f"Skipping record with missing essential fields: {record}")
                    
            except Exception as e:
                logger.error(f"Error parsing record: {e}")
                continue
        
        logger.info(f"Successfully parsed {len(parsed_schemes)} schemes")
        return parsed_schemes
    
    def _store_schemes(self, schemes: List[Dict]) -> Tuple[int, int]:
        """
        Store schemes in database, updating existing records if newer.
        
        Args:
            schemes (List[Dict]): List of parsed scheme records
            
        Returns:
            Tuple[int, int]: (new_schemes_count, updated_schemes_count)
        """
        new_count = 0
        updated_count = 0
        
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                for scheme in schemes:
                    try:
                        # Check if scheme already exists
                        cursor.execute("""
                            SELECT last_updated FROM gov_schemes 
                            WHERE scheme_id = ?
                        """, (scheme['scheme_id'],))
                        
                        existing_record = cursor.fetchone()
                        
                        if existing_record:
                            # Check if new data is newer
                            existing_last_updated = datetime.fromisoformat(existing_record[0])
                            
                            if scheme['last_updated'] > existing_last_updated:
                                # Update existing record
                                cursor.execute("""
                                    UPDATE gov_schemes SET
                                        scheme_name = ?, description = ?, ministry = ?,
                                        start_date = ?, eligibility = ?, region = ?,
                                        last_updated = ?, updated_at = CURRENT_TIMESTAMP
                                    WHERE scheme_id = ?
                                """, (
                                    scheme['scheme_name'], scheme['description'], scheme['ministry'],
                                    scheme['start_date'], scheme['eligibility'], scheme['region'],
                                    scheme['last_updated'], scheme['scheme_id']
                                ))
                                updated_count += 1
                                logger.debug(f"Updated scheme: {scheme['scheme_name']}")
                            else:
                                logger.debug(f"Skipping older data for scheme: {scheme['scheme_name']}")
                        else:
                            # Insert new record
                            cursor.execute("""
                                INSERT INTO gov_schemes (
                                    scheme_id, scheme_name, description, ministry,
                                    start_date, eligibility, region, last_updated
                                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                            """, (
                                scheme['scheme_id'], scheme['scheme_name'], scheme['description'],
                                scheme['ministry'], scheme['start_date'], scheme['eligibility'],
                                scheme['region'], scheme['last_updated']
                            ))
                            new_count += 1
                            logger.debug(f"Inserted new scheme: {scheme['scheme_name']}")
                            
                    except sqlite3.Error as e:
                        logger.error(f"Database error for scheme {scheme.get('scheme_name', 'Unknown')}: {e}")
                        continue
                
                conn.commit()
                logger.info(f"Database operations completed: {new_count} new, {updated_count} updated")
                
        except sqlite3.Error as e:
            logger.error(f"Database connection error: {e}")
            raise
        
        return new_count, updated_count
    
    def fetch_and_store_schemes(self) -> Dict[str, int]:
        """
        Main function to fetch and store government schemes data.
        
        Returns:
            Dict[str, int]: Summary of operation results
        """
        logger.info("Starting government schemes data fetch and store operation")
        start_time = datetime.now()
        
        try:
            # Try API first
            raw_data = self._fetch_from_api()
            
            # Fallback to CSV if API fails
            if not raw_data:
                logger.info("API fetch failed, trying CSV fallback")
                raw_data = self._fetch_from_csv_fallback()
            
            if not raw_data:
                logger.error("Both API and CSV fallback failed")
                return {
                    'status': 'failed',
                    'new_schemes': 0,
                    'updated_schemes': 0,
                    'total_schemes': 0,
                    'fetch_time': 0
                }
            
            # Parse the data
            parsed_schemes = self._parse_scheme_data(raw_data)
            
            if not parsed_schemes:
                logger.error("No valid schemes found after parsing")
                return {
                    'status': 'failed',
                    'new_schemes': 0,
                    'updated_schemes': 0,
                    'total_schemes': 0,
                    'fetch_time': 0
                }
            
            # Store in database
            new_count, updated_count = self._store_schemes(parsed_schemes)
            
            end_time = datetime.now()
            fetch_time = (end_time - start_time).total_seconds()
            
            result = {
                'status': 'success',
                'new_schemes': new_count,
                'updated_schemes': updated_count,
                'total_schemes': len(parsed_schemes),
                'fetch_time': fetch_time
            }
            
            logger.info(f"Operation completed successfully: {result}")
            return result
            
        except Exception as e:
            logger.error(f"Unexpected error in fetch_and_store_schemes: {e}")
            return {
                'status': 'error',
                'new_schemes': 0,
                'updated_schemes': 0,
                'total_schemes': 0,
                'fetch_time': 0,
                'error': str(e)
            }
    
    def get_schemes_from_db(self, region: Optional[str] = None, ministry: Optional[str] = None, state: Optional[str] = None) -> List[Dict]:
        """
        Retrieve schemes from database with optional filtering.
        
        Args:
            region (Optional[str]): Filter by region (Central/State)
            ministry (Optional[str]): Filter by ministry
            state (Optional[str]): Filter by state name
            
        Returns:
            List[Dict]: List of scheme records
        """
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                
                query = "SELECT * FROM gov_schemes WHERE 1=1"
                params = []
                
                if region:
                    query += " AND region = ?"
                    params.append(region)
                
                if ministry:
                    query += " AND ministry LIKE ?"
                    params.append(f"%{ministry}%")
                
                if state:
                    query += " AND (ministry LIKE ? OR scheme_name LIKE ?)"
                    params.extend([f"%{state}%", f"%{state}%"])
                
                query += " ORDER BY last_updated DESC"
                
                cursor.execute(query, params)
                columns = [description[0] for description in cursor.description]
                rows = cursor.fetchall()
                
                schemes = []
                for row in rows:
                    scheme = dict(zip(columns, row))
                    # Convert datetime objects to strings for JSON serialization
                    for key, value in scheme.items():
                        if isinstance(value, datetime):
                            scheme[key] = value.isoformat()
                        elif isinstance(value, date):
                            scheme[key] = value.isoformat()
                    schemes.append(scheme)
                
                logger.info(f"Retrieved {len(schemes)} schemes from database")
                return schemes
                
        except sqlite3.Error as e:
            logger.error(f"Database error while retrieving schemes: {e}")
            return []


def fetch_and_store_schemes() -> Dict[str, int]:
    """
    Standalone function for scheduling the scheme fetch operation.
    
    Returns:
        Dict[str, int]: Summary of operation results
    """
    fetcher = GovernmentSchemesFetcher()
    return fetcher.fetch_and_store_schemes()


def get_scheme_by_id(scheme_id: str) -> Optional[Dict]:
    """
    Get a specific scheme by ID.
    
    Args:
        scheme_id (str): The scheme ID to retrieve
        
    Returns:
        Optional[Dict]: Scheme data or None if not found
    """
    fetcher = GovernmentSchemesFetcher()
    try:
        with sqlite3.connect(fetcher.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM gov_schemes WHERE scheme_id = ?", (scheme_id,))
            row = cursor.fetchone()
            
            if row:
                columns = [description[0] for description in cursor.description]
                scheme = dict(zip(columns, row))
                # Convert datetime objects to strings for JSON serialization
                for key, value in scheme.items():
                    if isinstance(value, datetime):
                        scheme[key] = value.isoformat()
                    elif isinstance(value, date):
                        scheme[key] = value.isoformat()
                return scheme
            return None
    except sqlite3.Error as e:
        logger.error(f"Database error while retrieving scheme {scheme_id}: {e}")
        return None


def get_scheme_statistics() -> Dict:
    """
    Get statistics about schemes in the database.
    
    Returns:
        Dict: Statistics about schemes
    """
    fetcher = GovernmentSchemesFetcher()
    try:
        with sqlite3.connect(fetcher.db_path) as conn:
            cursor = conn.cursor()
            
            # Total schemes
            cursor.execute("SELECT COUNT(*) FROM gov_schemes")
            total_schemes = cursor.fetchone()[0]
            
            # Schemes by region
            cursor.execute("SELECT region, COUNT(*) FROM gov_schemes GROUP BY region")
            region_stats = dict(cursor.fetchall())
            
            # Schemes by ministry
            cursor.execute("SELECT ministry, COUNT(*) FROM gov_schemes GROUP BY ministry ORDER BY COUNT(*) DESC LIMIT 10")
            ministry_stats = dict(cursor.fetchall())
            
            # Recent schemes (last 30 days)
            cursor.execute("SELECT COUNT(*) FROM gov_schemes WHERE last_updated >= date('now', '-30 days')")
            recent_schemes = cursor.fetchone()[0]
            
            return {
                'total_schemes': total_schemes,
                'region_stats': region_stats,
                'ministry_stats': ministry_stats,
                'recent_schemes': recent_schemes
            }
    except sqlite3.Error as e:
        logger.error(f"Database error while retrieving statistics: {e}")
        return {}


def get_available_states() -> List[str]:
    """
    Get list of available states from the database.
    
    Returns:
        List[str]: List of state names
    """
    fetcher = GovernmentSchemesFetcher()
    try:
        with sqlite3.connect(fetcher.db_path) as conn:
            cursor = conn.cursor()
            
            # Get states from ministry names and scheme names
            cursor.execute("""
                SELECT DISTINCT 
                    CASE 
                        WHEN ministry LIKE '%Maharashtra%' THEN 'Maharashtra'
                        WHEN ministry LIKE '%Punjab%' THEN 'Punjab'
                        WHEN ministry LIKE '%Tamil Nadu%' THEN 'Tamil Nadu'
                        WHEN ministry LIKE '%Karnataka%' THEN 'Karnataka'
                        WHEN ministry LIKE '%Gujarat%' THEN 'Gujarat'
                        WHEN ministry LIKE '%Uttar Pradesh%' THEN 'Uttar Pradesh'
                        WHEN ministry LIKE '%Bihar%' THEN 'Bihar'
                        WHEN ministry LIKE '%West Bengal%' THEN 'West Bengal'
                        WHEN ministry LIKE '%Rajasthan%' THEN 'Rajasthan'
                        WHEN ministry LIKE '%Madhya Pradesh%' THEN 'Madhya Pradesh'
                        WHEN ministry LIKE '%Andhra Pradesh%' THEN 'Andhra Pradesh'
                        WHEN ministry LIKE '%Telangana%' THEN 'Telangana'
                        WHEN ministry LIKE '%Kerala%' THEN 'Kerala'
                        WHEN ministry LIKE '%Odisha%' THEN 'Odisha'
                        WHEN ministry LIKE '%Assam%' THEN 'Assam'
                        WHEN ministry LIKE '%Jharkhand%' THEN 'Jharkhand'
                        WHEN ministry LIKE '%Chhattisgarh%' THEN 'Chhattisgarh'
                        WHEN ministry LIKE '%Haryana%' THEN 'Haryana'
                        WHEN ministry LIKE '%Delhi%' THEN 'Delhi'
                        WHEN ministry LIKE '%Himachal Pradesh%' THEN 'Himachal Pradesh'
                        WHEN ministry LIKE '%Uttarakhand%' THEN 'Uttarakhand'
                        WHEN ministry LIKE '%Jammu and Kashmir%' THEN 'Jammu and Kashmir'
                        WHEN ministry LIKE '%Ladakh%' THEN 'Ladakh'
                        WHEN ministry LIKE '%Goa%' THEN 'Goa'
                        WHEN ministry LIKE '%Sikkim%' THEN 'Sikkim'
                        WHEN ministry LIKE '%Manipur%' THEN 'Manipur'
                        WHEN ministry LIKE '%Meghalaya%' THEN 'Meghalaya'
                        WHEN ministry LIKE '%Mizoram%' THEN 'Mizoram'
                        WHEN ministry LIKE '%Nagaland%' THEN 'Nagaland'
                        WHEN ministry LIKE '%Tripura%' THEN 'Tripura'
                        WHEN ministry LIKE '%Arunachal Pradesh%' THEN 'Arunachal Pradesh'
                        ELSE NULL
                    END as state
                FROM gov_schemes 
                WHERE region = 'State' AND state IS NOT NULL
                ORDER BY state
            """)
            
            states = [row[0] for row in cursor.fetchall() if row[0]]
            
            # Add common states if not found in database
            common_states = [
                'Maharashtra', 'Punjab', 'Tamil Nadu', 'Karnataka', 'Gujarat',
                'Uttar Pradesh', 'Bihar', 'West Bengal', 'Rajasthan', 'Madhya Pradesh',
                'Andhra Pradesh', 'Telangana', 'Kerala', 'Odisha', 'Assam',
                'Jharkhand', 'Chhattisgarh', 'Haryana', 'Delhi', 'Himachal Pradesh',
                'Uttarakhand', 'Jammu and Kashmir', 'Ladakh', 'Goa', 'Sikkim',
                'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Tripura', 'Arunachal Pradesh'
            ]
            
            # Combine and deduplicate
            all_states = list(set(states + common_states))
            all_states.sort()
            
            return all_states
            
    except sqlite3.Error as e:
        logger.error(f"Database error while retrieving states: {e}")
        return []


def main():
    """
    Command-line interface for the government schemes fetcher.
    """
    parser = argparse.ArgumentParser(description='Government Schemes Data Fetcher')
    subparsers = parser.add_subparsers(dest='command', help='Available commands')
    
    # Fetch schemes command
    fetch_parser = subparsers.add_parser('fetch_schemes', help='Fetch and store schemes from API')
    
    # Get schemes command
    get_parser = subparsers.add_parser('get_schemes', help='Get schemes from database')
    get_parser.add_argument('--region', help='Filter by region (Central/State)')
    get_parser.add_argument('--ministry', help='Filter by ministry')
    get_parser.add_argument('--state', help='Filter by state name')
    
    # Get scheme by ID command
    get_scheme_parser = subparsers.add_parser('get_scheme', help='Get specific scheme by ID')
    get_scheme_parser.add_argument('--id', required=True, help='Scheme ID to retrieve')
    
    # Get statistics command
    stats_parser = subparsers.add_parser('get_stats', help='Get scheme statistics')
    
    # Get states command
    states_parser = subparsers.add_parser('get_states', help='Get available states')
    
    args = parser.parse_args()
    
    if args.command == 'fetch_schemes':
        result = fetch_and_store_schemes()
        print(json.dumps(result))
        
    elif args.command == 'get_schemes':
        fetcher = GovernmentSchemesFetcher()
        schemes = fetcher.get_schemes_from_db(
            region=args.region,
            ministry=args.ministry,
            state=args.state
        )
        print(json.dumps(schemes))
        
    elif args.command == 'get_scheme':
        scheme = get_scheme_by_id(args.id)
        if scheme:
            print(json.dumps(scheme))
        else:
            print(json.dumps({"error": "Scheme not found"}))
            
    elif args.command == 'get_stats':
        stats = get_scheme_statistics()
        print(json.dumps(stats))
        
    elif args.command == 'get_states':
        states = get_available_states()
        print(json.dumps(states))
        
    else:
        parser.print_help()


# Example usage and testing
if __name__ == "__main__":
    if len(sys.argv) > 1:
        main()
    else:
        # Test the fetcher
        fetcher = GovernmentSchemesFetcher()
        
        # Fetch and store schemes
        result = fetcher.fetch_and_store_schemes()
        print(f"Fetch result: {result}")
        
        # Test database retrieval
        schemes = fetcher.get_schemes_from_db()
        print(f"Retrieved {len(schemes)} schemes from database")
        
        # Test filtering
        central_schemes = fetcher.get_schemes_from_db(region="Central")
        print(f"Central schemes: {len(central_schemes)}")

