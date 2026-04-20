/// Push notification integration point — no FCM/APNs wiring in Phase O.
///
/// **Extension points (Phase P+):**
/// - Call `initialize()` from `main.dart` after auth is stable.
/// - Map incoming push payloads to the same navigation rules as
///   [openNotificationTarget] (`notification_navigation.dart`), using `type` +
///   JSON `payload` keys aligned with Prisma `Notification.payloadJson`.
/// - POST a device token to a future `/api/carmunity/devices` (not implemented here).
class PushNotificationService {
  PushNotificationService._();

  static const String phase1Banner =
      'Device push (FCM / Windows) is not wired yet — your Carasta account already has live notifications on carasta.com (header bell). This hook exists so mobile can subscribe without restructuring the app.';

  /// Shown above the live inbox list — in-app delivery is real; transport is HTTP today.
  static const String inAppInboxExplainer =
      'This list is loaded from the same Carasta APIs as the web header bell (`GET /api/notifications`). '
      'Device push will reuse the same notification types/payloads when FCM/APNs land.';

  /// Future: initialize SDK, request permissions, bind token to Carasta user.
  static Future<void> initialize() async {}

  /// Future: persist device token via platform API.
  static Future<void> registerDeviceToken(String token) async {}
}
