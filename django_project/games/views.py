from django.shortcuts import render
from .models import Game

def index(request):
    games = Game.objects.all()
    return render(request, 'index.html', {'games': games})
