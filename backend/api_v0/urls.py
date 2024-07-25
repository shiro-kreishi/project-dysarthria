from django.urls import path, include
from rest_framework import routers
from api_v0.views import \
    ExerciseModelViewSet, ExerciseToTestModelViewSet, ResponseExerciseModelViewSet, \
    TestModelViewSet, PublicTestModelViewSet, \
    ResponseTestModelViewSet, WhitelistModelViewSet, \
    DoctorToTestModelViewSet, ExerciseTypeViewSet, UserModelViewSet


router = routers.DefaultRouter()
router.register(r'exercise-types', ExerciseTypeViewSet)
router.register(r'exercises', ExerciseModelViewSet)
router.register(r'exercises-to-test', ExerciseToTestModelViewSet)
router.register(r'response-exercises', ResponseExerciseModelViewSet)
router.register(r'tests', TestModelViewSet)
router.register(r'public-tests', PublicTestModelViewSet)
router.register(r'response-tests', ResponseTestModelViewSet)
router.register(r'whitelists', WhitelistModelViewSet)
router.register(r'doctors-test', DoctorToTestModelViewSet)
router.register(r'users', UserModelViewSet)


urlpatterns = [
    path('', include(router.urls)),

    # create
    # path('exercise/create/', ExerciseCreateAPIView.as_view(), name='exercise-create'),

]