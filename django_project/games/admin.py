from django.contrib import admin
from .models import Game, Genre

@admin.register(Game)
class GameAdmin(admin.ModelAdmin):
    list_display = ("name", "price", "developer")
    search_fields = ("name", "developer")
    list_filter = ("genres",)


@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display = ("name",)
