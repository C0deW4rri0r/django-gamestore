from .cart import get_cart_count


def cart_counter(request):
    return {
        'cart_items_count': get_cart_count(request)
    }