from rest_framework import permissions

# Re-use the canonical IsDonor from accounts app to avoid duplication
# This file is kept for any local overrides but proxies to the main permission
from accounts.permissions import IsDonor, IsReceiver, IsAdmin  # noqa: F401
