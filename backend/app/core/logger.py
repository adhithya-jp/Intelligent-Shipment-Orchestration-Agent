import logging
import json
import os
import contextvars
import uuid
from datetime import datetime, timezone

# Context variable to hold the request ID for the current async task
request_id_ctx_var: contextvars.ContextVar[str] = contextvars.ContextVar("request_id", default="")

class RequestIdFilter(logging.Filter):
    """
    Log filter to inject the current request ID from contextvars into every log record.
    """
    def filter(self, record):
        req_id = request_id_ctx_var.get()
        if req_id:
            record.request_id = req_id
        return True

class StructuredJSONFormatter(logging.Formatter):
    """
    Custom JSON formatter for structured logging.
    Perfect for Observability stacks like Loki, Fluentd, or Elasticsearch.
    """
    def format(self, record):
        log_record = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "service": "backend_api",  # Identifies the microservice
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
    
    # Add filter to inject request_id
    handler.addFilter(RequestIdFilter())
    
    # Environment-based formatting
    if os.getenv("ENVIRONMENT") == "production":
        formatter = StructuredJSONFormatter()
    else:
        formatter = logging.Formatter(
            '%(asctime)s | %(levelname)-8s | ReqID: %(request_id)s | %(module)s:%(funcName)s | %(message)s'
        )
        # We handle missing request_id for basic logging by providing a default dict fallback
        # But filter sets it only if present. The safe way is to not fail if missing:
        
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    
    return logger

class SafeFormatter(logging.Formatter):
    def format(self, record):
        if not hasattr(record, 'request_id'):
            record.request_id = 'N/A'
        return super().format(record)

def setup_logger_safe(name="shipment_agent"):
    logger = logging.getLogger(name)
    if logger.hasHandlers():
        return logger
    logger.setLevel(logging.INFO)
    logger.propagate = False
    handler = logging.StreamHandler()
    handler.addFilter(RequestIdFilter())

    if os.getenv("ENVIRONMENT") == "production":
        formatter = StructuredJSONFormatter()
    else:
        formatter = SafeFormatter(
            '%(asctime)s | %(levelname)-8s | ReqID: %(request_id)s | %(module)s:%(funcName)s | %(message)s'
        )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    return logger

# Single instance to be imported across the app: `from app.core.logger import log, request_id_ctx_var`
log = setup_logger_safe()

