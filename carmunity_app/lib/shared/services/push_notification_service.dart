/// Push notification integration point — no FCM/APNs wiring in Phase 1.
///
/// Register handlers here in a later phase; keep platform channels isolated.
class PushNotificationService {
  PushNotificationService._();

  static const String phase1Banner =
      'Device push (FCM / Windows) is not wired yet — your Carasta account already has live notifications on carasta.com (header bell). This hook exists so mobile can subscribe without restructuring the app.';

  /// Future: initialize SDK, request permissions, bind token to Carasta user.
  static Future<void> initialize() async {}

  /// Future: persist device token via platform API.
  static Future<void> registerDeviceToken(String token) async {}
}
