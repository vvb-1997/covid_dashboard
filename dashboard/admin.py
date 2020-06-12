from django.contrib import admin

from .models import dashboardData,CountrySlug,summaryData

# Register your models here.
admin.site.register(dashboardData)
admin.site.register(CountrySlug)
admin.site.register(summaryData)
