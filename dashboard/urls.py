from django.contrib import admin
from django.urls import path,include

from . import views
urlpatterns = [
    path('', views.home, name = "Dashboard"),
    path('historical_data/', views.data_hist, name = "data_hist"),
    path('data_country/', views.country_wise_hist_data, name = "country_wise_hist_data"),
    path('country/<str:slug>', views.historical_trend, name = "historical_trend"),

    path('trend_heatmap/',views.trend_heatmap, name = "trend_heatmap"),

    path('summary/', views.summary_append, name = "Summary_append"),
    path('whole_data/', views.dataAjax, name = "data_ajax"),
    path('data_collector/', views.data_append, name = "Data_append"),
    # path('population_data/', views.population_data, name = "population_data"),
    # path('country_slug/', views.slug_append, name = "Slug_append"),
]
