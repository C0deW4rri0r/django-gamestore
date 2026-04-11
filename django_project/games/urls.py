from django.urls import path
from .views import game_list, game_detail

urlpatterns = [
    path('', game_list, name='game_list'),
    path('<int:pk>/', game_detail, name='game_detail'),
]