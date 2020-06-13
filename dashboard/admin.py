from django.contrib import admin

from .models import dashboardData,CountrySlug,summaryData,HistoricalData

# Register your models here.
admin.site.register(dashboardData)
admin.site.register(CountrySlug)
admin.site.register(summaryData)
admin.site.register(HistoricalData)
