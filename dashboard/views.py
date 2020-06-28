from django.http import Http404
from django.shortcuts import render
import requests
from django.http import HttpResponse,JsonResponse
from .models import dashboardData,CountrySlug,summaryData,HistoricalData
import time
from datetime import datetime
import pandas as pd
from plotly.offline import plot
from plotly.graph_objs import Scatter

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

#view url 127.0.0.1:8000/
def home(request):
    return render(request, 'home.html')

#view url 127.0.0.1:8000/whole_data
def dataAjax(request):
    if request.method == 'POST':
        request_getdata = new_data()
        return JsonResponse(request_getdata)
    else:
        return HttpResponse('<h1>UnAuthorized!!</h1>')

#view url 127.0.0.1:8000/data_collector
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

#view url 127.0.0.1:8000/country_slug
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

#view url 127.0.0.1:8000/data_country
def country_wise_hist_data(request):
    start_time = time.time()

    Country_slug = list(summaryData.objects.all().values_list('Slug', flat=True) )

    for slug in Country_slug:
        if(slug != ''):
            try:
                values = requests.get('https://api.covid19api.com/total/country/'+slug)
                data = values.json()
                df = pd.DataFrame(data)
                df = df.applymap(str)
                df['Date'] = pd.to_datetime(df['Date'])

                if HistoricalData.objects.filter(Slug = slug).exists():
                    print('exists')
                    obj = HistoricalData.objects.get(Slug = slug)
                else:
                    obj = HistoricalData()

                obj.Slug = slug
                obj.Country = data[0]['Country']
                obj.text = str(data)
                obj.Confirmed = ','.join(list(df['Confirmed']))
                obj.Active = ','.join(list(df['Active']))
                obj.Date = ','.join(list(df['Date'].apply(lambda x: x.strftime('%d-%m-%Y'))))
                obj.Deaths = ','.join(list(df['Deaths']))
                obj.Recovered = ','.join(list(df['Recovered']))

                obj.save()
                print(slug + " Done")

            except Exception as e:
                print(e)
                print(slug + "Not done")

    print(time.time()-start_time)

    return HttpResponse('<h1>Done!!</h1>')

#view url 127.0.0.1:8000/country/<slug:slug>
def historical_trend(request,slug = ''):
    if HistoricalData.objects.filter(Slug = slug).exists():
        obj = HistoricalData.objects.get(Slug = slug)
        countrySlug = obj.Slug
        country = obj.Country
    else:
        raise Http404("No Proper Country")
    return render(request, 'historical_country.html', context = {'Country' : country, 'Country_Slug' : countrySlug})

#view url 127.0.0.1:8000/historical_data
def data_hist(request):
    if request.method == 'POST':
        slug = request.POST.get("slug")
        if HistoricalData.objects.filter(Slug = slug).exists():
            request_getdata = list(HistoricalData.objects.filter(Slug = slug).values())[0]
            return JsonResponse(request_getdata)
        else:
            return JsonResponse({'message':'No data'})
    else:
        return HttpResponse('<h1>401 UnAuthorized Access!!</h1>')

#view url 127.0.0.1:8000/trend_heatmap
def trend_heatmap(request):
    return render(request,'trend_heatmap.html',{})

def population_data(request):
    df = pd.read_excel(open('static/misc/world_population_area_data.xlsx','rb'),sheet_name = "Sheet2")
    print(df)

    for index,row in df.iterrows():
        if summaryData.objects.filter(Country_code = row['Country Code']).exists():
            obj = summaryData.objects.get(Country_code = row['Country Code'])
            obj.Population = row['Population']
            obj.Size = row['Size']

            obj.save()
        else:
            print(row['Country Code'])

    return HttpResponse('<h1>Done!!</h1>')
