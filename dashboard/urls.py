from django.contrib import admin
from django.urls import path,include

from . import views
urlpatterns = [
    path('', views.home, name = "Dashboard"),
    path('data_collector/', views.data_append, name = "Data_append"),
    # path('country_slug/', views.slug_append, name = "Slug_append"),
    path('summary/', views.summary_append, name = "Summary_append"),
    path('whole_data/', views.dataAjax, name = "data_ajax"),
]
