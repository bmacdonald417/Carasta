import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'app/app.dart';
import 'app/config/app_config.dart';
import 'shared/services/push_notification_service.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  AppConfig.init();
  PushNotificationService.initialize();
  runApp(const ProviderScope(child: CarmunityApp()));
}
