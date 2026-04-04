from django.contrib import admin
from .models import FoodListing, FoodPost

# Register your models here.

admin.site.register(FoodListing)
admin.site.register(FoodPost)

