import '../network/api_client.dart';
import '../network/api_exception.dart';
import 'carmunity_media_upload_port.dart';
import 'carmunity_upload_result.dart';

/// Multipart upload to `POST /api/carmunity/media/upload` — returns a public `imageUrl` for posts.
class ApiCarmunityMediaUpload implements CarmunityMediaUploadPort {
  ApiCarmunityMediaUpload({required ApiClient client}) : _client = client;

  final ApiClient _client;

  static const _uploadPath = '/api/carmunity/media/upload';

  @override
  Future<CarmunityUploadResult> uploadPostImage({
    required List<int> bytes,
    required String filename,
    required String mimeType,
  }) async {
    try {
      final res = await _client.postMultipart<Map<String, dynamic>>(
        _uploadPath,
        fileFieldName: 'file',
        bytes: bytes,
        filename: filename,
        mimeType: mimeType,
      );
      final data = res.data;
      if (data == null) {
        return const CarmunityUploadUnavailable('Empty upload response');
      }
      if (data['ok'] != true) {
        final err = data['error'];
        return CarmunityUploadUnavailable(err is String ? err : 'Upload failed');
      }
      final url = data['imageUrl'];
      if (url is! String || url.trim().isEmpty) {
        return const CarmunityUploadUnavailable('Invalid upload response');
      }
      return CarmunityUploadSuccess(url.trim());
    } on ApiException catch (e) {
      return CarmunityUploadUnavailable(e.message);
    }
  }
}
