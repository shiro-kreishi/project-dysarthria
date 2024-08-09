from django.shortcuts import render, redirect
from django.views.generic import TemplateView

# Create your views here.
class HomeStub(TemplateView):
    template_name = "pages/home_stub.html"