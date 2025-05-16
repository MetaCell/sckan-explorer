import logging

def get_logger(level: str = "INFO"):
    logging.basicConfig(level=level)
    return logging.getLogger(__name__)

logger = get_logger()