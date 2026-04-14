import 'carmunity_media_upload_port.dart';
import 'carmunity_upload_result.dart';

/// Honest no-op implementation until Carasta exposes upload/presign APIs.
class StagedCarmunityMediaUpload implements CarmunityMediaUploadPort {
  const StagedCarmunityMediaUpload();

  @override
  Future<CarmunityUploadResult> uploadPostImage({
    required List<int> bytes,
    required String filename,
    required String mimeType,
  }) async {
    return const CarmunityUploadUnavailable(
      'Photo upload is not wired to a Carasta endpoint yet. '
      'Paste a public image URL, or publish text only. '
      'See CARASTA_APP_PHASE_3_NOTES.md for the recommended backend contract.',
    );
  }
}
