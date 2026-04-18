/// Canonical path segments for [go_router].
///
/// Deep links (future): map `carasta://post/:id` → [post] + id;
/// `carasta://auction/:id` → [auctionDetail] + id.
abstract final class AppRoutes {
  static const String home = '/home';
  static const String forums = '/forums';
  static const String create = '/create';

  /// `/forums/space/:slug` e.g. mechanics-corner
  static String forumSpace(String slug) => '/forums/space/$slug';

  /// Thread list for a category id
  static String forumCategoryThreads(String categoryId) => '/forums/category/$categoryId';

  /// Thread detail
  static String forumThread(String threadId) => '/forums/thread/$threadId';

  static const String createPost = '/create/post';
  static const String createShareLink = '/create/share-link';
  static const String createForumThread = '/create/forum-thread';
  static const String createMedia = '/create/media';
  static const String auctions = '/auctions';
  static const String you = '/you';

  static String postDetail(String id) => '/home/post/$id';

  /// Top-level alias for deep linking (full-screen over shell).
  static String postDeepLink(String id) => '/post/$id';

  static String auctionDetail(String id) => '/auctions/detail/$id';

  static const String notifications = '/you/notifications';
  static const String garage = '/you/garage';
  static const String savedAuctions = '/you/saved-auctions';
  static const String settings = '/you/settings';

  /// Provisional — NextAuth cookie + user id for API testing.
  static const String devSession = '/you/dev-session';
}
