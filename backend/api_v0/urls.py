from django.urls import path, include
from rest_framework import routers
from api_v0.views import \
    ExerciseModelViewSet, ExerciseToTestModelViewSet, ResponseExerciseModelViewSet, \
    PictureOrWordDraggingModelViewSet, ObjectsWeDraggingModelViewSet, \
    ObjectsToDraggingModelViewSet, ContentModelViewSet, \
    StandardFormModelViewSet, \
    TestModelViewSet, PublicTestModelViewSet, \
    ResponseTestModelViewSet, WhitelistModelViewSet, \
    DoctorToTestModelViewSet
from api_v0.views.create import ExerciseCreateAPIView

router = routers.DefaultRouter()
router.register(r'exercises', ExerciseModelViewSet)
router.register(r'exercises-to-test', ExerciseToTestModelViewSet)
router.register(r'response-exercises', ResponseExerciseModelViewSet)
router.register(r'pictures-or-dragging', PictureOrWordDraggingModelViewSet)
router.register(r'objects-dragging', ObjectsWeDraggingModelViewSet)
router.register(r'objects-to-dragging', ObjectsToDraggingModelViewSet)
router.register(r'contents', ContentModelViewSet)
router.register(r'standard-forms', StandardFormModelViewSet)
router.register(r'tests', TestModelViewSet)
router.register(r'public-tests', PublicTestModelViewSet)
router.register(r'response-tests', ResponseTestModelViewSet)
router.register(r'whitelists', WhitelistModelViewSet)
router.register(r'doctors-test', DoctorToTestModelViewSet)


urlpatterns = [
    path('', include(router.urls)),

    # create
    # path('exercise/create/', ExerciseCreateAPIView.as_view(), name='exercise-create'),

]