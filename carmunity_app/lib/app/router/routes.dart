/// Canonical path segments for [go_router].
///
/// Deep links (future): map `carasta://post/:id` → [post] + id;
/// `carasta://auction/:id` → [auctionDetail] + id.
abstract final class AppRoutes {
  static const String home = '/home';
  static const String forums = '/forums';
  static const String create = '/create';
  static const String auctions = '/auctions';
  static const String you = '/you';

  static String postDetail(String id) => '/home/post/$id';

  /// Top-level alias for deep linking (full-screen over shell).
  static String postDeepLink(String id) => '/post/$id';

  static String forumCategory(String slug) => '/forums/c/$slug';

  static String forumThread(String threadId) => '/forums/thread/$threadId';

  static String auctionDetail(String id) => '/auctions/detail/$id';

  static const String notifications = '/you/notifications';
  static const String garage = '/you/garage';
  static const String settings = '/you/settings';
}
