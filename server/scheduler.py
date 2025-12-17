"""
Government Schemes Data Scheduler

This script schedules the government schemes data fetcher to run periodically.
It can be run as a cron job or as a background service.

Usage:
    python scheduler.py --interval 3600  # Run every hour
    python scheduler.py --daily          # Run daily at 6 AM
"""

import schedule
import time
import argparse
import logging
from datetime import datetime
from gov_schemes_fetcher import fetch_and_store_schemes

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('scheduler.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def run_fetch_job():
    """
    Wrapper function to run the scheme fetch job with logging.
    """
    logger.info("Starting scheduled government schemes fetch job")
    start_time = datetime.now()
    
    try:
        result = fetch_and_store_schemes()
        
        if result['status'] == 'success':
            logger.info(f"Fetch job completed successfully: {result}")
        else:
            logger.error(f"Fetch job failed: {result}")
            
    except Exception as e:
        logger.error(f"Unexpected error in scheduled job: {e}")
    
    end_time = datetime.now()
    duration = (end_time - start_time).total_seconds()
    logger.info(f"Scheduled job completed in {duration:.2f} seconds")

def main():
    """
    Main scheduler function with command line argument parsing.
    """
    parser = argparse.ArgumentParser(description='Government Schemes Data Scheduler')
    parser.add_argument('--interval', type=int, help='Run every N seconds')
    parser.add_argument('--daily', action='store_true', help='Run daily at 6 AM')
    parser.add_argument('--once', action='store_true', help='Run once and exit')
    
    args = parser.parse_args()
    
    if args.once:
        logger.info("Running fetch job once")
        run_fetch_job()
        return
    
    if args.interval:
        logger.info(f"Scheduling fetch job every {args.interval} seconds")
        schedule.every(args.interval).seconds.do(run_fetch_job)
    elif args.daily:
        logger.info("Scheduling fetch job daily at 6:00 AM")
        schedule.every().day.at("06:00").do(run_fetch_job)
    else:
        # Default: run every 6 hours
        logger.info("Scheduling fetch job every 6 hours (default)")
        schedule.every(6).hours.do(run_fetch_job)
    
    # Run initial fetch
    logger.info("Running initial fetch job")
    run_fetch_job()
    
    # Keep scheduler running
    logger.info("Scheduler started. Press Ctrl+C to stop.")
    try:
        while True:
            schedule.run_pending()
            time.sleep(60)  # Check every minute
    except KeyboardInterrupt:
        logger.info("Scheduler stopped by user")

if __name__ == "__main__":
    main()

