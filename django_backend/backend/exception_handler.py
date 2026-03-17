"""
Unified API Response Exception Handler

All DRF responses are wrapped in:
  Success: {"success": true,  "message": "...", "data": {...}}
  Error:   {"success": false, "message": "...", "errors": {...}}
"""
from rest_framework.views import exception_handler as drf_exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """
    Custom DRF exception handler that wraps all error responses
    in the unified API response format.
    """
    response = drf_exception_handler(exc, context)

    if response is not None:
        # Map status codes to human-readable messages
        default_messages = {
            400: "Bad request. Please check your input.",
            401: "Authentication required. Please log in.",
            403: "You do not have permission to perform this action.",
            404: "The requested resource was not found.",
            405: "Method not allowed.",
            429: "Too many requests. Please slow down.",
            500: "An internal server error occurred.",
        }

        data = response.data

        # Extract a readable message from the error data
        message = default_messages.get(response.status_code, "An error occurred.")

        # Check for nested detail key (most DRF errors)
        if isinstance(data, dict):
            if 'detail' in data:
                message = str(data['detail'])
            elif 'message' in data:
                message = str(data['message'])
        elif isinstance(data, list) and data:
            message = str(data[0])

        # Build the unified error response
        unified = {
            "success": False,
            "message": message,
            "errors": data if isinstance(data, dict) else {"detail": data},
        }
        response.data = unified

    return response
