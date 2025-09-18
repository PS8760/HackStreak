from fastapi import HTTPException, Request
from typing import Dict, Optional
import time
import logging
from collections import defaultdict, deque

logger = logging.getLogger(__name__)

class RateLimiter:
    def __init__(self):
        # Store request timestamps for each IP
        self.requests: Dict[str, deque] = defaultdict(deque)
        
        # Rate limit configurations
        self.limits = {
            'general': {'requests': 10, 'window': 900},  # 10 requests per 15 minutes
            'pdf': {'requests': 5, 'window': 900},       # 5 PDF requests per 15 minutes
            'gemini': {'requests': 3, 'window': 60}      # 3 AI requests per minute
        }

    def _get_client_ip(self, request: Request) -> str:
        """Get client IP address from request"""
        # Check for forwarded IP first (for proxy/load balancer scenarios)
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            return forwarded_for.split(",")[0].strip()
        
        # Check for real IP header
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        # Fall back to client host
        return request.client.host if request.client else "unknown"

    def _clean_old_requests(self, ip: str, window: int):
        """Remove old requests outside the time window"""
        current_time = time.time()
        cutoff_time = current_time - window
        
        # Remove old requests
        while self.requests[ip] and self.requests[ip][0] < cutoff_time:
            self.requests[ip].popleft()

    def _check_limit(self, request: Request, limit_type: str = 'general') -> bool:
        """Check if request is within rate limit"""
        ip = self._get_client_ip(request)
        current_time = time.time()
        
        # Get limit configuration
        config = self.limits.get(limit_type, self.limits['general'])
        max_requests = config['requests']
        window = config['window']
        
        # Clean old requests
        self._clean_old_requests(ip, window)
        
        # Check if limit exceeded
        if len(self.requests[ip]) >= max_requests:
            logger.warning(f"Rate limit exceeded for IP {ip} (limit: {limit_type})")
            return False
        
        # Add current request
        self.requests[ip].append(current_time)
        return True

    async def check_rate_limit(self, request: Request):
        """General rate limit check dependency"""
        if not self._check_limit(request, 'general'):
            raise HTTPException(
                status_code=429,
                detail={
                    "success": False,
                    "message": "Too many requests. Please try again later.",
                    "retry_after": "15 minutes"
                }
            )

    async def check_pdf_rate_limit(self, request: Request):
        """PDF-specific rate limit check dependency"""
        if not self._check_limit(request, 'pdf'):
            raise HTTPException(
                status_code=429,
                detail={
                    "success": False,
                    "message": "Too many PDF requests. Please try again later.",
                    "retry_after": "15 minutes"
                }
            )

    async def check_gemini_rate_limit(self, request: Request):
        """Gemini API rate limit check dependency"""
        if not self._check_limit(request, 'gemini'):
            raise HTTPException(
                status_code=429,
                detail={
                    "success": False,
                    "message": "AI generation rate limit exceeded. Please wait before trying again.",
                    "retry_after": "1 minute"
                }
            )

    def get_rate_limit_status(self, request: Request, limit_type: str = 'general') -> Dict:
        """Get current rate limit status for an IP"""
        ip = self._get_client_ip(request)
        config = self.limits.get(limit_type, self.limits['general'])
        
        # Clean old requests
        self._clean_old_requests(ip, config['window'])
        
        remaining = max(0, config['requests'] - len(self.requests[ip]))
        
        return {
            'limit': config['requests'],
            'remaining': remaining,
            'window': config['window'],
            'reset_time': time.time() + config['window'] if remaining == 0 else None
        }