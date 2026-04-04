"""
Cache Service for Second-Serve Platform
========================================
Provides a thin wrapper around Django's cache framework with:
- Predefined TTL constants
- Structured cache key generation
- Safe fallback if Redis is unavailable
- Write-time cache invalidation helpers

Usage:
    from backend.cache import cache_service

    # Get or set (with DB fallback)
    posts = cache_service.get_or_set('food_posts:available', lambda: fetch_posts(), ttl=60)

    # Invalidate on write
    cache_service.invalidate('food_posts:available')
"""

import logging
from django.core.cache import cache

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Time-To-Live constants (seconds)
# ---------------------------------------------------------------------------
TTL_SHORT = 60        # Public food listings / requests — refresh quickly
TTL_MEDIUM = 300      # User profile — stable, invalidate on update
TTL_LONG = 900        # Admin stats — rarely changes

# ---------------------------------------------------------------------------
# Cache key constants
# ---------------------------------------------------------------------------
KEY_FOOD_POSTS_AVAILABLE = 'food_posts:available'
KEY_FOOD_REQUESTS_OPEN   = 'food_requests:open'
KEY_AVAILABLE_LISTINGS   = 'available:listings'


def build_user_profile_key(user_id: str) -> str:
    return f'user_profile:{user_id}'


# ---------------------------------------------------------------------------
# Core helpers
# ---------------------------------------------------------------------------

class CacheService:
    """
    Lightweight caching wrapper.
    All methods silently fall back to the DB callable if Redis is down,
    so the app stays functional even without a Redis server.
    """

    def get_or_set(self, key: str, db_callable, ttl: int = TTL_SHORT):
        """
        Return cached value if present; otherwise call db_callable(),
        cache the result, and return it.
        Raises exceptions if Redis is down (IGNORE_EXCEPTIONS=False in settings).
        """
        try:
            value = cache.get(key)
            if value is not None:
                logger.debug('[Redis HIT] key=%s', key)
                return value
            logger.debug('[Redis MISS] key=%s — fetching from DB', key)
            value = db_callable()
            cache.set(key, value, timeout=ttl)
            logger.debug('[Redis SET] key=%s ttl=%ds', key, ttl)
            return value
        except Exception as exc:  # noqa: BLE001
            logger.error('[Redis ERROR] get_or_set failed for key=%s: %s', key, exc)
            return db_callable()


    def get(self, key: str):
        """Get a single cache value. Returns None on miss or error."""
        try:
            return cache.get(key)
        except Exception as exc:  # noqa: BLE001
            logger.warning('Cache get failed for key %s: %s', key, exc)
            return None

    def set(self, key: str, value, ttl: int = TTL_SHORT):
        """Set a cache key. Silently ignores errors."""
        try:
            cache.set(key, value, timeout=ttl)
        except Exception as exc:  # noqa: BLE001
            logger.warning('Cache set failed for key %s: %s', key, exc)

    def invalidate(self, *keys: str):
        """Delete one or more cache keys. Silently ignores errors."""
        try:
            cache.delete_many(keys)
        except Exception as exc:  # noqa: BLE001
            logger.warning('Cache invalidate failed for keys %s: %s', keys, exc)

    def invalidate_food_posts(self):
        """Call after any FoodPost create/update/delete."""
        self.invalidate(KEY_FOOD_POSTS_AVAILABLE)

    def invalidate_food_listings(self):
        """Call after any FoodListing create/update/delete."""
        self.invalidate(KEY_FOOD_REQUESTS_OPEN, KEY_AVAILABLE_LISTINGS)

    def invalidate_user_profile(self, user_id: str):
        """Call after user profile update."""
        self.invalidate(build_user_profile_key(user_id))


# Singleton instance — import and use directly
cache_service = CacheService()
