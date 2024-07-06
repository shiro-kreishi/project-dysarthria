from django.urls import include, path
from api_v0.views.test import \
    TestListAPIView, TestDetailAPIView, \
    PublicTestListAPIView, PublicTestDetailAPIView, \
    ResponseTestListAPIView, ResponseTestDetailAPIView, \
    WhitelistTestListAPIView, WhitelistTestDetailAPIView
from api_v0.views.exercise import \
    ExerciseListAPIView, ExerciseDetailAPIView,\
    ExerciseToTestListAPIView, ExerciseToTestDetailAPIView,\
    ResponseExerciseListAPIView, ResponseExerciseDetailAPIView
from api_v0.views.user import \
    DoctorToTestListAPIView, DoctorToTestDetailAPIView
from api_v0.views.object import \
    PictureOrWordDraggingListAPIView, PictureOrWordDraggingDetailAPIView,\
    ObjectsWeDraggingListAPIView, ObjectsWeDraggingDetailAPIView,\
    ObjectsToDraggingListAPIView, ObjectsToDraggingDetailAPIView,\
    ContentListAPIView, ContentDetailAPIView,\
    StandardFormListAPIView, StandardFormDetailAPIView

urlpatterns = [
    path('tests/', TestListAPIView.as_view(), name='test-list'),
    path('tests/<int:id>/', TestDetailAPIView.as_view(), name='test-detail'),
    path('public/tests/', PublicTestListAPIView.as_view(), name='public-test-list'),
    path('public/tests/<int:id>/', PublicTestDetailAPIView.as_view(), name='public-test-detail'),
    path('response/tests/', ResponseTestListAPIView.as_view(), name='response-test-list'),
    path('response/tests/<int:id>/', ResponseTestDetailAPIView.as_view(), name='response-test-detail'),
    path('whitelist/tests/', WhitelistTestListAPIView.as_view(), name='whitelist-test-list'),
    path('whitelist/test/<int:id>', WhitelistTestDetailAPIView.as_view(), name='whitelist-test-detail'),

    path('exercises/', ExerciseListAPIView.as_view(), name='exercise-list'),
    path('exercises/<int:id>/', ExerciseDetailAPIView.as_view(), name='exercise-detail'),
    path('exercises-to-test/', ExerciseToTestListAPIView.as_view(), name='exercise-to-test-list'),
    path('exercises-to-test/<int:id>/', ExerciseToTestDetailAPIView.as_view(), name='exercise-to-test-detail'),
    path('response-exercises/', ResponseExerciseListAPIView.as_view(), name='response-exercise-list'),
    path('response-exercises/<int:id>/', ResponseExerciseDetailAPIView.as_view(), name='response-exercise-detail'),
    path('doctors-test/', DoctorToTestListAPIView.as_view(), name='doctor-to-test-list'),
    path('doctors-test/<int:id>/', DoctorToTestDetailAPIView.as_view(), name='doctor-to-test-detail'),

    path('pictures-or-dragging/', PictureOrWordDraggingListAPIView.as_view(), name='pictures-or-dragging-list'),
    path('pictures-or-dragging/<int:id>/', PictureOrWordDraggingDetailAPIView.as_view(), name='pictures-or-dragging-detail'),
    path('objects-or-dragging/', ObjectsWeDraggingListAPIView.as_view(), name='objects-or-dragging-list'),
    path('objects-or-dragging/<int:id>/', ObjectsWeDraggingDetailAPIView.as_view(), name='objects-or-dragging-list'),
    path('objects-to-dragging/', ObjectsToDraggingListAPIView.as_view(), name='objects-to-dragging-list'),
    path('objects-to-dragging/<int:id>/', ObjectsToDraggingDetailAPIView.as_view(), name='objects-to-dragging-list'),
    path('contents/', ContentListAPIView.as_view(), name='content-list'),
    path('contents/<int:id>/', ContentDetailAPIView.as_view(), name='content-detail'),
    path('standard-forms/', StandardFormListAPIView.as_view(), name='standard-form-list'),
    path('standardForms/<int:id>/', StandardFormDetailAPIView.as_view(), name='standard-form-detail'),

]