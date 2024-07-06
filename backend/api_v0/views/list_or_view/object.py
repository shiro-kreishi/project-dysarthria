from rest_framework.generics import ListAPIView, RetrieveAPIView
from testing.models import PictureOrWordDragging, ObjectsWeDrag, ObjectsToDragTo, Content, StandardForm
from testing.serializers.testing import PictureOrWordDraggingSerializer, ObjectsWeDragSerializer, \
    ObjectsToDragToSerializer, ContentSerializer, StandardFormSerializer


class PictureOrWordDraggingListAPIView(ListAPIView):
    queryset = PictureOrWordDragging.objects.all()
    serializer_class = PictureOrWordDraggingSerializer


class PictureOrWordDraggingDetailAPIView(RetrieveAPIView):
    queryset = PictureOrWordDragging.objects.all()
    serializer_class = PictureOrWordDraggingSerializer
    lookup_field = 'id'


class ObjectsWeDraggingListAPIView(ListAPIView):
    queryset = ObjectsWeDrag.objects.all()
    serializer_class = ObjectsWeDragSerializer


class ObjectsWeDraggingDetailAPIView(RetrieveAPIView):
    queryset = ObjectsWeDrag.objects.all()
    serializer_class = ObjectsWeDragSerializer
    lookup_field = 'id'


class ObjectsToDraggingListAPIView(ListAPIView):
    queryset = ObjectsToDragTo.objects.all()
    serializer_class = ObjectsToDragToSerializer


class ObjectsToDraggingDetailAPIView(RetrieveAPIView):
    queryset = ObjectsToDragTo.objects.all()
    serializer_class = ObjectsToDragToSerializer
    lookup_field = 'id'


class ContentListAPIView(ListAPIView):
    queryset = Content.objects.all()
    serializer_class = ContentSerializer


class ContentDetailAPIView(RetrieveAPIView):
    queryset = Content.objects.all()
    serializer_class = ContentSerializer
    lookup_field = 'id'


class StandardFormListAPIView(ListAPIView):
    queryset = StandardForm.objects.all()
    serializer_class = StandardFormSerializer


class StandardFormDetailAPIView(RetrieveAPIView):
    queryset = StandardForm.objects.all()
    serializer_class = StandardFormSerializer
    lookup_field = 'id'
