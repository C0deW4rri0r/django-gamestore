CART_SESSION_KEY = 'cart'


def get_cart(request):
    return request.session.get(CART_SESSION_KEY, [])


def save_cart(request, cart):
    request.session[CART_SESSION_KEY] = cart
    request.session.modified = True


def add_to_cart(request, game_id):
    cart = get_cart(request)

    if game_id not in cart:
        cart.append(game_id)
        save_cart(request, cart)


def remove_from_cart(request, game_id):
    cart = get_cart(request)

    if game_id in cart:
        cart.remove(game_id)
        save_cart(request, cart)


def clear_cart(request):
    save_cart(request, [])

def get_cart_count(request):
    return len(get_cart(request))
