from django.urls import path
from .views import game_list, game_detail, game_create, game_update, game_delete, add_to_cart_view

urlpatterns = [
    path('', game_list, name='game_list'),
    path('<int:pk>/', game_detail, name='game_detail'),
    path('create/', game_create, name='game_create'),
    path('<int:pk>/edit/', game_update, name='game_update'),
    path('<int:pk>/delete/', game_delete, name='game_delete'),
    path('<int:pk>/add-to-cart/', add_to_cart_view, name='add_to_cart'),
]