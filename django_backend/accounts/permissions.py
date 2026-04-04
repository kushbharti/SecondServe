from rest_framework import permissions


DONOR_ROLES = ('DONOR',)
RECEIVER_ROLES = ('NGO', 'ORPHANAGE', 'OLD_AGE_HOME', 'GOVERNMENT_HOSPITAL')


class IsDonor(permissions.BasePermission):
    """
    Allows access to authenticated users with the DONOR role.
    """
    message = "Access restricted to donor accounts only."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in DONOR_ROLES
        )


class IsReceiver(permissions.BasePermission):
    """
    Allows access to approved receiver accounts only.
    Covers all 4 receiver types: NGO, ORPHANAGE, OLD_AGE_HOME, GOVERNMENT_HOSPITAL
    Also enforces that verification_status == 'approved'.
    """
    message = "Access restricted to approved receiver accounts only."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in RECEIVER_ROLES
            and request.user.verification_status == 'approved'
        )


class IsAdmin(permissions.BasePermission):
    """
    Allows access to Django staff/superusers only.
    Used for admin routes: receiver approvals, user management, etc.
    """
    message = "Access restricted to administrators only."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
        )


# Keep legacy alias for existing code that imports IsRecipient
IsRecipient = IsReceiver
