/// Push notification integration point — no FCM/APNs wiring in Phase 1.
///
/// Register handlers here in a later phase; keep platform channels isolated.
class PushNotificationService {
  PushNotificationService._();

  static const String phase1Banner =
      'Push is not enabled yet. This service exists so FCM / Windows notifications can plug in without restructuring the app.';

  /// Future: initialize SDK, request permissions, bind token to Carasta user.
  static Future<void> initialize() async {}

  /// Future: persist device token via platform API.
  static Future<void> registerDeviceToken(String token) async {}
}
