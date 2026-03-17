import re
from rest_framework import serializers
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

DONOR_ROLES = ('DONOR', 'HOTEL', 'CAFE', 'RESTAURANT', 'CANTEEN', 'CATERING_SERVICE')
RECEIVER_ROLES = ('NGO', 'ORPHANAGE', 'OLD_AGE_HOME', 'GOVERNMENT_HOSPITAL')


# ---------------------------------------------------------------------------
# Field-level validators
# ---------------------------------------------------------------------------

def validate_password_strength(value):
    """
    Password must be at least 8 chars, contain 1 uppercase, 1 digit,
    and 1 special character.
    """
    if len(value) < 8:
        raise serializers.ValidationError("Password must be at least 8 characters long.")
    if not re.search(r'[A-Z]', value):
        raise serializers.ValidationError("Password must contain at least one uppercase letter.")
    if not re.search(r'\d', value):
        raise serializers.ValidationError("Password must contain at least one digit.")
    if not re.search(r'[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\;\'`~/]', value):
        raise serializers.ValidationError("Password must contain at least one special character.")
    return value


def validate_phone_number(value):
    """10-digit Indian mobile number."""
    if value and not re.match(r'^[6-9]\d{9}$', value):
        raise serializers.ValidationError(
            "Enter a valid 10-digit Indian mobile number (starting with 6-9)."
        )
    return value


def validate_pincode(value):
    """6-digit numeric Indian pincode."""
    if value and not re.match(r'^\d{6}$', value):
        raise serializers.ValidationError("Pincode must be exactly 6 digits.")
    return value


def validate_pan(value):
    """PAN format: AAAAA9999A"""
    if value and not re.match(r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$', value):
        raise serializers.ValidationError(
            "Invalid PAN number format. Expected format: ABCDE1234F"
        )
    return value


# ---------------------------------------------------------------------------
# Registration Serializer
# ---------------------------------------------------------------------------

class UserRegisterSerializer(serializers.ModelSerializer):
    # FIXED: write_only=True is set — password never returned in response
    password = serializers.CharField(write_only=True, validators=[validate_password_strength])
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'email', 'role', 'phone_number', 'password', 'password_confirm',
            # Donor
            'username', 'full_name',
            # Org/Receiver
            'organization_name', 'hospital_name', 'contact_person',
            # Registration
            'registration_number', 'cci_registration_number', 'hospital_registration_number',
            'registration_type', 'government_license_number', 'social_welfare_license_number',
            'pan_number', 'darpan_id', 'registration_certificate_url',
            # Hospital
            'government_department', 'hospital_type', 'number_of_beds', 'official_email',
            # Orphanage
            'child_welfare_department',
            # Capacity
            'capacity_people_served', 'capacity_children_supported', 'capacity_residents_supported',
            # Address
            'address_line1', 'address_line2', 'city', 'district', 'state', 'pincode',
            # Org metadata
            'website_url', 'description',
        ]
        extra_kwargs = {
            'email': {'required': True},
        }

    def validate_phone_number(self, value):
        return validate_phone_number(value)

    def validate_pincode(self, value):
        return validate_pincode(value)

    def validate_pan_number(self, value):
        return validate_pan(value)

    def validate(self, attrs):
        # --- Password match ---
        if attrs.get('password') != attrs.get('password_confirm'):
            raise serializers.ValidationError({"password_confirm": "Password fields didn't match."})

        role = attrs.get('role', '')

        # --- Email lowercase ---
        if 'email' in attrs:
            attrs['email'] = attrs['email'].lower()

        # --- Per-role required field validation ---
        if role == 'NGO':
            required = [
                'organization_name', 'contact_person', 'phone_number',
                'registration_number', 'registration_type', 'pan_number',
                'registration_certificate_url', 'address_line1', 'city',
                'district', 'state', 'pincode', 'capacity_people_served',
            ]
        elif role == 'ORPHANAGE':
            required = [
                'organization_name', 'contact_person', 'phone_number',
                'cci_registration_number', 'government_license_number', 'pan_number',
                'registration_certificate_url', 'child_welfare_department',
                'capacity_children_supported', 'address_line1', 'city',
                'district', 'state', 'pincode',
            ]
        elif role == 'OLD_AGE_HOME':
            required = [
                'organization_name', 'contact_person', 'phone_number',
                'registration_number', 'social_welfare_license_number', 'pan_number',
                'registration_certificate_url', 'capacity_residents_supported',
                'address_line1', 'city', 'district', 'state', 'pincode',
            ]
        elif role == 'GOVERNMENT_HOSPITAL':
            required = [
                'organization_name', 'contact_person', 'phone_number',
                'hospital_registration_number', 'government_department',
                'hospital_type', 'number_of_beds', 'official_email',
                'address_line1', 'city', 'district', 'state', 'pincode',
            ]
        else:
            # All donor types only require email + password (username optional)
            required = []

        errors = {}
        for field in required:
            val = attrs.get(field)
            if val is None or (isinstance(val, str) and not val.strip()):
                errors[field] = f"This field is required for {role} registration."
        if errors:
            raise serializers.ValidationError(errors)

        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        role = validated_data.get('role', '')

        # FIXED: Donors are auto-approved; receivers start as pending
        if role in DONOR_ROLES:
            validated_data['verification_status'] = 'approved'
        else:
            validated_data['verification_status'] = 'pending'

        # GOVERNMENT_HOSPITAL: map organization_name from hospital_name if provided
        # and sync official_email with email if not separately provided
        if role == 'GOVERNMENT_HOSPITAL':
            hospital_name = validated_data.get('hospital_name') or validated_data.get('organization_name')
            if hospital_name:
                validated_data['organization_name'] = hospital_name
            # Sync official_email → email
            official_email = validated_data.get('official_email')
            if official_email and not validated_data.get('email'):
                validated_data['email'] = official_email.lower()

        # Sync username → full_name for donors (display purposes)
        if role in DONOR_ROLES:
            if validated_data.get('username') and not validated_data.get('full_name'):
                validated_data['full_name'] = validated_data['username']

        user = User.objects.create_user(password=password, **validated_data)
        return user


