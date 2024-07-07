from rest_framework.viewsets import ModelViewSet, GenericViewSet
from rest_framework import generics, mixins, views
from testing.models import PictureOrWordDragging, ObjectsWeDrag, ObjectsToDragTo, Content, StandardForm
from testing.serializers.testing import PictureOrWordDraggingSerializer, ObjectsWeDragSerializer, \
    ObjectsToDragToSerializer, ContentSerializer, StandardFormSerializer


class PictureOrWordDraggingModelViewSet(mixins.CreateModelMixin,
                                        mixins.RetrieveModelMixin,
                                        mixins.UpdateModelMixin,
                                        mixins.DestroyModelMixin,
                                        mixins.ListModelMixin,
                                        GenericViewSet):
    queryset = PictureOrWordDragging.objects.all()
    serializer_class = PictureOrWordDraggingSerializer


class ObjectsWeDraggingModelViewSet(mixins.CreateModelMixin,
                                    mixins.RetrieveModelMixin,
                                    mixins.UpdateModelMixin,
                                    mixins.DestroyModelMixin,
                                    mixins.ListModelMixin,
                                    GenericViewSet):
    queryset = ObjectsWeDrag.objects.all()
    serializer_class = ObjectsWeDragSerializer


class ObjectsToDraggingModelViewSet(mixins.CreateModelMixin,
                                    mixins.RetrieveModelMixin,
                                    mixins.UpdateModelMixin,
                                    mixins.DestroyModelMixin,
                                    mixins.ListModelMixin,
                                    GenericViewSet):
    queryset = ObjectsToDragTo.objects.all()
    serializer_class = ObjectsToDragToSerializer


class ContentModelViewSet(mixins.CreateModelMixin,
                          mixins.RetrieveModelMixin,
                          mixins.UpdateModelMixin,
                          mixins.DestroyModelMixin,
                          mixins.ListModelMixin,
                          GenericViewSet):
    queryset = Content.objects.all()
    serializer_class = ContentSerializer


class StandardFormModelViewSet(mixins.CreateModelMixin,
                               mixins.RetrieveModelMixin,
                               mixins.UpdateModelMixin,
                               mixins.DestroyModelMixin,
                               mixins.ListModelMixin,
                               GenericViewSet):
    queryset = StandardForm.objects.all()
    serializer_class = StandardFormSerializer
