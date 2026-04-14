/// Client-side model for “share link” posts. Server stores a single [Post.content] string today;
/// preview metadata (title, image) requires backend enrichment (Phase 4+).
class SharedLinkDraft {
  const SharedLinkDraft({
    required this.normalizedUrl,
    this.caption,
  });

  final String normalizedUrl;
  final String? caption;

  /// Serialized body for `POST /api/carmunity/posts` — text only until link preview API exists.
  String toPostContent() {
    final cap = caption?.trim();
    if (cap == null || cap.isEmpty) return normalizedUrl;
    return '$cap\n\n$normalizedUrl';
  }
}
