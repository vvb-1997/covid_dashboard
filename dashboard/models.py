from django.db import models

# Create your models here.
class dashboardData(models.Model):
    Country = models.CharField(max_length=50)
    Total_cases = models.IntegerField()
    Today_cases = models.IntegerField()
    Total_deaths = models.IntegerField()
    Today_deaths = models.IntegerField()
    Total_recovered = models.IntegerField(blank=True,null=True)
    Active_cases = models.IntegerField(blank=True,null=True)
    Critical_cases = models.IntegerField()
    Cases_per_one_million = models.IntegerField()
    Deaths_per_one_million = models.IntegerField()
    Total_tests = models.IntegerField()
    Tests_per_one_million = models.IntegerField()
    Last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.Country

    class Meta:
        verbose_name_plural = "Dashboard"

class CountrySlug(models.Model):
    Country = models.CharField(max_length=100)
    Slug = models.CharField(max_length=20)

    def __str__(self):
        return self.Country

    class Meta:
        verbose_name_plural = "Country to Slug"

class summaryData(models.Model):
    Country = models.CharField(max_length=50,blank=True)
    Country_code = models.CharField(max_length=10,blank=True)
    Slug = models.CharField(max_length=20,blank=True)
    Total_cases = models.IntegerField()
    New_cases = models.IntegerField()
    Total_deaths = models.IntegerField()
    New_deaths = models.IntegerField()
    Total_recovered = models.IntegerField(blank=True,null=True)
    New_recovered = models.IntegerField(blank=True,null=True)
    Last_updated = models.DateTimeField()

    def __str__(self):
        return self.Country

    class Meta:
        verbose_name_plural = "Summary Data"
