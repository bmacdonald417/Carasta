import 'carmunity_upload_result.dart';

/// Abstraction for posting **photo** bytes to Carasta and receiving a public `https` URL.
///
/// Phase 3 ships a [StagedCarmunityMediaUpload] that does not perform network I/O until the
/// backend exposes a presign or direct upload route (see Phase 3 notes).
abstract class CarmunityMediaUploadPort {
  /// Upload image bytes and return a URL suitable for `POST /api/carmunity/posts` `{ "imageUrl": ... }`.
  Future<CarmunityUploadResult> uploadPostImage({
    required List<int> bytes,
    required String filename,
    required String mimeType,
  });
}
