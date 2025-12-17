"""
Mock Government Schemes Data Populator

This script populates the database with sample government schemes data
for testing the Smart Farming Analytics application.

Author: Smart Farming Analytics Team
Date: 2025
"""

import sqlite3
import logging
from datetime import datetime, date, timedelta
import random

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def populate_mock_schemes(db_path="agriai.db"):
    """
    Populate database with mock government schemes data.
    """
    try:
        with sqlite3.connect(db_path) as conn:
            cursor = conn.cursor()
            
            # Clear existing data
            cursor.execute("DELETE FROM gov_schemes")
            logger.info("Cleared existing schemes data")
            
            # Comprehensive mock schemes data with real scheme names
            mock_schemes = [
                {
                    'scheme_id': 'PM-KISAN-001',
                    'scheme_name': 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
                    'description': 'Direct income support of ₹6,000 per year to all landholding farmer families across the country.',
                    'ministry': 'Ministry of Agriculture and Farmers Welfare',
                    'start_date': date(2019, 2, 1),
                    'eligibility': 'All landholding farmer families with cultivable land',
                    'region': 'Central',
                    'last_updated': datetime.now() - timedelta(days=random.randint(1, 30))
                },
                {
                    'scheme_id': 'PMFBY-002',
                    'scheme_name': 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
                    'description': 'Crop insurance scheme to provide financial support to farmers in case of crop failure.',
                    'ministry': 'Ministry of Agriculture and Farmers Welfare',
                    'start_date': date(2016, 4, 1),
                    'eligibility': 'All farmers growing notified crops in notified areas',
                    'region': 'Central',
                    'last_updated': datetime.now() - timedelta(days=random.randint(1, 30))
                },
                {
                    'scheme_id': 'PMKSY-003',
                    'scheme_name': 'Pradhan Mantri Krishi Sinchai Yojana (PMKSY)',
                    'description': 'Scheme to provide end-to-end solutions in irrigation supply chain.',
                    'ministry': 'Ministry of Agriculture and Farmers Welfare',
                    'start_date': date(2015, 7, 1),
                    'eligibility': 'Farmers, farmer groups, and agricultural cooperatives',
                    'region': 'Central',
                    'last_updated': datetime.now() - timedelta(days=random.randint(1, 30))
                },
                {
                    'scheme_id': 'SHC-004',
                    'scheme_name': 'Soil Health Card Scheme',
                    'description': 'Scheme to provide soil health cards to farmers with recommendations for appropriate use of fertilizers.',
                    'ministry': 'Ministry of Agriculture and Farmers Welfare',
                    'start_date': date(2015, 2, 19),
                    'eligibility': 'All farmers across the country',
                    'region': 'Central',
                    'last_updated': datetime.now() - timedelta(days=random.randint(1, 30))
                },
                {
                    'scheme_id': 'PMKSY-WDC-005',
                    'scheme_name': 'Watershed Development Component (WDC)',
                    'description': 'Comprehensive treatment of watershed areas for soil and water conservation.',
                    'ministry': 'Ministry of Agriculture and Farmers Welfare',
                    'start_date': date(2015, 7, 1),
                    'eligibility': 'Farmers in watershed areas',
                    'region': 'Central',
                    'last_updated': datetime.now() - timedelta(days=random.randint(1, 30))
                },
                {
                    'scheme_id': 'KCC-006',
                    'scheme_name': 'Kisan Credit Card (KCC)',
                    'description': 'Credit card scheme for farmers to meet their short-term credit requirements.',
                    'ministry': 'Ministry of Agriculture and Farmers Welfare',
                    'start_date': date(1998, 8, 1),
                    'eligibility': 'All farmers, tenant farmers, oral lessees, and sharecroppers',
                    'region': 'Central',
                    'last_updated': datetime.now() - timedelta(days=random.randint(1, 30))
                },
                {
                    'scheme_id': 'PMKSY-PDMC-007',
                    'scheme_name': 'Per Drop More Crop (PDMC)',
                    'description': 'Micro irrigation scheme to promote water use efficiency.',
                    'ministry': 'Ministry of Agriculture and Farmers Welfare',
                    'start_date': date(2015, 7, 1),
                    'eligibility': 'Farmers adopting micro irrigation systems',
                    'region': 'Central',
                    'last_updated': datetime.now() - timedelta(days=random.randint(1, 30))
                },
                {
                    'scheme_id': 'PMKSY-AIBP-008',
                    'scheme_name': 'Accelerated Irrigation Benefit Programme (AIBP)',
                    'description': 'Central assistance to states for major/medium irrigation projects.',
                    'ministry': 'Ministry of Water Resources',
                    'start_date': date(1996, 4, 1),
                    'eligibility': 'State governments for irrigation projects',
                    'region': 'Central',
                    'last_updated': datetime.now() - timedelta(days=random.randint(1, 30))
                },
                {
                    'scheme_id': 'PMKSY-HKKP-009',
                    'scheme_name': 'Har Khet Ko Pani (HKKP)',
                    'description': 'Scheme to provide water to every field through various water sources.',
                    'ministry': 'Ministry of Water Resources',
                    'start_date': date(2015, 7, 1),
                    'eligibility': 'Farmers in areas with water scarcity',
                    'region': 'Central',
                    'last_updated': datetime.now() - timedelta(days=random.randint(1, 30))
                },
                {
                    'scheme_id': 'PMKSY-SCADP-010',
                    'scheme_name': 'Surface Minor Irrigation (SMI) and Repair, Renovation and Restoration (RRR)',
                    'description': 'Scheme for renovation and restoration of water bodies and minor irrigation structures.',
                    'ministry': 'Ministry of Water Resources',
                    'start_date': date(2015, 7, 1),
                    'eligibility': 'Farmers and water user associations',
                    'region': 'Central',
                    'last_updated': datetime.now() - timedelta(days=random.randint(1, 30))
                },
                {
                    'scheme_id': 'MAHARASHTRA-001',
                    'scheme_name': 'Maharashtra Krishi Pump Yojana',
                    'description': 'Subsidy scheme for solar pumps for farmers in Maharashtra.',
                    'ministry': 'Maharashtra Agriculture Department',
                    'start_date': date(2020, 4, 1),
                    'eligibility': 'Farmers in Maharashtra with landholding',
                    'region': 'State',
                    'last_updated': datetime.now() - timedelta(days=random.randint(1, 30))
                },
                {
                    'scheme_id': 'PUNJAB-001',
                    'scheme_name': 'Punjab Kisan Credit Card Scheme',
                    'description': 'Enhanced credit facility for farmers in Punjab.',
                    'ministry': 'Punjab Agriculture Department',
                    'start_date': date(2019, 6, 1),
                    'eligibility': 'Farmers in Punjab',
                    'region': 'State',
                    'last_updated': datetime.now() - timedelta(days=random.randint(1, 30))
                },
                {
                    'scheme_id': 'TAMILNADU-001',
                    'scheme_name': 'Tamil Nadu Solar Pump Scheme',
                    'description': 'Subsidy for solar pumps to reduce electricity costs for farmers.',
                    'ministry': 'Tamil Nadu Agriculture Department',
                    'start_date': date(2021, 1, 1),
                    'eligibility': 'Farmers in Tamil Nadu',
                    'region': 'State',
                    'last_updated': datetime.now() - timedelta(days=random.randint(1, 30))
                },
                {
                    'scheme_id': 'KARNATAKA-001',
                    'scheme_name': 'Karnataka Raitha Siri Scheme',
                    'description': 'Direct benefit transfer scheme for farmers in Karnataka.',
                    'ministry': 'Karnataka Agriculture Department',
                    'start_date': date(2020, 3, 1),
                    'eligibility': 'Farmers in Karnataka',
                    'region': 'State',
                    'last_updated': datetime.now() - timedelta(days=random.randint(1, 30))
                },
                {
                    'scheme_id': 'GUJARAT-001',
                    'scheme_name': 'Gujarat Krishi Pump Yojana',
                    'description': 'Subsidy scheme for agricultural pumps in Gujarat.',
                    'ministry': 'Gujarat Agriculture Department',
                    'start_date': date(2019, 8, 1),
                    'eligibility': 'Farmers in Gujarat',
                    'region': 'State',
                    'last_updated': datetime.now() - timedelta(days=random.randint(1, 30))
                },
                {
                    'scheme_id': 'UTTAR-PRADESH-001',
                    'scheme_name': 'Uttar Pradesh Kisan Credit Card Scheme',
                    'description': 'Enhanced credit facility for farmers in Uttar Pradesh.',
                    'ministry': 'Uttar Pradesh Agriculture Department',
                    'start_date': date(2020, 1, 1),
                    'eligibility': 'Farmers in Uttar Pradesh',
                    'region': 'State',
                    'last_updated': datetime.now() - timedelta(days=random.randint(1, 30))
                },
                {
                    'scheme_id': 'BIHAR-001',
                    'scheme_name': 'Bihar Krishi Pump Yojana',
                    'description': 'Solar pump subsidy scheme for farmers in Bihar.',
                    'ministry': 'Bihar Agriculture Department',
                    'start_date': date(2021, 4, 1),
                    'eligibility': 'Farmers in Bihar',
                    'region': 'State',
                    'last_updated': datetime.now() - timedelta(days=random.randint(1, 30))
                },
                {
                    'scheme_id': 'WEST-BENGAL-001',
                    'scheme_name': 'West Bengal Krishi Sathi Scheme',
                    'description': 'Direct benefit transfer scheme for farmers in West Bengal.',
                    'ministry': 'West Bengal Agriculture Department',
                    'start_date': date(2020, 6, 1),
                    'eligibility': 'Farmers in West Bengal',
                    'region': 'State',
                    'last_updated': datetime.now() - timedelta(days=random.randint(1, 30))
                },
                {
                    'scheme_id': 'RAJASTHAN-001',
                    'scheme_name': 'Rajasthan Krishi Pump Yojana',
                    'description': 'Subsidy scheme for agricultural pumps in Rajasthan.',
                    'ministry': 'Rajasthan Agriculture Department',
                    'start_date': date(2019, 10, 1),
                    'eligibility': 'Farmers in Rajasthan',
                    'region': 'State',
                    'last_updated': datetime.now() - timedelta(days=random.randint(1, 30))
                },
                {
                    'scheme_id': 'MADHYA-PRADESH-001',
                    'scheme_name': 'Madhya Pradesh Krishi Pump Yojana',
                    'description': 'Solar pump subsidy for farmers in Madhya Pradesh.',
                    'ministry': 'Madhya Pradesh Agriculture Department',
                    'start_date': date(2020, 3, 1),
                    'eligibility': 'Farmers in Madhya Pradesh',
                    'region': 'State',
                    'last_updated': datetime.now() - timedelta(days=random.randint(1, 30))
                },
                {
                    'scheme_id': 'ANDHRA-PRADESH-001',
                    'scheme_name': 'Andhra Pradesh Rythu Bharosa Scheme',
                    'description': 'Direct benefit transfer scheme for farmers in Andhra Pradesh.',
                    'ministry': 'Andhra Pradesh Agriculture Department',
                    'start_date': date(2019, 5, 1),
                    'eligibility': 'Farmers in Andhra Pradesh',
                    'region': 'State',
                    'last_updated': datetime.now() - timedelta(days=random.randint(1, 30))
                },
                {
                    'scheme_id': 'TELANGANA-001',
                    'scheme_name': 'Telangana Rythu Bandhu Scheme',
                    'description': 'Investment support scheme for farmers in Telangana.',
                    'ministry': 'Telangana Agriculture Department',
                    'start_date': date(2018, 5, 1),
                    'eligibility': 'Farmers in Telangana',
                    'region': 'State',
                    'last_updated': datetime.now() - timedelta(days=random.randint(1, 30))
                },
                {
                    'scheme_id': 'KERALA-001',
                    'scheme_name': 'Kerala Krishi Pump Yojana',
                    'description': 'Solar pump subsidy scheme for farmers in Kerala.',
                    'ministry': 'Kerala Agriculture Department',
                    'start_date': date(2021, 1, 1),
                    'eligibility': 'Farmers in Kerala',
                    'region': 'State',
                    'last_updated': datetime.now() - timedelta(days=random.randint(1, 30))
                },
                {
                    'scheme_id': 'ODISHA-001',
                    'scheme_name': 'Odisha Krishi Pump Yojana',
                    'description': 'Agricultural pump subsidy scheme for farmers in Odisha.',
                    'ministry': 'Odisha Agriculture Department',
                    'start_date': date(2020, 7, 1),
                    'eligibility': 'Farmers in Odisha',
                    'region': 'State',
                    'last_updated': datetime.now() - timedelta(days=random.randint(1, 30))
                },
                {
                    'scheme_id': 'ASSAM-001',
                    'scheme_name': 'Assam Krishi Pump Yojana',
                    'description': 'Solar pump subsidy for farmers in Assam.',
                    'ministry': 'Assam Agriculture Department',
                    'start_date': date(2021, 2, 1),
                    'eligibility': 'Farmers in Assam',
                    'region': 'State',
                    'last_updated': datetime.now() - timedelta(days=random.randint(1, 30))
                },
                {
                    'scheme_id': 'JHARKHAND-001',
                    'scheme_name': 'Jharkhand Krishi Pump Yojana',
                    'description': 'Agricultural pump subsidy scheme for farmers in Jharkhand.',
                    'ministry': 'Jharkhand Agriculture Department',
                    'start_date': date(2020, 9, 1),
                    'eligibility': 'Farmers in Jharkhand',
                    'region': 'State',
                    'last_updated': datetime.now() - timedelta(days=random.randint(1, 30))
                },
                {
                    'scheme_id': 'CHHATTISGARH-001',
                    'scheme_name': 'Chhattisgarh Krishi Pump Yojana',
                    'description': 'Solar pump subsidy for farmers in Chhattisgarh.',
                    'ministry': 'Chhattisgarh Agriculture Department',
                    'start_date': date(2021, 3, 1),
                    'eligibility': 'Farmers in Chhattisgarh',
                    'region': 'State',
                    'last_updated': datetime.now() - timedelta(days=random.randint(1, 30))
                },
                {
                    'scheme_id': 'HARYANA-001',
                    'scheme_name': 'Haryana Krishi Pump Yojana',
                    'description': 'Agricultural pump subsidy scheme for farmers in Haryana.',
                    'ministry': 'Haryana Agriculture Department',
                    'start_date': date(2020, 4, 1),
                    'eligibility': 'Farmers in Haryana',
                    'region': 'State',
                    'last_updated': datetime.now() - timedelta(days=random.randint(1, 30))
                },
                {
                    'scheme_id': 'DELHI-001',
                    'scheme_name': 'Delhi Krishi Pump Yojana',
                    'description': 'Urban farming support scheme for farmers in Delhi.',
                    'ministry': 'Delhi Agriculture Department',
                    'start_date': date(2021, 1, 1),
                    'eligibility': 'Farmers in Delhi',
                    'region': 'State',
                    'last_updated': datetime.now() - timedelta(days=random.randint(1, 30))
                },
                {
                    'scheme_id': 'HIMACHAL-PRADESH-001',
                    'scheme_name': 'Himachal Pradesh Krishi Pump Yojana',
                    'description': 'Solar pump subsidy for farmers in Himachal Pradesh.',
                    'ministry': 'Himachal Pradesh Agriculture Department',
                    'start_date': date(2020, 5, 1),
                    'eligibility': 'Farmers in Himachal Pradesh',
                    'region': 'State',
                    'last_updated': datetime.now() - timedelta(days=random.randint(1, 30))
                },
                {
                    'scheme_id': 'UTTARAKHAND-001',
                    'scheme_name': 'Uttarakhand Krishi Pump Yojana',
                    'description': 'Agricultural pump subsidy scheme for farmers in Uttarakhand.',
                    'ministry': 'Uttarakhand Agriculture Department',
                    'start_date': date(2021, 6, 1),
                    'eligibility': 'Farmers in Uttarakhand',
                    'region': 'State',
                    'last_updated': datetime.now() - timedelta(days=random.randint(1, 30))
                },
                {
                    'scheme_id': 'JAMMU-KASHMIR-001',
                    'scheme_name': 'Jammu and Kashmir Krishi Pump Yojana',
                    'description': 'Solar pump subsidy for farmers in Jammu and Kashmir.',
                    'ministry': 'Jammu and Kashmir Agriculture Department',
                    'start_date': date(2021, 7, 1),
                    'eligibility': 'Farmers in Jammu and Kashmir',
                    'region': 'State',
                    'last_updated': datetime.now() - timedelta(days=random.randint(1, 30))
                },
                {
                    'scheme_id': 'LADAKH-001',
                    'scheme_name': 'Ladakh Krishi Pump Yojana',
                    'description': 'Agricultural pump subsidy scheme for farmers in Ladakh.',
                    'ministry': 'Ladakh Agriculture Department',
                    'start_date': date(2021, 8, 1),
                    'eligibility': 'Farmers in Ladakh',
                    'region': 'State',
                    'last_updated': datetime.now() - timedelta(days=random.randint(1, 30))
                },
                {
                    'scheme_id': 'GOA-001',
                    'scheme_name': 'Goa Krishi Pump Yojana',
                    'description': 'Solar pump subsidy for farmers in Goa.',
                    'ministry': 'Goa Agriculture Department',
                    'start_date': date(2021, 9, 1),
                    'eligibility': 'Farmers in Goa',
                    'region': 'State',
                    'last_updated': datetime.now() - timedelta(days=random.randint(1, 30))
                },
                {
                    'scheme_id': 'SIKKIM-001',
                    'scheme_name': 'Sikkim Krishi Pump Yojana',
                    'description': 'Agricultural pump subsidy scheme for farmers in Sikkim.',
                    'ministry': 'Sikkim Agriculture Department',
                    'start_date': date(2021, 10, 1),
                    'eligibility': 'Farmers in Sikkim',
                    'region': 'State',
                    'last_updated': datetime.now() - timedelta(days=random.randint(1, 30))
                },
                {
                    'scheme_id': 'MANIPUR-001',
                    'scheme_name': 'Manipur Krishi Pump Yojana',
                    'description': 'Solar pump subsidy for farmers in Manipur.',
                    'ministry': 'Manipur Agriculture Department',
                    'start_date': date(2021, 11, 1),
                    'eligibility': 'Farmers in Manipur',
                    'region': 'State',
                    'last_updated': datetime.now() - timedelta(days=random.randint(1, 30))
                },
                {
                    'scheme_id': 'MEGHALAYA-001',
                    'scheme_name': 'Meghalaya Krishi Pump Yojana',
                    'description': 'Agricultural pump subsidy scheme for farmers in Meghalaya.',
                    'ministry': 'Meghalaya Agriculture Department',
                    'start_date': date(2021, 12, 1),
                    'eligibility': 'Farmers in Meghalaya',
                    'region': 'State',
                    'last_updated': datetime.now() - timedelta(days=random.randint(1, 30))
                },
                {
                    'scheme_id': 'MIZORAM-001',
                    'scheme_name': 'Mizoram Krishi Pump Yojana',
                    'description': 'Solar pump subsidy for farmers in Mizoram.',
                    'ministry': 'Mizoram Agriculture Department',
                    'start_date': date(2022, 1, 1),
                    'eligibility': 'Farmers in Mizoram',
                    'region': 'State',
                    'last_updated': datetime.now() - timedelta(days=random.randint(1, 30))
                },
                {
                    'scheme_id': 'NAGALAND-001',
                    'scheme_name': 'Nagaland Krishi Pump Yojana',
                    'description': 'Agricultural pump subsidy scheme for farmers in Nagaland.',
                    'ministry': 'Nagaland Agriculture Department',
                    'start_date': date(2022, 2, 1),
                    'eligibility': 'Farmers in Nagaland',
                    'region': 'State',
                    'last_updated': datetime.now() - timedelta(days=random.randint(1, 30))
                },
                {
                    'scheme_id': 'TRIPURA-001',
                    'scheme_name': 'Tripura Krishi Pump Yojana',
                    'description': 'Solar pump subsidy for farmers in Tripura.',
                    'ministry': 'Tripura Agriculture Department',
                    'start_date': date(2022, 3, 1),
                    'eligibility': 'Farmers in Tripura',
                    'region': 'State',
                    'last_updated': datetime.now() - timedelta(days=random.randint(1, 30))
                },
                {
                    'scheme_id': 'ARUNACHAL-PRADESH-001',
                    'scheme_name': 'Arunachal Pradesh Krishi Pump Yojana',
                    'description': 'Agricultural pump subsidy scheme for farmers in Arunachal Pradesh.',
                    'ministry': 'Arunachal Pradesh Agriculture Department',
                    'start_date': date(2022, 4, 1),
                    'eligibility': 'Farmers in Arunachal Pradesh',
                    'region': 'State',
                    'last_updated': datetime.now() - timedelta(days=random.randint(1, 30))
                }
            ]
            
            # Insert mock data
            for scheme in mock_schemes:
                cursor.execute("""
                    INSERT INTO gov_schemes (
                        scheme_id, scheme_name, description, ministry,
                        start_date, eligibility, region, last_updated
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    scheme['scheme_id'],
                    scheme['scheme_name'],
                    scheme['description'],
                    scheme['ministry'],
                    scheme['start_date'],
                    scheme['eligibility'],
                    scheme['region'],
                    scheme['last_updated']
                ))
            
            conn.commit()
            logger.info(f"Successfully populated {len(mock_schemes)} mock schemes")
            
            # Verify data
            cursor.execute("SELECT COUNT(*) FROM gov_schemes")
            count = cursor.fetchone()[0]
            logger.info(f"Total schemes in database: {count}")
            
            # Show some statistics
            cursor.execute("SELECT region, COUNT(*) FROM gov_schemes GROUP BY region")
            region_stats = cursor.fetchall()
            for region, count in region_stats:
                logger.info(f"{region} schemes: {count}")
            
            return True
            
    except sqlite3.Error as e:
        logger.error(f"Database error: {e}")
        return False
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return False

if __name__ == "__main__":
    logger.info("Starting mock data population...")
    success = populate_mock_schemes()
    
    if success:
        logger.info("Mock data population completed successfully!")
    else:
        logger.error("Mock data population failed!")