# ---------------------------------------------------------------------------
# Login Serializer
# ---------------------------------------------------------------------------

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Extended JWT login serializer:
    - Validates role-specific identifiers (reg numbers, official email)
    - Blocks receivers if not yet approved
    - Returns role + verification_status in token and response
    """

    def validate(self, attrs):
        # simplejwt does the password check + user lookup via email field
        data = super().validate(attrs)

        request_data = self.context['request'].data
        requested_role = request_data.get('role')

        # --- Role mismatch check ---
        if requested_role and self.user.role != requested_role:
            raise serializers.ValidationError({
                "detail": (
                    f"This account is registered as '{self.user.role}', "
                    f"not '{requested_role}'. Please log in with the correct role."
                )
            })

        # --- Receiver pending approval check (403 but raised here as 400; view handles 403) ---
        if self.user.role in RECEIVER_ROLES:
            if self.user.verification_status != 'approved':
                raise serializers.ValidationError({
                    "detail": (
                        "Your account is pending admin approval. "
                        "You will be notified once approved."
                    ),
                    "verification_status": self.user.verification_status,
                })

        # --- Role-specific identifier validation ---
        if self.user.role == 'NGO':
            reg_num = request_data.get('registration_number')
            if not reg_num or self.user.registration_number != reg_num.strip():
                raise serializers.ValidationError({"detail": "Invalid NGO Registration Number."})

        elif self.user.role == 'ORPHANAGE':
            cci = request_data.get('cci_registration_number')
            if not cci or self.user.cci_registration_number != cci.strip():
                raise serializers.ValidationError({"detail": "Invalid CCI Registration Number."})

        elif self.user.role == 'OLD_AGE_HOME':
            reg_num = request_data.get('registration_number')
            if not reg_num or self.user.registration_number != reg_num.strip():
                raise serializers.ValidationError({"detail": "Invalid Registration Number."})

        elif self.user.role == 'GOVERNMENT_HOSPITAL':
            hosp_reg = request_data.get('hospital_registration_number')
            if not hosp_reg or self.user.hospital_registration_number != hosp_reg.strip():
                raise serializers.ValidationError({"detail": "Invalid Hospital Registration Number."})
            # Hospitals log in with official_email
            official_email = request_data.get('official_email', '').lower()
            if official_email and self.user.official_email and self.user.official_email.lower() != official_email:
                raise serializers.ValidationError({"detail": "Official email does not match."})

        # --- Add custom claims to token ---
        token = RefreshToken.for_user(self.user)
        token['role'] = self.user.role
        token['verification_status'] = self.user.verification_status

        data['access'] = str(token.access_token)
        data['refresh'] = str(token)
        data['role'] = self.user.role
        data['user'] = UserProfileSerializer(self.user).data

        return data


# ---------------------------------------------------------------------------
# Profile Serializer
# ---------------------------------------------------------------------------

class UserProfileSerializer(serializers.ModelSerializer):
    """
    Full user profile — returned on login and profile fetch.
    Password is excluded (no write_only needed; field not listed).
    """
    class Meta:
        model = User
        fields = [
            'id', 'email', 'role', 'phone_number',
            'username', 'full_name', 'profile_image',
            'organization_name', 'hospital_name', 'contact_person',
            'registration_number', 'cci_registration_number', 'hospital_registration_number',
            'registration_type', 'government_license_number', 'social_welfare_license_number',
            'pan_number', 'darpan_id', 'registration_certificate_url',
            'government_department', 'hospital_type', 'number_of_beds', 'official_email',
            'child_welfare_department',
            'capacity_people_served', 'capacity_children_supported', 'capacity_residents_supported',
            'address', 'address_line1', 'address_line2', 'city', 'district', 'state', 'pincode',
            'website_url', 'description',
            'verification_status', 'date_joined',
        ]
        read_only_fields = ['email', 'role', 'date_joined', 'verification_status']
