/// Result of uploading binary media to Carasta storage (future) for use as `imageUrl` on posts.
sealed class CarmunityUploadResult {
  const CarmunityUploadResult();
}

/// Backend returned a public URL accepted by `POST /api/carmunity/posts` as `imageUrl`.
final class CarmunityUploadSuccess extends CarmunityUploadResult {
  const CarmunityUploadSuccess(this.imageUrl);

  final String imageUrl;
}

/// Upload is not available (no presign endpoint, offline, etc.).
final class CarmunityUploadUnavailable extends CarmunityUploadResult {
  const CarmunityUploadUnavailable(this.message);

  final String message;
}
