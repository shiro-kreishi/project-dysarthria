from django.shortcuts import render
from django.views.generic import TemplateView

# Create your views here.
class HomeStub(TemplateView):
    template_name = "pages/home_stub.html"