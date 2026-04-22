from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.urls import reverse
from .forms import GameForm
from .models import Game, Genre
from .cart import add_to_cart as add_game_to_cart, get_cart, get_cart_count
from .cart import remove_from_cart as remove_game_from_cart, clear_cart as clear_game_cart

def game_list(request):
    games = Game.objects.all()
    genres = Genre.objects.all()

    return render(request, 'games/game_list.html', {
        'games': games,
        'genres': genres,
    })

def game_detail(request, pk):
    game = get_object_or_404(Game, pk=pk)
    back_url = request.GET.get('next') or reverse('game_list')

    return render(request, 'games/game_detail.html', {
        'game': game,
        'back_url': back_url,
    })

@login_required
def game_create(request):
    if request.method == 'POST':
        form = GameForm(request.POST, request.FILES)
        if form.is_valid():
            form.save()
            return redirect('game_list')
    else:
        form = GameForm()

    return render(request, 'games/game_form.html', {
        'form': form,
        'title': 'Добавить игру'
    })

@login_required
def game_update(request, pk):
    game = get_object_or_404(Game, pk=pk)

    if request.method == 'POST':
        form = GameForm(request.POST, request.FILES, instance=game)
        if form.is_valid():
            form.save()
            return redirect('game_detail', pk=pk)
    else:
        form = GameForm(instance=game)

    return render(request, 'games/game_form.html', {
        'form': form,
        'title': 'Редактировать игру'
    })

@login_required
def game_delete(request, pk):
    game = get_object_or_404(Game, pk=pk)

    if request.method == 'POST':
        game.delete()
        return redirect('game_list')

    return render(request, 'games/game_confirm_delete.html', {
        'game': game
    })

def add_to_cart_view(request, pk):
    game = get_object_or_404(Game, pk=pk)

    if request.method == 'POST':
        add_game_to_cart(request, game.id)

        message = f'Игра "{game.name}" добавлена в корзину.'
        cart_items_count = get_cart_count(request)

        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'success': True,
                'message': message,
                'cart_items_count': cart_items_count,
            })

        messages.success(request, message)

    return redirect('game_detail', pk=game.pk)

def cart_detail(request):
    cart_ids = get_cart(request)
    games = Game.objects.filter(id__in=cart_ids)
    total_price = sum(game.price for game in games)

    return render(request, 'games/cart_detail.html', {
        'games': games,
        'total_price': total_price,
    })

def remove_from_cart_view(request, pk):
    game = get_object_or_404(Game, pk=pk)

    if request.method == 'POST':
        remove_game_from_cart(request, game.id)
        messages.success(request, f'Игра "{game.name}" удалена из корзины.')

    return redirect('cart_detail')

def checkout_cart_view(request):
    if request.method == 'POST':
        cart_ids = get_cart(request)

        if not cart_ids:
            messages.warning(request, 'Корзина пуста. Нечего оформлять.')
            return redirect('cart_detail')
        
        clear_game_cart(request)
        messages.success(request, 'Покупка успешно оформлена.')
        return redirect('cart_detail')
    
    return redirect('cart_detail')

def game_modal_data(request, pk):
    game = get_object_or_404(Game, pk=pk)

    current_path = request.GET.get('current_path', '')
    detail_url = reverse('game_detail', args=[game.id])

    if current_path:
        detail_url = f'{detail_url}?next={current_path}'

    data = {
        'id': game.id,
        'name': game.name,
        'description': game.description,
        'price': str(game.price),
        'developer': game.developer,
        'release_date': game.release_date.strftime('%d.%m.%Y') if game.release_date else '',
        'genres': list(game.genres.values_list('name', flat=True)),
        'image_url': game.image.url if game.image else '',
        'detail_url': detail_url,
    }

    return JsonResponse(data)

def game_filter(request):
    search_query = request.GET.get('search', '').strip()
    genre_id = request.GET.get('genre', '').strip()

    games = Game.objects.all()

    if search_query:
        games = games.filter(name__icontains=search_query)

    if genre_id:
        games = games.filter(genres__id=genre_id)

    games = games.distinct()

    return render(request, 'games/partials/game_cards.html', {
        'games': games,
    })
