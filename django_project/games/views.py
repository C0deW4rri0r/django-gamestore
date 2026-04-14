from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from .forms import GameForm
from .models import Game

def game_list(request):
    games = Game.objects.all()

    return render(request, 'games/game_list.html', {
        'games': games
    })

def game_detail(request, pk):
    game = get_object_or_404(Game, pk=pk)

    return render(request, 'games/game_detail.html', {
        'game': game
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