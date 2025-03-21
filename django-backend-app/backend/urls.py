from django.contrib import admin  # Add this line
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),  # Admin route
    path('api/', include('api.urls')),  # Include API routes
]
