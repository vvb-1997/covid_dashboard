from django.shortcuts import render
import requests
from django.http import HttpResponse,JsonResponse
from .models import dashboardData,CountrySlug,summaryData
import time
from datetime import datetime

def data_from_model():
    #old way to retrive data from api pros: real time : cons time consuming
    # values = requests.get('https://coronavirus-19-api.herokuapp.com/countries')
    # data = values.json()
    # return data

    #new way to retrive data from api pros: improved performance : cons not real time
    data = dashboardData.objects.all().values()
    all_fields = [f.name for f in dashboardData._meta.get_fields()]

    context = {}
    for data_obj in data:
        country = data_obj['Country']
        context[country] = data_obj

    return context

def new_data():
    data = summaryData.objects.all().values()
    all_fields = [f.name for f in dashboardData._meta.get_fields()]

    context = {}
    for data_obj in data:
        country = data_obj['Country']
        context[country] = data_obj

    return context

#view url 127.0.0.1/
def home(request):
    return render(request, 'home.html')

#view url 127.0.0.1/whole_data
def dataAjax(request):
    if request.method == 'POST':
        request_getdata = new_data()

        return JsonResponse(request_getdata)

#view url 127.0.0.1/data_collector
def data_append(request):

    values = requests.get('https://coronavirus-19-api.herokuapp.com/countries')
    data = values.json()

    for data_items in data:

        if dashboardData.objects.filter(Country = data_items['country']).exists():
            print('exists')
            obj = dashboardData.objects.get(Country = data_items['country'])
        else:
            obj = dashboardData()

        obj.Country = data_items['country']
        obj.Total_cases = data_items['cases']
        obj.Today_cases = data_items['todayCases']
        obj.Total_deaths = data_items['deaths']
        obj.Today_deaths = data_items['todayDeaths']
        obj.Total_recovered = data_items['recovered']
        obj.Active_cases = data_items['active']
        obj.Critical_cases = data_items['critical']
        obj.Cases_per_one_million = data_items['casesPerOneMillion']
        obj.Deaths_per_one_million = data_items['deathsPerOneMillion']
        obj.Total_tests = data_items['totalTests']
        obj.Tests_per_one_million = data_items['testsPerOneMillion']
        obj.save()

        print(data_items['country'] + " Done")

    return HttpResponse('<h1>Done!!</h1>')

#view url 127.0.0.1/country_slug
def slug_append(request):

    values = requests.get('https://api.covid19api.com/countries')
    data = values.json()

    for data_items in data:

        if CountrySlug.objects.filter(Country = data_items['Country']).exists():
            print('exists')
            obj = CountrySlug.objects.get(Country = data_items['Country'])
        else:
            obj = CountrySlug()

        obj.Country = data_items['Country']
        obj.Slug = data_items['Slug']
        obj.save()

        print(data_items['Country'] + " Done")

    return HttpResponse('<h1>Done!!</h1>')

#view url 127.0.0.1:8000/summary
def summary_append(request):

    values = requests.get('https://api.covid19api.com/summary')
    data = values.json()

    if summaryData.objects.filter(Country = "Global").exists():
        print('exists')
        obj = summaryData.objects.get(Country = "Global")
    else:
        obj = summaryData()

    data_items = data['Global']
    obj.Country = "Global"
    obj.Total_cases = data_items['TotalConfirmed']
    obj.New_cases = data_items['NewConfirmed']
    obj.Total_deaths = data_items['TotalDeaths']
    obj.New_deaths = data_items['NewDeaths']
    obj.Total_recovered = data_items['TotalRecovered']
    obj.New_recovered = data_items['NewRecovered']
    obj.Last_updated = datetime.strptime(data['Date'], "%Y-%m-%dT%H:%M:%SZ")

    obj.save()
    del obj,data_items

    for data_items in data['Countries']:

        if summaryData.objects.filter(Country = data_items['Country']).exists():
            print('exists')
            obj = summaryData.objects.get(Country = data_items['Country'])
        else:
            obj = summaryData()

        obj.Country = data_items['Country']
        obj.Country_code = data_items['CountryCode']
        obj.Slug = data_items['Slug']
        obj.Total_cases = data_items['TotalConfirmed']
        obj.New_cases = data_items['NewConfirmed']
        obj.Total_deaths = data_items['TotalDeaths']
        obj.New_deaths = data_items['NewDeaths']
        obj.Total_recovered = data_items['TotalRecovered']
        obj.New_recovered = data_items['NewRecovered']
        obj.Last_updated = datetime.strptime(data_items['Date'], "%Y-%m-%dT%H:%M:%SZ")
        obj.save()

        print(data_items['Country'] + " Done")

    return HttpResponse('<h1>Done!!</h1>')
