import 'package:image_picker/image_picker.dart';

/// Thin wrapper around [ImagePicker] for Carmunity composers (photos first; video out of scope).
class MediaPickerService {
  MediaPickerService({ImagePicker? picker}) : _picker = picker ?? ImagePicker();

  final ImagePicker _picker;

  /// Picks a single image from gallery (or camera on mobile when requested).
  Future<XFile?> pickGalleryImage() async {
    return _picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: 4096,
      maxHeight: 4096,
      imageQuality: 92,
    );
  }

  Future<XFile?> pickCameraImage() async {
    return _picker.pickImage(
      source: ImageSource.camera,
      maxWidth: 4096,
      maxHeight: 4096,
      imageQuality: 92,
    );
  }
}
