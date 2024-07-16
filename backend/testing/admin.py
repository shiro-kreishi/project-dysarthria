from django.contrib import admin
from testing.models import Test, Exercise, ExerciseToTest, DoctorToTest,\
    Whitelist, PublicTest, ResponseTest, ResponseExercise, ExerciseType

@admin.register(Test)
class TestAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')

@admin.register(Exercise)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'type')

@admin.register(ExerciseToTest)
class ExerciseToTestAdmin(admin.ModelAdmin):
    list_display = ('exercise', 'test')

@admin.register(DoctorToTest)
class DoctorToTestAdmin(admin.ModelAdmin):
    list_display = ('doctor', 'test')

@admin.register(Whitelist)
class WhitelistAdmin(admin.ModelAdmin):
    list_display = ('user', 'test')

@admin.register(PublicTest)
class PublicTestAdmin(admin.ModelAdmin):
    list_display = ('test',)

@admin.register(ResponseTest)
class ResponseTestAdmin(admin.ModelAdmin):
    list_display = ('test', 'user', 'json_result')

@admin.register(ResponseExercise)
class ResponseExerciseAdmin(admin.ModelAdmin):
    list_display = ('exercise', 'json_result', 'date', 'response_test')

@admin.register(ExerciseType)
class ResponseExerciseAdmin(admin.ModelAdmin):
    list_display = ('name',)
