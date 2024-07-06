from rest_framework.generics import ListAPIView, RetrieveAPIView
from testing.models.test import Exercise, ExerciseToTest, ResponseExercise
from testing.serializers.testing import ExerciseSerializer, ExerciseToTestSerializer, ResponseExerciseSerializer

class ExerciseListAPIView(ListAPIView):
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer

class ExerciseDetailAPIView(RetrieveAPIView):
    queryset = Exercise.objects.all()
    serializer_class = ExerciseSerializer
    lookup_field = 'id'

class ExerciseToTestListAPIView(ListAPIView):
    queryset = ExerciseToTest.objects.all()
    serializer_class = ExerciseToTestSerializer

class ExerciseToTestDetailAPIView(RetrieveAPIView):
    queryset = ExerciseToTest.objects.all()
    serializer_class = ExerciseToTestSerializer
    lookup_field = 'id'

class ResponseExerciseListAPIView(ListAPIView):
    queryset = ResponseExercise.objects.all()
    serializer_class = ResponseExerciseSerializer

class ResponseExerciseDetailAPIView(RetrieveAPIView):
    queryset = ResponseExercise.objects.all()
    serializer_class = ResponseExerciseSerializer
    lookup_field = 'id'
