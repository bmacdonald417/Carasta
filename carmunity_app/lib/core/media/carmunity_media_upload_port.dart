import 'carmunity_upload_result.dart';

/// Abstraction for posting **photo** bytes to Carasta and receiving a public URL for
/// `POST /api/carmunity/posts` `{ "imageUrl": ... }`.
abstract class CarmunityMediaUploadPort {
  /// Upload image bytes and return a URL suitable for `POST /api/carmunity/posts` `{ "imageUrl": ... }`.
  Future<CarmunityUploadResult> uploadPostImage({
    required List<int> bytes,
    required String filename,
    required String mimeType,
  });
}
