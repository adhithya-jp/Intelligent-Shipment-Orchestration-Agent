import logging
import json
import os
from datetime import datetime, timezone

class StructuredJSONFormatter(logging.Formatter):
    """
    Custom JSON formatter for structured logging.
    Perfect for Observability stacks like Loki, Fluentd, or Elasticsearch.
    """
    def format(self, record):
        log_record = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "module": record.module,
            "funcName": record.funcName,
            "message": record.getMessage(),
        }
        
        # Inject standard extra attributes if they exist
        if hasattr(record, "request_id"):
            log_record["request_id"] = record.request_id

        # Include exception traceback if present
        if record.exc_info:
            log_record["exception"] = self.formatException(record.exc_info)
            
        return json.dumps(log_record)

def setup_logger(name="shipment_agent"):
    """
    Initializes and returns a configured logger instances.
    Uses JSON formatting in production, and standard readable formatting locally.
    """
    logger = logging.getLogger(name)
    
    # Prevent adding multiple handlers if setup is called more than once
    if logger.hasHandlers():
        return logger
        
    logger.setLevel(logging.INFO)
    logger.propagate = False
    
    handler = logging.StreamHandler()
    
    # Environment-based formatting
    if os.getenv("ENVIRONMENT") == "production":
        formatter = StructuredJSONFormatter()
    else:
        formatter = logging.Formatter(
            '%(asctime)s | %(levelname)-8s | %(module)s:%(funcName)s | %(message)s'
        )
        
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    
    return logger

# Single instance to be imported across the app: `from app.core.logger import log`
log = setup_logger()

