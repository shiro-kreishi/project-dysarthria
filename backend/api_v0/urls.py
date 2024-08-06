from django.urls import path, include
from rest_framework import routers
from api_v0.views import \
    ExerciseModelViewSet, ExerciseToTestModelViewSet, ResponseExerciseModelViewSet, \
    TestModelViewSet, PublicTestModelViewSet, \
    ResponseTestModelViewSet, WhitelistModelViewSet, \
    DoctorToTestModelViewSet, ExerciseTypeViewSet, UserModelViewSet


router = routers.DefaultRouter()
router.register(r'exercise-types', ExerciseTypeViewSet, basename='exercise-types')
router.register(r'exercises', ExerciseModelViewSet, basename='exercises')
router.register(r'exercises-to-test', ExerciseToTestModelViewSet, basename='exercises-to-test')
router.register(r'response-exercises', ResponseExerciseModelViewSet, basename='response-exercises')
router.register(r'tests', TestModelViewSet, basename='tests')
router.register(r'public-tests', PublicTestModelViewSet, basename='public-tests')
router.register(r'response-tests', ResponseTestModelViewSet, basename='response-tests')
router.register(r'whitelists', WhitelistModelViewSet, basename='whitelists')
router.register(r'doctors-test', DoctorToTestModelViewSet, basename='doctors-test')
router.register(r'users', UserModelViewSet, basename='users')


urlpatterns = [
    path('', include(router.urls)),

    # create
    # path('exercise/create/', ExerciseCreateAPIView.as_view(), name='exercise-create'),

]