from django.db import models

class Genre(models.Model):
    name = models.CharField(max_length=50)

    class Meta:
        verbose_name = "Genre"
        verbose_name_plural = "Genres"

    def __str__(self):
        return self.name

class Game(models.Model):
    name = models.CharField(max_length=50)
    description = models.TextField()
    price = models.DecimalField(max_digits=6, decimal_places=2)
    release_date = models.DateField(blank=True, null=True)
    developer = models.CharField(max_length=50)
    genres = models.ManyToManyField(Genre)
    image = models.ImageField(upload_to='games/', blank=True, null=True)

    class Meta:
        verbose_name = "Game"
        verbose_name_plural = "Games"

    def __str__(self):
        return self.name