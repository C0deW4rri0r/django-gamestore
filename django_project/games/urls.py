from django.urls import path
from .views import game_list, game_detail, game_create, game_update, game_delete
from .views import add_to_cart_view, cart_detail, remove_from_cart_view, checkout_cart_view
from .views import game_modal_data

urlpatterns = [
    path('', game_list, name='game_list'),
    path('<int:pk>/', game_detail, name='game_detail'),
    path('create/', game_create, name='game_create'),
    path('<int:pk>/edit/', game_update, name='game_update'),
    path('<int:pk>/delete/', game_delete, name='game_delete'),
    path('<int:pk>/add-to-cart/', add_to_cart_view, name='add_to_cart'),
    path('cart/', cart_detail, name='cart_detail'),
    path('<int:pk>/remove-from-cart/', remove_from_cart_view, name='remove_from_cart'),
    path('cart/checkout/', checkout_cart_view, name='checkout'),
    path('<int:pk>/modal-data/', game_modal_data, name='game_modal_data'),
]